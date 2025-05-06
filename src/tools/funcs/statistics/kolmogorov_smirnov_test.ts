import { z } from 'zod'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const kolmogorov_smirnov_test_for_independent_vars_type = z.object({
	dataVar: z.string(),
	groupVar: z.string(),
})

export const kolmogorov_smirnov_test_for_independent_vars: AIFunction = {
	name: Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_INDEPENDENT_VARS,
	label: '单样本 Kolmogorov-Smirnov 检验 (正态分布检验) (被试间变量)',
	tool: {
		type: 'function',
		function: {
			name: Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_INDEPENDENT_VARS,
			description:
				'你可以调用这个函数来帮助用户进行被试间变量的单样本 Kolmogorov-Smirnov 检验, 验证各组数据是否服从正态分布',
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
				},
				required: ['dataVar', 'groupVar'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}

export const kolmogorov_smirnov_test_for_paired_vars_type = z.object({
	variables: z.array(z.string()),
})

export const kolmogorov_smirnov_test_for_paired_vars: AIFunction = {
	name: Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_PAIRED_VARS,
	label: '单样本 Kolmogorov-Smirnov 检验 (正态分布检验) (被试内变量)',
	tool: {
		type: 'function',
		function: {
			name: Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_PAIRED_VARS,
			description:
				'你可以调用这个函数来帮助用户进行被试内变量的单样本 Kolmogorov-Smirnov 检验, 验证各个变量是否满足正态分布',
			parameters: {
				type: 'object',
				properties: {
					variables: {
						type: 'array',
						items: { type: 'string' },
						description: '变量名列表 (必须是等距或等比数据)',
					},
				},
				required: ['variables'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
