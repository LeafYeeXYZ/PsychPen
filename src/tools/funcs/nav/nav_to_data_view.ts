import type { AIFunction } from '../../../types'

export const nav_to_data_view: AIFunction = {
	label: '将页面导航到数据视图',
	tool: {
		type: 'function',
		function: {
			name: 'nav_to_data_view',
			description: '你可以调用这个函数来帮用户将页面导舨到数据视图',
			strict: true,
		},
	},
}
