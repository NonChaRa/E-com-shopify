import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    // Converts imported images at build time (PNG→WebP, resize, compress).
    // Use by appending query params to any asset import:
    //   import hero from './foo.png?format=webp&quality=80&w=1920'
    imagetools(),
    basicSsl(),
  ],

  build: {
    rollupOptions: {
      output: {
        // Converted from Object to Function for Vite 8 / Rolldown compatibility
        manualChunks(id) {
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
    chunkSizeWarningLimit: 600,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
