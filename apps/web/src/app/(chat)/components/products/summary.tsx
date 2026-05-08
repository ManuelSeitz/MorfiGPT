import { api } from "@/api/client";
import Button from "@/components/button";
import Modal from "@/components/modal";
import CartIcon from "@/icons/cart";
import CheckIcon from "@/icons/check";
import { useCart } from "@/stores/cart";
import { Recipe } from "@/stores/recipes";
import {
  Checkbox,
  Description,
  DialogTitle,
  Field,
  Label,
} from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CURRENCY } from "@repo/constants";
import { Cart } from "@repo/types/cart";
import type { Product } from "@repo/types/products";
import { AxiosResponse } from "axios";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  SubmitHandler,
  useForm,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import z from "zod";

export default function ProductsSummary({ recipe }: { recipe: Recipe }) {
  const { min, savePercent } = recipe.prices;

  const calculateTotal = useCallback(() => {
    const currentIngredients = Object.entries(recipe.ingredients);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedProductPrices = currentIngredients.map(([_, products]) => {
      const selectedProduct = products.find((p) => p.selected);
      return selectedProduct?.price ?? 0;
    });

    return selectedProductPrices.reduce((acc, price) => acc + price, 0);
  }, [recipe.ingredients]);

  return (
    <div className="border-primary-200 mt-1.5 flex items-center justify-between gap-3 border-t pt-2">
      <div>
        <ShoppingCartForm recipe={recipe} />
      </div>
      <div className="flex flex-wrap-reverse items-center justify-end gap-x-3 gap-y-1">
        {min && savePercent > 0 && (
          <p className="bg-accent-100 border-accent-400 text-accent-700 shrink-0 rounded border px-2 py-1 text-sm leading-3.5 font-medium">
            Ahorrá un{" "}
            <strong className="font-bold">{savePercent.toFixed(0)}%</strong> con{" "}
            <strong className="font-bold">{min.name}</strong>
          </p>
        )}
        <div className="shrink-0 font-bold">
          Total {CURRENCY.format(calculateTotal())}
        </div>
      </div>
    </div>
  );
}

const CartSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().int().positive(),
      selected: z.boolean(),
    }),
  ),
});

function ShoppingCartForm({ recipe }: { recipe: Recipe }) {
  const updateCart = useCart((s) => s.updateCart);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedProducts = Object.values(recipe.ingredients)
    .map((ingredient) => {
      const product = ingredient.find((p) => p.selected);
      if (!product) return null;
      return product;
    })
    .filter((product) => product !== null);

  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(CartSchema),
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    if (selectedProducts.length > 0) {
      reset({
        items: selectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: 1,
          price: p.price,
          selected: true,
        })),
      });
    }
  }, [selectedProducts, reset]);

  const items = useWatch({
    control,
    name: "items",
  });

  const onSubmit: SubmitHandler<z.infer<typeof CartSchema>> = async (data) => {
    const filteredData = data.items
      .filter((i) => i.selected)
      .map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { selected, price, ...result } = item;
        return result;
      });

    const res: AxiosResponse<Cart> = await api.patch("/carts", {
      items: filteredData,
    });

    updateCart(res.data);
    setIsModalOpen(false);
    reset();
  };

  const countSelectedItems = useCallback(() => {
    const selectedItems = items.filter((item) => item.selected);
    return selectedItems;
  }, [items]);

  const calculateTotal = useCallback(() => {
    const selectedItems = items.filter((item) => item.selected);
    return selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [items]);

  if (selectedProducts.length === 0) return null;

  const selectedItems = countSelectedItems();

  return (
    <>
      <Button
        variant="secondary"
        title="Añadir ingredientes al carrito"
        aria-label="Añadir ingredientes al carrito"
        className="hover:bg-primary-200 relative rounded-full p-2"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <div className="bg-primary-700 text-primary-50 absolute -top-0.5 -right-1.5 grid size-4.5 place-content-center rounded-full text-xs font-bold">
          {selectedProducts.length}
        </div>
        <CartIcon className="size-6" strokeWidth={30} />
      </Button>
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        className="w-full"
        style={{ padding: 0 }}
      >
        <div className="border-primary-300 border-b pt-5 pb-3">
          <DialogTitle className="px-5 text-xl leading-5 font-bold">
            Agregá al carrito
          </DialogTitle>
          <Description className="text-primary-700 px-5 text-sm leading-6">
            {items.length} productos ·{" "}
            {selectedItems.length === items.length
              ? "todos"
              : selectedItems.length === 0
                ? "ninguno"
                : selectedItems.length}{" "}
            {selectedItems.length <= 1 ? "seleccionado" : "seleccionados"}
          </Description>
        </div>
        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className="h-96 overflow-y-auto">
            {items.map((item, i) => (
              <Product
                key={item.id}
                index={i}
                item={item}
                product={selectedProducts[i]}
                setValue={setValue}
              />
            ))}
          </div>
          <div className="border-primary-300 flex items-center justify-between border-t px-5 py-3">
            <span className="text-primary-800">Total estimado</span>
            <strong className="text-lg">
              {CURRENCY.format(calculateTotal())}
            </strong>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 pb-4">
            <Button
              variant="outline"
              type="button"
              className="w-40 rounded-3xl py-2"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1 rounded-3xl px-3 py-2"
            >
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Product({
  index,
  item,
  product: { name, imageUrl },
  setValue,
}: {
  index: number;
  item: z.infer<typeof CartSchema>["items"][number];
  product: Product;
  setValue: UseFormSetValue<z.infer<typeof CartSchema>>;
}) {
  const checked = item.selected;

  const handleToggle = () => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    setValue(`items.${index}.selected`, !checked);
  };

  return (
    <Field
      className={clsx(
        "flex w-full items-center justify-between gap-2 px-5 py-3 transition-opacity",
        !checked && "opacity-60",
        index !== 0 && "border-primary-300 border-t",
      )}
    >
      <Label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <Image
          src={imageUrl}
          alt={name}
          width={36}
          height={36}
          className="size-9 shrink-0"
        />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <h3 className={clsx("truncate", checked && "font-medium")}>{name}</h3>
          <span className="text-primary-800 text-sm font-medium">
            {CURRENCY.format(item.price * item.quantity)}
          </span>
        </div>
      </Label>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            disabled={item.quantity === 1}
            className="rounded-xl px-3 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              setValue(`items.${index}.quantity`, item.quantity - 1);
            }}
          >
            -
          </Button>
          <div className="text-primary-900 w-4 text-center font-medium">
            {item.quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl px-3 font-bold"
            onClick={(e) => {
              e.stopPropagation();
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              setValue(`items.${index}.quantity`, item.quantity + 1);
            }}
          >
            +
          </Button>
        </div>

        <Checkbox
          checked={checked}
          onChange={handleToggle}
          className="group border-primary-600 data-checked:bg-primary-600 grid size-5 place-content-center rounded border"
        >
          <CheckIcon className="text-primary-50 hidden size-5 group-data-checked:block" />
        </Checkbox>
      </div>
    </Field>
  );
}
