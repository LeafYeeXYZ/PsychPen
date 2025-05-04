import { ExportTypes } from '@psych/sheet'
import { z } from 'zod'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const export_data_type = z.object({
	file_name: z.string(),
	file_type: z.nativeEnum(ExportTypes),
})

export const export_data: AIFunction = {
	name: Funcs.EXPORT_DATA,
	label: '导出数据',
	tool: {
		type: 'function',
		function: {
			name: Funcs.EXPORT_DATA,
			description:
				'你可以调用这个函数来帮助用户导出数据. 调用成功后, 浏览器会自动下载文件.',
			parameters: {
				type: 'object',
				properties: {
					file_name: {
						type: 'string',
						description: '文件名 (不含拓展名)',
					},
					file_type: {
						description: '文件类型',
						enum: Object.values(ExportTypes),
					},
				},
				required: ['file_name', 'file_type'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
