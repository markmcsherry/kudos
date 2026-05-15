import js from "@eslint/js";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**"]
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "tests/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly"
      }
    },
    plugins: {
      react,
      "react-hooks": hooks
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off"
    }
  }
];
