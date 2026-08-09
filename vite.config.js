// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // custom domain kmls-bpkh.mshadianto.id di-serve dari root
})
