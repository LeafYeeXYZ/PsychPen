import { z } from 'zod'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const one_sample_t_test_type = z.object({
	variable: z.string(),
	expect: z.number(),
	twoside: z.boolean(),
	alpha: z.number(),
})

export const one_sample_t_test: AIFunction = {
	name: Funcs.ONE_SAMPLE_T_TEST,
	label: "单样本T检验 (Student's T Test)",
	tool: {
		type: 'function',
		function: {
			name: Funcs.ONE_SAMPLE_T_TEST,
			description:
				"你可以调用这个函数来帮助用户进行单样本T检验 (Student's T Test)",
			parameters: {
				type: 'object',
				properties: {
					variable: {
						type: 'string',
						description: '要检验的变量名 (必须是等距或等比数据)',
					},
					expect: {
						type: 'number',
						description: '检验值 (要检验的总体均值)',
					},
					twoside: {
						type: 'boolean',
						description:
							'单尾或双尾检验 (如用户没有特别要求, 请设为双尾, 即true)',
					},
					alpha: {
						type: 'number',
						description: '显著性水平 (如用户没有特别要求, 请设为0.05)',
					},
				},
				required: ['variable', 'expect', 'twoside', 'alpha'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
