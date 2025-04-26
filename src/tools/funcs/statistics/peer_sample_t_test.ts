import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const peer_sample_t_test: AIFunction = {
	name: Funcs.PEER_SAMPLE_T_TEST,
	label: "配对样本T检验 (Student's T Test)",
	tool: {
		type: 'function',
		function: {
			name: Funcs.PEER_SAMPLE_T_TEST,
			description:
				"你可以调用这个函数来帮助用户进行配对样本T检验 (Student's T Test)",
			parameters: {
				type: 'object',
				properties: {
					variable1: {
						type: 'string',
						description: '第一个配对变量的变量名 (必须是等距或等比数据)',
					},
					variable2: {
						type: 'string',
						description: '第二个配对变量的变量名 (必须是等距或等比数据)',
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
				required: ['variable1', 'variable2', 'expect', 'twoside', 'alpha'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
