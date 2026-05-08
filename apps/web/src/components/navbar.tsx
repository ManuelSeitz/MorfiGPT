"use client";
import { api } from "@/api/client";
import BarsIcon from "@/icons/bars";
import LogoutIcon from "@/icons/logout";
import UserIcon from "@/icons/user";
import { useHistory } from "@/stores/history";
import { useModal } from "@/stores/modal";
import { useSession } from "@/stores/session";
import { useSidebar } from "@/stores/sidebar";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuSeparator,
} from "@headlessui/react";
import { AuthenticatedUser } from "@repo/types/auth";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ShoppingCart from "./cart";
import LoginForm from "./forms/auth/login";
import SignupForm from "./forms/auth/sign-up";

export default function Navbar({ user }: { user: AuthenticatedUser | null }) {
  const { user: userState, setUser } = useSession();
  const toggleSidebar = useSidebar((s) => s.toggleSidebar);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return (
    <nav className="max-2xl:border-primary-200 max-2xl:bg-primary-50 absolute top-0 z-10 flex h-13 w-full shrink-0 items-center justify-between px-2 max-2xl:border-b">
      <div className="ml-2 flex items-center gap-4">
        <button
          type="button"
          title="Abrir menú lateral"
          aria-label="Abrir menú lateral"
          className="text-primary-600 cursor-pointer md:hidden"
          onClick={toggleSidebar}
        >
          <BarsIcon className="size-6" />
        </button>
        <h2 className="text-lg font-bold">MorfiGPT</h2>
      </div>
      {!userState ? (
        <div className="flex items-center gap-2">
          <LoginForm />
          <SignupForm />
        </div>
      ) : (
        <div className="mr-2 flex items-center gap-2">
          <ShoppingCart />
          <UserMenu user={userState} />
        </div>
      )}
    </nav>
  );
}

function UserMenu({ user }: { user: AuthenticatedUser }) {
  return (
    <Menu>
      <MenuButton className="bg-primary-100 grid size-6 cursor-pointer place-content-center overflow-hidden rounded-full shadow outline">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt="Foto de perfil"
            width={24}
            height={24}
            className="size-6"
          />
        ) : (
          <UserIcon className="size-5" />
        )}
      </MenuButton>
      <MenuItems
        transition
        anchor="bottom end"
        className={clsx(
          "bg-primary-50 border-primary-400 w-3xs origin-top space-y-1.5 rounded-xl border p-2 shadow-md/15 [--anchor-gap:6px]",
          "transition duration-200 ease-in",
          "data-closed:-translate-y-2 data-closed:opacity-0",
          "relative z-20",
        )}
      >
        <MenuSection>
          <div className="flex items-center gap-2 p-2">
            <div className="bg-primary-100 text-primary-900 grid size-10 shrink-0 place-content-center overflow-hidden rounded-full shadow outline">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Foto de perfil"
                  width={40}
                  height={40}
                  className="size-10"
                />
              ) : (
                <UserIcon className="size-8" strokeWidth={1.25} />
              )}
            </div>
            <div className="min-w-0">
              <div className="leading-4 font-bold">
                {user.name ?? "Usuario"}
              </div>
              <div className="text-primary-700 truncate text-sm">
                {user.email}
              </div>
            </div>
          </div>
        </MenuSection>
        <MenuSeparator className="bg-primary-300 mx-2 h-px" />
        <MenuSection>
          <MenuItem>
            <LogoutButton />
          </MenuItem>
        </MenuSection>
      </MenuItems>
    </Menu>
  );
}

function LogoutButton() {
  const router = useRouter();
  const { setUser } = useSession();
  const resetChat = useHistory((s) => s.resetChat);
  const setIsLoginModalOpen = useModal((s) => s.setIsLoginModalOpen);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setIsLoginModalOpen(false);
    resetChat();
    router.replace("/");
  };

  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-red-700 hover:bg-red-50"
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={() => {
        void handleLogout();
      }}
    >
      <LogoutIcon className="size-5" strokeWidth={3.5} />
      <span>Cerrar sesión</span>
    </button>
  );
}
