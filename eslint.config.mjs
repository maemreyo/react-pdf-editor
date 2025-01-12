import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
    )
  ),
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.husky/**",
      "**/.idea/**",
      "**/.vscode/**",
      "**/build/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "!/.storybook", // Ensure .storybook is not ignored
      "!/vite.config.ts", // Ensure vite.config.ts is not ignored
      "!/eslint.config.mjs", // Ensure eslint.config.mjs is not ignored
      "!.storybook", // Ensure .storybook is not ignored
      "!vite.config.ts", // Ensure vite.config.ts is not ignored
      "!eslint.config.mjs", // Ensure eslint.config.mjs is not ignored
      "/*.*", // Ignore all files at root level except specific mentioned above
    ],
    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      prettier: fixupPluginRules(prettier),
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.eslint.json"], // Use the new tsconfig.eslint.json
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "react/prop-types": "off", // Disable react/prop-types as we are using TypeScript
      "react/react-in-jsx-scope": "off", // Disable this as React 17+ no longer needs this
    },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "react/prop-types": "off", // Disable react/prop-types for stories files
    },
  },
];
