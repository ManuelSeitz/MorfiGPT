import { create } from "zustand";

type AssistantStatus = "thinking" | "cooking" | "streaming" | null;

interface AssistantState {
  status: AssistantStatus;
  setStatus: (status: AssistantStatus) => void;
}

export const useAssistant = create<AssistantState>((set) => ({
  status: null,
  setStatus: (status) => {
    set({ status });
  },
}));
