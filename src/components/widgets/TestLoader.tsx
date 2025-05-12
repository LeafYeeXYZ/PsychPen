import { useEffect } from 'react'
import {
	PLOTS_SUB_PAGES_LABELS,
	STATISTICS_SUB_PAGES_LABELS,
	TOOLS_VIEW_SUB_PAGES_LABELS,
	VARIABLE_SUB_PAGES_LABELS,
} from '../../hooks/useNav'
import { Funcs } from '../../tools/enum'
import { nav_to_plots_view_desc } from '../../tools/funcs/nav/nav_to_plots_view'
import { nav_to_statistics_view_desc } from '../../tools/funcs/nav/nav_to_statistics_view'
import { nav_to_tools_view_desc } from '../../tools/funcs/nav/nav_to_tools_view'
import { nav_to_variable_view_desc } from '../../tools/funcs/nav/nav_to_variable_view'
import { funcsLabel, funcsTools } from '../../tools/tools'

export function TestLoader() {
	useEffect(() => {
		const funcsNames = Object.values(Funcs)
		if (funcsNames.length !== funcsTools.length) {
			throw new Error('AI函数枚举长度与函数工具长度不一致')
		}
		if (funcsNames.length !== funcsLabel.size) {
			throw new Error('AI函数枚举长度与函数标签长度不一致')
		}

		const variableViewLabels = Object.values(VARIABLE_SUB_PAGES_LABELS)
		if (variableViewLabels.length !== nav_to_variable_view_desc.size) {
			throw new Error('变量视图标签长度与函数描述长度不一致')
		}
		for (const label of variableViewLabels) {
			if (!nav_to_variable_view_desc.has(label)) {
				throw new Error(`变量视图标签 ${label} 在函数描述中不存在`)
			}
		}

		const plotsViewLabels = Object.values(PLOTS_SUB_PAGES_LABELS)
		if (plotsViewLabels.length !== nav_to_plots_view_desc.size) {
			throw new Error('绘图视图标签长度与函数描述长度不一致')
		}
		for (const label of plotsViewLabels) {
			if (!nav_to_plots_view_desc.has(label)) {
				throw new Error(`绘图视图标签 ${label} 在函数描述中不存在`)
			}
		}

		const toolsViewLabels = Object.values(TOOLS_VIEW_SUB_PAGES_LABELS)
		if (toolsViewLabels.length !== nav_to_tools_view_desc.size) {
			throw new Error('工具视图标签长度与函数描述长度不一致')
		}
		for (const label of toolsViewLabels) {
			if (!nav_to_tools_view_desc.has(label)) {
				throw new Error(`工具视图标签 ${label} 在函数描述中不存在`)
			}
		}

		const statisticsViewLabels = Object.values(STATISTICS_SUB_PAGES_LABELS)
		if (statisticsViewLabels.length !== nav_to_statistics_view_desc.size) {
			throw new Error('统计视图标签长度与函数描述长度不一致')
		}
		for (const label of statisticsViewLabels) {
			if (!nav_to_statistics_view_desc.has(label)) {
				throw new Error(`统计视图标签 ${label} 在函数描述中不存在`)
			}
		}
	}, [])
	return <></>
}
