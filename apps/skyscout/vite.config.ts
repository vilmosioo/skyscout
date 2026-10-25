import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '../../',
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.lasair.lsst.ac.uk',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
