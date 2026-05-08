export interface ProductResponse {
  data: {
    productSuggestions: {
      products: RawProduct[];
    };
  };
}

export interface RawProduct {
  productId: string;
  productName: string;
  linkText: string;
  brand: string;
  priceRange: {
    sellingPrice: { highPrice: number; lowPrice: number };
    listPrice: { highPrice: number; lowPrice: number };
  };
  items: Item[];
  categories: string[];
}

export interface Item {
  itemId: string;
  measurementUnit: string;
  images: { imageId: string; imageUrl: string }[];
}

export interface ProductSource {
  name: string;
  baseUrl: string;
  imageHost: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  source: ProductSource;
  link: string;
  imageUrl: string;
}

export type FridgeProduct = Product & { quantity: number };
