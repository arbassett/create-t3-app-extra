import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/client.mjs"));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
