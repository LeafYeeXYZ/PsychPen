import { create } from 'zustand'

import { DataViewElement } from '../../components/DataView'
import { PlotsView } from '../../components/PlotsView'
import { StatisticsView } from '../../components/StatisticsView'
import { ToolsView } from '../../components/ToolsView'
import { VariableView } from '../../components/VariableView'

export enum MAIN_PAGES_LABELS {
	DATA = '数据',
	VARIABLE = '变量',
	PLOTS = '绘图',
	STATISTICS = '统计',
	TOOLS = '工具',
}
export const MAIN_PAGES_ELEMENTS: Record<
	MAIN_PAGES_LABELS,
	React.ReactElement
> = {
	[MAIN_PAGES_LABELS.DATA]: <DataViewElement />,
	[MAIN_PAGES_LABELS.VARIABLE]: <VariableView />,
	[MAIN_PAGES_LABELS.PLOTS]: <PlotsView />,
	[MAIN_PAGES_LABELS.STATISTICS]: <StatisticsView />,
	[MAIN_PAGES_LABELS.TOOLS]: <ToolsView />,
}

import { ComputeVar } from '../../components/variable/ComputeVar'
import { DataFilter } from '../../components/variable/DataFilter'
import { Interpolate } from '../../components/variable/Interpolate'
import { MissingValue } from '../../components/variable/MissingValue'
import { SubVariables } from '../../components/variable/SubVariables'
import { VariableTable } from '../../components/variable/VariableTable'

export enum VARIABLE_SUB_PAGES_LABELS {
	VARIABLE_TABLE = '变量表格',
	MISSING_VALUE = '定义缺失值',
	INTERPOLATE = '缺失值插值',
	SUB_VARIABLES = '中心化/标准化/离散化',
	DATA_FILTER = '数据筛选',
	COMPUTE_VAR = '生成新变量',
}
export const VARIABLE_SUB_PAGES_ELEMENTS: Record<
	VARIABLE_SUB_PAGES_LABELS,
	React.ReactElement
> = {
	[VARIABLE_SUB_PAGES_LABELS.VARIABLE_TABLE]: <VariableTable />,
	[VARIABLE_SUB_PAGES_LABELS.MISSING_VALUE]: <MissingValue />,
	[VARIABLE_SUB_PAGES_LABELS.INTERPOLATE]: <Interpolate />,
	[VARIABLE_SUB_PAGES_LABELS.SUB_VARIABLES]: <SubVariables />,
	[VARIABLE_SUB_PAGES_LABELS.DATA_FILTER]: <DataFilter />,
	[VARIABLE_SUB_PAGES_LABELS.COMPUTE_VAR]: <ComputeVar />,
}

import { BasicBarPlot } from '../../components/plots/BasicBarPlot'
import { BasicBoxPlot } from '../../components/plots/BasicBoxPlot'
import { BasicLinePlot } from '../../components/plots/BasicLinePlot'
import { BasicPiePlot } from '../../components/plots/BasicPiePlot'
import { BasicScatterPlot } from '../../components/plots/BasicScatterPlot'
import { GroupedBarPlot } from '../../components/plots/GroupedBarPlot'
import { ParallelLinePlot } from '../../components/plots/ParallelLinePlot'
import { QQPlot } from '../../components/plots/QQPlot'
import { ThreeDBarPlot } from '../../components/plots/ThreeDBarPlot'
import { ThreeDScatterPlot } from '../../components/plots/ThreeDScatterPlot'
import { WordCloudPlot } from '../../components/plots/WordCloudPlot'

