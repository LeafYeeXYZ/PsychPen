import { z } from 'zod'
import { TOOLS_VIEW_SUB_PAGES_LABELS } from '../../../hooks/useNav'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const nav_to_tools_view_type = z.object({
	page: z.nativeEnum(TOOLS_VIEW_SUB_PAGES_LABELS),
})

export const nav_to_tools_view: AIFunction = {
	name: Funcs.NAV_TO_TOOLS_VIEW,
	label: '将页面导航到工具视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_TOOLS_VIEW,
			description: '你可以调用这个函数来帮用户将页面导舨到工具视图的指定页面',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(TOOLS_VIEW_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
