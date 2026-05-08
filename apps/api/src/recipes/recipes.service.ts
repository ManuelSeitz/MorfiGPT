import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import {
  YOUTUBE_SEARCH_API_URL,
  YOUTUBE_VIDEOS_API_URL,
} from "@repo/constants";
import { Product } from "@repo/types/products";
import type {
  RecipeMetadata,
  RecipeVideo,
  YouTubeVideo,
  YouTubeVideoDetails,
} from "@repo/types/recipes";
import pLimit from "p-limit";
import { IsNull, QueryFailedError, Repository } from "typeorm";
import { scrapePuliCocina } from "../../helpers/scrapers/pulicocina";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { ProductsService } from "../products/products.service";
import { Recipe } from "./entities/recipe.entity";

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private recipeRepository: Repository<Recipe>,
    private readonly productsService: ProductsService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async scrapeRecipes() {
    const puliCocinaRecipes = await scrapePuliCocina();
    const recipes = [...puliCocinaRecipes];

    for (const recipe of recipes) {
      console.log(`Analyzing ${recipe.title}...`);

      const existing = await this.recipeRepository.findOne({
        where: {
          title: recipe.title,
          author: recipe.author,
        },
      });

      if (existing) {
        console.log(
          recipe.title,
          "already exists. Looking for the next recipe...",
        );
        continue;
      }

      const estimatedTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

      const newRecipe = this.recipeRepository.create({
        title: recipe.title,
        description: recipe.description,
        author: recipe.author,
        category: recipe.category?.name,
        difficulty: recipe.difficulty,
        estimatedTime: estimatedTime === 0 ? null : estimatedTime,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: recipe.servings,
        link: recipe.link,
      });

      try {
        await this.recipeRepository.save(newRecipe);
      } catch (error) {
        console.log(error);
        if (error instanceof QueryFailedError) {
          console.log("Query failed:", error.message);
        }
        console.log(
          `Something went wrong with ${recipe.title}. Looking for the next recipe...`,
        );
        continue;
      }

      console.log(recipe.title, "stored successfully");
    }

    console.log(recipes.length, "recipes processed");
  }

  @Cron(CronExpression.EVERY_WEEK, {
    name: "prices",
    timeZone: "America/Argentina/Buenos_Aires",
  })
  async updatePrices() {
    const limit = pLimit(5);
    const recipes = await this.recipeRepository.find();

    const updatePromises = recipes.map((recipe) => {
      return limit(async () => {
        const recipeProducts = await Promise.all(this.getProducts(recipe));
        recipe.estimatedPrice = this.calculateEstimatedPrice(recipeProducts);
        return await this.recipeRepository.save(recipe);
      });
    });

    await Promise.all(updatePromises);
    console.log("Recipe prices updated successfully");
  }

  async embedRecipes() {
    const recipes = await this.recipeRepository.find({
      where: { recipeEmbedding: IsNull() },
    });

    await Promise.all(
      recipes.map(async (recipe) => {
        const embedding = await this.embeddingsService.embedRecipe(recipe);
        recipe.recipeEmbedding = embedding as number[];
        return recipe;
      }),
    );

    await this.recipeRepository.save(recipes);
    console.log("Embeddings stored successfully");
  }

  private getProducts(recipe: Recipe | RecipeMetadata) {
    const limit = pLimit(2);

    return recipe.ingredients.map((ingredient) =>
      limit(async () => {
        const products = await this.productsService.getAll({
          query: ingredient.name,
          perSource: 1,
        });

        await new Promise((r) => setTimeout(r, 500));

        return products;
      }),
    );
  }

  private calculateEstimatedPrice(recipeProducts: Product[][]) {
    const estimatedPrice = recipeProducts.reduce((total, products) => {
      if (products.length === 0) return total;
      const minPrice = Math.min(...products.map((p) => p.price));
      return total + minPrice;
    }, 0);

    return Number(estimatedPrice.toFixed(2));
  }

  async getRecipeVideos(recipe: string) {
    const recipeVideos: RecipeVideo[] = [];
    const MIN_DURATION = 60 * 2;
    const MAX_VIDEOS = 3;

    const searchUrl = new URL(YOUTUBE_SEARCH_API_URL);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "20");
    searchUrl.searchParams.set("q", recipe);
    searchUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY as string);

    const videos = (await (await fetch(searchUrl)).json()) as {
      items: YouTubeVideo[];
    };

    const videoIds = videos.items.map((video) => video.id.videoId).join(",");

    const detailsUrl = new URL(YOUTUBE_VIDEOS_API_URL);
    detailsUrl.searchParams.set("part", "contentDetails");
    detailsUrl.searchParams.set("id", videoIds);
    detailsUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY as string);

    const details = (await (await fetch(detailsUrl)).json()) as {
      items: YouTubeVideoDetails[];
    };

    for (const video of videos.items) {
      const videoDetails = details.items.find((i) => i.id === video.id.videoId);
      if (!videoDetails) continue;

      const match = videoDetails.contentDetails.duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
      );
      if (!match) continue;

      const [, h = "0", m = "0", s = "0"] = match as [
        string,
        string?,
        string?,
        string?,
      ];

      const hours = parseInt(h);
      const minutes = parseInt(m);
      const seconds = parseInt(s);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      if (totalSeconds < MIN_DURATION) continue;

      const thumbnail = video.snippet.thumbnails.medium;

      recipeVideos.push({
        id: video.id.videoId,
        title: video.snippet.title,
        duration: totalSeconds,
        thumbnail: {
          url: thumbnail.url,
          width: thumbnail.width,
          height: thumbnail.height,
        },
      });
      if (recipeVideos.length === MAX_VIDEOS) break;
    }

    return recipeVideos;
  }
}
