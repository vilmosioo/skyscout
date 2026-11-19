import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', ['VITE_', 'LASAIR_']);
  const token = env.LASAIR_TOKEN || env.VITE_LASAIR_TOKEN || '';
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};

  return {
    plugins: [react()],
    envDir: '../../',
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api/lasair': {
          target: 'https://api.lasair.lsst.ac.uk',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api\/lasair/, '/api'),
          headers: authHeaders,
        },
        '/api': {
          target: 'https://api.lasair.lsst.ac.uk',
          changeOrigin: true,
          secure: true,
          headers: authHeaders,
        },
      },
    },
  };
});
