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
      '/api/nasa/mast': {
        target: 'https://mast.stsci.edu/api/v0/tap',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nasa\/mast/, ''),
      },
      '/api/nasa': {
        target: 'https://irsa.ipac.caltech.edu/TAP',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nasa(\/ipac)?/, ''),
      },
      '/api/skyview': {
        target: 'https://skyview.gsfc.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/skyview/, ''),
      },
      '/api/hips': {
        target: 'https://alasky.cds.unistra.fr/hips-image-services/hips2fits',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/hips/, ''),
      },
    },
  },
});
