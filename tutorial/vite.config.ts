import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { optimizeCssModules } from "vite-plugin-optimize-css-modules";
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), optimizeCssModules(), viteSingleFile()],
});
