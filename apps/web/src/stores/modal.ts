import { create } from "zustand";

interface ModalState {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

export const useModal = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  setIsLoginModalOpen: (isOpen) => {
    set({ isLoginModalOpen: isOpen });
  },
}));
