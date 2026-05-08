import Button from "@/components/button";
import GoogleIcon from "@/icons/google";
import { useModal } from "@/stores/modal";
import { useSession } from "@/stores/session";
import { AuthenticatedUser } from "@repo/types/auth";
import { useEffect } from "react";

export default function GoogleAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useSession((s) => s.setUser);
  const setIsLoginModalOpen = useModal((s) => s.setIsLoginModalOpen);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_API_URL) return;
      const data = event.data as { type: string; user: AuthenticatedUser };

      if (data.type === "GOOGLE_AUTH_SUCCESS") {
        setUser(data.user);
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setUser, setIsLoginModalOpen]);

  const handleLogin = () => {
    const width = 500;
    const height = 600;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const windowFeatures = `
      popup,
      width=${width.toString()},
      height=${height.toString()},
      left=${left.toString()},
      top=${top.toString()},
      resizable=yes,
      scrollbars=yes,
    `;

    window.open(
      new URL("/auth/google", process.env.NEXT_PUBLIC_API_URL),
      "Google Auth",
      windowFeatures,
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="flex w-full items-center justify-center gap-2 rounded-3xl py-2 font-medium"
      onClick={handleLogin}
    >
      <GoogleIcon className="size-5" />
      {children}
    </Button>
  );
}
