import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePlugin } from '@twa-dev/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 3001,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['antd'],
        },
      },
    },
  },
});

