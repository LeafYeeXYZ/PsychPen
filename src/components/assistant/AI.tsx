import {
	BankOutlined,
	ExportOutlined,
	FilterOutlined,
	InfoCircleOutlined,
	MoreOutlined,
} from '@ant-design/icons'
import { Prompts, Sender } from '@ant-design/x'
import type { SenderRef } from '@ant-design/x/es/sender'
import parseThink from '@leaf/parse-think'
import { ExportTypes } from '@psych/sheet'
import { Popover, Space, Tag } from 'antd'
import type OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import readme from '../../../README_FOR_AI.md?raw'
import { useAssistant } from '../../hooks/useAssistant'
import { useData } from '../../hooks/useData'
import {
	MAIN_PAGES_LABELS,
	PLOTS_SUB_PAGES_LABELS,
	STATISTICS_SUB_PAGES_LABELS,
	TOOLS_VIEW_SUB_PAGES_LABELS,
	VARIABLE_SUB_PAGES_LABELS,
	useNav,
} from '../../hooks/useNav'
import { useStates } from '../../hooks/useStates'
import { shortId, sleep } from '../../lib/utils'
import { Funcs } from '../../tools/enum'
import { funcsTools } from '../../tools/tools'
import type { Variable } from '../../types'
import { ALLOWED_INTERPOLATION_METHODS, ALL_VARS_IDENTIFIER } from '../../types'
import { simpleMediationTestCalculator } from '../statistics/SimpleMediatorTest'
import { Messages } from './Messages'

const GREETTING =
	'你好, 我是 PsychPen 的 AI 助手, 可以帮你**讲解 PsychPen 的使用方法、探索你的数据集、导出数据、跳转页面、定义缺失值、缺失值插值、标准化/中心化/离散化变量、生成新变量、筛选数据、解释你当前的统计结果等**. 请问有什么可以帮你的?'
