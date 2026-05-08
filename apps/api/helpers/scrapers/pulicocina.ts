import { Ingredient, RecipeMetadata } from "@repo/types/recipes";

interface PuliCocinaRecipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  images: { url: string }[] | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  category: { name: string; icon: string };
}

interface PuliCocinaResponse {
  items: PuliCocinaRecipe[];
  page: number;
  totalPages: number;
}

export async function scrapePuliCocina(): Promise<RecipeMetadata[]> {
  const normalizedRecipes: RecipeMetadata[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const data = await fetchData(page);
      totalPages = data.totalPages;

      normalizedRecipes.push(...normalize(data.items));

      page++;
    } while (page <= totalPages);
  } catch (error) {
    console.error(
      `Error scraping PuliCocina at page ${page.toString()}:`,
      error,
    );
  }

  return normalizedRecipes;
}

async function fetchData(page: number): Promise<PuliCocinaResponse> {
  const url = new URL("/api/public/recipes", "https://www.pulicocina.com");
  url.searchParams.set("page", page.toString());

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  return (await response.json()) as PuliCocinaResponse;
}

function normalize(data: PuliCocinaRecipe[]): RecipeMetadata[] {
  const normalized: RecipeMetadata[] = [];

  const fractions = {
    "½": "0.5",
    "1/2": "0.5",
    "⅓": "0.333",
    "1/3": "0.333",
    "⅔": "0.667",
    "2/3": "0.667",
    "¼": "0.25",
    "1/4": "0.25",
    "¾": "0.75",
    "3/4": "0.75",
    "⅕": "0.2",
    "1/5": "0.2",
    "⅖": "0.4",
    "2/5": "0.4",
    "⅗": "0.6",
    "3/5": "0.6",
    "⅘": "0.8",
    "4/5": "0.8",
    "⅙": "0.167",
    "1/6": "0.167",
    "⅚": "0.833",
    "5/6": "0.833",
    "⅐": "0.143",
    "1/7": "0.143",
    "⅛": "0.125",
    "1/8": "0.125",
    "⅜": "0.375",
    "3/8": "0.375",
    "⅝": "0.625",
    "5/8": "0.625",
    "⅞": "0.875",
    "7/8": "0.875",
    "⅑": "0.111",
    "1/9": "0.111",
    "⅒": "0.1",
    "1/10": "0.1",
  };

  const fractionKeys = Object.keys(fractions).map((f) => f.replace("/", "\\/"));
  const fractionsPattern = `(?:${fractionKeys.join("|")})`;
  const unitsPattern = `(ml|g\\b|gr|kg|l\\b|cc|cdas?|cdtas?|latas?|puñados?|medidas?|chorritos?|tapitas?|sobres?|cditas?|pizcas?|tazas?|cucharad(?:as?|itas?))?\\b`;

  const ingredientsRegex = new RegExp(
    `^(${fractionsPattern}|\\d+(?!/)(?:[/.]\\d+)?(?:\\s*(?:a|-|–)\\s*\\d+(?:[/.]\\d+)?)?)?\\s*` +
      `${unitsPattern}\\s*` +
      `(.+?)$`,
    "i",
  );

  const textToNumber = {
    un: "1",
    una: "1",
    dos: "2",
    tres: "3",
    medio: "0.5",
    media: "0.5",
    ...fractions,
  };

  for (const recipe of data) {
    const ingredients: Ingredient[] = [];

    for (const ingredient of recipe.ingredients) {
      let cleaned = ingredient.toLowerCase().trim();

      let isOptional = false;

      if (/opcional:?\s*/i.test(cleaned)) {
        isOptional = true;
        cleaned = cleaned.replace(/opcional:?\s*/, "");
      }

      cleaned = cleaned
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/\s?(de)?\s?@[a-zA-Z0-9.]+\s?/g, " ") // elimina marcas o promociones
        .replace(/[.,]+$/, "")
        .trim();

      const match = cleaned.match(ingredientsRegex);

      if (!match) continue;

      let quantity = match[1] as string | null;
      const unit = match[2] as string | null;
      let name = match[3];

      if (!name) continue;
      name = name.trim();
      if (name.endsWith(":")) continue;

      if (quantity && textToNumber[quantity.trim()]) {
        quantity = textToNumber[quantity.trim() as keyof typeof textToNumber];
      }

      name = name
        .replace(
          new RegExp(
            `^\\s*[ao]\\s+(\\d+(?:\\/\\d+)?|${fractionsPattern})\\s*(?:${unitsPattern})?`,
            "i",
          ),
          "",
        )
        .trim();

      const finalName = name
        .replace(/^de(l)?\s+/i, "")
        .replace(/[\\.!_].*/, "")
        .replace(":", "")
        .split(/\s+o\s+|\+|,/i)[0]
        .trim();

      if (!finalName) continue;

      ingredients.push({
        name: finalName,
        quantity: quantity ?? null,
        unit: unit ?? null,
        optional: isOptional,
      });
    }

    if (ingredients.length === 0) continue;

    normalized.push({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      author: "pulicocina",
      category: { name: recipe.category.name },
      ingredients,
      instructions: recipe.instructions,
      images: recipe.images,
      difficulty: recipe.difficulty,
      cookTime: recipe.cookTime,
      prepTime: recipe.prepTime,
      servings: recipe.servings ?? 1,
      createdAt: recipe.createdAt,
      link: "https://www.pulicocina.com/receta/" + recipe.slug,
    });
  }

  return normalized;
}
