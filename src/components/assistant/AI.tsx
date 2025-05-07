import {
	BankOutlined,
	BoxPlotOutlined,
	ExportOutlined,
	FilterOutlined,
	InfoCircleOutlined,
	MoreOutlined,
} from '@ant-design/icons'
import { Prompts, Sender } from '@ant-design/x'
import type { SenderRef } from '@ant-design/x/es/sender'
import parseThink from '@leaf/parse-think'
import { Popover, Space, Tag } from 'antd'
import type OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import readme from '../../../README_FOR_AI.md?raw'
import { useAssistant } from '../../hooks/useAssistant'
import { useData } from '../../hooks/useData'
import { MAIN_PAGES_LABELS, useNav } from '../../hooks/useNav'
import { useStates } from '../../hooks/useStates'
import { isNumeric, isUniqueNum, isVariable } from '../../lib/checkers'
import { shortId, sleep, tryCatch } from '../../lib/utils'
import { Funcs } from '../../tools/enum'
import { custom_export_type } from '../../tools/funcs/data/custom_export'
import { export_data_type } from '../../tools/funcs/data/export_data'
import { nav_to_plots_view_type } from '../../tools/funcs/nav/nav_to_plots_view'
import { nav_to_statistics_view_type } from '../../tools/funcs/nav/nav_to_statistics_view'
import { nav_to_tools_view_type } from '../../tools/funcs/nav/nav_to_tools_view'
import { nav_to_variable_view_type } from '../../tools/funcs/nav/nav_to_variable_view'
import {
	kolmogorov_smirnov_test_for_independent_vars_type,
	kolmogorov_smirnov_test_for_paired_vars_type,
} from '../../tools/funcs/statistics/kolmogorov_smirnov_test'
import {
	kurtosis_skewness_test_for_independent_vars_type,
	kurtosis_skewness_test_for_paired_vars_type,
} from '../../tools/funcs/statistics/kurtosis_skewness_test'
import {
	levene_test_for_independent_vars_type,
	levene_test_for_paired_vars_type,
} from '../../tools/funcs/statistics/levene_test'
import { one_sample_t_test_type } from '../../tools/funcs/statistics/one_sample_t_test'
import { peer_sample_t_test_type } from '../../tools/funcs/statistics/peer_sample_t_test'
import { simple_mediator_test_type } from '../../tools/funcs/statistics/simple_mediator_test'
import { welch_t_test_type } from '../../tools/funcs/statistics/welch_t_test'
import { apply_filter_type } from '../../tools/funcs/variable/apply_filter'
import { create_new_var_type } from '../../tools/funcs/variable/create_new_var'
import {
	clear_sub_var_type,
	create_sub_var_type,
} from '../../tools/funcs/variable/create_sub_var'
import {
	clear_interpolate_type,
	define_interpolate_type,
} from '../../tools/funcs/variable/interpolate'
import {
	clear_missing_value_type,
	define_missing_value_type,
} from '../../tools/funcs/variable/missing_value'
import { funcsTools } from '../../tools/tools'
import type { Variable } from '../../types'
import { ALLOWED_INTERPOLATION_METHODS } from '../../types'
import { kolmogorovSmirnovTestCalculator } from '../statistics/KolmogorovSmirnovTest'
import { kurtosisSkewnessCalculator } from '../statistics/KurtosisSkewness'
import { leveneTestCalculator } from '../statistics/LeveneTest'
import { oneSampleTTestCalculator } from '../statistics/OneSampleTTest'
import { peerSampleTTestCalculator } from '../statistics/PeerSampleTTest'
import { simpleMediationTestCalculator } from '../statistics/SimpleMediatorTest'
import { twoSampleTTestCalculator } from '../statistics/TwoSampleTTest'
import { welchTTestCalculator } from '../statistics/WelchTTest'
import { Messages } from './Messages'

