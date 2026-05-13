import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single copy of React throughout the entire bundle.
    // Without this, circular dependencies between components/ui packages
    // can cause Vite to bundle two separate React instances, leading to
    // the "Cannot read properties of null (reading 'useState')" crash.
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  // Pre-bundle all React-family packages together so they share a single
  // module scope at runtime. This is the definitive fix for the white screen.
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "@tanstack/react-query",
    ],
    // Prevent Vite from accidentally treating these as CJS/ESM boundary issues
    exclude: [],
  },
  build: {
    // Produce a single vendor chunk for all of React so it loads atomically.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Force ALL react-related code into one chunk
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          // Group all radix-ui into one chunk to prevent circular dep splitting
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-vendor";
          }
        },
      },
    },
  },
});
