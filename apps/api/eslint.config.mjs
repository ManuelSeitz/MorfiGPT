import { nestJsConfig } from "@repo/eslint-config/nest-js";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([...nestJsConfig]);

export default eslintConfig;
