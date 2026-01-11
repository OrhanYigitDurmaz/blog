// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      // allow the specific host from the error message
      allowedHosts: [
        "*",
        "orhandurmaz.dev",
        "concerned-mailto-delays-professionals.trycloudflare.com",
      ],
    },
  },
});
