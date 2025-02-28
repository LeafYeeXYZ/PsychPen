import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintConfigPrettier from "eslint-config-prettier"

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { 
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      'react/react-in-jsx-scope': 'off', // 无需显式引入 React
      'react/no-unescaped-entities': 'off', // 避免代码阅读负担
      '@typescript-eslint/no-unused-expressions': 'off', // 把 if (a) b 简化为 a && b
    },
  },
  eslintConfigPrettier,
]
