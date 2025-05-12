import { z } from 'zod'
import { STATISTICS_SUB_PAGES_LABELS } from '../../../hooks/useNav'
import type { AIFunction } from '../../../types'
import { Funcs } from '../../enum'

export const nav_to_statistics_view_type = z.object({
	page: z.nativeEnum(STATISTICS_SUB_PAGES_LABELS),
})

export const nav_to_statistics_view_desc: Map<
	STATISTICS_SUB_PAGES_LABELS,
	string
> = new Map([
	[
		STATISTICS_SUB_PAGES_LABELS.DESCRIPTION,
		'在此页面中, 既可以对被试内变量 (一个或多个导入的列) 进行描述统计, 也可以对被试间变量 (一列作为数据, 一列作为分组) 进行描述统计. 描述统计信息包括有效值数、唯一值数、总和、均值、中位数、标准差、方差、Q1(25%分位数)、Q2(50%分位数)、Q3(75%分位数)、众数、最小值、最大值、极差, 可按需选择',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.ONE_SAMPLE_T_TEST,
		'选择要进行检验的变量, 输入要检验的指定值, 点击 `计算` 按钮即可进行单样本 t 检验. 除此之外, 还可以自定义检验方向',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.PEER_SAMPLE_T_TEST,
		'选择要进行检验的变量 (共两个), 点击 `计算` 按钮即可进行配对样本 t 检验. 除此之外, 还可以自定义检验差异值和检验方向',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.TWO_SAMPLE_T_TEST,
		'选择要进行检验的变量, 再选择用于分组的变量, 点击 `计算` 按钮即可进行独立样本 t 检验. 除此之外, 还可以自定义检验差异值和检验方向',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.WELCH_T_TEST,
		'选择要进行检验的变量, 再选择用于分组的变量, 点击 `计算` 按钮即可进行不等方差 t 检验. 除此之外, 还可以自定义检验差异值和检验方向',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.ONE_WAY_ANOVA,
		'选择要进行检验的数据变量和分组变量, 点击 `计算` 按钮即可进行单因素方差分析. 除此之外, 还可以选择进行事后检验的方法 (Scheffe、Bonferroni、Tukey)',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.PEER_ANOVA,
		'选择要进行检验的至少2个配对变量, 点击 `计算` 按钮即可进行重复测量方差分析. 除此之外, 还可以选择进行事后检验的方法 (Scheffe、Bonferroni、Tukey)',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.KOLMOGOROV_SMIRNOV_TEST,
		'选择要进行检验的变量 (可以一次选择多个), 点击 `计算` 按钮即可进行 Kolmogorov-Smirnov 检验. 注意: 结果的 P 值不显著 (大于 0.05) 时, 才说明数据服从正态分布 (因为检验的原假设是"数据服从XX分布"). 此外, 显著性检验在⼩样本中 (n<30) 由于检验⼒的不⾜, 即便是偏态分布也可能⽆法检验出来; 但在很⼤的样本中 (n>1000) 又很敏感, 即便有很⼩的峰度或偏度值也会拒绝正态分布的虚⽆假设, 但从直⽅图或者正态概率图中直观地看, 分布仍然⾮常接近正态分布. 因此在检验时需要结合样本量, 图形检验, 以及峰度或者偏度取值的大小来综合考虑 (刘红云, 2023)',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.LEVENE_TEST,
		'选择要进行检验的变量的类型 (被试内变量/被试间变量). 如果是被试内变量, 需要选择要进行检验的变量 (至少选择两个); 如果是被试间变量, 需要选择要进行检验的数据变量和分组变量. 点击 `计算` 按钮即可进行 Levene 检验. 注意: 结果的 P 值不显著 (大于 0.05) 时, 才说明数据具有方差齐性 (因为检验的原假设是"数据具有方差齐性")',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.KURTOSIS_SKEWNESS,
		'选择要进行检验的变量的类型 (被试内变量/被试间变量). 如果是被试内变量, 需要选择要进行检验的变量 (至少选择两个); 如果是被试间变量, 需要选择要进行检验的数据变量和分组变量. 点击 `计算` 按钮即可进行偏度和峰度检验. 在实际应用中, 峰度和偏度值的检验容易受样本量的影响, 即样本量大时特别容易拒绝虚无假设. 因此在经验上, 即使虚无假设被拒绝 (即 P 值的绝对值大于 1.96), 若偏度和峰度绝对值较小, 分布仍可近似为正态的 (刘红云, 2023)',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.PEARSON_CORRELATION_TEST,
		'选择要进行检验的变量 (至少选择两个), 点击 `计算` 按钮即可进行 Pearson 相关检验. 除此之外, 还可以自定义检验方向. 结果除了会给出选择的变量两两之间的各种统计量 (如相关系数、显著性水平、置信区间等), 还会给出一个所有变量之间的相关矩阵 (显示相关系数和显著性水平)',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.ONE_LINEAR_REGRESSION,
		'选择要进行检验的自变量和因变量, 点击 `计算` 按钮即可进行一元线性回归',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.MULTI_LINEAR_REGRESSION,
		'选择你要进行检验的多个自变量和因变量, 并选择回归方法, 点击 `计算` 按钮即可进行多元线性回归. 回归方法包括:\n\n- **标准多元线性回归**: 所有自变量同时进入模型, 共同影响将被排除 (即使用最小二乘法获得偏回归系数); 目的是检验多个自变量对因变量的影响是否显著\n- **逐步多元线性回归**: **根据一定标准自动**逐步引入自变量, 以确定哪些自变量对因变量有显著影响 (包括**向前选择**、**向后剔除**、**双向选择**三种方法); 目的是找到最佳的预测模型\n- **序列多元线性回归**: **根据研究目的手动**逐步引入自变量, 但不会剔除已经进入模型的自变量, 并将自变量间的共同影响归入先进入模型的自变量中 (从而提高先进入模型的自变量的显著性); 目的是验证新加入的自变量是否对因变量有显著影响',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.CORR_RELIABILITY,
		'重测信度指同一量表, 同一受测群体, 不同时间, 两次施测, 求积差相关; 复本信度指以两个测验复本来测量同一群体, 然后求受测者群体在这两个测验上得分的积差相关. 在本页面中, 可以选择要进行检验的变量 (两个), 点击 `计算` 按钮即可进行重测信度/复本信度检验. 还可以选择分组变量, 以便对不同分组的数据进行信度检验. 可以接受的信度临界值取决于研究的具体情况',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.HALF_RELIABILITY,
		'分半信度指将一个量表分成两半, 每半都包含相同数量的项目, 然后计算两半的得分, 求两半得分的相关系数. 得到的相关系数还需要通过公式修正, 以得到最终的分半信度. 在本页面中, 可以分别选择两半的变量列表, 点击 `计算` 按钮即可进行分半信度检验. 还可以选择分组变量, 以便对不同分组的数据进行信度检验',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.HOMO_RELIABILITY,
		'如果各个题目是测量同一心理特质, 则各个题目得分间相关越高则信度越好; 同质性信度即是各个题目与总分的相关系数, 常用 alpha 系数表示 (应用中, alpha 的值至少要大于0.5, 最好能大于0.7), 近期也有越来越多的研究使用 omega 系数. 在本页面中, 可以选择量表的所有题目, 点击 `计算` 按钮即可进行同质性信度检验. 还可以选择分组变量, 以便对不同分组的数据进行信度检验. 如果需要计算 omega 系数, 需要先在数据视图的 `R语言服务器` 设置中启用 `R语言服务器` 功能',
	],
	[
		STATISTICS_SUB_PAGES_LABELS.SIMPLE_MEDIATOR_TEST,
		'简单中介效应模型只有一个自变量、一个因变量和一个中介变量. 在此页面中, 可以选择要进行检验的自变量、因变量和中介变量, 点击 `计算` 按钮即可进行简单中介效应检验. 还可以手动设置 Bootstrap 采样次数, 以便得到更准确的中介效应值和置信区间',
	],
])

export const nav_to_statistics_view: AIFunction = {
	name: Funcs.NAV_TO_STATISTICS_VIEW,
	label: '将页面导航到统计视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_STATISTICS_VIEW,
			description:
				'你可以调用这个函数来帮用户将页面导舨到统计视图的指定页面, 每个页面的操作方法将在调用结果中给出',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(STATISTICS_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
