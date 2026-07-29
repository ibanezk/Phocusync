import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Si estás en local ejecutando el servidor, usa '/'
    // Si estás compilando para producción (Vercel), usa '/app/dist/'
    base: command === "serve" ? "/" : "/",

    server: {
      port: 3003,
      proxy: {
        "/api": {
          target: "http://localhost:3004", // Puerto donde corre Vercel CLI
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
