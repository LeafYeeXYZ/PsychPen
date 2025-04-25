import type OpenAI from 'openai'
import { useState } from 'react'
import { DefaultTool } from '../../tools/components/DefaultTool'
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
import { Funcs } from '../../tools/enum'
import { funcsLabel } from '../../tools/tools'
import type {
	ALLOWED_DISCRETE_METHODS,
	ALLOWED_INTERPOLATION_METHODS,
} from '../../types'

export function ToolCall({
	toolCall,
}: {
	toolCall: OpenAI.ChatCompletionMessageToolCall
}) {
	const id = toolCall.id
	const name = toolCall.function.name
	const args = toolCall.function.arguments
	const [done, setDone] = useState(false)
	let element: React.ReactElement | null = null
	const initDone = sessionStorage.getItem(id) === 'done'
	switch (name) {
		case Funcs.APPLY_FILTER: {
			const { filter_expression } = JSON.parse(args) as {
				filter_expression: string
			}
			element = (
				<ApplyFilterTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					filter_expression={filter_expression}
				/>
			)
			break
		}
		case Funcs.CLEAR_SUB_VAR: {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearSubVarTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
				/>
			)
			break
		}
		case Funcs.CREATE_SUB_VAR: {
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
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
					standardize={standardize}
					centralize={centralize}
					discretize={discretize}
				/>
			)
			break
		}
		case Funcs.CREATE_NEW_VAR: {
			const { variable_name, calc_expression } = JSON.parse(args) as {
				variable_name: string
				calc_expression: string
			}
			element = (
				<CreateNewVarTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_name={variable_name}
					calc_expression={calc_expression}
				/>
			)
			break
		}
		case Funcs.EXPORT_DATA: {
			const { file_name, file_type } = JSON.parse(args) as {
				file_name: string
				file_type: string
			}
			element = (
				<ExportDataTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					file_name={file_name}
					file_type={file_type}
				/>
			)
			break
		}
		case Funcs.NAV_TO_DATA_VIEW: {
			element = <NavToPageTool mainPageName='数据视图' />
			break
		}
		case Funcs.NAV_TO_VARIABLE_VIEW: {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='变量视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_PLOTS_VIEW: {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='绘图视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_STATISTICS_VIEW: {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='统计视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_TOOLS_VIEW: {
			const { page } = JSON.parse(args) as { page: string }
			element = <NavToPageTool mainPageName='工具视图' subPageName={page} />
			break
		}
		case Funcs.DEFINE_MISSING_VALUE: {
			const { variable_names, missing_values } = JSON.parse(args) as {
				variable_names: string[]
				missing_values: unknown[]
			}
			element = (
				<DefineMissingValueTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
					missing_values={missing_values}
				/>
			)
			break
		}
		case Funcs.CLEAR_MISSING_VALUE: {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearMissingValueTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
				/>
			)
			break
		}
		case Funcs.DEFINE_INTERPOLATE: {
			const { variable_names, method, reference_variable } = JSON.parse(
				args,
			) as {
				variable_names: string[]
				method: ALLOWED_INTERPOLATION_METHODS
				reference_variable?: string
			}
			element = (
				<DefineInterpolateTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
					method={method}
					reference_variable={reference_variable}
				/>
			)
			break
		}
		case Funcs.CLEAR_INTERPOLATE: {
			const { variable_names } = JSON.parse(args) as {
				variable_names: string[]
			}
			element = (
				<ClearInterpolateTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					variable_names={variable_names}
				/>
			)
			break
		}
		default: {
			element = (
				<DefaultTool label={funcsLabel.get(name as Funcs) ?? '未知函数'} />
			)
			break
		}
	}
	return <div className='flex flex-col gap-3'>{element}</div>
}
