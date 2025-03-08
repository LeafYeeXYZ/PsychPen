import type { AIFunction } from '../../types'
import { export_data } from '../../lib/assistant/export_data'
import { nav_to_data_view } from '../../lib/assistant/nav_to_data_view'
import { nav_to_variable_view } from '../../lib/assistant/nav_to_variable_view'
import { nav_to_plots_view } from '../../lib/assistant/nav_to_plots_view'
import { nav_to_statistics_view } from '../../lib/assistant/nav_to_statistics_view'
import { nav_to_tools_view } from '../../lib/assistant/nav_to_tools_view'
import { create_new_var } from '../../lib/assistant/create_new_var'
import {
  create_sub_var,
  clear_sub_var,
} from '../../lib/assistant/create_sub_var'
import { apply_filter } from '../../lib/assistant/apply_filter'

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
]
