import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',        // output folder
      emptyOutDir: true,     // clear before build
      assetsDir: 'assets',   // assets go under /static/assets
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(
        isProduction
          ? 'https://grouph-h.onrender.com'
          : 'http://localhost:8000'
      ),
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      fs: {
        strict: false,
      },
      // Hot Module Replacement over HTTPS
      hmr: {
        clientPort: 443,
        overlay: false,
      },
      // Proxy API calls to Django backend during development
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  };
})
