import { z } from 'zod'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const custom_export_type = z.object({
	file_name: z.string(),
	file_type: z.enum(['json', 'txt', 'csv', 'md']),
	function_code: z.string(),
})

const custom_export_description = `
你可以调用这个函数来对原始数据进行计算, 并以JSON格式导出计算后的数据.

你需要提供文件名、文件类型、生成数据的 JavaScript 代码. 你输出的代码将被这样执行:

\`\`\`javascript
const result = String(
  new Function('data', 'vars', function_code)(
    userCurrentData,
    userCurrentVariables,
  ),
)
\`\`\`

在这个代码中, function_code 是你提供的 JavaScript 代码, 它将被作为字符串传入 new Function() 函数中执行. 你可以通过 data 变量访问当前数据 (经过缺失值定义和插值、数据过滤、子变量生成等操作后的数据)、通过 vars 变量访问变量信息, 并对它们进行计算.

变量 data 是一个数组, 每个元素是一个对象, 对象的键是变量名, 值是变量值 (如果这个变量是等距或等比数据, 则类型是"number | undefined", 否则是"string | number | undefined").

变量 vars 是一个数组, 每个元素是一个 Variable 对象, 其类型定义如下:

\`\`\`typescript
type Variable = {
  /** 变量名 */
  name: string
  /** 数据类型 */
  type: '称名或等级数据' | '等距或等比数据'
  /** 样本量 */
  count: number
  /** 缺失值数量 (不含已插值缺失值) */
  missing: number
  /** 有效值数量 (含已插值缺失值) */
  valid: number
  /** 唯一值数量 */
  unique: number
  /** 最小值 (只有等距或等比数据才有) */
  min?: number
  /** 最大值 (只有等距或等比数据才有) */
  max?: number
  /** 均值 (只有等距或等比数据才有) */
  mean?: number
  /** 众数 (只有等距或等比数据才有) */
  mode?: number
  /** 25%分位数 (只有等距或等比数据才有) */
  q1?: number
  /** 50%分位数 (只有等距或等比数据才有) */
  q2?: number
  /** 75%分位数 (只有等距或等比数据才有) */
  q3?: number
  /** 标准差 (只有等距或等比数据才有) */
  std?: number
}
\`\`\`

请注意, 你的代码中返回的结果 (最终使用 return 关键字返回的值) 必须是一个字符串. 你需要根据选择的文件类型, 在代码中把它转换为相应格式的字符串.
`

export const custom_export: AIFunction = {
	name: Funcs.CUSTOM_EXPORT,
	label: '自定义导出',
	tool: {
		type: 'function',
		function: {
			name: Funcs.CUSTOM_EXPORT,
			description: custom_export_description,
			parameters: {
				type: 'object',
				properties: {
					file_name: {
						type: 'string',
						description: '文件名 (不含扩展名)',
					},
					file_type: {
						enum: ['json', 'txt', 'csv', 'md'],
						description: '文件类型',
					},
					function_code: {
						type: 'string',
						description: '生成数据的 JavaScript 代码',
					},
				},
				required: ['file_name', 'file_type', 'function_code'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
