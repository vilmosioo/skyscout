import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/gaia-tap': {
        target: 'https://gea.esac.esa.int/tap-server/tap',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gaia-tap/, ''),
      },
    },
  },
});
