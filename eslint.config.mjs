// Travas de qualidade (vibe-coding-toolkit, prompt 08), adaptadas a este app:
// scripts clássicos do navegador que compartilham o escopo global, sem imports.
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import quality from "./eslint-rules/index.cjs";

export default defineConfig([
  globalIgnores(["node_modules/", "vendor/", "supabase/", "icons/"]),
  {
    files: ["js/**/*.js", "sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser, ...globals.serviceworker, supabase: "readonly" },
    },
    plugins: { quality },
    rules: {
      ...js.configs.recommended.rules,
      // Os arquivos de js/ dividem o escopo global (cada um usa o que os
      // anteriores definem), então estas duas regras não se aplicam aqui.
      "no-undef": "off",
      "no-unused-vars": "off",
      "quality/max-lines": ["error", { max: 350 }],
      "quality/no-direct-console": ["error", { allow: ["warn"], logger: "console.warn (único uso permitido)" }],
      // catch vazio é intencional: localStorage pode falhar em aba privada.
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
]);