const GREETTING = `
你好, 我是 PsychPen 的 AI 助手, 可以**讲解 PsychPen 的使用方法、探索你的数据集、导出当前数据、跳转页面、定义缺失值、缺失值插值、标准化/中心化/离散化变量、生成新变量、筛选数据、解释你当前的统计结果、生成并执行代码来导出自定义数据等**. 请问有什么可以帮你的?
`.trim()
const INSTRUCTION = `
你是在线统计分析和数据可视化软件"PsychPen"中的AI助手.

你将收到用户的提问、当前用户导入到软件中的数据集中的变量和数据的信息、PsychPen的文档、可以供你调用的工具 (函数) 信息.

你的任务是按照用户的要求, 对用户进行回复或调用工具 (函数). 在调用工具 (函数) 前, 请确保你已经明确知晓了用户的意图, 否则请通过进一步和用户对话来确认细节. 有的工具需要用户确认后才会执行, 你无法知道用户是否已经确认.

你的回复中如果包含数学公式和符号, 请使用 TeX 语法, 并将行内公式用 \`$\` 包裹, 将块级公式用 \`$$\` 包裹. 如 \`$\\alpha$\` 和 \`(换行)$$(换行)\\alpha(换行)$$(换行)\`.
`.trim()
function GET_PROMPT({
	vars,
	page,
	stat,
	filterExpression,
	totalCount,
	usableCount,
}: {
	vars: Variable[]
	page: string
	stat: string
	filterExpression: string
	totalCount: number
	usableCount: number
}) {
	const varsInfo = vars.map((col) => {
		if (col.type === '称名或等级数据') {
			return `| ${col.name} | ${col.type} | ${col.valid} | ${col.missing} | ${col.missingValues ? col.missingValues.map((v) => `"${v}"`).join('、') : '(未定义缺失值)'} | ${col.unique} | - | - | - | - | - | - | - | - |`
		}
		const subVarInfo = col.subVars
			? `已定义${[
					col.subVars.standard ? '标准化' : '',
					col.subVars.center ? '中心化' : '',
					col.subVars.discrete
						? `离散化 (${col.subVars.discrete.method}, ${col.subVars.discrete.groups} 组) `
						: '',
				]
					.filter((part) => part)
					.join('、')}子变量`
			: '未定义任何子变量'
		return `| ${col.name} | ${col.type} | ${col.valid} | ${col.missing} | ${col.missingValues ? col.missingValues.map((v) => `"${v}"`).join('、') : '(未定义缺失值)'} | ${col.unique} | ${col.mean?.toFixed(4) || '-'} | ${col.std?.toFixed(4) || '-'} | ${col.q2?.toFixed(4) || '-'} | ${col.q1?.toFixed(4) || '-'} | ${col.q3?.toFixed(4) || '-'} | ${col.min?.toFixed(4) || '-'} | ${col.max?.toFixed(4) || '-'} | ${subVarInfo} |`
	})
	const userText = `\n\n# 用户信息\n\n用户当前所处的页面为: ${page}${stat && `, 当前UI界面中的统计结果为: \n\n\`\`\`markdown\n${stat}\n\`\`\``}`
	const varsText = `\n\n# 变量信息\n\n| 变量名 | 变量类型 | 有效值数量 | 缺失值数量 | 缺失值定义 | 唯一值数量 | 均值 | 标准差 | 中位数 (q2) | q1 | q3 | 最小值 | 最大值 | 子变量信息 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${varsInfo.join('\n')}`
	const dataText = `\n\n# 数据信息\n\n用户原始数据共包含 ${totalCount} 行数据, 经过筛选后剩余 ${usableCount} 行数据. 当前生效的筛选表达式为: \n\n\`\`\`markdown\n${filterExpression || '(无)'}\n\`\`\``
	const docsText = `\n\n# 使用文档\n\n\`\`\`markdown\n${readme.replace(
		/`/g,
		'\\`',
	)}\n\`\`\``
	return INSTRUCTION + userText + varsText + dataText + docsText
}

