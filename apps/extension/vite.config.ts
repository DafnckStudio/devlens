import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirOnBuildStart: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        popup: resolve(__dirname, 'src/popup/popup.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest.json
        copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );

        // Copy popup files
        const popupDir = resolve(__dirname, 'dist/popup');
        if (!existsSync(popupDir)) {
          mkdirSync(popupDir, { recursive: true });
        }
        copyFileSync(
          resolve(__dirname, 'src/popup/popup.html'),
          resolve(__dirname, 'dist/popup/popup.html')
        );
        copyFileSync(
          resolve(__dirname, 'src/popup/popup.css'),
          resolve(__dirname, 'dist/popup/popup.css')
        );

        // Copy assets
        const assetsDir = resolve(__dirname, 'dist/assets');
        if (!existsSync(assetsDir)) {
          mkdirSync(assetsDir, { recursive: true });
        }
        copyFileSync(
          resolve(__dirname, 'assets/icon.svg'),
          resolve(__dirname, 'dist/assets/icon.svg')
        );

        // Copy content CSS
        copyFileSync(
          resolve(__dirname, 'src/content/content.css'),
          resolve(__dirname, 'dist/content.css')
        );
      },
    },
  ],
});
