import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
// import neverthrow from "eslint-plugin-neverthrow"; // TODO: Re-enable when ESLint 9 support is available
import tseslint from "typescript-eslint";

export default tseslint.config(
  { 
    ignores: [
      "dist", 
      "*.json", 
      "*.d.ts",
      "worker-configuration.d.ts",
      "tsconfig*.json",
      "package*.json",
      "pnpm-*.yaml",
      "wrangler.json"
    ] 
  },
  // React app configuration
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/react-app/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint.plugin,
      // "neverthrow": neverthrow,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TODO: Re-enable when neverthrow plugin supports ESLint 9
      // "neverthrow/must-use-result": "error",
    },
  },
  // Worker configuration
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/worker/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.worker.json"],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      // "neverthrow": neverthrow,
    },
    rules: {
      // TODO: Re-enable when neverthrow plugin supports ESLint 9
      // "neverthrow/must-use-result": "error",
    },
  },
  // Node/Vite config files
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["*.config.ts", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.node.json"],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
);
