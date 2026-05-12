import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
    https: false,
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: [
        'fiscally-omen-unglue.ngrok-free.dev'
    ]
  }
});
