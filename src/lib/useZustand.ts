/**
 * @file 全局状态管理
 */

import { create } from 'zustand'
import { Variable } from './types'
import type { Row } from '@psych/sheet'
import type { MessageInstance } from 'antd/es/message/interface'
import { Derive } from './derive'
import { Missing } from './misssing'
import { Describe } from './describe'

/**
 * 处理原始数据
 * @param dataCols 数据变量列表, 必须提供 name 字段, 可选提供其他字段
 * @param dataRows 原始数据(sheet_to_json), 不要传入已经处理过的数据
 * @returns 处理后的数据变量列表和数据行
 * @important 过滤派生变量 -> 缺失值处理 -> 描述统计量计算 -> 派生变量生成
 */
const calculator = ( 
  dataCols: Variable[], 
  dataRows: { [key: string]: unknown }[] 
) : { 
  calculatedCols: Variable[], 
  calculatedRows: { [key: string]: unknown }[] 
} => {
  const missinged = new Missing(dataCols.filter((col) => !col.derived), dataRows)
  const described = new Describe(missinged.updatedCols, missinged.updatedRows)
  const derived = new Derive(described.updatedCols, described.updatedRows)
  return { calculatedCols: derived.updatedCols, calculatedRows: derived.updatedRows }
}

export const useZustand = create<GlobalState>()((set) => ({
  data: null,
  dataRows: [],
  dataCols: [],
  isLargeData: false,
  _DataView_setIsLargeData: (isLarge) => set({ isLargeData: isLarge }),
  _DataView_setData: (rows) => {
    if (rows) {
      const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
      const { calculatedCols, calculatedRows } = calculator(cols, rows)
      set({ 
        data: rows,
        dataRows: calculatedRows,
        dataCols: calculatedCols,
      })
    } else {
      set({ data: rows, dataRows: [], dataCols: [] })
    }
  },
  _VariableView_updateData: (cols) => {
    set((state) => {
      const rows = state.data!
      const { calculatedCols, calculatedRows } = calculator(cols, rows)
      return { dataCols: calculatedCols, dataRows: calculatedRows }
    })
  },
  messageApi: null,
  _App_setMessageApi: (api) => set({ messageApi: api }),
  disabled: false,
  setDisabled: (disabled) => set({ disabled }),
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  _App_setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
}))

type GlobalState = {
  /**
   * 原始数据
   */
  data: Row[] | null
  /**
   * 设置原始数据
   * @param data 原始数据 (WorkBook 类型)
   * @important 仅在 DataView.tsx 中使用
   */
  _DataView_setData: (data: Row[] | null) => void
  /**
   * 更新数据
   * @param cols 变量列表
   * @important 仅在 VariableView.tsx 中使用
   */
  _VariableView_updateData: (cols: Variable[]) => void
  /**
   * 数据列表
   */
  dataRows: { [key: string]: unknown }[]
  /**
   * 变量列表
   */
  dataCols: Variable[]
  /**
   * 是否数据量较大 (超过 LARGE_DATA_SIZE)
   */
  isLargeData: boolean
  /**
   * 设置数据量是否较大
   * @param isLarge 是否数据量较大
   */
  _DataView_setIsLargeData: (isLarge: boolean) => void
  /**
   * 消息提示 API
   */
  messageApi: MessageInstance | null
  /**
   * 设置消息提示 API
   * @param api 消息提示 API
   */
  _App_setMessageApi: (api: MessageInstance) => void
  /**
   * 是否是黑暗模式
   */
  isDarkMode: boolean
  /**
   * 设置是否是黑暗模式
   * @param isDarkMode 是否是黑暗模式
   */
  _App_setIsDarkMode: (isDarkMode: boolean) => void
  /**
   * 是否禁用各种按钮等
   */
  disabled: boolean
  /**
   * 设置是否禁用各种按钮等
   * @param disabled 是否禁用
   */
  setDisabled: (disabled: boolean) => void
}