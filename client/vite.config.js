import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],

  build: {
    rollupOptions: {
      output: {
        // Split the bundle into focused chunks so the initial page only loads
        // what it needs. Heavy vendor libs are cached separately and reused
        // across deploys when only app code changes.
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-misc':     ['react-icons', 'dompurify', 'zustand'],
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
