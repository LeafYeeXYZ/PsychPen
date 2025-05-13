import type { AIFunction } from '../types'
import type { Funcs } from './enum'
import { custom_export } from './funcs/data/custom_export'
import { export_data } from './funcs/data/export_data'
import { get_user_stat_result } from './funcs/data/get_user_stat_result'
import { nav_to_data_view } from './funcs/nav/nav_to_data_view'
import { nav_to_plots_view } from './funcs/nav/nav_to_plots_view'
import { nav_to_statistics_view } from './funcs/nav/nav_to_statistics_view'
import { nav_to_tools_view } from './funcs/nav/nav_to_tools_view'
import { nav_to_variable_view } from './funcs/nav/nav_to_variable_view'
import {
	kolmogorov_smirnov_test_for_independent_vars,
	kolmogorov_smirnov_test_for_paired_vars,
} from './funcs/statistics/kolmogorov_smirnov_test'
import {
	kurtosis_skewness_test_for_independent_vars,
	kurtosis_skewness_test_for_paired_vars,
} from './funcs/statistics/kurtosis_skewness_test'
import {
	levene_test_for_independent_vars,
	levene_test_for_paired_vars,
} from './funcs/statistics/levene_test'
import { one_sample_t_test } from './funcs/statistics/one_sample_t_test'
import { peer_sample_t_test } from './funcs/statistics/peer_sample_t_test'
import { simple_mediator_test } from './funcs/statistics/simple_mediator_test'
import { two_sample_t_test } from './funcs/statistics/two_sample_t_test'
import { welch_t_test } from './funcs/statistics/welch_t_test'
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
