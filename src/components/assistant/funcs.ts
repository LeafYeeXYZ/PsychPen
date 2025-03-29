import { apply_filter } from '../../lib/assistant/apply_filter'
import { create_new_var } from '../../lib/assistant/create_new_var'
import {
	clear_sub_var,
	create_sub_var,
} from '../../lib/assistant/create_sub_var'
import { export_data } from '../../lib/assistant/export_data'
import {
	clear_interpolate,
	define_interpolate,
} from '../../lib/assistant/interpolate'
import {
	clear_missing_value,
	define_missing_value,
} from '../../lib/assistant/missing_value'
import { nav_to_data_view } from '../../lib/assistant/nav_to_data_view'
import { nav_to_plots_view } from '../../lib/assistant/nav_to_plots_view'
import { nav_to_statistics_view } from '../../lib/assistant/nav_to_statistics_view'
import { nav_to_tools_view } from '../../lib/assistant/nav_to_tools_view'
import { nav_to_variable_view } from '../../lib/assistant/nav_to_variable_view'
import type { AIFunction } from '../../types'

export const funcs: AIFunction[] = [
	export_data,
	nav_to_data_view,
	nav_to_variable_view,
	nav_to_plots_view,
	nav_to_statistics_view,
	nav_to_tools_view,
	create_new_var,
	create_sub_var,
	clear_sub_var,
	apply_filter,
	define_missing_value,
	clear_missing_value,
	define_interpolate,
	clear_interpolate,
]
