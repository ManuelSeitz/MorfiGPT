import { Extensions } from "@repo/types/vtex";

const VTEX_HASH = process.env.VTEX_SHA256_HASH;

export function encodeVTEX(baseUrl: string, query: string) {
  if (!VTEX_HASH) {
    throw Error("SHA256 HASH required");
  }

  const url = new URL("_v/segment/graphql/v1", baseUrl);
  url.searchParams.set("operationName", "productSuggestions");

  const extensions: Extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: VTEX_HASH,
      sender: "vtex.store-resources@0.x",
      provider: "vtex.search-graphql@0.x",
    },
    variables: {
      productOriginVtex: true,
      simulationBehavior: "default",
      hideUnavailableItems: true,
      fullText: query,
      count: 4,
    },
  };

  const variablesJSON = JSON.stringify(extensions.variables);
  const variablesBase64 = Buffer.from(variablesJSON).toString("base64url");

  url.searchParams.set(
    "extensions",
    JSON.stringify({ ...extensions, variables: variablesBase64 }),
  );

  return url;
}

// encodeVTEX("https://www.carrefour.com.ar/", "Mayonesa Hellmann's 475 Gr");
