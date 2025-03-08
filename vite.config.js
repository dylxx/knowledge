import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  publicPath: './',
  base: './',
  resolve: {
    extensions: ['.js', '.ts', '.vue']
  },
  server: {
    port: 3000
  }
})