export function AI() {
	const ai = useAssistant((state) => state.ai)
	const model = useAssistant((state) => state.model)
	const data = useData((state) => state.data)
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const filterExpression = useData((state) => state.filterExpression)
	const messageApi = useStates((state) => state.messageApi)
	const statResult = useStates((state) => state.statResult)
	const disabled = useStates((state) => state.disabled)
	const activeMainPage = useNav((state) => state.activeMainPage)
	const currentPageInfo = useNav((state) => state.currentPageInfo)
	const setMainPage = useNav((state) => state.setMainPage)
	const setStatisticsViewSubPage = useNav(
		(state) => state.setStatisticsViewSubPage,
	)
	const setVariableViewSubPage = useNav((state) => state.setVariableViewSubPage)
	const setPlotsViewSubPage = useNav((state) => state.setPlotsViewSubPage)
	const setToolsViewSubPage = useNav((state) => state.setToolsViewSubPage)
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [showLoading, setShowLoading] = useState(false)
	const [messages, setMessages] = useState<
		(OpenAI.ChatCompletionMessageParam & { id: string })[]
	>([])
	const [tokenUsage, setTokenUsage] = useState<number>(0)

	// 数据被清除时重置对话
	useEffect(() => {
		if (!data) {
			setInput('')
			setMessages([])
		}
	}, [data])
	// 对话被清除时重置Tokens用量
	useEffect(() => {
		if (messages.length === 0) {
			setTokenUsage(0)
		}
	}, [messages])

	const abortRef = useRef<boolean>(false)
	const onCancel = async () => {
		if (!abortRef.current) {
			messageApi?.loading('正在取消...', 0)
			abortRef.current = true
		}
	}
	const onSubmit = async () => {
		abortRef.current = false
		const old = JSON.parse(
			JSON.stringify(messages),
		) as (OpenAI.ChatCompletionMessageParam & { id: string })[]
		const snapshot = input
		try {
			const user: OpenAI.ChatCompletionUserMessageParam & { id: string } = {
				role: 'user',
				content: snapshot,
				id: shortId(),
			}
			flushSync(() => {
				setLoading(true)
				setShowLoading(true)
				setMessages([...old, user])
				setInput('')
			})
			const system = GET_PROMPT({
				vars: dataCols,
				page: currentPageInfo(),
				stat:
					statResult ||
					(activeMainPage === MAIN_PAGES_LABELS.STATISTICS
						? '(还未进行统计分析)'
						: '(无)'),
				filterExpression: filterExpression,
				totalCount: data?.length || Number.NaN,
				usableCount: dataRows.length,
			})
			// 初始化消息数组和当前状态
			let currentMessages = [...old, user]
			let hasToolCall = true
			// 使用while循环处理连续的函数调用
			while (hasToolCall) {
				if (abortRef.current) {
					throw new Error('已取消本次请求')
				}
				if (!ai) {
					throw new Error('AI助手不可用')
				}
				const stream = await ai.chat.completions.create({
					model: model,
					messages: [
						{ role: 'system', content: system },
						...(currentMessages.map((message) =>
							Object.fromEntries(
								Object.entries(message).filter(([key]) => key !== 'id'),
							),
						) as OpenAI.ChatCompletionMessageParam[]),
					],
					stream: true,
					tools: funcsTools,
					stream_options: {
						include_usage: true,
					},
				})
				if (abortRef.current) {
					throw new Error('已取消本次请求')
				}
				let responseText = ''
				let thinkProcess = ''
				let toolCallId = ''
				let toolCallName = ''
				let toolCallArgs = ''
				for await (const chunk of stream) {
					if (abortRef.current) {
						throw new Error('已取消本次请求')
					}
					if (chunk.usage) {
						setTokenUsage(chunk.usage.total_tokens)
					}
					if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
						const delta = chunk.choices[0].delta
						// @ts-expect-error 部分 API 服务自定义字段
						if (typeof delta.reasoning_content === 'string') {
							// @ts-expect-error 部分 API 服务自定义字段
							thinkProcess += delta.reasoning_content
							flushSync(() => {
								setShowLoading(false)
								setMessages([
									...currentMessages,
									{
										role: 'assistant',
										content: `__think__${thinkProcess}`,
										id: shortId(),
									},
								])
							})
						}
						if (delta.content) {
							responseText += delta.content
							flushSync(() => {
								setShowLoading(false)
								setMessages([
									...currentMessages,
									{
										role: 'assistant',
										content: parseThink(responseText).content,
										id: shortId(),
									},
								])
							})
						}
						if (
							Array.isArray(delta.tool_calls) &&
							delta.tool_calls.length > 0
						) {
							const toolCall = delta.tool_calls[0]
							if (toolCall.id) {
								toolCallId = toolCall.id
							}
							if (toolCall.function?.name) {
								toolCallName = toolCall.function.name
							}
							if (toolCall.function?.arguments) {
								toolCallArgs += toolCall.function.arguments
							}
						}
					}
				}
				if (abortRef.current) {
					throw new Error('已取消本次请求')
				}
				const toolCall: OpenAI.ChatCompletionMessageToolCall | null =
					toolCallId && toolCallName && toolCallArgs
						? {
								id: toolCallId,
								type: 'function',
								function: {
									name: toolCallName,
									arguments: toolCallArgs,
								},
							}
						: null

				// 处理函数调用
				if (toolCall) {
					const newMessages: (OpenAI.ChatCompletionMessageParam & {
						id: string
					})[] = [
						{
							role: 'assistant',
							content: '',
							tool_calls: [toolCall],
							id: shortId(),
						},
						{
							role: 'tool',
							content: '',
							tool_call_id: toolCall.id,
							id: shortId(),
						},
					]
					try {
						switch (toolCall.function.name) {
							case Funcs.CUSTOM_EXPORT: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								await tryCatch(
									() => custom_export_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								newMessages[1].content =
									'已请求执行代码并导出结果, 等待用户手动确认'
								break
							}
							case Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_INDEPENDENT_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { dataVar, groupVar } = await tryCatch(
									() =>
										kolmogorov_smirnov_test_for_independent_vars_type.parse(
											raw,
										),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric([dataVar], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								await tryCatch(
									() => isVariable([groupVar], dataCols),
									'AI助手返回的分组变量不存在',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const filteredRows = dataRows.filter(
										(row) =>
											typeof row[dataVar] === 'number' &&
											typeof row[groupVar] !== 'undefined',
									)
									const groups = Array.from(
										new Set(filteredRows.map((row) => row[groupVar])),
									).map((v) => String(v))
									const data: number[][] = groups.map(
										(g) =>
											filteredRows
												.filter((row) => row[groupVar] === g)
												.map((row) => row[dataVar]) as number[],
									)
									const result = kurtosisSkewnessCalculator({
										type: 'independent',
										variable: dataVar,
										group: groupVar,
										data,
										groups,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.KOLMOGOROV_SMIRNOV_TEST_FOR_PAIRED_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variables } = await tryCatch(
									() => kolmogorov_smirnov_test_for_paired_vars_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric(variables, dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const data: number[][] = variables.map((variable) =>
										dataRows
											.map((row) => row[variable])
											.filter((v) => typeof v === 'number'),
									)
									const result = kolmogorovSmirnovTestCalculator({
										type: 'paired',
										variables,
										data,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.KURTOSIS_SKEWNESS_TEST_FOR_PAIRED_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variables } = await tryCatch(
									() => kurtosis_skewness_test_for_paired_vars_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric(variables, dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const data: number[][] = variables.map((variable) =>
										dataRows
											.map((row) => row[variable])
											.filter((v) => typeof v === 'number'),
									)
									const result = kurtosisSkewnessCalculator({
										type: 'paired',
										variables,
										data,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.KURTOSIS_SKEWNESS_TEST_FOR_INDEPENDENT_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { dataVar, groupVar } = await tryCatch(
									() =>
										kurtosis_skewness_test_for_independent_vars_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric([dataVar], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								await tryCatch(
									() => isVariable([groupVar], dataCols),
									'AI助手返回的分组变量不存在',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const filteredRows = dataRows.filter(
										(row) =>
											typeof row[dataVar] === 'number' &&
											typeof row[groupVar] !== 'undefined',
									)
									const groups = Array.from(
										new Set(filteredRows.map((row) => row[groupVar])),
									).map((v) => String(v))
									const data: number[][] = groups.map(
										(g) =>
											filteredRows
												.filter((row) => row[groupVar] === g)
												.map((row) => row[dataVar]) as number[],
									)
									const result = kurtosisSkewnessCalculator({
										type: 'independent',
										variable: dataVar,
										group: groupVar,
										data,
										groups,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.LEVENE_TEST_FOR_INDEPENDENT_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { dataVar, groupVar, center } = await tryCatch(
									() => levene_test_for_independent_vars_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric([dataVar], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								await tryCatch(
									() => isVariable([groupVar], dataCols),
									'AI助手返回的分组变量不存在',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const filteredRows = dataRows.filter(
										(row) =>
											typeof row[dataVar] === 'number' &&
											typeof row[groupVar] !== 'undefined',
									)
									const data = filteredRows.map(
										(row) => row[dataVar],
									) as number[]
									const groups = filteredRows.map((row) =>
										String(row[groupVar]),
									)
									const result = leveneTestCalculator({
										type: 'independent',
										variable: dataVar,
										group: groupVar,
										center,
										data,
										groups,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.LEVENE_TEST_FOR_PAIRED_VARS: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variables, center } = await tryCatch(
									() => levene_test_for_paired_vars_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric(variables, dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const groups: string[] = []
									const value: number[] = []
									for (const variable of variables) {
										const filteredRows = dataRows.filter(
											(row) => typeof row[variable] === 'number',
										)
										for (const row of filteredRows) {
											groups.push(String(variable))
											value.push(row[variable] as number)
										}
									}
									const result = leveneTestCalculator({
										type: 'paired',
										variables,
										center,
										data: value,
										groups,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.PEER_SAMPLE_T_TEST: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable1, variable2, expect, twoside, alpha } =
									await tryCatch(
										() => peer_sample_t_test_type.parse(raw),
										'AI助手返回的函数调用参数错误',
									)
								await tryCatch(
									() => isNumeric([variable1, variable2], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const filteredRows = dataRows.filter((row) =>
										[variable1, variable2].every(
											(variable) => typeof row[variable] === 'number',
										),
									)
									const data1 = filteredRows.map(
										(row) => row[variable1],
									) as number[]
									const data2 = filteredRows.map(
										(row) => row[variable2],
									) as number[]
									const result = peerSampleTTestCalculator({
										variable1,
										variable2,
										expect,
										twoside,
										alpha,
										data1,
										data2,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.WELCH_T_TEST:
							case Funcs.TWO_SAMPLE_T_TEST: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { dataVar, groupVar, expect, twoside, alpha } =
									await tryCatch(
										() => welch_t_test_type.parse(raw),
										'AI助手返回的函数调用参数错误',
									)
								await tryCatch(
									() => isNumeric([dataVar], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								await tryCatch(
									() => isUniqueNum(groupVar, dataCols, 2),
									'AI助手返回的分组变量不存在/水平数不为二',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const group1data: number[] = []
									const group2data: number[] = []
									const [group1label, group2label] = Array.from(
										new Set(
											dataRows
												.map((value) => value[groupVar])
												.filter((v) => v !== undefined),
										).values(),
									)
									for (const row of dataRows) {
										if (
											typeof row[dataVar] === 'number' &&
											typeof row[groupVar] !== 'undefined'
										) {
											row[groupVar] == group1label &&
												group1data.push(row[dataVar])
											row[groupVar] == group2label &&
												group2data.push(row[dataVar])
										}
									}
									const result =
										toolCall.function.name === Funcs.WELCH_T_TEST
											? welchTTestCalculator({
													dataVar,
													groupVar,
													expect,
													twoside,
													alpha,
													group1data,
													group2data,
													group1label: String(group1label),
													group2label: String(group2label),
												})
											: twoSampleTTestCalculator({
													dataVar,
													groupVar,
													expect,
													twoside,
													alpha,
													group1data,
													group2data,
													group1label: String(group1label),
													group2label: String(group2label),
												})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.ONE_SAMPLE_T_TEST: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable, expect, twoside, alpha } = await tryCatch(
									() => one_sample_t_test_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric([variable], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const data = dataRows
										.map((row) => row[variable])
										.filter((v) => typeof v === 'number')
									const result = oneSampleTTestCalculator({
										variable,
										expect,
										twoside,
										alpha,
										data,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.SIMPLE_MEDIATOR_TEST: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { x, m, y, B } = await tryCatch(
									() => simple_mediator_test_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric([x, m, y], dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								try {
									messageApi?.loading('正在处理数据...', 0)
									await sleep()
									const timestamp = Date.now()
									const filteredRows = dataRows.filter((row) =>
										[x, m, y].every(
											(variable) => typeof row[variable] === 'number',
										),
									)
									const xData = filteredRows.map((row) => row[x]) as number[]
									const mData = filteredRows.map((row) => row[m]) as number[]
									const yData = filteredRows.map((row) => row[y]) as number[]
									const result = simpleMediationTestCalculator({
										x,
										m,
										y,
										B,
										N: filteredRows.length,
										xData,
										mData,
										yData,
									})
									newMessages[1].content = `##### 统计结果\n\n${result}`
									messageApi?.destroy()
									messageApi?.success(
										`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
									)
									break
								} catch (e) {
									messageApi?.destroy()
									throw new Error(
										`数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
									)
								}
							}
							case Funcs.DEFINE_INTERPOLATE: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names, method, reference_variable } =
									await tryCatch(
										() => define_interpolate_type.parse(raw),
										'AI助手返回的函数调用参数错误',
									)
								await tryCatch(
									() => isNumeric(variable_names, dataCols, true),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								if (
									(method === ALLOWED_INTERPOLATION_METHODS.NEAREST ||
										method === ALLOWED_INTERPOLATION_METHODS.LAGRANGE) &&
									!dataCols.some(
										(col) =>
											col.name === reference_variable &&
											col.type === '等距或等比数据',
									)
								) {
									throw new Error('插值参考变量不存在/不是等距或等比数据')
								}
								newMessages[1].content =
									'已请求为指定变量设置插值方法, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_INTERPOLATE: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names } = await tryCatch(
									() => clear_interpolate_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric(variable_names, dataCols, true),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								newMessages[1].content =
									'已请求清除指定变量的插值方法, 等待用户手动确认'
								break
							}
							case Funcs.DEFINE_MISSING_VALUE: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names } = await tryCatch(
									() => define_missing_value_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isVariable(variable_names, dataCols, true),
									'AI助手返回的变量名不存在',
								)
								newMessages[1].content =
									'已请求为指定变量设置缺失值, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_MISSING_VALUE: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names } = await tryCatch(
									() => clear_missing_value_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isVariable(variable_names, dataCols, true),
									'AI助手返回的变量名不存在',
								)
								newMessages[1].content =
									'已请求清除指定变量的缺失值定义, 等待用户手动确认'
								break
							}
							case Funcs.APPLY_FILTER: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								await tryCatch(
									() => apply_filter_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								newMessages[1].content =
									'已请求设置数据筛选规则, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_SUB_VAR: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names } = await tryCatch(
									() => clear_sub_var_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								await tryCatch(
									() => isNumeric(variable_names, dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								newMessages[1].content =
									'已请求清除指定变量的所有子变量, 等待用户手动确认'
								break
							}
							case Funcs.CREATE_SUB_VAR: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { variable_names, standardize, centralize, discretize } =
									await tryCatch(
										() => create_sub_var_type.parse(raw),
										'AI助手返回的函数调用参数错误',
									)
								await tryCatch(
									() => isNumeric(variable_names, dataCols),
									'AI助手返回的变量名不存在/不是等距或等比数据',
								)
								if (
									discretize &&
									(typeof discretize !== 'object' ||
										!discretize.method ||
										!discretize.groups ||
										typeof discretize.method !== 'string' ||
										typeof discretize.groups !== 'number')
								) {
									throw new Error('AI助手返回的离散化参数错误')
								}
								newMessages[1].content = `已请求生成变量 ${(variable_names as string[]).map((name) => `"${name}"`).join('、')} 的${[
									standardize ? '标准化' : '',
									centralize ? '中心化' : '',
									discretize ? '离散化' : '',
								]
									.filter((part) => part)
									.join('、')}子变量, 等待用户手动确认`
								break
							}
							case Funcs.CREATE_NEW_VAR: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								await tryCatch(
									() => create_new_var_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								newMessages[1].content = '已请求生成新变量, 等待用户手动确认'
								break
							}
							case Funcs.EXPORT_DATA: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								await tryCatch(
									() => export_data_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								newMessages[1].content = '已请求导出数据, 等待用户手动确认'
								break
							}
							case Funcs.NAV_TO_DATA_VIEW: {
								setMainPage(MAIN_PAGES_LABELS.DATA)
								newMessages[1].content = '已成功跳转到数据视图'
								break
							}
							case Funcs.NAV_TO_VARIABLE_VIEW: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { page } = await tryCatch(
									() => nav_to_variable_view_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								setMainPage(MAIN_PAGES_LABELS.VARIABLE)
								setVariableViewSubPage(page)
								newMessages[1].content = `已成功跳转到变量视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_PLOTS_VIEW: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { page } = await tryCatch(
									() => nav_to_plots_view_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								setMainPage(MAIN_PAGES_LABELS.PLOTS)
								setPlotsViewSubPage(page)
								newMessages[1].content = `已成功跳转到绘图视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_STATISTICS_VIEW: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { page } = await tryCatch(
									() => nav_to_statistics_view_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								setMainPage(MAIN_PAGES_LABELS.STATISTICS)
								setStatisticsViewSubPage(page)
								newMessages[1].content = `已成功跳转到统计视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_TOOLS_VIEW: {
								const raw = await tryCatch(
									() => JSON.parse(toolCall.function.arguments),
									'AI助手返回的JSON数据格式错误',
								)
								const { page } = await tryCatch(
									() => nav_to_tools_view_type.parse(raw),
									'AI助手返回的函数调用参数错误',
								)
								setMainPage(MAIN_PAGES_LABELS.TOOLS)
								setToolsViewSubPage(page)
								newMessages[1].content = `已成功跳转到工具视图的${page}页面`
								break
							}
							default: {
								throw new Error(`未知函数 (${toolCall.function.name})`)
							}
						}
					} catch (e) {
						throw new Error(
							`AI函数调用错误: ${e instanceof Error ? e.message : String(e)}`,
						)
					}
					// 更新UI，显示函数调用结果
					flushSync(() => {
						setShowLoading(true)
						setMessages([...currentMessages, ...newMessages])
					})
					// 更新当前消息集合，添加函数调用和结果
					currentMessages = [...currentMessages, ...newMessages]
				} else {
					// 如果没有工具调用，处理普通响应
					const { content } = parseThink(responseText)
					setMessages([
						...currentMessages,
						{ role: 'assistant', content, id: shortId() },
					])
					hasToolCall = false // 结束循环
				}
			}
		} catch (error) {
			messageApi?.destroy()
			messageApi?.error(error instanceof Error ? error.message : String(error))
			setMessages(old)
			setInput(snapshot)
		} finally {
			setShowLoading(false)
			setLoading(false)
		}
	}
	// 给 <Prompts /> 用的
	const senderRef = useRef<SenderRef>(null)
	const numberCol = dataCols.find((col) => col.type === '等距或等比数据')

	return !data ? (
		<div className='w-full h-full flex items-center justify-center text-base font-bold'>
			<InfoCircleOutlined style={{ marginRight: '0.3rem' }} />
			请先导入数据或打开示例数据
		</div>
	) : !ai ? (
		<div className='w-full h-full flex items-center justify-center text-base font-bold'>
			<InfoCircleOutlined style={{ marginRight: '0.3rem' }} />
			请先在数据页面右上角进行AI设置
		</div>
	) : (
		<div className='w-full h-full flex flex-col justify-between items-center'>
			<Messages
				messages={messages}
				showLoading={showLoading}
				greeting={GREETTING}
				setInput={setInput}
				setMessages={setMessages}
				loading={loading}
			/>
			{messages.length === 0 && (
				<Prompts
					className='w-full mb-3'
					onItemClick={({ data }) => {
						setInput(data.description?.toString() || '')
						senderRef.current?.focus()
					}}
					items={[
						{
							key: 'intro',
							icon: <InfoCircleOutlined />,
							label: '自我介绍',
							description: '你能为我做什么?',
						},
						...(numberCol
							? [
									{
										key: 'filter',
										icon: <FilterOutlined />,
										label: '处理数据',
										description: `请帮我筛选出"${numberCol.name}"在三个标准差以内的数据`,
									},
									{
										key: 'ttest',
										icon: <BoxPlotOutlined />,
										label: '统计检验',
										description: `请帮我进行对变量"${numberCol.name}"进行单样本t检验`,
									},
								]
							: []),
						{
							key: 'education',
							icon: <BankOutlined />,
							label: '讲解概念',
							description: '请问什么是最小二乘法?',
						},
						{
							key: 'jump',
							icon: <MoreOutlined />,
							label: '跳转页面',
							description: '我想去体验一下T分布动态演示',
						},
						{
							key: 'export',
							icon: <ExportOutlined />,
							label: '导出数据',
							description: '帮我导出 Excel 格式的数据',
						},
					]}
				/>
			)}
			<Sender
				ref={senderRef}
				onCancel={onCancel}
				onSubmit={onSubmit}
				disabled={disabled}
				loading={loading}
				value={input}
				onChange={setInput}
				submitType='shiftEnter'
				placeholder='按 Shift + Enter 发送消息'
				actions={(_, info) => {
					const { SendButton, LoadingButton, ClearButton } = info.components
					return (
						<Space size='small'>
							<Popover
								trigger={['hover', 'click']}
								content={
									<span>
										当前 Tokens 使用量
										<Tag style={{ marginLeft: '0.3rem', marginRight: '0' }}>
											{tokenUsage}
										</Tag>
									</span>
								}
							>
								<InfoCircleOutlined />
							</Popover>
							<ClearButton
								disabled={loading || disabled || !messages.length}
								onClick={() => {
									setInput('')
									setMessages([])
									messageApi?.success('已清空历史对话')
								}}
							/>
							{loading ? <LoadingButton /> : <SendButton />}
						</Space>
					)
				}}
			/>
		</div>
	)
}
