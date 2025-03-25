import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/tailwind.css'
import './styles/markdown.css'
import 'katex/dist/katex.min.css'
import { marked } from 'marked'
import katex from 'marked-katex-extension'

marked.use(katex({ throwOnError: false }))

const root = document.getElementById('root')
if (!root) {
	throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