const INSTRUCTION =
	'你是在线统计分析和数据可视化软件"PsychPen"中的AI助手. \n\n你将收到用户的提问、当前用户导入到软件中的数据集中的变量和数据的信息、PsychPen的文档、可以供你调用的工具 (函数) 信息. \n\n你的任务是按照用户的要求, 对用户进行回复或调用工具 (函数). 在调用工具 (函数) 前, 请确保你已经明确知晓了用户的意图, 否则请通过进一步和用户对话来确认细节. \n\n你的回复中如果包含数学公式和符号, 请使用 TeX 语法, 并将行内公式用 `$` 包裹 (类似于 Markdown 的行内代码), 将块级公式用 `$$` 包裹 (类似于 Markdown 的代码块).'
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
	const userText = `\n\n# 用户信息\n\n用户当前所处的页面为: ${page}${stat && `, 当前统计结果为: \n\n\`\`\`markdown\n${stat}\n\`\`\``}`
	const varsText = `\n\n# 变量信息\n\n| 变量名 | 变量类型 | 有效值数量 | 缺失值数量 | 缺失值定义 | 唯一值数量 | 均值 | 标准差 | 中位数 (q2) | q1 | q3 | 最小值 | 最大值 | 子变量信息 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${varsInfo.join('\n')}`
	const dataText = `\n\n# 数据信息\n\n用户原始数据共包含 ${totalCount} 行数据, 经过筛选后剩余 ${usableCount} 行数据. 当前生效的筛选表达式为: \n\n\`\`\`markdown\n${filterExpression || '(无)'}\n\`\`\``
	const docsText = `\n\n# 使用文档\n\n\`\`\`markdown\n${
		readme.replace(/`/g, '\\`')
	}\n\`\`\``
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
					}
				})
				if (abortRef.current) {
					throw new Error('已取消本次请求')
				}
				let rawResponse = ''
				let toolCall: OpenAI.ChatCompletionMessageToolCall | null = null
				for await (const chunk of stream) {
					if (abortRef.current) {
						throw new Error('已取消本次请求')
					}
					if (chunk.usage) {
						setTokenUsage(chunk.usage.total_tokens)
						break
					}
					const delta = chunk.choices[0].delta
					if (delta.tool_calls?.length) {
						if (toolCall) {
							toolCall.function.arguments +=
								delta.tool_calls[0].function?.arguments || ''
						} else if (
							delta.tool_calls[0].id &&
							delta.tool_calls[0].function?.name
						) {
							toolCall = {
								id: delta.tool_calls[0].id,
								type: 'function',
								function: {
									name: delta.tool_calls[0].function.name,
									arguments: delta.tool_calls[0].function?.arguments || '',
								},
							}
						}
					} else if (!toolCall) {
						rawResponse += delta.content || ''
						flushSync(() => {
							setShowLoading(false)
							setMessages([
								...currentMessages,
								{ role: 'assistant', content: rawResponse, id: shortId() },
							])
						})
					}
				}
				if (abortRef.current) {
					throw new Error('已取消本次请求')
				}
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
							case Funcs.SIMPLE_MEDIATOR_TEST: {
								const { x, m, y, B } = JSON.parse(toolCall.function.arguments)
								if (
									typeof x !== 'string' ||
									typeof m !== 'string' ||
									typeof y !== 'string' ||
									typeof B !== 'number'
								) {
									throw new Error('参数错误')
								}
								if (
									!dataCols.some((col) => col.name === x) ||
									!dataCols.some((col) => col.name === m) ||
									!dataCols.some((col) => col.name === y)
								) {
									throw new Error('变量名参数错误')
								}
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
								const { variable_names, method, reference_variable } =
									JSON.parse(toolCall.function.arguments)
								if (
									!Array.isArray(variable_names) ||
									(!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											dataCols.some(
												(col) =>
													col.name === name && col.type === '等距或等比数据',
											),
									) &&
										!variable_names.includes(ALL_VARS_IDENTIFIER))
								) {
									throw new Error('变量名参数错误')
								}
								if (
									!Object.values(ALLOWED_INTERPOLATION_METHODS).includes(method)
								) {
									throw new Error('插值方法参数错误')
								}
								if (
									(method === ALLOWED_INTERPOLATION_METHODS.NEAREST ||
										method === ALLOWED_INTERPOLATION_METHODS.LAGRANGE) &&
									(typeof reference_variable !== 'string' ||
										!dataCols.some(
											(col) =>
												col.name === reference_variable &&
												col.type === '等距或等比数据',
										))
								) {
									throw new Error('插值参考变量参数错误')
								}
								newMessages[1].content =
									'已请求为指定变量设置插值方法, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_INTERPOLATE: {
								const { variable_names } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									!Array.isArray(variable_names) ||
									(!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											dataCols.some(
												(col) =>
													col.name === name && col.type === '等距或等比数据',
											),
									) &&
										!variable_names.includes(ALL_VARS_IDENTIFIER))
								) {
									throw new Error('变量名参数错误')
								}
								newMessages[1].content =
									'已请求清除指定变量的插值方法, 等待用户手动确认'
								break
							}
							case Funcs.DEFINE_MISSING_VALUE: {
								const { variable_names, missing_values } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									!Array.isArray(variable_names) ||
									!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											(dataCols.some((col) => col.name === name) ||
												name === ALL_VARS_IDENTIFIER),
									)
								) {
									throw new Error('变量名参数错误')
								}
								if (!Array.isArray(missing_values)) {
									throw new Error('缺失值参数错误')
								}
								newMessages[1].content =
									'已请求为指定变量设置缺失值, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_MISSING_VALUE: {
								const { variable_names } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									!Array.isArray(variable_names) ||
									!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											(dataCols.some((col) => col.name === name) ||
												name === ALL_VARS_IDENTIFIER),
									)
								) {
									throw new Error('变量名参数错误')
								}
								newMessages[1].content =
									'已请求清除指定变量的缺失值定义, 等待用户手动确认'
								break
							}
							case Funcs.APPLY_FILTER: {
								const { filter_expression } = JSON.parse(
									toolCall.function.arguments,
								)
								if (typeof filter_expression !== 'string') {
									throw new Error('筛选表达式参数错误')
								}
								newMessages[1].content =
									'已请求设置数据筛选规则, 等待用户手动确认'
								break
							}
							case Funcs.CLEAR_SUB_VAR: {
								const { variable_names } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									!Array.isArray(variable_names) ||
									!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											dataCols.some(
												(col) =>
													col.name === name && col.type === '等距或等比数据',
											),
									)
								) {
									throw new Error('变量名参数错误')
								}
								newMessages[1].content = `已请求清除变量 ${(variable_names as string[]).map((name) => `"${name}"`).join('、')} 的所有子变量, 等待用户手动确认`
								break
							}
							case Funcs.CREATE_SUB_VAR: {
								const { variable_names, standardize, centralize, discretize } =
									JSON.parse(toolCall.function.arguments)
								if (
									!Array.isArray(variable_names) ||
									!variable_names.every(
										(name) =>
											typeof name === 'string' &&
											dataCols.some(
												(col) =>
													col.name === name && col.type === '等距或等比数据',
											),
									)
								) {
									throw new Error('变量名参数错误')
								}
								if (
									discretize &&
									(typeof discretize !== 'object' ||
										!discretize.method ||
										!discretize.groups ||
										typeof discretize.method !== 'string' ||
										typeof discretize.groups !== 'number')
								) {
									throw new Error('离散化参数错误')
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
								const { variable_name, calc_expression } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									typeof variable_name !== 'string' ||
									typeof calc_expression !== 'string'
								) {
									throw new Error('变量名或计算表达式参数错误')
								}
								newMessages[1].content = `已请求生成新变量"${variable_name}", 等待用户手动确认`
								break
							}
							case Funcs.EXPORT_DATA: {
								const { file_name, file_type } = JSON.parse(
									toolCall.function.arguments,
								)
								if (
									typeof file_name !== 'string' ||
									typeof file_type !== 'string' ||
									!Object.values(ExportTypes).includes(file_type as ExportTypes)
								) {
									throw new Error('文件名或文件类型参数错误')
								}
								newMessages[1].content = `已请求导出数据到文件"${file_name || 'data'}.${file_type || 'xlsx'}", 等待用户手动确认`
								break
							}
							case Funcs.NAV_TO_DATA_VIEW: {
								setMainPage(MAIN_PAGES_LABELS.DATA)
								newMessages[1].content = '已成功跳转到数据视图'
								break
							}
							case Funcs.NAV_TO_VARIABLE_VIEW: {
								const { page } = JSON.parse(toolCall.function.arguments)
								if (
									!page ||
									!Object.values(VARIABLE_SUB_PAGES_LABELS).includes(page)
								) {
									throw new Error(`未知的子页面 (${page})`)
								}
								setMainPage(MAIN_PAGES_LABELS.VARIABLE)
								setVariableViewSubPage(page)
								newMessages[1].content = `已成功跳转到变量视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_PLOTS_VIEW: {
								const { page } = JSON.parse(toolCall.function.arguments)
								if (
									!page ||
									!Object.values(PLOTS_SUB_PAGES_LABELS).includes(page)
								) {
									throw new Error(`未知的子页面 (${page})`)
								}
								setMainPage(MAIN_PAGES_LABELS.PLOTS)
								setPlotsViewSubPage(page)
								newMessages[1].content = `已成功跳转到绘图视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_STATISTICS_VIEW: {
								const { page } = JSON.parse(toolCall.function.arguments)
								if (
									!page ||
									!Object.values(STATISTICS_SUB_PAGES_LABELS).includes(page)
								) {
									throw new Error(`未知的子页面 (${page})`)
								}
								setMainPage(MAIN_PAGES_LABELS.STATISTICS)
								setStatisticsViewSubPage(page)
								newMessages[1].content = `已成功跳转到统计视图的${page}页面`
								break
							}
							case Funcs.NAV_TO_TOOLS_VIEW: {
								const { page } = JSON.parse(toolCall.function.arguments)
								if (
									!page ||
									!Object.values(TOOLS_VIEW_SUB_PAGES_LABELS).includes(page)
								) {
									throw new Error(`未知的子页面 (${page})`)
								}
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
					const { content } = parseThink(rawResponse)
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
		<div className='w-full h-full flex items-center justify-center gap-3 flex-col'>
			<div className='text-base font-bold mb-4'>
				<InfoCircleOutlined style={{ marginRight: '0.3rem' }} />
				请先按以下步骤设置AI助手
			</div>
			<div className='text-center'>
				1. 鼠标移动到(电脑)或手指点击(手机/平板)数据视图右上角的
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					AI辅助分析设置
				</Tag>
				按钮
			</div>
			<div className='text-center'>
				2. 在弹出的设置窗口中, 点击
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					开启AI辅助分析
				</Tag>
				按钮
			</div>
			<div className='text-center'>
				3. 在
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					API地址
				</Tag>
				文本框中输入AI服务提供商的API地址. 例如 DeepSeek 的API地址为
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					https://api.deepseek.com/v1
				</Tag>
			</div>
			<div className='text-center'>
				4. 在
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					API密钥
				</Tag>
				文本框中输入AI服务提供商的API密钥. 例如 DeepSeek 的API密钥可以在
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					https://platform.deepseek.com/api_keys
				</Tag>
				中获取
			</div>
			<div className='text-center'>
				5. 在
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					AI模型名称
				</Tag>
				文本框中输入要使用的AI模型名称, 例如 DeepSeek-V3 的模型名称为
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					deepseek-chat
				</Tag>
			</div>
			<div className='text-center'>
				6. 点击
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					确认并检验AI服务是否可用
				</Tag>
				按钮. 如果信息填写正确, 则设置界面上方
				<Tag style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}>
					当前状态
				</Tag>
				会显示
				<Tag
					style={{ marginLeft: '0.3rem', marginRight: '0.3rem' }}
					color='green'
				>
					可用
				</Tag>
			</div>
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
							description: '我想去做个中介效应分析',
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
							  content={<span>
								  上次 Tokens 使用量<Tag style={{ marginLeft: '0.3rem', marginRight: '0' }}>{tokenUsage}</Tag>
								</span>}
							>
								<InfoCircleOutlined />
							</Popover>
							<ClearButton
								disabled={loading || disabled || !messages.length}
								onClick={() => {
									setInput('')
									setTokenUsage(0)
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
