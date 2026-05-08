import { api } from "@/api/client";
import CartIcon from "@/icons/cart";
import CloseIcon from "@/icons/close";
import { useCart } from "@/stores/cart";
import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { CURRENCY } from "@repo/constants";
import { Cart } from "@repo/types/cart";
import { AxiosResponse } from "axios";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "./button";

export default function ShoppingCart() {
  const { cart, updateCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const res: AxiosResponse<Cart> = await api.get("/carts");
      updateCart(res.data);
    };

    void fetchCart();
  }, [updateCart]);

  const makeOrder = async (cart: Cart) => {
    await api.post("/orders", {
      items: cart.items,
    });
    updateCart(null);
  };

  return (
    <Popover>
      <PopoverButton
        title="Abrir carrito de compras"
        aria-label="Abrir carrito de compras"
        className="relative grid size-7 cursor-pointer place-content-center outline-none"
      >
        {cart && cart.items.length > 0 && (
          <div className="bg-primary-600 border-primary-50 absolute top-0.5 right-0 size-2.5 rounded-full border-2" />
        )}
        <CartIcon className="size-5" strokeWidth={32} />
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom end"
        className={clsx(
          "bg-primary-50 border-primary-400 min-h-64 w-lg origin-top space-y-2 rounded-xl border shadow-md/15 [--anchor-gap:6px]",
          "transition duration-200 ease-in",
          "data-closed:-translate-y-2 data-closed:opacity-0",
          "relative z-20",
        )}
      >
        <div>
          <div className="flex items-center justify-between p-4">
            <h4 className="leading-4 font-bold">Carrito</h4>
            <CloseButton className="cursor-pointer">
              <CloseIcon className="size-5" />
            </CloseButton>
          </div>
          <hr className="border-primary-300" />
        </div>
        {!cart || cart.items.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center gap-4 px-3 py-6">
            <CartIcon
              className="animate-float size-24 place-self-center"
              strokeWidth={16}
            />
            <div className="space-y-1">
              <h2 className="text-center text-xl font-medium">
                Tu carrito está vacío
              </h2>
              <p className="text-primary-700 mx-auto max-w-3/4 text-center text-sm leading-5">
                Agregá productos desde la sección de productos para llenar tu
                heladera.
              </p>
            </div>
            <Button
              variant="primary"
              type="button"
              className="mt-4 w-11/12 rounded-3xl py-2"
              onClick={() => {
                router.push("/productos");
              }}
            >
              Ir a productos
            </Button>
          </section>
        ) : (
          <section className="flex flex-col gap-2">
            <ul className="h-96 space-y-2 overflow-auto px-4 py-2">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ul>
            <Button
              variant="primary"
              type="button"
              className="mx-auto mt-4 mb-4 w-11/12 rounded-3xl py-2"
              onClick={() => {
                void makeOrder(cart);
              }}
            >
              Enviar todo a la heladera
            </Button>
          </section>
        )}
      </PopoverPanel>
    </Popover>
  );
}

function CartItem({ item }: { item: Cart["items"][number] }) {
  return (
    <li className="bg-primary-100 border-primary-300 flex items-center justify-between gap-4 rounded-lg border p-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Image src={item.imageUrl} alt={item.name} width={32} height={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate leading-4 font-semibold">{item.name}</div>
          <div className="flex items-center gap-1">
            <Image
              src={`/images/${item.source.slug}.png`}
              alt={item.source.name}
              width={14}
              height={14}
            />
            <div className="text-sm">{item.source.name}</div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm">
        <div className="text-primary-700 whitespace-nowrap">
          {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
        </div>
        <div className="font-bold">
          {CURRENCY.format(item.quantity * item.price)}
        </div>
      </div>
    </li>
  );
}
