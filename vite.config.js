import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Se o repositório for https://usuario.github.io/FROGGER/
  // defina base: '/FROGGER/'
  // Se for um repositório de usuário (usuario.github.io), use base: '/'
  base: '/FROGGER/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
