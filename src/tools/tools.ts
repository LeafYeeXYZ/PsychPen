import type { AIFunction } from '../types.ts'
import type { Funcs } from './enum.ts'
import { custom_export } from './funcs/data/custom_export.ts'
import { export_data } from './funcs/data/export_data.ts'
import { get_user_stat_result } from './funcs/data/get_user_stat_result.ts'
import { nav_to_data_view } from './funcs/nav/nav_to_data_view.ts'
import { nav_to_plots_view } from './funcs/nav/nav_to_plots_view.ts'
import { nav_to_statistics_view } from './funcs/nav/nav_to_statistics_view.ts'
import { nav_to_tools_view } from './funcs/nav/nav_to_tools_view.ts'
import { nav_to_variable_view } from './funcs/nav/nav_to_variable_view.ts'
import {
	kolmogorov_smirnov_test_for_independent_vars,
	kolmogorov_smirnov_test_for_paired_vars,
} from './funcs/statistics/kolmogorov_smirnov_test.ts'
import {
	kurtosis_skewness_test_for_independent_vars,
	kurtosis_skewness_test_for_paired_vars,
} from './funcs/statistics/kurtosis_skewness_test.ts'
import {
	levene_test_for_independent_vars,
	levene_test_for_paired_vars,
} from './funcs/statistics/levene_test.ts'
import { one_sample_t_test } from './funcs/statistics/one_sample_t_test.ts'
import { peer_sample_t_test } from './funcs/statistics/peer_sample_t_test.ts'
import { simple_mediator_test } from './funcs/statistics/simple_mediator_test.ts'
import { two_sample_t_test } from './funcs/statistics/two_sample_t_test.ts'
import { welch_t_test } from './funcs/statistics/welch_t_test.ts'
import { apply_filter } from './funcs/variable/apply_filter.ts'
import { create_new_var } from './funcs/variable/create_new_var.ts'
import {
	clear_sub_var,
	create_sub_var,
} from './funcs/variable/create_sub_var.ts'
import {
	clear_interpolate,
	define_interpolate,
} from './funcs/variable/interpolate.ts'
import {
	clear_missing_value,
	define_missing_value,
} from './funcs/variable/missing_value.ts'

const funcs: AIFunction[] = [
	export_data,
	custom_export,
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
	simple_mediator_test,
	one_sample_t_test,
	peer_sample_t_test,
	two_sample_t_test,
	welch_t_test,
	levene_test_for_independent_vars,
	levene_test_for_paired_vars,
	kurtosis_skewness_test_for_independent_vars,
	kurtosis_skewness_test_for_paired_vars,
	kolmogorov_smirnov_test_for_independent_vars,
	kolmogorov_smirnov_test_for_paired_vars,
	get_user_stat_result,
]
export const funcsTools = funcs.map((func) => func.tool)
export const funcsLabel: Map<Funcs, AIFunction['label']> = new Map(
	funcs.map((func) => [func.name, func.label]),
)
