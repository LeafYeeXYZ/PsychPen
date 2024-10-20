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
          'antd': ['antd'],
          'xlsx': ['xlsx', 'dta'],
          'chart': ['echarts'],
          'table': ['ag-grid-react'],
          'chart-gl': ['echarts-gl'],
          'utils': [
            'html2canvas', 
            'mathjs', 
            'echarts-wordcloud', 
            'jieba-wasm', 
            'echarts-stat',
            '@leaf/sav-reader',
            '@ant-design/icons',
            'jstat',
          ],
        }
      }
    }
  }
})
