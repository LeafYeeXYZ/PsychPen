import type { AIFunction } from '../../../types'
import { ALLOWED_DISCRETE_METHODS } from '../../../types'
import { Funcs } from '../../enum'

export const create_sub_var: AIFunction = {
	name: Funcs.CREATE_SUB_VAR,
	label: '生成子变量',
	tool: {
		type: 'function',
		function: {
			name: Funcs.CREATE_SUB_VAR,
			description:
				'你可以调用这个函数来帮助用户把指定变量的标准化/中心化/离散化子变量',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要生成子变量的变量名 (必须是等距或等比数据)',
						items: {
							type: 'string',
							description: '变量名',
						},
					},
					standardize: {
						type: 'boolean',
						description: '是否生成标准化子变量',
					},
					centralize: {
						type: 'boolean',
						description: '是否生成中心化子变量',
					},
					discretize: {
						type: 'object',
						description: '如果要生成离散化子变量, 则需要指定离散化算法和分组数',
						properties: {
							method: {
								description: '离散化算法',
								enum: Object.values(ALLOWED_DISCRETE_METHODS),
							},
							groups: {
								type: 'number',
								description: '离散化分组数',
							},
						},
						required: ['method', 'groups'],
						additionalProperties: false,
					},
				},
				required: ['variable_names'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}

export const clear_sub_var: AIFunction = {
	name: Funcs.CLEAR_SUB_VAR,
	label: '清除子变量',
	tool: {
		type: 'function',
		function: {
			name: Funcs.CLEAR_SUB_VAR,
			description: '你可以调用这个函数来帮助用户清除指定变量的所有子变量',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要清除子变量的变量名 (必须是等距或等比数据)',
						items: {
							type: 'string',
							description: '变量名',
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
