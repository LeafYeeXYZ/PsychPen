import { type AIFunction, ALL_VARS_IDENTIFIER } from '../../types'

export const define_missing_value: AIFunction = {
	label: '定义缺失值',
	tool: {
		type: 'function',
		function: {
			name: 'define_missing_value',
			description: '你可以调用这个函数来帮助用户定义缺失值',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要定义缺失值的变量名',
						items: {
							type: 'string',
							description: `变量名 (如果要为全部变量定义缺失值, 请包含特殊变量名"${ALL_VARS_IDENTIFIER}")`,
						},
					},
					missing_values: {
						type: 'array',
						description:
							'缺失值列表 (不管要定义的缺失值是数字还是字符串, 都请使用字符串类型)',
						items: {
							type: 'string',
							description: '缺失值',
						},
					},
				},
				required: ['variable_names', 'missing_values'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}

export const clear_missing_value: AIFunction = {
	label: '清除缺失值定义',
	tool: {
		type: 'function',
		function: {
			name: 'clear_missing_value',
			description: '你可以调用这个函数来帮助用户清除指定变量的所有缺失值定义',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要清除缺失值定义的变量名',
						items: {
							type: 'string',
							description: `变量名 (如果要为全部变量清除缺失值定义, 请包含特殊变量名"${ALL_VARS_IDENTIFIER}")`,
						},
					},
				},
				required: ['variable_names'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
