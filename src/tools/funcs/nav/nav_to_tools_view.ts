import { z } from 'zod'
import { TOOLS_VIEW_SUB_PAGES_LABELS } from '../../../hooks/useNav.tsx'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const nav_to_tools_view_type = z.object({
	page: z.nativeEnum(TOOLS_VIEW_SUB_PAGES_LABELS),
})

export const nav_to_tools_view_desc: Map<TOOLS_VIEW_SUB_PAGES_LABELS, string> =
	new Map([
		[
			TOOLS_VIEW_SUB_PAGES_LABELS.STATISTIC_TO_PVALUE,
			'输入统计量或 P 值 (t 分布和 F 分布等还需要输入自由度), 查看对应的 P 值或统计量结果',
		],
		[
			TOOLS_VIEW_SUB_PAGES_LABELS.NORMAL_DISTRIBUTION,
			'正态分布是心理学和教育学研究中经常使用的分布. 在正态分布可视化演示工具中, 可以调整正态分布(总体)的均值和标准差, 并进行手动或自动(动态演示)抽样, 以便更好地理解正态分布的性质. 视图左侧将分别显示 `样本` 和 `总体` 的一些信息, 右侧将显示当前样本的直方图和分布曲线. 底部可以进行 `手动抽样`、`动态演示`、`清除数据` 等操作',
		],
		[
			TOOLS_VIEW_SUB_PAGES_LABELS.T_DISTRIBUTION,
			'T分布是假设检验中最常见的分布之一. 在T分布可视化演示工具中, 可以供抽样的总体(正态分布)的均值和标准差, 以及T分布的自由度(即每次抽样的样本量减1), 并进行手动或自动(动态演示)抽样, 以便更好地理解T分布的性质和"样本均值的标准差"、"估计标准误"、"真实标准误"之间的细微区别. 视图左侧将分别显示 `样本` 和 `总体` 的一些信息, 右侧将显示当前样本的直方图和分布曲线. 底部可以进行 `手动抽样`、`动态演示`、`清除数据` 等操作',
		],
	])

export const nav_to_tools_view: AIFunction = {
	name: Funcs.NAV_TO_TOOLS_VIEW,
	label: '将页面导航到工具视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_TOOLS_VIEW,
			description:
				'你可以调用这个函数来帮用户将页面导舨到工具视图的指定页面, 每个页面的操作方法将在调用结果中给出',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(TOOLS_VIEW_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
