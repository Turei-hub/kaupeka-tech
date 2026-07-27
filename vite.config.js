import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Defaults to 5174, but honours PORT so more than one dev server can coexist.
  server: { port: Number(process.env.PORT) || 5174 },
})
