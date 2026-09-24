import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = `http://localhost:${process.env.PORT ?? 8787}`;

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': { target: API, changeOrigin: true } } },
});
