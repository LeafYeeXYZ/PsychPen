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
    rollupOptions: {
      output: {
        manualChunks: {
          'antd': ['antd'],
          'data': ['@psych/sheet'],
          'chart': ['echarts'],
          'table': ['ag-grid-react'],
          'chart-gl': ['echarts-gl'],
          'utils': [
            'html2canvas', 
            'echarts-wordcloud', 
            'jieba-wasm', 
            'echarts-stat',
            '@ant-design/icons',
            'bowser',
            'ml-kmeans',
            '@psych/lib',
          ],
        }
      }
    }
  }
})
