import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import mocha from "eslint-plugin-mocha";
import prettier from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: ["**/dist/**"],
  },
  {
    languageOptions: { globals: { ...globals.node } },
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  mocha.configs.flat.recommended,
  prettier,
  {
    rules: {
      // Setup for test cases in mocha should be done in before, beforeEach,
      // or it blocks. Unfortunately there is nothing stopping you from doing
      // setup directly inside a describe block.
      "mocha/no-setup-in-describe": "off",
    },
  },
];
