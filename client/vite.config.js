import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Disable noisy sourcemap warnings for pre-bundled node_modules
    sourcemapIgnoreList: (relativeSourcePath) =>
      relativeSourcePath.includes('node_modules'),
  },
  build: {
    sourcemap: false,
  },
});