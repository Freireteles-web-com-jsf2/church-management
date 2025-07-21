import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    open: true
  },
  // Configuração para lidar corretamente com o roteamento do lado do cliente
  preview: {
    port: 5174
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  // Garantir que o histórico de navegação funcione corretamente
  base: '/'
})
