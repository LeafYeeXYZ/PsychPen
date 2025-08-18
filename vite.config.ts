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
					antd: ['antd'],
					antd_utils: [
						'@ant-design/icons',
						'@ant-design/v5-patch-for-react-19',
						'@ant-design/x',
					],
					echarts: ['echarts'],
					echarts_gl: ['echarts-gl'],
					echarts_utils: [
						'echarts-stat',
						'echarts-wordcloud',
						'html2canvas-pro',
					],
					ag_grid: ['ag-grid-community', 'ag-grid-react'],
					marked: ['katex', 'marked', 'marked-katex-extension'],
					psych_sheet: ['@psych/sheet'],
					stats: ['@psych/lib', 'ml-kmeans'],
					utils: [
						'jieba-wasm',
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
