import { z } from 'zod'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const welch_t_test_type = z.object({
	dataVar: z.string(),
	groupVar: z.string(),
	expect: z.number(),
	twoside: z.boolean(),
	alpha: z.number(),
})

export const welch_t_test: AIFunction = {
	name: Funcs.WELCH_T_TEST,
	label: "不等方差T检验 (Welch's T Test)",
	tool: {
		type: 'function',
		function: {
			name: Funcs.WELCH_T_TEST,
			description:
				"你可以调用这个函数来帮助用户进行不等方差T检验 (Welch's T Test)",
			parameters: {
				type: 'object',
				properties: {
					dataVar: {
						type: 'string',
						description: '数据变量的变量名 (必须是等距或等比数据)',
					},
					groupVar: {
						type: 'string',
						description: '分组变量的变量名 (类型不限, 但唯一值数必须为2)',
					},
					expect: {
						type: 'number',
						description: '检验值 (如用户没有特别要求, 请设为0)',
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
				required: ['dataVar', 'groupVar', 'expect', 'twoside', 'alpha'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
