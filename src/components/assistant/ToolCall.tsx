import { ExportTypes, downloadSheet } from '@psych/sheet'
import { Button, Tag } from 'antd'
import type { ChatCompletionMessageToolCall } from 'openai/resources/index.mjs'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { sleep } from '../../lib/utils'
import {
	ALLOWED_DISCRETE_METHODS,
	type ALLOWED_INTERPOLATION_METHODS,
	ALL_VARS_IDENTIFIER,
} from '../../types'
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
		case 'nav_to_data_view': {
			element = <NavToPageTool mainPageName='数据视图' />
			break
		}
		case 'nav_to_variable_view': {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='变量视图' subPageName={page} />
			break
		}
		case 'nav_to_plots_view': {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='绘图视图' subPageName={page} />
			break
		}
		case 'nav_to_statistics_view': {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='统计视图' subPageName={page} />
			break
		}
		case 'nav_to_tools_view': {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='工具视图' subPageName={page} />
			break
		}
		case 'define_missing_value': {
			const { variable_names, missing_values } = JSON.parse(args) as {
				variable_names: string[]
				missing_values: unknown[]
			}
			element = (
				<DefineMissingValueTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
					missing_values={missing_values}
				/>
			)
			break
		}
		case 'clear_missing_value': {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearMissingValueTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
				/>
			)
			break
		}
		case 'define_interpolate': {
			const { variable_names, method, reference_variable } = JSON.parse(
				args,
			) as {
				variable_names: string[]
				method: ALLOWED_INTERPOLATION_METHODS
				reference_variable?: string
			}
			element = (
				<DefineInterpolateTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
					method={method}
					reference_variable={reference_variable}
				/>
			)
			break
		}
		case 'clear_interpolate': {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearInterpolateTool
					done={done}
					setDone={setDone}
					id={id}
					variable_names={variable_names}
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

function NavToPageTool({
	mainPageName,
	subPageName,
}: {
	mainPageName: string
	subPageName?: string
}) {
	return (
		<div>
			跳转到{' '}
			<Tag color='blue' style={{ margin: 0 }}>
				{mainPageName}
			</Tag>
			{subPageName && (
				<>
					{' '}
					下的{' '}
					<Tag color='blue' style={{ margin: 0 }}>
						{subPageName}
					</Tag>{' '}
					页面
				</>
			)}
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
	const dataRows = useData((state) => state.dataRows)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
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
	const addNewVar = useData((state) => state.addNewVar)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
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

function DefineInterpolateTool({
	done,
	setDone,
	id,
	variable_names,
	method,
	reference_variable,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	variable_names: string[]
	method: ALLOWED_INTERPOLATION_METHODS
	reference_variable?: string
}) {
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find(
							(func) => func.tool.function.name === 'define_interpolate',
						)?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}设置变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					<>
						{variable_names.map((name) => (
							<Tag
								key={name}
								style={{ margin: 0, marginLeft: '0.3rem' }}
								color='blue'
							>
								{name}
							</Tag>
						))}
					</>
				)}{' '}
				的插值方法为:
				<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='yellow'>
					{method}
				</Tag>
				{reference_variable && (
					<>
						, 插值参考变量为:
						<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='yellow'>
							{reference_variable}
						</Tag>
					</>
				)}
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							if (variable_names.includes(ALL_VARS_IDENTIFIER)) {
								updateData(
									dataCols.map((col) => {
										if (col.type === '等距或等比数据') {
											return {
												...col,
												missingMethod: method,
												missingRefer: reference_variable,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为所有变量设置插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingMethod: method,
												missingRefer: reference_variable,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为变量 ${variable_names
										.map((name) => `"${name}"`)
										.join(
											'、',
										)} 设置插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							}
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
					{done ? '已设置插值方法' : '确认设置插值方法'}
				</Button>
			</div>
		</>
	)
}

function ClearInterpolateTool({
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
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find(
							(func) => func.tool.function.name === 'clear_interpolate',
						)?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}清除变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					<>
						{variable_names.map((name) => (
							<Tag
								key={name}
								style={{ margin: 0, marginLeft: '0.3rem' }}
								color='blue'
							>
								{name}
							</Tag>
						))}
					</>
				)}{' '}
				的插值方法
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
							if (variable_names.includes(ALL_VARS_IDENTIFIER)) {
								updateData(
									dataCols.map((col) => {
										if (col.type === '等距或等比数据') {
											return {
												...col,
												missingMethod: undefined,
												missingRefer: undefined,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除所有变量的插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingMethod: undefined,
												missingRefer: undefined,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除变量 ${variable_names
										.map((name) => `"${name}"`)
										.join(
											'、',
										)} 的插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							}
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
					{done ? '已清除插值方法' : '确认清除插值方法'}
				</Button>
			</div>
		</>
	)
}

function DefineMissingValueTool({
	done,
	setDone,
	id,
	variable_names,
	missing_values,
}: {
	done: boolean
	setDone: (done: boolean) => void
	id: string
	variable_names: string[]
	missing_values: unknown[]
}) {
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find(
							(func) => func.tool.function.name === 'define_missing_value',
						)?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}定义变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					<>
						{variable_names.map((name) => (
							<Tag
								key={name}
								style={{ margin: 0, marginLeft: '0.3rem' }}
								color='blue'
							>
								{name}
							</Tag>
						))}
					</>
				)}{' '}
				的缺失值为:
				{missing_values.map((value) => (
					<Tag
						key={String(value)}
						style={{ margin: 0, marginLeft: '0.3rem' }}
						color='yellow'
					>
						{String(value)}
					</Tag>
				))}
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
							if (variable_names.includes(ALL_VARS_IDENTIFIER)) {
								updateData(
									dataCols.map((col) => ({
										...col,
										missingValues: missing_values,
									})),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为所有变量定义缺失值, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingValues: missing_values,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为变量 ${variable_names
										.map((name) => `"${name}"`)
										.join(
											'、',
										)} 定义缺失值, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							}
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
					{done ? '已定义缺失值' : '确认定义缺失值'}
				</Button>
			</div>
		</>
	)
}

function ClearMissingValueTool({
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
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{
						funcs.find(
							(func) => func.tool.function.name === 'clear_missing_value',
						)?.label
					}
				</Tag>
				{done ? ', 已' : ', 是否确认'}清除变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					<>
						{variable_names.map((name) => (
							<Tag
								key={name}
								style={{ margin: 0, marginLeft: '0.3rem' }}
								color='blue'
							>
								{name}
							</Tag>
						))}
					</>
				)}{' '}
				的缺失值定义
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
							if (variable_names.includes(ALL_VARS_IDENTIFIER)) {
								updateData(
									dataCols.map((col) => ({
										...col,
										missingValues: undefined,
									})),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除所有变量的缺失值定义, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingValues: undefined,
											}
										}
										return col
									}),
								)
								setDone(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的缺失值定义, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							}
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
					{done ? '已清除缺失值定义' : '确认清除缺失值定义'}
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
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
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
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
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
	const setFilterExpression = useData((state) => state.setFilterExpression)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
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
							messageApi?.destroy()
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
