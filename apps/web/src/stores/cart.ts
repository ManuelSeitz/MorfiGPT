import { Cart } from "@repo/types/cart";
import { create } from "zustand";

interface CartState {
  cart: Cart | null;
  updateCart: (cart: Cart | null) => void;
}

export const useCart = create<CartState>((set) => ({
  cart: null,
  updateCart: (cart) => {
    set(() => ({ cart }));
  },
}));
