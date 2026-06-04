import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'app.webmanifest',
      includeAssets: [
        'favicon.svg', 
        'pwa/Cityguard-logo-lightmode.png', 
        'pwa/Cityguard-logo-darkmode.png',
        'pwa/round logo-darkmode.png',
        'pwa/round-logo-lightmode.png'
      ],
      manifest: {
        name: 'City Guard',
        short_name: 'City Guard',
        description: 'City Guard Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa/round-logo-lightmode.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa/round logo-darkmode.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
