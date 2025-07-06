import { z } from 'zod'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const levene_test_for_independent_vars_type = z.object({
	dataVar: z.string(),
	groupVar: z.string(),
	center: z.enum(['mean', 'median']),
})

export const levene_test_for_independent_vars: AIFunction = {
	name: Funcs.LEVENE_TEST_FOR_INDEPENDENT_VARS,
	label: "Levene's Test (方差齐性检验) (被试间变量)",
	tool: {
		type: 'function',
		function: {
			name: Funcs.LEVENE_TEST_FOR_INDEPENDENT_VARS,
			description:
				"你可以调用这个函数来帮助用户进行被试间变量的 Levene's Test, 验证各组数据是否满足方差齐性",
			parameters: {
				type: 'object',
				properties: {
					dataVar: {
						type: 'string',
						description: '数据变量的变量名 (必须是等距或等比数据)',
					},
					groupVar: {
						type: 'string',
						description: '分组变量的变量名 (类型不限)',
					},
					center: {
						enum: ['mean', 'median'],
						description:
							'中心化方法 (均值或中位数, 如果用户没有特别要求, 请使用均值)',
					},
				},
				required: ['dataVar', 'groupVar', 'center'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}

export const levene_test_for_paired_vars_type = z.object({
	variables: z.array(z.string()).min(2),
	center: z.enum(['mean', 'median']),
})

export const levene_test_for_paired_vars: AIFunction = {
	name: Funcs.LEVENE_TEST_FOR_PAIRED_VARS,
	label: "Levene's Test (方差齐性检验) (被试内变量)",
	tool: {
		type: 'function',
		function: {
			name: Funcs.LEVENE_TEST_FOR_PAIRED_VARS,
			description:
				"你可以调用这个函数来帮助用户进行被试内变量的 Levene's Test, 验证各组数据是否满足方差齐性",
			parameters: {
				type: 'object',
				properties: {
					variables: {
						type: 'array',
						items: { type: 'string' },
						description: '变量名列表 (至少两个, 必须是等距或等比数据)',
					},
					center: {
						enum: ['mean', 'median'],
						description:
							'中心化方法 (均值或中位数, 如果用户没有特别要求, 请使用均值)',
					},
				},
				required: ['variables', 'center'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
