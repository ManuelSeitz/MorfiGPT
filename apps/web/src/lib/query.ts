import QueryString from "qs";

export function stringifyQuery(params: Record<string, object>) {
  return QueryString.stringify(params, {
    encode: true,
    skipNulls: true,
    arrayFormat: "repeat",
  });
}
