import type { AIFunction } from '../types'
import { export_data } from './funcs/data/export_data'
import { nav_to_data_view } from './funcs/nav/nav_to_data_view'
import { nav_to_plots_view } from './funcs/nav/nav_to_plots_view'
import { nav_to_statistics_view } from './funcs/nav/nav_to_statistics_view'
import { nav_to_tools_view } from './funcs/nav/nav_to_tools_view'
import { nav_to_variable_view } from './funcs/nav/nav_to_variable_view'
import { apply_filter } from './funcs/variable/apply_filter'
import { create_new_var } from './funcs/variable/create_new_var'
import { clear_sub_var, create_sub_var } from './funcs/variable/create_sub_var'
import {
	clear_interpolate,
	define_interpolate,
} from './funcs/variable/interpolate'
import {
	clear_missing_value,
	define_missing_value,
} from './funcs/variable/missing_value'

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
