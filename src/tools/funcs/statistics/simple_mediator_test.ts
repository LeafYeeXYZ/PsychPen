import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const simple_mediator_test: AIFunction = {
	name: Funcs.SIMPLE_MEDIATOR_TEST,
	label: '简单中介效应检验',
	tool: {
		type: 'function',
		function: {
			name: Funcs.SIMPLE_MEDIATOR_TEST,
			description: '你可以调用这个函数来帮助用户进行简单中介效应检验',
			parameters: {
				type: 'object',
				properties: {
					x: {
						type: 'string',
						description: '自变量的变量名 (必须是等距或等比数据)',
					},
					m: {
						type: 'string',
						description: '中介变量的变量名 (必须是等距或等比数据)',
					},
					y: {
						type: 'string',
						description: '因变量的变量名 (必须是等距或等比数据)',
					},
					B: {
						type: 'number',
						description: 'Bootstrap 抽样次数 (如用户没有特别要求, 请设为5000)',
					},
				},
				required: ['x', 'm', 'y', 'B'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
