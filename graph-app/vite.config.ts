import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      react(),
      optimizeCssModules()
  ],
})
