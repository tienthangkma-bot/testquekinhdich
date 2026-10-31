import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          if (id.includes('packages/domain')) {
            return 'kindich-domain';
          }
          if (id.includes('packages/calendar')) {
            return 'kindich-calendar';
          }
          if (id.includes('packages/core')) {
            return 'kindich-core';
          }
          if (id.includes('packages/shared')) {
            return 'kindich-shared';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
