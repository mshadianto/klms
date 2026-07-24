// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/klms/',  // subpath GitHub Pages (mshadianto.github.io/klms/); ubah ke '/' bila di-serve dari root domain
})
