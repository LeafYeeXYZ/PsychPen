import type { ChatCompletionMessageToolCall } from 'openai/resources/index.mjs'
import { useEffect, useState } from 'react'
import { ExportDataTool } from '../../tools/components/data/ExportDataTool'
import { NavToPageTool } from '../../tools/components/nav/NavToPageTool'
import { ApplyFilterTool } from '../../tools/components/variable/ApplyFilterTool'
import { ClearInterpolateTool } from '../../tools/components/variable/ClearInterpolateTool'
import { ClearMissingValueTool } from '../../tools/components/variable/ClearMissingValueTool'
import { ClearSubVarTool } from '../../tools/components/variable/ClearSubVarTool'
import { CreateNewVarTool } from '../../tools/components/variable/CreateNewVarTool'
import { CreateSubVarTool } from '../../tools/components/variable/CreateSubVarTool'
import { DefineInterpolateTool } from '../../tools/components/variable/DefineInterpolateTool'
import { DefineMissingValueTool } from '../../tools/components/variable/DefineMissingValueTool'
import type {
	ALLOWED_DISCRETE_METHODS,
	ALLOWED_INTERPOLATION_METHODS,
} from '../../types'

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
			throw new Error(`未知函数 (${toolCall.function.name})`)
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
