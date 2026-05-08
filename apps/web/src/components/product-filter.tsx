import FilterIcon from "@/icons/filter";
import LoaderIcon from "@/icons/loader";
import {
  Checkbox,
  Popover,
  PopoverButton,
  PopoverPanel,
  Select,
} from "@headlessui/react";
import { PRODUCT_SOURCES } from "@repo/constants";
import clsx from "clsx";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import Field from "./forms/field";
import Label from "./forms/label";

export default function ProductFilter({
  isLoading,
  sourceBlacklist,
  setSourceBlacklist,
  orderBy,
  setOrderBy,
}: {
  isLoading: boolean;
  sourceBlacklist: string[];
  setSourceBlacklist: Dispatch<SetStateAction<string[]>>;
  orderBy: string | null;
  setOrderBy: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <Popover className="relative">
      <PopoverButton
        type="button"
        disabled={isLoading}
        className={clsx(
          "grid size-9 place-content-center rounded-full",
          isLoading
            ? "cursor-not-allowed bg-neutral-200"
            : "bg-primary-100 cursor-pointer",
        )}
      >
        {isLoading ? (
          <LoaderIcon className="size-5 animate-spin text-neutral-500" />
        ) : (
          <FilterIcon className="text-primary-600 size-5" />
        )}
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom end"
        className="bg-primary-50 border-primary-700 max-w-md! origin-top space-y-3 rounded-2xl border p-3.5 text-sm shadow transition duration-150 ease-in-out [--anchor-gap:20px] data-closed:-translate-y-2 data-closed:opacity-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <section className="space-y-2">
          <h3 className="leading-3.5 font-bold">Supermercados</h3>
          <div className="flex flex-wrap items-center gap-2">
            {PRODUCT_SOURCES.map(({ name, slug }, i) => (
              <Checkbox
                key={i}
                checked={!sourceBlacklist.includes(slug)}
                onChange={() => {
                  if (sourceBlacklist.includes(slug)) {
                    setSourceBlacklist((prev) =>
                      prev.filter((s) => s !== slug),
                    );
                  } else {
                    setSourceBlacklist((prev) => [...prev, slug]);
                  }
                }}
                className={clsx(
                  "border-primary-200 data-checked:bg-primary-100 data-checked:border-primary-600 flex cursor-pointer items-center gap-1 rounded-3xl border px-2 py-1",
                )}
              >
                <Image
                  src={`/images/${slug}.png`}
                  alt={name}
                  width={16}
                  height={16}
                />
                <span>{name}</span>
              </Checkbox>
            ))}
          </div>
        </section>
        <hr className="border-primary-200" />
        <Field className="flex flex-col gap-2">
          <Label className="w-fit leading-3.5 font-bold">Ordenar por</Label>
          <Select
            className="border-primary-400 rounded-xl border px-2 py-1"
            value={orderBy ?? undefined}
            onChange={(e) => {
              setOrderBy(e.target.value);
            }}
          >
            <option value="source">Supermercado</option>
            <option value="price">Precio final</option>
          </Select>
        </Field>
      </PopoverPanel>
    </Popover>
  );
}
