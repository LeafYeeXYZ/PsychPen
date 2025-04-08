import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/tailwind.css'
import './styles/markdown.css'
import 'katex/dist/katex.min.css'
import Bowser from 'bowser'
import { marked } from 'marked'
import katex from 'marked-katex-extension'
import '@ant-design/v5-patch-for-react-19'
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community'

const root = document.getElementById('root')
if (!root) {
	throw new Error('Root element not found')
}

const browser = Bowser.getParser(navigator.userAgent)
const valid = browser.satisfies({
	chrome: '>=110',
	firefox: '>=115',
	safari: '>=16',
	edge: '>=110',
})
if (!valid) {
	window.confirm(
		'当前浏览器版本较低, 可能会导致部分功能无法正常使用, 建议使用最新版本的 Chrome, Firefox, Safari 或 Edge 浏览器',
	)
}

ModuleRegistry.registerModules([ClientSideRowModelModule])
marked.use(katex({ throwOnError: false }))

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
