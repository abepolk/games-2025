import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      stylistic.configs.customize({
        semi: true,
        commaDangle: "never",
        quotes: "double"
      }),
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module"
      }
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          // This varsIgnorePattern is here because ESLint can't see that a declared component is used in JSX
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_$"
        }
      ],
      "@stylistic/indent": [
        "error",
        2,
        {
          offsetTernaryExpressions: false,
          SwitchCase: 1
        }
      ],
      "@stylistic/brace-style": ["error", "1tbs"]
    }
  },
  {
    // TODO maybe add the ESLint config too, haven't thought about that
    files: ["vite.config.js"],
    env: {
      node: true
    }
  }
]);
