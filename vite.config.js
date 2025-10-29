import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ring24-25/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})