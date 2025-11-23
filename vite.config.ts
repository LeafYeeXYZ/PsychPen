import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
		chunkSizeWarningLimit: 1200,
		rollupOptions: {
			output: {
				manualChunks: {
					antd: ['antd', '@ant-design/icons', '@ant-design/x'],
					echarts: ['echarts'],
					echarts_utils: [
						'echarts-gl',
						'echarts-stat',
						'echarts-wordcloud',
						'html2canvas-pro',
					],
					ag_grid: ['ag-grid-community', 'ag-grid-react'],
					psych_sheet: ['@psych/sheet'],
					utils: [
						'katex',
						'marked',
						'marked-katex-extension',
						'@psych/lib',
						'ml-kmeans',
						'zod',
						'bowser',
						'openai',
						'@leaf/parse-think',
						'idb-keyval',
					],
				},
			},
		},
	},
})
