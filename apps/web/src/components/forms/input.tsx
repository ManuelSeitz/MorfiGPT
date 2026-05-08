import EyeIcon from "@/icons/eye";
import EyeClosedIcon from "@/icons/eye-closed";
import { Input as InputComponent } from "@headlessui/react";
import clsx from "clsx";
import {
  useState,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from "react";

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function Input(props: Props) {
  if (props.type === "password") return <PasswordInput {...props} />;

  return (
    <InputComponent
      {...props}
      className={clsx(
        "data-focus:border-primary-900 border-primary-300 rounded-2xl border px-2 py-1 focus:outline-none data-error:border-red-600",
        props.className,
      )}
    />
  );
}

function PasswordInput(props: Props) {
  const [isShowing, setIsShowing] = useState(false);
  const buttonLabel = isShowing ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <div
      className={clsx(
        "data-focus:border-primary-900 border-primary-300 flex h-8.5 items-center gap-2 rounded-2xl border px-2 py-1 focus:outline-none data-error:border-red-600",
        props.className,
      )}
    >
      <InputComponent
        {...props}
        type={isShowing ? "text" : "password"}
        className={clsx("flex-1 outline-none", !isShowing && "text-sm")}
      />
      <button
        type="button"
        title={buttonLabel}
        aria-label={buttonLabel}
        onClick={() => {
          setIsShowing((prev) => !prev);
        }}
        className="cursor-pointer"
      >
        {isShowing ? (
          <EyeClosedIcon className="size-5" />
        ) : (
          <EyeIcon className="size-5" />
        )}
      </button>
    </div>
  );
}
