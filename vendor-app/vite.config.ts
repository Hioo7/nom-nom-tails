import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  envDir: '..',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['nomnomlogo.webp', 'nomnomlogo_192.png'],
      manifest: {
        name: 'NomNom Tails',
        short_name: 'NomNom Tails',
        description: 'Staff portal for NomNom Tails delivery operations',
        theme_color: '#f59e0b',
        background_color: '#fefce8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'nomnomlogo_192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'nomnomlogo_192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
