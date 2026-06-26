import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy dev: /api -> backend, agar tidak perlu CORS saat lokal
    proxy: { "/api": "http://localhost:5000" },
  },
});
