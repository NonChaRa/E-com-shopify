import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],

  build: {
    rollupOptions: {
      output: {
        // Converted from Object to Function for Vite 8 / Rolldown compatibility
        manualChunks(id) {
          // Only split out dependencies coming from node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-icons') || id.includes('dompurify') || id.includes('zustand')) {
              return 'vendor-misc';
            }
          }
        },
      },
    },
    // Raise the warning limit slightly — the supabase chunk is legitimately large
    chunkSizeWarningLimit: 600,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
});