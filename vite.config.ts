import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/polymarket-api': {
            target: 'https://gamma-api.polymarket.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/polymarket-api/, ''),
          },
          '/polymarket-data': {
            target: 'https://data-api.polymarket.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/polymarket-data/, ''),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
