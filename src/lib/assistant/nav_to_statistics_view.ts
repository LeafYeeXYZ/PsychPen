import type { AIFunction } from '../../types'
import { STATISTICS_SUB_PAGES_LABELS } from '../hooks/useNav'

export const nav_to_statistics_view: AIFunction = {
	label: '将页面导航到统计视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: 'nav_to_statistics_view',
			description: '你可以调用这个函数来帮用户将页面导舨到统计视图的指定页面',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(STATISTICS_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
