import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import Button, { Props } from "./button";

export default function Textbox({
  children,
  ref,
  actions,
  ...props
}: {
  children: React.ReactNode;
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  actions?: (Props & { isButton?: boolean; show?: boolean })[];
} & Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
>) {
  return (
    <div
      className={clsx(
        "flex min-h-14.5 w-full cursor-text items-end p-2.5",
        "bg-primary-50 border-primary-400 rounded-4xl border",
        "[&_textarea]:resize-none",
        "[&_textarea,&_input]:placeholder:text-primary-500 [&_textarea,&_input]:outline-0 [&_textarea,&_input]:placeholder:font-medium",
        props.className,
      )}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        if (target.closest("[data-headlessui-state]")) {
          return;
        }

        e.preventDefault();
        ref.current?.focus();
      }}
    >
      {children}
      {actions?.map(({ isButton, show, ...props }, i) => {
        if (show !== undefined && !show) return null;

        if (isButton || isButton === undefined) {
          return (
            <Button key={i} {...props}>
              {props.children}
            </Button>
          );
        }

        return <div key={i}>{props.children}</div>;
      })}
    </div>
  );
}
