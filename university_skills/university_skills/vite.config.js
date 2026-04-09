import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('@supabase/supabase-js')) return 'supabase'
        },
      },
    },
  },
})
