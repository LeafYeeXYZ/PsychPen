import { z } from 'zod'
import { PLOTS_SUB_PAGES_LABELS } from '../../../hooks/useNav'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const nav_to_plots_view_type = z.object({
	page: z.nativeEnum(PLOTS_SUB_PAGES_LABELS),
})

export const nav_to_plots_view: AIFunction = {
	name: Funcs.NAV_TO_PLOTS_VIEW,
	label: '将页面导航到绘图视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_PLOTS_VIEW,
			description: '你可以调用这个函数来帮用户将页面导舨到绘图视图的指定页面',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(PLOTS_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
