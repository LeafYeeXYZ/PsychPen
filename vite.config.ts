import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ['babel-plugin-react-compiler', {}],
    },
  })],
  optimizeDeps: {
    exclude: ['jieba-wasm'],
  },
  build: {
    target: ['chrome110', 'firefox115', 'safari16', 'edge110'],
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'data': ['@psych/sheet'],
          'chart-a': ['echarts'],
          'chart-b': ['echarts-gl'],
          'chart-c': ['echarts-wordcloud', 'echarts-stat'],
          'table': ['ag-grid-react'],
          'stats': ['@psych/lib', 'ml-kmeans', 'jieba-wasm'],
          'utils': ['html2canvas', '@ant-design/icons', 'bowser'],
        }
      }
    }
  }
})
