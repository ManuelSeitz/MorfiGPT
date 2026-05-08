import { RefObject, useEffect } from "react";

export function useTextboxKeydown(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
) {
  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (!target) return;

      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key !== "Enter" && !e.ctrlKey) {
        ref.current?.focus();
      }
    };

    window.addEventListener("keydown", keydownHandler);

    return () => {
      window.removeEventListener("keydown", keydownHandler);
    };
  }, [ref]);
}
