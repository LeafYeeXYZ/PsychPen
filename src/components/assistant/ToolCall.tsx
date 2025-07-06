// 注: 类型检查已在 AI.tsx 中完成
import type OpenAI from 'openai'
import { useState } from 'react'
import type { z } from 'zod'
import { DefaultTool } from '../../tools/components/DefaultTool.tsx'
import { CustomExportTool } from '../../tools/components/data/CustomExportTool.tsx'
import { ExportDataTool } from '../../tools/components/data/ExportDataTool.tsx'
import { NavToPageTool } from '../../tools/components/nav/NavToPageTool.tsx'
import { ApplyFilterTool } from '../../tools/components/variable/ApplyFilterTool.tsx'
import { ClearInterpolateTool } from '../../tools/components/variable/ClearInterpolateTool.tsx'
import { ClearMissingValueTool } from '../../tools/components/variable/ClearMissingValueTool.tsx'
import { ClearSubVarTool } from '../../tools/components/variable/ClearSubVarTool.tsx'
import { CreateNewVarTool } from '../../tools/components/variable/CreateNewVarTool.tsx'
import { CreateSubVarTool } from '../../tools/components/variable/CreateSubVarTool.tsx'
import { DefineInterpolateTool } from '../../tools/components/variable/DefineInterpolateTool.tsx'
import { DefineMissingValueTool } from '../../tools/components/variable/DefineMissingValueTool.tsx'
import { Funcs } from '../../tools/enum.ts'
import type { custom_export_type } from '../../tools/funcs/data/custom_export.ts'
import type { export_data_type } from '../../tools/funcs/data/export_data.ts'
import type { nav_to_plots_view_type } from '../../tools/funcs/nav/nav_to_plots_view.ts'
import type { nav_to_statistics_view_type } from '../../tools/funcs/nav/nav_to_statistics_view.ts'
import type { nav_to_tools_view_type } from '../../tools/funcs/nav/nav_to_tools_view.ts'
import type { nav_to_variable_view_type } from '../../tools/funcs/nav/nav_to_variable_view.ts'
import type { apply_filter_type } from '../../tools/funcs/variable/apply_filter.ts'
import type { create_new_var_type } from '../../tools/funcs/variable/create_new_var.ts'
import type {
	clear_sub_var_type,
	create_sub_var_type,
} from '../../tools/funcs/variable/create_sub_var.ts'
import type {
	clear_interpolate_type,
	define_interpolate_type,
} from '../../tools/funcs/variable/interpolate.ts'
import type {
	clear_missing_value_type,
	define_missing_value_type,
} from '../../tools/funcs/variable/missing_value.ts'
import { funcsLabel } from '../../tools/tools.ts'

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
		case Funcs.CUSTOM_EXPORT: {
			const { file_name, file_type, function_code } = JSON.parse(
				args,
			) as z.infer<typeof custom_export_type>
			element = (
				<CustomExportTool
					done={initDone || done}
					setDone={initDone ? undefined : setDone}
					id={id}
					file_name={file_name}
					file_type={file_type}
					function_code={function_code}
				/>
			)
			break
		}
		case Funcs.APPLY_FILTER: {
			const { filter_expression } = JSON.parse(args) as z.infer<
				typeof apply_filter_type
			>
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
			const { variable_names } = JSON.parse(args) as z.infer<
				typeof clear_sub_var_type
			>
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
				JSON.parse(args) as z.infer<typeof create_sub_var_type>
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
			const { variable_name, calc_expression } = JSON.parse(args) as z.infer<
				typeof create_new_var_type
			>
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
			const { file_name, file_type } = JSON.parse(args) as z.infer<
				typeof export_data_type
			>
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
			const { page } = JSON.parse(args) as z.infer<
				typeof nav_to_variable_view_type
			>
			element = <NavToPageTool mainPageName='变量视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_PLOTS_VIEW: {
			const { page } = JSON.parse(args) as z.infer<
				typeof nav_to_plots_view_type
			>
			element = <NavToPageTool mainPageName='绘图视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_STATISTICS_VIEW: {
			const { page } = JSON.parse(args) as z.infer<
				typeof nav_to_statistics_view_type
			>
			element = <NavToPageTool mainPageName='统计视图' subPageName={page} />
			break
		}
		case Funcs.NAV_TO_TOOLS_VIEW: {
			const { page } = JSON.parse(args) as z.infer<
				typeof nav_to_tools_view_type
			>
			element = <NavToPageTool mainPageName='工具视图' subPageName={page} />
			break
		}
		case Funcs.DEFINE_MISSING_VALUE: {
			const { variable_names, missing_values } = JSON.parse(args) as z.infer<
				typeof define_missing_value_type
			>
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
			const { variable_names } = JSON.parse(args) as z.infer<
				typeof clear_missing_value_type
			>
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
			) as z.infer<typeof define_interpolate_type>
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
			const { variable_names } = JSON.parse(args) as z.infer<
				typeof clear_interpolate_type
			>
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
