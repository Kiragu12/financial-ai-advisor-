/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5274,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
