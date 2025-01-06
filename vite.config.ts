import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/r2': {
        target: 'https://d201ab745ab7ea0913da8a38e3989474.r2.cloudflarestorage.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r2/, ''),
        secure: false,
        headers: {
          'Host': 'd201ab745ab7ea0913da8a38e3989474.r2.cloudflarestorage.com'
        }
      }
    }
  }
});
