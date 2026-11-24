import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api/gaia': {
        target: 'https://gea.esac.esa.int',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/gaia/, '/tap-server/tap'),
      },
      '/gaia-tap': {
        target: 'https://gea.esac.esa.int',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gaia-tap/, '/tap-server/tap'),
      },
      '/api/nasa/mast': {
        target: 'https://mast.stsci.edu',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nasa\/mast/, '/api/v0/tap'),
      },
      '/api/nasa/ipac': {
        target: 'https://irsa.ipac.caltech.edu',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nasa\/ipac/, '/TAP'),
      },
      '/api/nasa': {
        target: 'https://irsa.ipac.caltech.edu',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/nasa/, '/TAP'),
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