export enum PLOTS_SUB_PAGES_LABELS {
	BASIC_BOX_PLOT = '基础箱线图',
	BASIC_SCATTER_PLOT = '基础散点图',
	THREE_D_SCATTER_PLOT = '三维散点图',
	BASIC_LINE_PLOT = '基础折线图',
	WORD_CLOUD_PLOT = '词云图',
	THREE_D_BAR_PLOT = '三维柱状图',
	PARALLEL_LINE_PLOT = '平行折线图',
	BASIC_PIE_PLOT = '基础饼图',
	BASIC_BAR_PLOT = '基础柱状图',
	GROUPED_BAR_PLOT = '分组柱状图',
	QQ_PLOT = 'Q-Q图',
}
export const PLOTS_SUB_PAGES_ELEMENTS: Record<
	PLOTS_SUB_PAGES_LABELS,
	React.ReactElement
> = {
	[PLOTS_SUB_PAGES_LABELS.BASIC_BOX_PLOT]: <BasicBoxPlot />,
	[PLOTS_SUB_PAGES_LABELS.BASIC_SCATTER_PLOT]: <BasicScatterPlot />,
	[PLOTS_SUB_PAGES_LABELS.THREE_D_SCATTER_PLOT]: <ThreeDScatterPlot />,
	[PLOTS_SUB_PAGES_LABELS.BASIC_LINE_PLOT]: <BasicLinePlot />,
	[PLOTS_SUB_PAGES_LABELS.WORD_CLOUD_PLOT]: <WordCloudPlot />,
	[PLOTS_SUB_PAGES_LABELS.THREE_D_BAR_PLOT]: <ThreeDBarPlot />,
	[PLOTS_SUB_PAGES_LABELS.PARALLEL_LINE_PLOT]: <ParallelLinePlot />,
	[PLOTS_SUB_PAGES_LABELS.BASIC_PIE_PLOT]: <BasicPiePlot />,
	[PLOTS_SUB_PAGES_LABELS.BASIC_BAR_PLOT]: <BasicBarPlot />,
	[PLOTS_SUB_PAGES_LABELS.GROUPED_BAR_PLOT]: <GroupedBarPlot />,
	[PLOTS_SUB_PAGES_LABELS.QQ_PLOT]: <QQPlot />,
}
export const PLOTS_SUB_PAGES_MAP: Record<string, PLOTS_SUB_PAGES_LABELS[]> = {
	折线图: [
		PLOTS_SUB_PAGES_LABELS.BASIC_LINE_PLOT,
		PLOTS_SUB_PAGES_LABELS.PARALLEL_LINE_PLOT,
	],
	箱线图: [PLOTS_SUB_PAGES_LABELS.BASIC_BOX_PLOT],
	散点图: [
		PLOTS_SUB_PAGES_LABELS.BASIC_SCATTER_PLOT,
		PLOTS_SUB_PAGES_LABELS.THREE_D_SCATTER_PLOT,
	],
	柱状图: [
		PLOTS_SUB_PAGES_LABELS.BASIC_BAR_PLOT,
		PLOTS_SUB_PAGES_LABELS.THREE_D_BAR_PLOT,
		PLOTS_SUB_PAGES_LABELS.GROUPED_BAR_PLOT,
	],
	饼图: [PLOTS_SUB_PAGES_LABELS.BASIC_PIE_PLOT],
	其他: [
		PLOTS_SUB_PAGES_LABELS.WORD_CLOUD_PLOT,
		PLOTS_SUB_PAGES_LABELS.QQ_PLOT,
	],
}

import { CorrReliability } from '../../components/statistics/CorrReliability'
import { Description } from '../../components/statistics/Description'
import { HalfReliability } from '../../components/statistics/HalfReliability'
import { HomoReliability } from '../../components/statistics/HomoReliability'
import { KolmogorovSmirnovTest } from '../../components/statistics/KolmogorovSmirnovTest'
import { KurtosisSkewness } from '../../components/statistics/KurtosisSkewness'
import { LeveneTest } from '../../components/statistics/LeveneTest'
import { MultiLinearRegression } from '../../components/statistics/MultiLinearRegression'
import { OneLinearRegression } from '../../components/statistics/OneLinearRegression'
import { OneSampleTTest } from '../../components/statistics/OneSampleTTest'
import { OneWayANOVA } from '../../components/statistics/OneWayANOVA'
import { PearsonCorrelationTest } from '../../components/statistics/PearsonCorrelationTest'
import { PeerANOVA } from '../../components/statistics/PeerANOVA'
import { PeerSampleTTest } from '../../components/statistics/PeerSampleTTest'
import { SimpleMediatorTest } from '../../components/statistics/SimpleMediatorTest'
import { TwoSampleTTest } from '../../components/statistics/TwoSampleTTest'
import { WelchTTest } from '../../components/statistics/WelchTTest'

