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
          'xlsx': ['xlsx', 'dta'],
          'chart': ['echarts'],
          'table': ['ag-grid-react'],
          'chart-gl': ['echarts-gl'],
          'stdlib': [
            '@stdlib/stats/kstest',
            '@stdlib/stats/levene-test',
          ],
          'utils': [
            'html2canvas', 
            'echarts-wordcloud', 
            'jieba-wasm', 
            'echarts-stat',
            '@ant-design/icons',
            'bowser',
            'ml-kmeans',
            'hyparquet',
            '@leaf/sav-reader',
            '@psych/lib',
          ],
        }
      }
    }
  }
})
