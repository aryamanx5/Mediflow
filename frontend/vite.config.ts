import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The backend is an existing, separately-run Express service. In dev we proxy
// /api to it so the browser sees a single origin and no CORS/auth edge cases.
// Override with VITE_API_TARGET when the backend runs on another port.
const API_TARGET = process.env.VITE_API_TARGET || "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
});
