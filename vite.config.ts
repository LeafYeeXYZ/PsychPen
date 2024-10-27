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
            '@stdlib/stats/ttest',
            '@stdlib/stats/ttest2',
            '@stdlib/stats/pcorrtest',
            '@stdlib/random/base/normal',
          ],
          'utils': [
            'jstat',
            'mathjs', 
            'html2canvas', 
            'echarts-wordcloud', 
            'jieba-wasm', 
            'echarts-stat',
            '@ant-design/icons',
            'bowser',
            'ml-kmeans',
            'hyparquet',
          ],
        }
      }
    }
  }
})
