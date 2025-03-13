import { ExportTypes, downloadSheet } from '@psych/sheet'
import { Button, Tag } from 'antd'
import type { ChatCompletionMessageToolCall } from 'openai/resources/index.mjs'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { sleep } from '../../lib/utils'
import { ALLOWED_DISCRETE_METHODS } from '../../types'
import { Expression } from '../widgets/Expression'
import { funcs } from './funcs'

export function ToolCall({
	toolCall,
}: {
	toolCall: ChatCompletionMessageToolCall
}) {
	const id = toolCall.id
	const name = toolCall.function.name
	const args = toolCall.function.arguments
	const [done, setDone] = useState(false)
	let element: React.ReactElement | null = null
	const initDone = sessionStorage.getItem(id) === 'done'
	switch (name) {
		case 'apply_filter': {
			const { filter_expression } = JSON.parse(args) as {
				filter_expression: string
			}
			element = (
				<ApplyFilterTool
					done={done}
					setDone={setDone}
					id={id}
					filter_expression={filter_expression}
				/>
			)
			break
		}

		case 'clear_sub_var': {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearSubVarTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
				/>
			)
			break
		}
		case 'create_sub_var': {
			const { variable_names, standardize, centralize, discretize } =
				JSON.parse(args) as {
					variable_names: string[]
					standardize: boolean | undefined
					centralize: boolean | undefined
					discretize:
						| {
								method: ALLOWED_DISCRETE_METHODS
								groups: number
						  }
						| undefined
				}
			element = (
				<CreateSubVarTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
					standardize={standardize}
					centralize={centralize}
					discretize={discretize}
				/>
			)
			break
		}
		case 'create_new_var': {
			const { variable_name, calc_expression } = JSON.parse(args) as {
				variable_name: string
				calc_expression: string
			}
			element = (
				<CreateNewVarTool
					done={done}
					setDone={setDone}
					id={id}
					variable_name={variable_name}
					calc_expression={calc_expression}
				/>
			)
			break
		}
		case 'export_data': {
			const { file_name, file_type } = JSON.parse(args) as {
				file_name: string
				file_type: string
			}
			element = (
				<ExportDataTool
					done={done}
					setDone={setDone}
					id={id}
					file_name={file_name}
					file_type={file_type}
				/>
			)
			break
		}
		default: {
			element = <DefaultTool toolCall={toolCall} />
		}
	}
	// biome-ignore lint/correctness/useExhaustiveDependencies: 用于初始化, 无需持续监听
	useEffect(() => {
		if (initDone) {
			setDone(true)
		}
	}, [])
	return <div className='flex flex-col gap-3'>{element}</div>
}

function DefaultTool({
	toolCall,
}: {
	toolCall: ChatCompletionMessageToolCall
}) {
	return (
		<div>
			执行函数{' '}
			<Tag color='blue' style={{ margin: 0 }}>
				{funcs.find(
					(func) => func.tool.function.name === toolCall.function.name,
				)?.label || `未知函数 (${toolCall.function.name})`}
			</Tag>
		</div>
	)
}

function ExportDataTool({
	done,
	setDone,
	id,
	file_name,
	file_type,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	file_name: string
	file_type: string
}) {
	const { dataRows } = useData()
	const { messageApi, disabled } = useStates()
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find((func) => func.tool.function.name === 'export_data')
							?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}导出数据到文件{' '}
				<Tag style={{ margin: 0 }} color='blue'>
					{file_name || 'data'}.{file_type || 'xlsx'}
				</Tag>
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={() => {
						downloadSheet(
							dataRows,
							Object.values(ExportTypes).includes(file_type as ExportTypes)
								? (file_type as ExportTypes)
								: ExportTypes.XLSX,
							file_name || undefined,
						)
						setDone(true)
						sessionStorage.setItem(id, 'done')
						messageApi?.success(
							`已成功导出数据到文件"${file_name || 'data'}.${file_type || 'xlsx'}"`,
						)
					}}
				>
					{done ? '已导出数据' : '确认导出数据'}
				</Button>
			</div>
		</>
	)
}

