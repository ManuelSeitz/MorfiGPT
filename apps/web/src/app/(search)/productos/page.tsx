"use client";

import { api } from "@/api/client";
import ProductFilter from "@/components/product-filter";
import Textbox from "@/components/textbox";
import Title from "@/components/title";
import { useTextboxKeydown } from "@/hooks/useTextboxKeydown";
import { stringifyQuery } from "@/lib/query";
import type { Product } from "@repo/types/products";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import LoadingScreen from "../components/loading-screen";
import ProductCard from "../components/product-card";
import ProductsGrid from "../components/product-grid";
import ProductSkeleton from "../components/product-skeleton";

export default function Products() {
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 700, { maxWait: 2000 });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceBlacklist, setSourceBlacklist] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useTextboxKeydown(inputRef);

  useEffect(() => {
    if (!debouncedInput) {
      setProducts([]);
      return;
    }

    setIsLoading(true);

    api
      .get<Product[]>("/products", {
        params: { name: debouncedInput, blacklist: sourceBlacklist, orderBy },
        paramsSerializer: stringifyQuery,
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
  }, [debouncedInput, sourceBlacklist, orderBy]);

  return (
    <>
      <Title>Productos</Title>
      <div className="sticky top-0 z-20 w-full">
        <div className="relative">
          <div className="from-primary-50 pointer-events-none absolute top-0 left-0 z-0 h-24 w-full bg-linear-to-b from-40% to-transparent to-80%" />
          <Textbox
            ref={inputRef}
            className="relative z-10 mx-auto max-w-3xl"
            actions={[
              {
                isButton: false,
                children: (
                  <ProductFilter
                    isLoading={isLoading}
                    sourceBlacklist={sourceBlacklist}
                    setSourceBlacklist={setSourceBlacklist}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                  />
                ),
              },
            ]}
          >
            <input
              ref={inputRef}
              type="search"
              value={input}
              placeholder="Ingresá un producto..."
              className="my-auto ml-2 flex-1"
              onChange={(e) => {
                setInput(e.target.value);
              }}
            />
          </Textbox>
        </div>
      </div>
      {isLoading ? (
        <LoadingScreen />
      ) : products.length > 0 ? (
        <div className="relative w-full pb-16">
          <div className="mx-auto max-w-5xl space-y-4">
            <p>
              {products.length}{" "}
              {products.length === 1 ? "resultado" : "resultados"} para{" "}
              <strong>{debouncedInput}</strong>
            </p>
            <ProductsGrid>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductsGrid>
          </div>
        </div>
      ) : (
        <InitialScreen
          title={
            debouncedInput || sourceBlacklist.length > 0
              ? "No se encontraron productos"
              : "¿Qué necesitás hoy?"
          }
          setInput={setInput}
        />
      )}
    </>
  );
}

function InitialScreen({
  title,
  setInput,
}: {
  title: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  const suggestions = [
    { name: "leche", label: "🥛 Leche" },
    { name: "pan lactal", label: "🍞 Pan lactal" },
    { name: "fideos", label: "🍝 Fideos" },
    { name: "queso", label: "🧀 Queso" },
    { name: "huevos", label: "🥚 Huevos" },
    { name: "aceite", label: "🛢️ Aceite" },
    { name: "yerba mate", label: "🧉 Yerba mate" },
    { name: "pollo", label: "🍗 Pollo" },
  ];

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl">
      <div className="relative w-full">
        <div className="h-[50dvh] w-full overflow-hidden opacity-40">
          <div className="to-primary-50 pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent" />
          <ProductsGrid>
            {new Array(8).fill(null).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </ProductsGrid>
        </div>
        <main className="absolute top-14 right-0 left-0">
          <div className="from-primary-50 flex flex-col items-center gap-9 bg-radial from-50% to-transparent to-70% p-10 max-[480px]:p-4">
            <div className="space-y-3">
              <h2 className="text-center text-2xl leading-6">{title}</h2>
              <p className="text-primary-700 max-w-96 text-center leading-5">
                Buscá cualquier producto y encontrá el mejor precio entre los
                supermercados cercanos.
              </p>
            </div>
            <div className="relative w-full">
              <div
                role="separator"
                className="bg-primary-300 absolute top-1/2 h-px w-full -translate-y-1/2"
              />
              <h3 className="bg-primary-50 text-primary-500 relative z-10 mx-auto w-fit px-4 text-center text-sm tracking-wide uppercase">
                Búsquedas frecuentes
              </h3>
            </div>
            <ul className="flex max-w-xl flex-wrap items-center justify-center gap-2">
              {suggestions.map(({ name, label }) => (
                <li key={name}>
                  <button
                    type="button"
                    className="hover:border-primary-400 border-primary-300 cursor-pointer rounded-3xl border bg-neutral-50 px-3 py-1"
                    onClick={() => {
                      setInput(name);
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </section>
  );
}