export enum STATISTICS_SUB_PAGES_LABELS {
	DESCRIPTION = '描述统计',
	ONE_SAMPLE_T_TEST = '单样本T检验',
	TWO_SAMPLE_T_TEST = '独立样本T检验',
	PEER_SAMPLE_T_TEST = '配对样本T检验',
	WELCH_T_TEST = "不等方差T检验 (Welch's T Test)",
	ONE_WAY_ANOVA = '单因素方差分析',
	PEER_ANOVA = '重复测量方差分析',
	KOLMOGOROV_SMIRNOV_TEST = '单样本 KS 检验 (正态分布检验)',
	KURTOSIS_SKEWNESS = '峰度和偏度检验 (正态分布检验)',
	LEVENE_TEST = 'Levene 检验 (方差齐性检验)',
	PEARSON_CORRELATION_TEST = 'Pearson 相关检验',
	ONE_LINEAR_REGRESSION = '一元线性回归',
	MULTI_LINEAR_REGRESSION = '多元线性回归',
	CORR_RELIABILITY = '重测或复本信度',
	HALF_RELIABILITY = '分半信度',
	HOMO_RELIABILITY = '同质性信度',
	SIMPLE_MEDIATOR_TEST = '简单中介效应检验',
}
export const STATISTICS_SUB_PAGES_ELEMENTS: Record<
	STATISTICS_SUB_PAGES_LABELS,
	React.ReactElement
> = {
	[STATISTICS_SUB_PAGES_LABELS.DESCRIPTION]: <Description />,
	[STATISTICS_SUB_PAGES_LABELS.ONE_SAMPLE_T_TEST]: <OneSampleTTest />,
	[STATISTICS_SUB_PAGES_LABELS.TWO_SAMPLE_T_TEST]: <TwoSampleTTest />,
	[STATISTICS_SUB_PAGES_LABELS.PEER_SAMPLE_T_TEST]: <PeerSampleTTest />,
	[STATISTICS_SUB_PAGES_LABELS.WELCH_T_TEST]: <WelchTTest />,
	[STATISTICS_SUB_PAGES_LABELS.ONE_WAY_ANOVA]: <OneWayANOVA />,
	[STATISTICS_SUB_PAGES_LABELS.PEER_ANOVA]: <PeerANOVA />,
	[STATISTICS_SUB_PAGES_LABELS.KOLMOGOROV_SMIRNOV_TEST]: (
		<KolmogorovSmirnovTest />
	),
	[STATISTICS_SUB_PAGES_LABELS.KURTOSIS_SKEWNESS]: <KurtosisSkewness />,
	[STATISTICS_SUB_PAGES_LABELS.LEVENE_TEST]: <LeveneTest />,
	[STATISTICS_SUB_PAGES_LABELS.PEARSON_CORRELATION_TEST]: (
		<PearsonCorrelationTest />
	),
	[STATISTICS_SUB_PAGES_LABELS.ONE_LINEAR_REGRESSION]: <OneLinearRegression />,
	[STATISTICS_SUB_PAGES_LABELS.MULTI_LINEAR_REGRESSION]: (
		<MultiLinearRegression />
	),
	[STATISTICS_SUB_PAGES_LABELS.CORR_RELIABILITY]: <CorrReliability />,
	[STATISTICS_SUB_PAGES_LABELS.HALF_RELIABILITY]: <HalfReliability />,
	[STATISTICS_SUB_PAGES_LABELS.HOMO_RELIABILITY]: <HomoReliability />,
	[STATISTICS_SUB_PAGES_LABELS.SIMPLE_MEDIATOR_TEST]: <SimpleMediatorTest />,
}
export const STATISTICS_SUB_PAGES_MAP: Record<
	string,
	STATISTICS_SUB_PAGES_LABELS[]