function CreateNewVarTool({
	done,
	setDone,
	id,
	variable_name,
	calc_expression,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	variable_name: string
	calc_expression: string
}) {
	const { addNewVar, isLargeData } = useData()
	const { messageApi, disabled, setDisabled } = useStates()
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find((func) => func.tool.function.name === 'create_new_var')
							?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}生成新变量{' '}
				<Tag style={{ margin: 0 }} color='blue'>
					{variable_name}
				</Tag>
				, 计算表达式为如下:
			</div>
			<div className='bg-white dark:bg-gray-800 rounded-md p-3 border'>
				<Expression value={calc_expression} />
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							await addNewVar(variable_name, calc_expression)
							setDone(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功生成新变量"${variable_name}", 用时 ${Date.now() - timestamp} 毫秒`,
							)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					{done ? '已生成新变量' : '确认生成新变量'}
				</Button>
			</div>
		</>
	)
}

function CreateSubVarTool({
	done,
	setDone,
	id,
	variable_names,
	standardize,
	centralize,
	discretize,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	variable_names: string[]
	standardize: boolean | undefined
	centralize: boolean | undefined
	discretize:
		| {
				method: ALLOWED_DISCRETE_METHODS
				groups: number
		  }
		| undefined
}) {
	const { dataCols, updateData, isLargeData } = useData()
	const { messageApi, disabled, setDisabled } = useStates()
	const ALLOWED_METHOD = Object.values(ALLOWED_DISCRETE_METHODS)
	const shouldDiscritize = Boolean(
		typeof discretize === 'object' &&
			discretize.method &&
			discretize.groups &&
			ALLOWED_METHOD.includes(discretize.method),
	)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find((func) => func.tool.function.name === 'create_sub_var')
							?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}生成变量
				{variable_names.map((name) => (
					<Tag
						key={name}
						style={{ margin: 0, marginLeft: '0.3rem' }}
						color='blue'
					>
						{name}
					</Tag>
				))}{' '}
				的
				{[
					standardize ? '标准化' : '',
					centralize ? '中心化' : '',
					shouldDiscritize
						? `离散化 (${discretize?.method}, ${discretize?.groups} 组) `
						: '',
				]
					.filter((part) => part)
					.join('、')}
				子变量
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							updateData(
								dataCols.map((col) => {
									if (variable_names.includes(col.name)) {
										return {
											...col,
											subVars: {
												standard: Boolean(standardize) || col.subVars?.standard,
												center: Boolean(centralize) || col.subVars?.center,
												discrete: shouldDiscritize
													? {
															// biome-ignore lint/style/noNonNullAssertion: 如果 shouldDiscritize 为真, 则 discretize 一定存在
															method: discretize!.method,
															// biome-ignore lint/style/noNonNullAssertion: 如果 shouldDiscritize 为真, 则 discretize 一定存在
															groups: discretize!.groups,
														}
													: col.subVars?.discrete,
											},
										}
									}
									return col
								}),
							)
							setDone(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功生成变量 ${variable_names
									.map((name) => `"${name}"`)
									.join('、')} 的${[
									standardize ? '标准化' : '',
									centralize ? '中心化' : '',
									shouldDiscritize ? '离散化' : '',
								]
									.filter((part) => part)
									.join('、')}子变量, 用时 ${Date.now() - timestamp} 毫秒`,
							)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					{done ? '已生成子变量' : '确认生成子变量'}
				</Button>
			</div>
		</>
	)
}

function ClearSubVarTool({
	done,
	setDone,
	id,
	variable_names,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	variable_names: string[]
}) {
	const { dataCols, updateData, isLargeData } = useData()
	const { messageApi, disabled, setDisabled } = useStates()
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find((func) => func.tool.function.name === 'clear_sub_var')
							?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}清除变量
				{variable_names.map((name) => (
					<Tag
						key={name}
						style={{ margin: 0, marginLeft: '0.3rem' }}
						color='blue'
					>
						{name}
					</Tag>
				))}{' '}
				的所有子变量
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							updateData(
								dataCols.map((col) => {
									if (variable_names.includes(col.name)) {
										return {
											...col,
											subVars: undefined,
										}
									}
									return col
								}),
							)
							setDone(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功清除变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的所有子变量, 用时 ${Date.now() - timestamp} 毫秒`,
							)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					{done ? '已清除子变量' : '确认清除子变量'}
				</Button>
			</div>
		</>
	)
}

function ApplyFilterTool({
	done,
	setDone,
	id,
	filter_expression,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	filter_expression: string
}) {
	const { setFilterExpression, isLargeData } = useData()
	const { messageApi, disabled, setDisabled } = useStates()
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find((func) => func.tool.function.name === 'apply_filter')
							?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}设置数据筛选规则, 表达式如下:
			</div>
			<div className='bg-white dark:bg-gray-800 rounded-md p-3 border'>
				<Expression value={filter_expression} />
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							await setFilterExpression(filter_expression)
							setDone(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.success(
								`已成功设置数据筛选规则, 用时 ${Date.now() - timestamp} 毫秒`,
							)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					{done ? '已设置筛选规则' : '确认设置筛选规则'}
				</Button>
			</div>
		</>
	)
}
