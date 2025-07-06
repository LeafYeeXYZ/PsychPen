import { z } from 'zod'
import { VARIABLE_SUB_PAGES_LABELS } from '../../../hooks/useNav.tsx'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const nav_to_variable_view_type = z.object({
	page: z.nativeEnum(VARIABLE_SUB_PAGES_LABELS),
})

export const nav_to_variable_view_desc: Map<VARIABLE_SUB_PAGES_LABELS, string> =
	new Map([
		[
			VARIABLE_SUB_PAGES_LABELS.VARIABLE_TABLE,
			'在变量表格中, 可以查看你导入的数据表格中的变量信息. 包括变量名、类型 (决定了能否用该变量进行一些数学运算)、缺失值情况、描述统计信息 (如均值、标准差、最大值、最小值) 等. 注: PsychPen 延用 PsychLib 的计算众数的方式: 如果有多个众数, 则显示皮尔逊经验公式计算的众数 (中位数 x 3 - 均值 x 2)',
		],
		[
			VARIABLE_SUB_PAGES_LABELS.MISSING_VALUE,
			'通常, 在研究数据中不会直接将缺失值留空, 而是将缺失值标注为特定的值, 以便于后续的数据处理 (例如用 `-1`、`-99`、`99` 等值表示缺失值). 在此页面, 可以选择变量 (可多选或直接选择 `全部变量`), 输入缺失值的值 (如果要取消定义缺失值, 可以将输入框留空), 点击 `确认` 按钮即可定义缺失值. 设置缺失值后, 可以在 `变量表格` 中看到定义的缺失值的情况',
		],
		[
			VARIABLE_SUB_PAGES_LABELS.INTERPOLATE,
			'研究中可能会因为各种原因导致数据缺失, 如果样本量较大, 直接删除缺失值是一个不错的选择; 但当实验样本比较珍贵, 或直接删除缺失值会带来误差时, 研究者往往会选择合适的插值法来将缺失值替换为有效值. 在此页面, 可以选择变量 (可多选), 选择插值方法 (均值、中位数、最临近点插值、拉格朗日插值), 如果使用了后两种插值方法, 还需要选择插值参考的变量. 选择好插值方法后, 点击 `确认` 按钮即可进行插值. 插值处理后, 可以在 `变量表格` 中看到插值的设置情况',
		],
		[
			VARIABLE_SUB_PAGES_LABELS.SUB_VARIABLES,
			'在数据分析中, 有时需要对原始数据进行处理. 标准化是指把 `x` 转换为 `(x - μ) / σ`, 从而让数据的均值为 `0`, 方差为 `1`; 中心化是指把 `x` 转换为 `x - μ`, 从而让数据的均值为 `0`, 方差不变; 两种处理均不会改变数据的分布形状. 离散化是指把连续变量通过某种规则转换为离散变量, 以便于分组分析. 在此页面, 可以选择变量 (可多选), 并选择一个或多个子变量; 如果选择了离散化, 还需要选择离散化的方法 (等宽、等频、聚类分析 `k-means`) 和离散化的区间数. 生成子变量后, 可以在 `变量表格` 和 `数据` 视图中看到生成的子变量. 注: 生成的子变量名为 `xxx_标准化`、`xxx_中心化`、`xxx_等宽离散`、`xxx_等频离散`、`xxx_聚类分析离散`, 其中 `xxx` 为原变量名',
		],
		[
			VARIABLE_SUB_PAGES_LABELS.DATA_FILTER,
			'数据筛选可以让用户根据自己的需求, 选择性地使用满足过滤规则的数据来进行统计分析和数据可视化. 在此页面, 可以输入过滤表达式, 点击 `确认` 按钮即可生成新数据. 生成后, 可以在 `数据视图` 中看到过滤后的数据 (而变量视图中的变量描述统计信息仍是过滤前数据的信息)',
		],
		[
			VARIABLE_SUB_PAGES_LABELS.COMPUTE_VAR,
			'在心理学和教育学研究中, 通常需要对原始数据进行一些计算, 以得到最终用于分析的变量. 在此页面, 可以输入计算表达式和新变量名, 点击 `计算` 按钮并确认即可生成新变量. 生成后, 可以在 `变量表格` 和 `数据视图` 中看到生成的新变量',
		],
	])

export const nav_to_variable_view: AIFunction = {
	name: Funcs.NAV_TO_VARIABLE_VIEW,
	label: '将页面导航到变量视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_VARIABLE_VIEW,
			description:
				'你可以调用这个函数来帮用户将页面导舨到变量视图的指定页面, 每个页面的操作方法将在调用结果中给出',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(VARIABLE_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
