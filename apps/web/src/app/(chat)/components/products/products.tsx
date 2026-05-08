"use client";

import { api } from "@/api/client";
import LoaderIcon from "@/icons/loader";
import { useRecipes } from "@/stores/recipes";
import { CURRENCY } from "@repo/constants";
import { Product } from "@repo/types/products";
import { Ingredient } from "@repo/types/recipes";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface IngredientContent extends Ingredient {
  title: string;
}

export default function Products({
  messageId,
  ingredient,
}: {
  messageId: string;
  ingredient: IngredientContent;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const recipe = useRecipes((s) => s.recipes).get(messageId);
  const updateRecipe = useRecipes((s) => s.updateRecipe);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<Product[]>("/products", {
        params: { name: ingredient.name, perSource: 1 },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((error: unknown) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ingredient.name]);

  useEffect(() => {
    setProducts([]);
  }, [ingredient.name]);

  useEffect(() => {
    if (products.length === 0 || !recipe) return;

    const currentProducts = recipe.ingredients[ingredient.name] ?? [];
    if (currentProducts.length > 0) return;

    updateRecipe(messageId, {
      ingredients: {
        ...recipe.ingredients,
        [ingredient.name]: products.map((p) => ({
          ...p,
          selected: false,
        })),
      },
    });
  }, [products, messageId, ingredient.name, recipe, updateRecipe]);

  const selectedProduct = recipe?.ingredients[ingredient.name]?.find(
    (p) => p.selected,
  );

  return (
    <div className="my-1.5 space-y-1">
      <div
        title={
          products.length > 0
            ? isOpen
              ? "Cerrar panel de precios"
              : "Abrir panel de precios"
            : undefined
        }
        className="flex cursor-pointer items-center justify-between"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <p>{ingredient.title}</p>

        {selectedProduct && !isLoading && (
          <div className="flex items-center gap-1">
            <strong className="font-bold">
              {CURRENCY.format(selectedProduct.price)}
            </strong>
            <Image
              src={`/images/${selectedProduct.source.slug}.png`}
              alt={selectedProduct.source.name}
              width={24}
              height={24}
            />
          </div>
        )}

        {isLoading && (
          <LoaderIcon
            className="text-primary-400 size-5 animate-spin"
            strokeWidth={2.5}
          />
        )}
      </div>

      {products.length > 0 && isOpen && (
        <section className="bg-primary-100 grid grid-cols-1 gap-2 rounded-2xl p-2.5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className={clsx(
                "bg-primary-50 flex cursor-pointer items-start justify-between gap-2 rounded-xl p-2",
                p.id === selectedProduct?.id && "outline-primary-700 outline",
              )}
              onClick={() => {
                if (!recipe) return;
                const current = recipe.ingredients[ingredient.name] ?? [];

                updateRecipe(messageId, {
                  ...recipe,
                  ingredients: {
                    ...recipe.ingredients,
                    [ingredient.name]: current.map((product) => ({
                      ...product,
                      selected:
                        product.id === p.id && selectedProduct?.id !== p.id,
                      isManual: product.id === p.id,
                    })),
                  },
                });
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate">
                  <a
                    title={p.name}
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {p.name}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <span>
                    <strong className="font-semibold">
                      {CURRENCY.format(p.price)}
                    </strong>
                  </span>
                  <Image
                    src={`/images/${p.source.slug}.png`}
                    alt={p.source.name}
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                </div>
              </div>
              <Image src={p.imageUrl} alt={p.name} width={40} height={40} />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
