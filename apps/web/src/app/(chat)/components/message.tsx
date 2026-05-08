"use client";

import ErrorIcon from "@/icons/error";
import LinkIcon from "@/icons/link";
import PlayIcon from "@/icons/play";
import { formatDuration } from "@/lib/duration";
import { Block } from "@/stores/history";
import { defaultState, useRecipes } from "@/stores/recipes";
import { RecipeVideo } from "@repo/types/recipes";
import Image from "next/image";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import Products, { IngredientContent } from "./products/products";
import ProductsSummary from "./products/summary";

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary-200 ml-auto w-fit rounded-3xl px-3.5 py-2 whitespace-break-spaces">
      {children}
    </div>
  );
}

export function AssistantMessage({ blocks }: { blocks: Block[] }) {
  const recipes = useRecipes((s) => s.recipes);
  const updateRecipe = useRecipes((s) => s.updateRecipe);

  const recipeBlock = blocks.find((b) => b.type === "recipe");
  const messageId = blocks.find((b) => b.type === "id")?.content ?? null;

  useEffect(() => {
    if (!messageId || !recipeBlock) return;
    const existing = recipes.get(messageId);
    if (!existing) {
      try {
        const recipeContent = JSON.parse(recipeBlock.content) as {
          servings: number;
          link: string;
        };
        updateRecipe(messageId, { ingredients: {}, ...recipeContent });
      } catch {
        updateRecipe(messageId);
      }
    }
  }, [messageId, recipeBlock, recipes, updateRecipe]);

  const recipe =
    messageId && recipeBlock ? (recipes.get(messageId) ?? defaultState) : null;

  const isRecipeMetadata =
    recipe && blocks.length <= 2 && blocks[0]?.type === "id";

  if (blocks.length === 0 || isRecipeMetadata) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        {blocks.map(({ type, content }, i) => {
          if (type === "id" || type === "recipe") {
            return null;
          }

          if (type === "title") {
            return (
              <h2 key={i} className="mb-4 pt-4 text-2xl font-bold">
                {content}
              </h2>
            );
          }

          if (type === "subtitle") {
            return (
              <h3 key={i} className="mt-4 mb-1.5 text-xl font-bold">
                {content}
              </h3>
            );
          }

          if (type.includes("ingredient")) {
            try {
              if (!messageId || !recipe) return null;

              const parsedContent = JSON.parse(content) as IngredientContent;

              const isAfterLastIngredient =
                i < blocks.length - 1 &&
                !blocks[i + 1].type.includes("ingredient");

              return (
                <React.Fragment key={i}>
                  <Products messageId={messageId} ingredient={parsedContent} />
                  {isAfterLastIngredient && <ProductsSummary recipe={recipe} />}
                </React.Fragment>
              );
            } catch {
              return null;
            }
          }

          if (type.includes("step")) {
            return (
              <p key={i} className="mb-1 list-item list-inside leading-6">
                {content}
              </p>
            );
          }

          if (type === "videos") {
            const videos = JSON.parse(content) as RecipeVideo[];

            return (
              <div
                key={i}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
              >
                {videos.map(({ id, title, duration, thumbnail }) => (
                  <a
                    key={id}
                    href={`https://www.youtube.com/watch?v=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full overflow-hidden rounded hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 left-0 z-10 -translate-y-full bg-linear-to-b from-neutral-900 to-transparent opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      <p
                        title={title}
                        className="text-primary-50 max-w-[80%] truncate px-2 py-1 text-sm font-medium"
                      >
                        {title}
                      </p>
                    </div>

                    <div className="absolute inset-0 bg-neutral-900/30 transition-colors group-hover:bg-neutral-900/70" />

                    <div className="group-hover:bg-primary-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800/80 px-4 py-2 text-neutral-50 group-hover:shadow">
                      <PlayIcon className="size-6" />
                    </div>

                    <Image
                      src={thumbnail.url}
                      alt={title}
                      width={thumbnail.width}
                      height={thumbnail.height}
                      className="h-auto w-full"
                    />

                    <div className="absolute right-1 bottom-1 rounded bg-neutral-900/50 p-1 text-xs text-neutral-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {formatDuration(duration)}
                    </div>
                  </a>
                ))}
              </div>
            );
          }

          return <Markdown key={i}>{content}</Markdown>;
        })}
      </div>

      {recipe && recipe.link && blocks.some((b) => b.type === "videos") && (
        <div className="text-primary-600 flex items-center gap-2">
          <a
            title="Ir al enlace"
            aria-label="Ir al enlace"
            href={recipe.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkIcon className="size-5" />
          </a>
        </div>
      )}
    </div>
  );
}

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-xl border border-red-500 bg-red-100 p-4 text-red-600">
      <ErrorIcon />
      <p className="font-semibold">{children}</p>
    </div>
  );
}
