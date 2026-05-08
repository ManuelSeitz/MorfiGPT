import { create } from "zustand";

interface SidebarState {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },
  toggleSidebar: () => {
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen }));
  },
}));
