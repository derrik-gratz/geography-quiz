import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import json from "@eslint/json";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["node_modules/", "dist/"] },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js, react: pluginReact, "react-hooks": pluginReactHooks },
    ...js.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    ...pluginReact.configs.flat["jsx-runtime"],
    ...pluginReactHooks.configs["recommended-latest"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
