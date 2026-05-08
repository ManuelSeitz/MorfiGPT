import { Field as FieldComponent } from "@headlessui/react";
import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export default function Field(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
  return (
    <FieldComponent
      {...props}
      className={clsx("flex flex-col gap-0.5", props.className)}
    >
      {props.children}
    </FieldComponent>
  );
}
