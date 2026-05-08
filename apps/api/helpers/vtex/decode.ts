import { Extensions } from "@repo/types/vtex";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

async function setup() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  const vtexURL = await rl.question("VTEX URL: ");
  if (!vtexURL) {
    throw Error("VTEX URL required");
  }

  const { sha256Hash } = decodeVTEX(new URL(vtexURL));

  console.log(`SHA256 HASH: ${sha256Hash}`);

  rl.close();
}

function decodeVTEX(url: URL) {
  const params = url.searchParams;

  const extensions = params.get("extensions");
  if (!extensions) {
    throw new Error("Extensions query param is missing");
  }

  const extensionsJSON = JSON.parse(extensions) as Extensions;
  console.log(atob(JSON.stringify(extensionsJSON.variables)));

  return { sha256Hash: extensionsJSON.persistedQuery.sha256Hash };
}

void setup();
