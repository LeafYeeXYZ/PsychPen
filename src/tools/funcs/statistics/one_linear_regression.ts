import { z } from 'zod'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const one_linear_regression_type = z.object({
	independent_var: z.string(),
	dependent_var: z.string(),
})

export const one_linear_regression: AIFunction = {
	name: Funcs.ONE_LINEAR_REGRESSION,
	label: '一元线性回归',
	tool: {
		type: 'function',
		function: {
			name: Funcs.ONE_LINEAR_REGRESSION,
			description: '你可以调用这个函数来帮助用户进行一元线性回归分析',
			parameters: {
				type: 'object',
				properties: {
					independent_var: {
						type: 'string',
						description: '自变量名 (必须是等距或等比数据)',
					},
					dependent_var: {
						type: 'string',
						description: '因变量名 (必须是等距或等比数据)',
					},
				},
				required: ['independent_var', 'dependent_var'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
