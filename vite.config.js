import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // base: './' garante que os caminhos dos arquivos gerados sejam relativos,
  // funcionando em qualquer nome de repositório no GitHub Pages.
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
