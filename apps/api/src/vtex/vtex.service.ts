import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Extensions } from "@repo/types/vtex";

@Injectable()
export class VtexService {
  constructor(private readonly configService: ConfigService) {}

  decode(url: URL) {
    const params = url.searchParams;

    const extensions = params.get("extensions");
    if (!extensions) {
      throw new Error("Extensions query param is missing");
    }

    const extensionsJSON = JSON.parse(extensions) as Extensions;
    console.log(atob(JSON.stringify(extensionsJSON.variables)));

    return { sha256Hash: extensionsJSON.persistedQuery.sha256Hash };
  }

  encode(baseUrl: string, query: string, limit?: number) {
    const VTEX_HASH = this.configService.get<string>("VTEX_SHA256_HASH");

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
        count: limit ?? 10,
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
}
