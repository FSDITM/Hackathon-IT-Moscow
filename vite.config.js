import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Все запросы /api/* → прокси-сервер GigaChat
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
