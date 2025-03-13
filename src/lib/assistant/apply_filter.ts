import type { AIFunction } from '../../types'

export const apply_filter: AIFunction = {
	label: '设置数据筛选规则',
	tool: {
		type: 'function',
		function: {
			name: 'apply_filter',
			description: '你可以调用这个函数来帮助用户设置数据筛选规则',
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
