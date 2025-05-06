import { z } from 'zod'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const apply_filter_type = z.object({
	filter_expression: z.string(),
})

export const apply_filter: AIFunction = {
	name: Funcs.APPLY_FILTER,
	label: '设置数据筛选规则',
	tool: {
		type: 'function',
		function: {
			name: Funcs.APPLY_FILTER,
			description:
				'你可以调用这个函数来帮助用户设置数据筛选规则. 筛选所用的表达式中的任意变量为缺失值时, 该行数据会被过滤掉 (如果要保留该行数据, 则需要提前进行缺失值插值)',
			parameters: {
				type: 'object',
				properties: {
					filter_expression: {
						type: 'string',
						description:
							'过滤表达式 (语法见文档), 如果返回空字符串则表示清除过滤器',
					},
				},
				required: ['filter_expression'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
