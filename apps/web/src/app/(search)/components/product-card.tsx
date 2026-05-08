import { api } from "@/api/client";
import Button from "@/components/button";
import CartIcon from "@/icons/cart";
import FridgeIcon from "@/icons/fridge";
import PencilIcon from "@/icons/pencil";
import TrashIcon from "@/icons/trash";
import { useCart } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { CURRENCY } from "@repo/constants";
import { Cart } from "@repo/types/cart";
import type { FridgeProduct, Product } from "@repo/types/products";
import { AxiosResponse } from "axios";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

type BaseProduct = Product;

type Props =
  | {
      product: BaseProduct;
      setProducts?: never;
    }
  | {
      product: FridgeProduct;
      setProducts: Dispatch<SetStateAction<FridgeProduct[]>>;
    };

export default function ProductCard({ product, setProducts }: Props) {
  const { imageUrl, brand, source, name, link, price } = product;
  const [quantity, setQuantity] = useState(
    "quantity" in product ? product.quantity : 1,
  );
  const { user } = useSession();

  const isFridgeSection = "quantity" in product;

  return (
    <article className="bg-primary-50 border-primary-300 flex w-full max-w-2xs flex-col items-center gap-5 rounded-xl border p-3">
      <Image
        src={imageUrl}
        alt={`${name} - ${source.name}`}
        width={144}
        height={144}
        className="size-36 shrink-0 object-contain"
      />
      <main className="w-full space-y-3">
        <div className="flex flex-col">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
          >
            <h2 title={name} className="truncate leading-4 font-semibold">
              {name}
            </h2>
          </a>
          <div className="text-primary-700 text-sm">{brand}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary-700 font-bold">
            {isFridgeSection
              ? `${quantity.toString()} ${quantity === 1 ? "unidad" : "unidades"}`
              : CURRENCY.format(price * quantity)}
          </span>
          <Image
            title={source.name}
            src={`/images/${source.slug}.png`}
            alt={source.name}
            width={20}
            height={20}
          />
        </div>
        {user && (
          <div className="space-y-2">
            <div className="bg-primary-100 flex items-center justify-between rounded-md px-2 py-1 font-bold">
              <Button
                variant="outline"
                className="w-10 rounded"
                disabled={quantity === 1}
                onClick={() => {
                  if (quantity === 1) return;
                  setQuantity((prev) => prev - 1);
                }}
              >
                -
              </Button>
              <div>{quantity}</div>
              <Button
                variant="outline"
                className="w-10 rounded"
                onClick={() => {
                  setQuantity((prev) => prev + 1);
                }}
              >
                +
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isFridgeSection && setProducts ? (
                <FridgeSectionActions
                  product={product as Product & { quantity: number }}
                  setProducts={setProducts}
                  quantity={quantity}
                />
              ) : (
                <ProductsSectionActions product={product} quantity={quantity} />
              )}
            </div>
          </div>
        )}
      </main>
    </article>
  );
}

function ProductsSectionActions({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  const [isFridgeLoading, setIsFridgeLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const updateCart = useCart((s) => s.updateCart);

  const addToFridge = async () => {
    try {
      setIsFridgeLoading(true);
      await api.post("/orders", {
        items: [
          {
            id: product.id,
            name: product.name,
            quantity: quantity,
          },
        ],
      });
    } finally {
      setIsFridgeLoading(false);
    }
  };

  const addToCart = async () => {
    setIsCartLoading(true);
    try {
      const res: AxiosResponse<Cart> = await api.post("/carts", {
        id: product.id,
        name: product.name,
        quantity,
      });
      updateCart(res.data);
    } finally {
      setIsCartLoading(false);
    }
  };

  return (
    <>
      <Button
        disabled={isFridgeLoading}
        variant="outline"
        title="Agregar a la heladera"
        aria-label="Agregar a la heladera"
        className="flex-1 rounded-lg border py-2"
        onClick={() => {
          void addToFridge();
        }}
      >
        <FridgeIcon
          className="text-primary-700 mx-auto size-5"
          strokeWidth={1.5}
        />
      </Button>
      <Button
        disabled={isCartLoading}
        variant="outline"
        title="Agregar al carrito"
        aria-label="Agregar al carrito"
        className="flex-1 rounded-lg border py-2"
        onClick={() => {
          void addToCart();
        }}
      >
        <CartIcon
          className="text-primary-700 mx-auto size-5"
          strokeWidth={28}
        />
      </Button>
    </>
  );
}

function FridgeSectionActions({
  product,
  quantity,
  setProducts,
}: {
  product: FridgeProduct;
  quantity: number;
  setProducts: Dispatch<
    SetStateAction<
      (Product & {
        quantity: number;
      })[]
    >
  >;
}) {
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const editProduct = async () => {
    try {
      setIsEditLoading(true);
      if (quantity < product.quantity) {
        await api.patch(`/fridges/${product.id}`, { quantity });
      } else {
        await api.post("/orders", {
          items: [
            {
              id: product.id,
              name: product.name,
              quantity: quantity - product.quantity,
            },
          ],
        });
      }
      setProducts((prev) => {
        const copy = [...prev];
        const productIndex = copy.findIndex((p) => p.id === product.id);
        copy[productIndex] = { ...copy[productIndex], quantity };
        return copy;
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const deleteProduct = async () => {
    try {
      setIsDeleteLoading(true);
      await api.delete(`/fridges/${product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        title="Editar producto"
        aria-label="Editar producto"
        disabled={product.quantity == quantity || isEditLoading}
        className="flex-1 rounded-lg border py-2"
        onClick={() => {
          void editProduct();
        }}
      >
        <PencilIcon
          className="text-primary-700 mx-auto size-5"
          strokeWidth={1.5}
        />
      </Button>
      <Button
        disabled={isDeleteLoading}
        variant="outline"
        title="Eliminar producto"
        aria-label="Eliminar producto"
        className="flex-1 rounded-lg border border-red-400! py-2 hover:border-red-500!"
        onClick={() => {
          void deleteProduct();
        }}
      >
        <TrashIcon className="mx-auto size-5 text-red-500" strokeWidth={1.5} />
      </Button>
    </>
  );
}
