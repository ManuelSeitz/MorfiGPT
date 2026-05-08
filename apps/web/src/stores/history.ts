import { Chat } from "@repo/types/chats";
import { create } from "zustand";

type UserMessage = {
  role: "user";
  content: string;
};

type ErrorMessage = {
  role: "error";
  content: string;
};

type AssistantMessage = {
  role: "assistant";
  content: Block[];
};

export type History = (UserMessage | AssistantMessage | ErrorMessage)[];

export type Block = {
  type: string;
  content: string;
};

interface HistoryState {
  history: History;
  setHistory: (history: History) => void;
  chatId: string;
  setChatId: (id: string) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  addUserMessage: (content: string) => void;
  initAssistantMessage: () => void;
  updateAssistantMessage: (block: Block) => void;
  addErrorMessage: (content: string) => void;
  resetChat: () => void;
}

export const useHistory = create<HistoryState>((set) => ({
  history: [],
  setHistory: (history) => {
    set(() => ({ history }));
  },

  chatId: crypto.randomUUID(),
  setChatId: (id) => {
    set({ chatId: id });
  },

  selectedChat: null,
  setSelectedChat: (chat) => {
    set(() => ({ selectedChat: chat }));
  },

  addUserMessage: (content) => {
    set((state) => ({
      history: [...state.history, { role: "user", content }],
    }));
  },

  initAssistantMessage: () => {
    set((state) => ({
      history: [...state.history, { role: "assistant", content: [] }],
    }));
  },

  updateAssistantMessage: (block) => {
    set((state) => {
      const history = [...state.history];
      const last = history[history.length - 1] as History[number] | undefined;

      if (last?.role === "assistant") {
        last.content = [...last.content, block];
      }

      return { history };
    });
  },

  addErrorMessage: (content) => {
    set((state) => ({
      history: [...state.history, { role: "error", content }],
    }));
  },

  resetChat: () => {
    set(() => ({
      chatId: crypto.randomUUID(),
      history: [],
      selectedChat: null,
    }));
  },
}));
