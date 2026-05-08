export interface Extensions {
  persistedQuery: PersistedQuery;
  variables: Variables;
}

export interface PersistedQuery {
  version: number;
  sha256Hash: string;
  sender: string;
  provider: string;
}

export interface Variables {
  productOriginVtex: boolean;
  simulationBehavior: "default";
  hideUnavailableItems: boolean;
  fullText: string;
  count: number;
}
