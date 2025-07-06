import { z } from 'zod'
import {
	type AIFunction,
	ALL_VARS_IDENTIFIER,
	ALLOWED_INTERPOLATION_METHODS,
} from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const define_interpolate_type = z.object({
	variable_names: z.array(z.string()),
	method: z.nativeEnum(ALLOWED_INTERPOLATION_METHODS),
	reference_variable: z.string().optional(),
})

export const define_interpolate: AIFunction = {
	name: Funcs.DEFINE_INTERPOLATE,
	label: '设置插值方法',
	tool: {
		type: 'function',
		function: {
			name: Funcs.DEFINE_INTERPOLATE,
			description: '你可以调用这个函数来帮助用户设置插值方法',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要定义插值方法的变量名 (必须是等距或等比数据)',
						items: {
							type: 'string',
							description: `变量名 (如果要为全部等距或等比变量定义插值方法, 请包含特殊变量名"${ALL_VARS_IDENTIFIER}")`,
						},
					},
					method: {
						description: '插值方法',
						enum: Object.values(ALLOWED_INTERPOLATION_METHODS),
					},
					reference_variable: {
						type: 'string',
						description: `如果插值方法为"${ALLOWED_INTERPOLATION_METHODS.NEAREST}"或"${ALLOWED_INTERPOLATION_METHODS.LAGRANGE}", 则需要指定插值参考变量名 (必须是等距或等比数据)`,
					},
				},
				required: ['variable_names', 'method'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}

export const clear_interpolate_type = z.object({
	variable_names: z.array(z.string()),
})

export const clear_interpolate: AIFunction = {
	name: Funcs.CLEAR_INTERPOLATE,
	label: '清除插值方法',
	tool: {
		type: 'function',
		function: {
			name: Funcs.CLEAR_INTERPOLATE,
			description:
				'你可以调用这个函数来帮助用户清除指定变量的插值方法 (即还原为默认方法-直接删除缺失值)',
			parameters: {
				type: 'object',
				properties: {
					variable_names: {
						type: 'array',
						description: '所有要清除缺失值定义的变量名 (必须是等距或等比数据)',
						items: {
							type: 'string',
							description: `变量名 (如果要清除全部等距或等比变量的插值方法, 请包含特殊变量名"${ALL_VARS_IDENTIFIER}")`,
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
