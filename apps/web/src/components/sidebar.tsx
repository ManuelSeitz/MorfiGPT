"use client";
import { api } from "@/api/client";
import Button from "@/components/button";
import Modal from "@/components/modal";
import ChatIcon from "@/icons/chat";
import CloseIcon from "@/icons/close";
import DotsIcon from "@/icons/dots";
import FridgeIcon from "@/icons/fridge";
import Logo from "@/icons/logo";
import SearchIcon from "@/icons/search";
import SidebarIcon from "@/icons/sidebar";
import TrashIcon from "@/icons/trash";
import { groupChats } from "@/lib/group-chats";
import { useAssistant } from "@/stores/assistant";
import { Block, History, useHistory } from "@/stores/history";
import { useModal } from "@/stores/modal";
import { useSession } from "@/stores/session";
import { useSidebar } from "@/stores/sidebar";
import {
  Description,
  DialogTitle,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Chat } from "@repo/types/chats";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Sidebar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const user = useSession((s) => s.user);
  const {
    isSidebarOpen: isOpen,
    setIsSidebarOpen,
    toggleSidebar,
  } = useSidebar();

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setIsDesktop(isDesktop);
    setIsSidebarOpen(isDesktop);
  }, [setIsSidebarOpen]);

  return (
    <>
      <div
        className={clsx(
          !isOpen && "hidden",
          "bg-primary-900/15 fixed inset-0 z-20 backdrop-blur-[1px] md:hidden",
        )}
        onClick={toggleSidebar}
      />
      <aside
        className={clsx(
          "bg-primary-100 text-primary-900 border-r-primary-200 flex w-full flex-col gap-3 border-r transition-all",
          "z-20 max-md:absolute max-md:top-0 max-md:bottom-0 max-md:shadow-xl/15",
          !isOpen
            ? "max-w-13.25 max-md:max-w-65 max-md:-translate-x-full"
            : "max-w-65",
        )}
      >
        <header className="flex items-center justify-between p-2">
          {isOpen && (
            <Link
              href="/"
              className="hover:bg-primary-200 grid size-9 place-content-center rounded-md"
            >
              <Logo className="text-primary-800 size-5" />
            </Link>
          )}
          <button
            title={isOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
            aria-label={isOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
            className="group hover:bg-primary-200 grid size-9 cursor-pointer place-content-center rounded-md"
            onClick={toggleSidebar}
          >
            {!isOpen && (
              <Logo className="text-primary-800 size-5 group-hover:hidden" />
            )}
            <SidebarIcon
              className={clsx(
                "text-primary-600 size-5 max-md:hidden",
                !isOpen && "hidden group-hover:block",
              )}
            />
            <CloseIcon
              className={clsx(
                "text-primary-600 size-5 md:hidden",
                !isOpen && "hidden",
              )}
            />
          </button>
        </header>
        <Actions isDesktop={isDesktop} />
        {user && <Chats isOpen={isOpen} isDesktop={isDesktop} />}
      </aside>
    </>
  );
}

function Actions({ isDesktop }: { isDesktop: boolean }) {
  const user = useSession((s) => s.user);
  const { history, setHistory, setSelectedChat, resetChat } = useHistory();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const setIsLoginModalOpen = useModal((s) => s.setIsLoginModalOpen);
  const toggleSidebar = useSidebar((s) => s.toggleSidebar);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      setHistory([]);
      setSelectedChat(null);
    }
  }, [pathname, setHistory, setSelectedChat]);

  const actions: Record<string, [React.JSX.Element, () => void]> = {
    "Nuevo chat": [
      <ChatIcon key={0} className="size-5 shrink-0" strokeWidth={1.75} />,
      () => {
        router.replace("/");
        if (!user && history.length > 0) {
          setIsChatModalOpen(true);
        } else {
          resetChat();
        }
      },
    ],
    Productos: [
      <SearchIcon key={1} className="size-5 shrink-0" strokeWidth={1.75} />,
      () => {
        router.push("/productos");
      },
    ],
    Heladera: [
      <FridgeIcon key={2} className="size-5 shrink-0" strokeWidth={1.75} />,
      () => {
        if (user) {
          router.push("/heladera");
        } else {
          setIsLoginModalOpen(true);
        }
      },
    ],
  };

  return (
    <>
      <ul className="mb-2 flex flex-col gap-1 px-1.5">
        {Object.entries(actions).map(([label, [icon, action]]) => (
          <li key={label}>
            <button
              className="hover:bg-primary-200 flex w-full cursor-pointer items-center gap-1 rounded-lg px-2.25 py-1.5"
              onClick={() => {
                action();
                if (isDesktop) return;
                toggleSidebar();
              }}
            >
              {icon}
              <span className="truncate text-sm font-semibold">{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <Modal
        open={isChatModalOpen}
        closable
        onClose={() => {
          setIsChatModalOpen(false);
        }}
        className="w-md space-y-4"
      >
        <div className="space-y-2 text-center">
          <DialogTitle className="text-2xl">
            ¿Limpiar el chat actual?
          </DialogTitle>
          <Description>
            Inicia sesión para poder guardar nuevos chats.
          </Description>
        </div>
        <hr className="border-primary-200" />
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="primary"
            className="w-full rounded-3xl py-2 text-lg"
            onClick={() => {
              setIsLoginModalOpen(true);
              setIsChatModalOpen(false);
            }}
          >
            Inicia sesión
          </Button>
          <button
            className="text-primary-600 cursor-pointer text-sm font-bold"
            onClick={() => {
              resetChat();
              setIsChatModalOpen(false);
            }}
          >
            Limpiar chat
          </button>
        </div>
      </Modal>
    </>
  );
}

function Chats({ isOpen, isDesktop }: { isOpen: boolean; isDesktop: boolean }) {
  const { setHistory, selectedChat, setSelectedChat, setChatId } = useHistory();
  const { status } = useAssistant();
  const [chats, setChats] = useState<Chat[]>([]);
  const toggleSidebar = useSidebar((s) => s.toggleSidebar);
  const router = useRouter();

  useEffect(() => {
    api
      .get<Chat[]>("/chats")
      .then((res) => {
        setChats(res.data);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (status) return;
    const timeout = setTimeout(() => {
      api
        .get<Chat[]>("/chats")
        .then((res) => {
          setChats(res.data);
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    }, 10_000);
    return () => {
      clearTimeout(timeout);
    };
  }, [status]);

  const grouped = groupChats(chats);

  const selectChat = async (chat: Chat) => {
    const res = await api.get<Chat>(`/chats/${chat.id}`);

    const parsedHistory: History = res.data.messages.map(
      ({ role, content }) => {
        if (role === "assistant") {
          const parsedContent = JSON.parse(content) as Block[];
          return { role, content: parsedContent };
        }

        return { role, content };
      },
    );

    router.replace("/");
    setChatId(chat.id);
    setSelectedChat(chat);
    setHistory(parsedHistory);
    if (!isDesktop) toggleSidebar();
  };

  const deleteChat = async (chat: Chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);

      const newChats = chats.filter((c) => c.id !== chat.id);
      setChats(newChats);

      if (newChats.length === 0) {
        setHistory([]);
      }

      setSelectedChat(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className={clsx("space-y-3", !isOpen && "hidden")}>
      {Object.entries(grouped).map(([label, items]) => {
        if (items.length === 0) return null;

        return (
          <React.Fragment key={label}>
            <h3 className="text-primary-700 mb-1.5 px-4 text-sm font-bold">
              {label}
            </h3>
            <ul className="flex flex-col gap-1 px-1">
              {items.map((chat) => (
                <li
                  key={chat.id}
                  className={clsx(
                    "flex h-8 cursor-pointer items-center justify-between rounded-lg",
                    selectedChat?.id === chat.id
                      ? "bg-primary-300"
                      : "hover:bg-primary-200",
                  )}
                >
                  <div
                    className="group flex size-full cursor-pointer items-center justify-between truncate pr-2 pl-3 text-left text-sm"
                    onClick={() => void selectChat(chat)}
                  >
                    <div className="max-w-[90%] truncate">
                      {chat.title ?? "Chat sin nombre"}
                    </div>
                    <Menu>
                      <MenuButton
                        onClick={(e) => {
                          setSelectedChat(chat);
                          e.stopPropagation();
                          if (!isDesktop) toggleSidebar();
                        }}
                        className={clsx(
                          "hover:bg-primary-400 shrink-0 cursor-pointer rounded p-1",
                          isDesktop && "invisible group-hover:visible",
                        )}
                      >
                        <DotsIcon className="size-4" />
                      </MenuButton>
                      <MenuItems
                        transition
                        anchor="bottom end"
                        className="bg-primary-50 border-primary-500 z-30 flex min-w-40 origin-top flex-col rounded-xl border p-1.5 text-sm font-medium shadow transition duration-200 ease-out outline-none data-closed:scale-95 data-closed:opacity-0"
                      >
                        <MenuItem>
                          {({ close }) => (
                            <button
                              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                close();
                                void deleteChat(chat);
                              }}
                            >
                              <TrashIcon className="size-5" strokeWidth={1.5} />
                              Eliminar
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </li>
              ))}
            </ul>
          </React.Fragment>
        );
      })}
    </section>
  );
}
