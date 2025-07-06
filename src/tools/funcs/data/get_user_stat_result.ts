import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const get_user_stat_result: AIFunction = {
	name: Funcs.GET_USER_STAT_RESULT,
	label: '获取用户当前统计结果',
	tool: {
		type: 'function',
		function: {
			name: Funcs.GET_USER_STAT_RESULT,
			description:
				'当用户位于统计视图时, 你可以调用这个函数来获取用户当前的统计结果',
			strict: true,
		},
	},
}
