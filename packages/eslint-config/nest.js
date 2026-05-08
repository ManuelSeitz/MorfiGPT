import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Nest.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nestJsConfig = [
  ...baseConfig,
  eslintNestJs.configs.flatRecommended,
  eslintNestJs.configs.flatNoSwagger,
  { rules: { "@typescript-eslint/no-extraneous-class": "off" } },
];
