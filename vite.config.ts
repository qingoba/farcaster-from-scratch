import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api/rpc': {
        target: 'https://sepolia-rollup.arbitrum.io/rpc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rpc/, ''),
      }
    }
  },
});
