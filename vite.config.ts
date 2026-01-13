import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  define: {
    // CUSTOMER_ID를 빌드 타임 상수로 주입
    'import.meta.env.VITE_CUSTOMER_ID': JSON.stringify(process.env.CUSTOMER_ID || ''),
  },
});
