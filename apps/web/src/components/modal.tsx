import CloseIcon from "@/icons/close";
import {
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  closable?: boolean;
}

export default function Modal({
  children,
  open,
  onClose,
  closable = false,
  ...props
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      transition
      className="relative z-50 transition duration-150 ease-in-out data-closed:opacity-0"
    >
      <DialogBackdrop className="bg-primary-900/15 fixed inset-0 backdrop-blur-[1px]" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          as="div"
          className={clsx(
            "bg-primary-50 border-primary-400 relative max-w-xl rounded-2xl border p-5 shadow",
            props.className,
          )}
          style={props.style}
        >
          {closable && (
            <CloseButton className="text-primary-900 absolute top-2 right-2 grid size-7 cursor-pointer place-content-center">
              <CloseIcon className="size-5" />
            </CloseButton>
          )}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
