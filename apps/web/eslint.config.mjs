import { nextJsConfig } from "@repo/eslint-config/next-js";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([...nextJsConfig]);

export default eslintConfig;
