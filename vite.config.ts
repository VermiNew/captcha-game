import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createObfuscatorPlugin, getOptimizedBuildConfig } from './vite-obfuscator.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createObfuscatorPlugin({ level: 'balanced' }),
  ],
  build: getOptimizedBuildConfig(true)
})
