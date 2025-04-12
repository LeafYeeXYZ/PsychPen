import { VARIABLE_SUB_PAGES_LABELS } from '../../../hooks/useNav'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const nav_to_variable_view: AIFunction = {
	name: Funcs.NAV_TO_VARIABLE_VIEW,
	label: '将页面导航到变量视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_VARIABLE_VIEW,
			description: '你可以调用这个函数来帮用户将页面导舨到变量视图的指定页面',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(VARIABLE_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
