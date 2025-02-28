import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler', {}],
      },
    }),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['jieba-wasm'],
  },
  build: {
    target: ['chrome110', 'firefox115', 'safari16', 'edge110'],
    chunkSizeWarningLimit: 1050,
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd'],
          data: ['@psych/sheet'],
          'chart-a': ['echarts'],
          'chart-b': ['echarts-gl'],
          table: ['ag-grid-react'],
          utils: [
            'html2canvas',
            '@ant-design/icons',
            'bowser',
            'echarts-wordcloud',
            'echarts-stat',
            '@psych/lib',
            'ml-kmeans',
            'jieba-wasm',
            'openai',
            '@leaf/parse-think',
            'markdown-it',
          ],
        },
      },
    },
  },
})
