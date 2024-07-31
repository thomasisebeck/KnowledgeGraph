import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pluginPurgeCss from "@mojojoejo/vite-plugin-purgecss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      react(),
      pluginPurgeCss()
  ],
})
