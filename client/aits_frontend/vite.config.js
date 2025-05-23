import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const base = '/'; // Changed for Vercel compatibility
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // assetsDir: 'assets', // This is the default and usually fine
      // manifest: true, // Optional: useful if you were to integrate with django-vite
    },
    base: base, // Set base to '/'
    server: {
      fs: {
        strict: false
      }
    }
  };
})
