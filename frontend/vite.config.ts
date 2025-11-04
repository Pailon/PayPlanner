import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Плагин для отображения статуса запуска
function successBanner() {
  return {
    name: 'success-banner',
    configureServer(server: any) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          console.log('\n' + '='.repeat(60));
          console.log('🎨 PayPlanner Frontend успешно запущен!');
          console.log('='.repeat(60));
          console.log(`🌐 Local: http://localhost:3001`);
          console.log(`🌐 Network: http://192.168.1.X:3001`);
          console.log(`📱 Ready for Telegram Mini App testing`);
          console.log('='.repeat(60) + '\n');
        }, 100);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    successBanner(),
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

