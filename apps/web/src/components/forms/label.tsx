import { Label as LabelComponent } from "@headlessui/react";
import clsx from "clsx";
import { DetailedHTMLProps, LabelHTMLAttributes } from "react";

interface Props extends DetailedHTMLProps<
  LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> {
  required?: boolean;
}

export default function Label({ required = false, ...props }: Props) {
  return (
    <LabelComponent
      {...props}
      className={clsx("w-fit font-medium", props.className)}
    >
      <span>{props.children}</span>
      {required && <span className="text-red-500"> *</span>}
    </LabelComponent>
  );
}
