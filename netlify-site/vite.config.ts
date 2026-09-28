import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = `http://localhost:${process.env.PORT ?? 8787}`;

// PAGES_BASE is set by the GitHub Pages build, which lives under /<repo>/.
export default defineConfig({
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react()],
  server: { proxy: { '/api': { target: API, changeOrigin: true } } },
});
