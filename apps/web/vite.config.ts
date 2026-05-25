import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ['jaren.home'],
  },
  plugins: [
    tanstackStart({ spa: { enabled: process.env.BUILD_TARGET === 'desktop' } }),
    viteReact(),
  ],
});
