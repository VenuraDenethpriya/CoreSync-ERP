import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   workbox: {
    //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, 
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'], 
    //   },
    //   includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
    //   manifest: {
    //     name: "Renewaa Inventory Management System",
    //     short_name: "RIMS",
    //     description: "Inventory Management System for Renewaa",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    // host: '0.0.0.0',
    port: 80,
    allowedHosts: ["rims.renewaa.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

 build: {
    sourcemap: false, 
  }
})
