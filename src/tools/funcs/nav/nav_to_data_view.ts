import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const nav_to_data_view: AIFunction = {
	name: Funcs.NAV_TO_DATA_VIEW,
	label: '将页面导航到数据视图',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_DATA_VIEW,
			description: '你可以调用这个函数来帮用户将页面导舨到数据视图',
			strict: true,
		},
	},
}
