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
          'antd': ['antd'],
          'psych-sheet': ['@psych/sheet'],
          'echarts': ['echarts'],
          'echarts-extension': ['echarts-gl', 'echarts-stat', 'echarts-wordcloud'],
          'ag-grid': ['ag-grid-react'],
          'utils-a': [
            'html2canvas',
            'bowser',
            '@ant-design/icons',
            'openai',
            '@leaf/parse-think',
          ],
          'utils-b': [
            '@psych/lib',
            'ml-kmeans',
            'jieba-wasm',
            'marked',
            'marked-katex-extension',
            'katex',
          ],
        },
      },
    },
  },
})
