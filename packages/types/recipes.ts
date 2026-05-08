export interface RecipeMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  ingredients: Ingredient[];
  instructions: string[];
  images: { url: string }[] | null;
  difficulty: string;
  category?: { name: string };
  prepTime: number | null;
  cookTime: number | null;
  servings: number;
  createdAt: string;
  link: string;
}

export interface Ingredient {
  name: string;
  quantity: string | null;
  unit: string | null;
  optional: boolean;
}

export interface UserInput {
  recipe: string;
  maxPrice: number | null;
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: 120;
        height: 90;
      };
      medium: {
        url: string;
        width: 320;
        height: 180;
      };
      high: {
        url: string;
        width: 480;
        height: 360;
      };
    };
    channelTitle: string;
    publishTime: string;
  };
}

export interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
  };
}

export interface RecipeVideo {
  id: string;
  title: string;
  duration: number;
  thumbnail: { url: string; width: number; height: number };
}