> = {
	描述统计: [STATISTICS_SUB_PAGES_LABELS.DESCRIPTION],
	T检验: [
		STATISTICS_SUB_PAGES_LABELS.ONE_SAMPLE_T_TEST,
		STATISTICS_SUB_PAGES_LABELS.TWO_SAMPLE_T_TEST,
		STATISTICS_SUB_PAGES_LABELS.PEER_SAMPLE_T_TEST,
		STATISTICS_SUB_PAGES_LABELS.WELCH_T_TEST,
	],
	方差分析: [
		STATISTICS_SUB_PAGES_LABELS.ONE_WAY_ANOVA,
		STATISTICS_SUB_PAGES_LABELS.PEER_ANOVA,
	],
	非参数检验: [
		STATISTICS_SUB_PAGES_LABELS.KOLMOGOROV_SMIRNOV_TEST,
		STATISTICS_SUB_PAGES_LABELS.KURTOSIS_SKEWNESS,
		STATISTICS_SUB_PAGES_LABELS.LEVENE_TEST,
	],
	相关和回归: [
		STATISTICS_SUB_PAGES_LABELS.PEARSON_CORRELATION_TEST,
		STATISTICS_SUB_PAGES_LABELS.ONE_LINEAR_REGRESSION,
		STATISTICS_SUB_PAGES_LABELS.MULTI_LINEAR_REGRESSION,
	],
	信度分析: [
		STATISTICS_SUB_PAGES_LABELS.CORR_RELIABILITY,
		STATISTICS_SUB_PAGES_LABELS.HALF_RELIABILITY,
		STATISTICS_SUB_PAGES_LABELS.HOMO_RELIABILITY,
	],
	中介效应分析: [STATISTICS_SUB_PAGES_LABELS.SIMPLE_MEDIATOR_TEST],
}

import { NormalDistribution } from '../../components/tools/NormalDistribution'
import { StatisticToPvalue } from '../../components/tools/StatisticToPvalue'
import { TDistribution } from '../../components/tools/TDistribution'

export enum TOOLS_VIEW_SUB_PAGES_LABELS {
	NORMAL_DISTRIBUTION = '正态分布动态演示',
	T_DISTRIBUTION = 'T分布动态演示',
	STATISTIC_TO_PVALUE = '统计量与P值相互转换',
}
export const TOOLS_VIEW_SUB_PAGES_ELEMENTS: Record<
	TOOLS_VIEW_SUB_PAGES_LABELS,
	React.ReactElement
> = {
	[TOOLS_VIEW_SUB_PAGES_LABELS.NORMAL_DISTRIBUTION]: <NormalDistribution />,
	[TOOLS_VIEW_SUB_PAGES_LABELS.T_DISTRIBUTION]: <TDistribution />,
	[TOOLS_VIEW_SUB_PAGES_LABELS.STATISTIC_TO_PVALUE]: <StatisticToPvalue />,
}

type NavState = {
  currentPageInfo: () => string

	mainPage: React.ReactElement
	activeMainPage: MAIN_PAGES_LABELS
	setMainPage: (page: MAIN_PAGES_LABELS) => void

	variableViewSubPage: React.ReactElement
	activeVariableViewSubPage: VARIABLE_SUB_PAGES_LABELS
	setVariableViewSubPage: (page: VARIABLE_SUB_PAGES_LABELS) => void

	plotsViewSubPage: React.ReactElement
	activePlotsViewSubPage: PLOTS_SUB_PAGES_LABELS
	setPlotsViewSubPage: (page: PLOTS_SUB_PAGES_LABELS) => void

	statisticsViewSubPage: React.ReactElement
	activeStatisticsViewSubPage: STATISTICS_SUB_PAGES_LABELS
	setStatisticsViewSubPage: (page: STATISTICS_SUB_PAGES_LABELS) => void

	toolsViewSubPage: React.ReactElement
	activeToolsViewSubPage: TOOLS_VIEW_SUB_PAGES_LABELS
	setToolsViewSubPage: (page: TOOLS_VIEW_SUB_PAGES_LABELS) => void
}

