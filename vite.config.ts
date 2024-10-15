import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ['babel-plugin-react-compiler', {}],
    },
  })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd', '@ant-design/icons'],
          'xlsx': ['xlsx', 'dta'],
          'chart': ['echarts'],
          'chart-gl': ['echarts-gl'],
          'utils': ['html2canvas', 'mathjs'],
        }
      }
    }
  }
})
