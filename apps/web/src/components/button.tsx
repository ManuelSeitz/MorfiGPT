import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "link";
}

export default function Button({
  children,
  variant = "primary",
  ...props
}: Props) {
  if (variant === "primary") {
    return (
      <button
        {...props}
        className={clsx(
          "bg-primary-900 text-primary-50 cursor-pointer",
          props.className,
        )}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        {...props}
        className={clsx(
          "bg-primary-100 text-primary-700 cursor-pointer",
          props.className,
        )}
      >
        {children}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        {...props}
        className={clsx(
          "bg-primary-transparent hover:border-primary-500 border-primary-400 text-primary-900 cursor-pointer border",
          "disabled:cursor-not-allowed disabled:opacity-50",
          props.className,
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      {...props}
      className={clsx(
        "text-primary-900 cursor-pointer hover:underline",
        props.className,
      )}
    >
      {children}
    </button>
  );
}