const DEFAULT_VARIABLE_SUB_PAGE = VARIABLE_SUB_PAGES_LABELS.VARIABLE_TABLE
const DEFAULT_PLOTS_SUB_PAGE = PLOTS_SUB_PAGES_LABELS.BASIC_BAR_PLOT
const DEFAULT_STATISTICS_SUB_PAGE =
	STATISTICS_SUB_PAGES_LABELS.ONE_SAMPLE_T_TEST
const DEFAULT_TOOLS_SUB_PAGE = TOOLS_VIEW_SUB_PAGES_LABELS.STATISTIC_TO_PVALUE

export const useNav = create<NavState>()((setState, getState) => ({
	currentPageInfo: () => {
		const state = getState()
		switch (state.activeMainPage) {
			case MAIN_PAGES_LABELS.DATA:
				return '数据视图'
			case MAIN_PAGES_LABELS.VARIABLE:
				return `变量视图的"${state.activeVariableViewSubPage}"页面`
			case MAIN_PAGES_LABELS.PLOTS:
				return `绘图视图的"${state.activePlotsViewSubPage}"页面`
			case MAIN_PAGES_LABELS.STATISTICS:
				return `统计视图的"${state.activeStatisticsViewSubPage}"页面`
			case MAIN_PAGES_LABELS.TOOLS:
				return `工具视图的"${state.activeToolsViewSubPage}"页面`
			default:
				throw new Error('发现未知页面')
		}
	},
	mainPage: MAIN_PAGES_ELEMENTS[MAIN_PAGES_LABELS.DATA],
	activeMainPage: MAIN_PAGES_LABELS.DATA,
	setMainPage: (page) =>
		setState({ mainPage: MAIN_PAGES_ELEMENTS[page], activeMainPage: page }),

	variableViewSubPage: VARIABLE_SUB_PAGES_ELEMENTS[DEFAULT_VARIABLE_SUB_PAGE],
	activeVariableViewSubPage: DEFAULT_VARIABLE_SUB_PAGE,
	setVariableViewSubPage: (page) =>
		setState({
			variableViewSubPage: VARIABLE_SUB_PAGES_ELEMENTS[page],
			activeVariableViewSubPage: page,
		}),

	plotsViewSubPage: PLOTS_SUB_PAGES_ELEMENTS[DEFAULT_PLOTS_SUB_PAGE],
	activePlotsViewSubPage: DEFAULT_PLOTS_SUB_PAGE,
	setPlotsViewSubPage: (page) =>
		setState({
			plotsViewSubPage: PLOTS_SUB_PAGES_ELEMENTS[page],
			activePlotsViewSubPage: page,
		}),

	statisticsViewSubPage:
		STATISTICS_SUB_PAGES_ELEMENTS[DEFAULT_STATISTICS_SUB_PAGE],
	activeStatisticsViewSubPage: DEFAULT_STATISTICS_SUB_PAGE,
	setStatisticsViewSubPage: (page) =>
		setState({
			statisticsViewSubPage: STATISTICS_SUB_PAGES_ELEMENTS[page],
			activeStatisticsViewSubPage: page,
		}),

	toolsViewSubPage: TOOLS_VIEW_SUB_PAGES_ELEMENTS[DEFAULT_TOOLS_SUB_PAGE],
	activeToolsViewSubPage: DEFAULT_TOOLS_SUB_PAGE,
	setToolsViewSubPage: (page) =>
		setState({
			toolsViewSubPage: TOOLS_VIEW_SUB_PAGES_ELEMENTS[page],
			activeToolsViewSubPage: page,
		}),
}))
