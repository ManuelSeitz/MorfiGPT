import { AuthenticatedUser } from "@repo/types/auth";
import { create } from "zustand";

interface SessionState {
  user: AuthenticatedUser | null;
  setUser: (user: AuthenticatedUser | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
  },
}));
