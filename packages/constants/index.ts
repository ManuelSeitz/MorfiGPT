import { ProductSource } from "@repo/types/products";

export const PRODUCT_SOURCES: ProductSource[] = [
  {
    name: "Carrefour",
    baseUrl: "https://www.carrefour.com.ar",
    imageHost: "carrefourar.vtexassets.com",
    slug: "carrefour",
  },
  {
    name: "Jumbo",
    baseUrl: "https://www.jumbo.com.ar",
    imageHost: "jumboargentina.vtexassets.com",
    slug: "jumbo",
  },
  {
    name: "Dia",
    baseUrl: "https://diaonline.supermercadosdia.com.ar",
    imageHost: "ardiaprod.vtexassets.com",
    slug: "dia",
  },
  {
    name: "ChangoMâs",
    baseUrl: "https://www.masonline.com.ar",
    imageHost: "masonlineprod.vtexassets.com",
    slug: "changomas",
  },
  {
    name: "Vea",
    baseUrl: "https://www.vea.com.ar",
    imageHost: "veaargentina.vtexassets.com",
    slug: "vea",
  },
  {
    name: "Disco",
    baseUrl: "https://www.disco.com.ar",
    imageHost: "discoargentina.vtexassets.com",
    slug: "disco",
  },
];

export const YOUTUBE_SEARCH_API_URL =
  "https://www.googleapis.com/youtube/v3/search";

export const YOUTUBE_VIDEOS_API_URL =
  "https://www.googleapis.com/youtube/v3/videos";

export const CURRENCY = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export const PERSONAL_URL = new URL("https://manuelseitz.com");
