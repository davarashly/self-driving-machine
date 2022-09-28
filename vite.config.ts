import { defineConfig } from "vite"
import * as path from "path"
import eslint from "vite-plugin-eslint"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  plugins: [eslint({ failOnError: false })]
})
