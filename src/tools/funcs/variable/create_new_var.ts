import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const create_new_var: AIFunction = {
	name: Funcs.CREATE_NEW_VAR,
	label: '生成新变量',
	tool: {
		type: 'function',
		function: {
			name: Funcs.CREATE_NEW_VAR,
			description: '你可以调用这个函数来帮助用户生成新变量',
			parameters: {
				type: 'object',
				properties: {
					variable_name: {
						type: 'string',
						description: '新变量名 (不可与已有变量名重复)',
					},
					calc_expression: {
						type: 'string',
						description: '计算表达式 (语法见文档)',
					},
				},
				required: ['variable_name', 'calc_expression'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
