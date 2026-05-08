import { InferenceClient } from "@huggingface/inference";
import { Injectable } from "@nestjs/common";
import { Recipe } from "../recipes/entities/recipe.entity";

@Injectable()
export class EmbeddingsService {
  async embedInput(input: string) {
    const client = new InferenceClient(process.env.HF_API_KEY);

    const output = await client.featureExtraction({
      model: "intfloat/multilingual-e5-large",
      inputs: input,
      provider: "hf-inference",
    });

    return output;
  }

  async embedRecipe({
    title,
    description,
    difficulty,
    category,
    estimatedTime,
  }: Recipe) {
    const textToEmbed = (
      `Recipe: ${title}.` +
      `Description: ${description}.` +
      (difficulty ? `Difficulty: ${difficulty}.` : "") +
      (category ? `Category: ${category}.` : "") +
      (estimatedTime
        ? `Estimated Time: ${estimatedTime.toString()} minutes.`
        : "")
    )
      .replace(/\s+/g, " ")
      .trim();

    return this.embedInput(textToEmbed);
  }

  async embedIngredients(recipe: Recipe) {
    const ingredientsText = recipe.ingredients
      .map((i) => {
        const parts = [
          i.quantity ?? "",
          i.unit ?? "",
          i.name,
          i.optional ? "(optional)" : "",
        ].filter(Boolean);
        return parts.join(" ").trim();
      })
      .join("; ")
      .replace(/\s+/g, " ")
      .trim();

    return this.embedInput(ingredientsText);
  }
}
