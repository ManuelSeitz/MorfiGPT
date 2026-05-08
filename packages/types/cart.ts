import { Product } from "./products";

export interface Cart {
  id: string;
  items: (Product & { quantity: number })[];
  createdAt: string;
}
