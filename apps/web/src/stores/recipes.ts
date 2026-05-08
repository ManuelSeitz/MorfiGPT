import { Product } from "@repo/types/products";
import { create } from "zustand";

type PriceExtreme = { name: string; price: number; count: number } | null;

type SourceTotal = { price: number; count: number };

export type Recipe = {
  ingredients: Record<
    string,
    (Product & { selected: boolean; isManual?: boolean })[]
  >;
  servings: number;
  link: string | null;
  prices: {
    min: PriceExtreme;
    max: PriceExtreme;
    savePercent: number;
  };
};

interface RecipesState {
  recipes: Map<string, Recipe>;
  updateRecipe: (messageId: string, recipe?: Partial<Recipe>) => void;
}

export const defaultState: Recipe = {
  ingredients: {},
  servings: 1,
  link: null,
  prices: { min: null, max: null, savePercent: 0 },
};

export const useRecipes = create<RecipesState>((set) => ({
  recipes: new Map(),
  updateRecipe: (id, partialRecipe) => {
    set((state) => {
      const newRecipes = new Map(state.recipes);
      const current = newRecipes.get(id) || defaultState;

      const updated = {
        ...current,
        ...partialRecipe,
        ingredients: { ...current.ingredients, ...partialRecipe?.ingredients },
      };

      const ingredientKeys = Object.keys(updated.ingredients);
      const totalRequired = ingredientKeys.length;

      const sourceTotals: Record<string, SourceTotal> = {};
      ingredientKeys.forEach((key) => {
        updated.ingredients[key].forEach((p) => {
          const source = sourceTotals[p.source.name] as SourceTotal | undefined;
          if (!source) {
            sourceTotals[p.source.name] = { price: 0, count: 0 };
          }
          sourceTotals[p.source.name].price += p.price;
          sourceTotals[p.source.name].count += 1;
        });
      });

      const completeSources = Object.entries(sourceTotals)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, val]) => val.count === totalRequired)
        .map(([name, val]) => ({ name, ...val }));

      if (completeSources.length > 0) {
        const min = completeSources.reduce((a, b) =>
          a.price < b.price ? a : b,
        );
        const max =
          completeSources.length > 1
            ? completeSources.reduce((a, b) => (a.price > b.price ? a : b))
            : null;

        updated.prices = {
          min,
          max,
          savePercent: max ? ((max.price - min.price) / max.price) * 100 : 0,
        };

        // Autoselección
        ingredientKeys.forEach((key) => {
          const hasManualSelection = updated.ingredients[key].some(
            (p) => p.isManual,
          );

          if (!hasManualSelection) {
            updated.ingredients[key] = updated.ingredients[key].map((p) => ({
              ...p,
              selected: p.source.name === min.name,
            }));
          }
        });
      }

      newRecipes.set(id, updated);
      return { recipes: newRecipes };
    });
  },
}));
