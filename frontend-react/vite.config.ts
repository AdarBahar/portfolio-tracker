import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for production deployment
  // Note: Keep in sync with server configuration and .htaccess RewriteBase
  // For development (localhost), use root path to avoid OAuth origin issues
  base: process.env.NODE_ENV === 'production' ? '/fantasybroker/react/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: '../react',
    emptyOutDir: true,
    // Disable sourcemaps in production to avoid leaking source code
    // Enable only in staging or with restricted access
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.* and debugger statements in production
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
})
