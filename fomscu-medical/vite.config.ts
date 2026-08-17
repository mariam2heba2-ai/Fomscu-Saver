import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Simple Vite config. No extra plugins needed.
export default defineConfig({
  plugins: [react()],
});
