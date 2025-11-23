import { z } from 'zod'
import { PLOTS_SUB_PAGES_LABELS } from '../../../hooks/useNav.tsx'
import type { AIFunction } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export const nav_to_plots_view_type = z.object({
	page: z.nativeEnum(PLOTS_SUB_PAGES_LABELS),
})

export const nav_to_plots_view_desc: Map<PLOTS_SUB_PAGES_LABELS, string> =
	new Map([
		[
			PLOTS_SUB_PAGES_LABELS.BASIC_LINE_PLOT,
			'选择要进行绘图的变量的类型 (被试内变量/被试间变量). 如果是被试内变量, 需要选择要进行绘图的变量 (即X轴上的不同值); 如果是被试间变量, 需要选择你要进行检验的数据变量 (Y轴数据) 和分组变量 (X轴上的不同值). 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴和 Y 轴的标签、选择折线图显示的统计量、是否启用折线平滑、是否显示数据标签',
		],
		[
			PLOTS_SUB_PAGES_LABELS.STACK_LINE_PLOT,
			'选择要进行绘图的变量的类型 (被试内变量/被试间变量). 如果是被试内变量, 需要选择要进行绘图的变量 (即X轴上的不同值); 如果是被试间变量, 需要选择你要进行检验的数据变量 (Y轴数据) 和分组变量 (X轴上的不同值). 再选择堆叠变量, 以它的不同取值来区分不同的折线. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴和 Y 轴的标签、选择折线图显示的统计量、是否启用折线平滑、是否显示数据标签',
		],
		[
			PLOTS_SUB_PAGES_LABELS.PARALLEL_LINE_PLOT,
			'选择要进行绘图的变量, 每个选择的变量都是 X 轴上的一条竖线. 每个数据都会成为连接这些竖线的一条横向折线. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义每个变量的标签、折线的宽度和颜色',
		],
		[
			PLOTS_SUB_PAGES_LABELS.BASIC_SCATTER_PLOT,
			'选择要进行绘图 X 轴和 Y 轴的变量. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴和 Y 轴的标签、自定义散点大小、绘制回归线、显示回归方程',
		],
		[
			PLOTS_SUB_PAGES_LABELS.THREE_D_SCATTER_PLOT,
			'选择要进行绘图的 X 轴、Y 轴和 Z 轴的变量. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴、Y 轴和 Z 轴的标签',
		],
		[
			PLOTS_SUB_PAGES_LABELS.BASIC_BAR_PLOT,
			'选择要进行绘图的变量的类型 (被试内变量/被试间变量). 如果是被试内变量, 需要选择要进行绘图的变量; 如果是被试间变量, 需要选择要进行检验的数据变量 (Y轴数据) 和分组变量 (X轴上的不同值). 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴和 Y 轴的标签、是否显示误差棒、误差棒的内容、是否显示数据标签',
		],
		[
			PLOTS_SUB_PAGES_LABELS.THREE_D_BAR_PLOT,
			'选择要进行绘图的 X 轴、Y 轴和 Z 轴的变量. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴、Y 轴和 Z 轴的标签、柱状图的统计量',
		],
		[
			PLOTS_SUB_PAGES_LABELS.GROUPED_BAR_PLOT,
			'选择要进行绘图的分组变量 (X轴上的不同值) 和数据变量 (每个X轴上的值需要显示的Y轴数据). 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义 X 轴和 Y 轴的标签、分组变量每一组的标签、数据变量每一项的标签、误差棒的内容等',
		],
		[
			PLOTS_SUB_PAGES_LABELS.BASIC_PIE_PLOT,
			'选择要进行绘图的变量. 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以设置是否显示数据标签、数据标签的内容',
		],
		[
			PLOTS_SUB_PAGES_LABELS.WORD_CLOUD_PLOT,
			'选择要进行绘图的变量, 并选择合适的词语过滤规则 (如 `非中文常见字` 会过滤掉除常见中文字外的所有字符), 也可自行输入过滤规则 (输入的内容会被视作正则表达式), 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以自定义词云图的颜色、词云图的形状、单词最大和最小尺寸、单词旋转角度、手动关闭词语切分等',
		],
		[
			PLOTS_SUB_PAGES_LABELS.QQ_PLOT,
			'选择要进行绘图的变量 (或选择标准正态分布), 点击 `生成` 按钮即可生成图片, 生成后, 点击 `保存图片` 按钮可以保存图片. 此外, 还可以设置是否标准化数据 (默认不)、取点的数量 (默认匹配数据量)',
		],
	])

export const nav_to_plots_view: AIFunction = {
	name: Funcs.NAV_TO_PLOTS_VIEW,
	label: '将页面导航到绘图视图的指定页面',
	tool: {
		type: 'function',
		function: {
			name: Funcs.NAV_TO_PLOTS_VIEW,
			description:
				'你可以调用这个函数来帮用户将页面导舨到绘图视图的指定页面, 每个页面的操作方法将在调用结果中给出',
			parameters: {
				type: 'object',
				properties: {
					page: {
						description: '页面',
						enum: Object.values(PLOTS_SUB_PAGES_LABELS),
					},
				},
				required: ['page'],
				additionalProperties: false,
			},
			strict: true,
		},
	},
}
