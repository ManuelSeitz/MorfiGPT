import ErrorIcon from "@/icons/error";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

export default function InputErrorMessage(
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >,
) {
  return (
    <p className="flex items-center gap-1 text-sm text-red-600">
      <ErrorIcon className="size-4" />
      <span>{props.children}</span>
    </p>
  );
}
