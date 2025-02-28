/**
 * @file 全局状态管理
 */

import { create } from 'zustand'
import type { MessageInstance } from 'antd/es/message/interface'
import { Derive } from './calculates/derive'
import { Missing } from './calculates/misssing'
import { Describe } from './calculates/describe'
import { Filter } from './calculates/filter'

/**
 * 检查计算变量的表达式的安全性
 * @param expression 计算变量的表达式
 * @throws 如果表达式不安全, 则抛出异常
 */
function validateExpression(expression: string): void {
  // 先排除变量名
  expression = expression.replace(/:::.+?:::/g, '')
  if (
    // 阻止数据泄露
    expression.includes('http://') ||
    expression.includes('https://') ||
    expression.includes('//') ||
    expression.includes('fetch') ||
    expression.includes('XMLHttpRequest') ||
    // 阻止外部代码执行
    expression.includes('import') ||
    expression.includes('eval') ||
    expression.includes('Function') ||
    expression.includes('setTimeout') ||
    expression.includes('setInterval') ||
    expression.includes('setImmediate') ||
    // 阻止本地存储
    expression.includes('localStorage') ||
    expression.includes('sessionStorage')
  ) {
    throw new Error('表达式不安全, 拒绝执行')
  }
}

/**
 * 处理原始数据
 * @param dataCols 数据变量列表, 必须提供 name 字段, 可选提供其他字段
 * @param dataRows 原始数据, 不要传入已经处理过的数据
 * @returns 处理后的数据变量列表和数据行
 */
const calculator = (
  dataCols: Variable[],
  dataRows: { [key: string]: unknown }[],
): {
  calculatedCols: Variable[]
  calculatedRows: { [key: string]: unknown }[]
} => {
  const TASKS = [
    // Order matters
    Missing,
    Derive,
    Filter,
    Describe,
  ]
  let calculatedCols = dataCols
  let calculatedRows = dataRows
  for (let i = 0; i < TASKS.length; i++) {
    const instance = new TASKS[i](calculatedCols, calculatedRows)
    calculatedCols = instance.updatedCols
    calculatedRows = instance.updatedRows
  }
  return { calculatedCols, calculatedRows }
}

export const useZustand = create<GlobalState>()((set) => ({
  data: null,
  dataRows: [],
  dataCols: [],
  isLargeData: false,
  _DataView_setIsLargeData: (isLargeData) => set({ isLargeData }),
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
  _VariableView_addNewVar: (name, expression) => {
    validateExpression(expression) // 检查表达式的安全性
    set((state) => {
      const cols = state.dataCols
      const rows = state.dataRows
      if (cols.find((col) => col.name == name)) {
        // 故意使用 == 而不是 ===
        throw new Error(`变量名 ${name} 已存在`)
      }
      const vars = expression.match(/:::.+?:::/g) ?? []
      if (vars.length > 0) {
        vars.forEach((v) => {
          if (!cols.find(({ name }) => name == v.slice(3, -3))) {
            // 故意使用 == 而不是 ===
            throw new Error(`变量 ${v} 不存在`)
          }
        })
      }
      const newRows = rows.map((row) => {
        // 如果参考的变量值不存在, 或已被按照缺失值定义删除, 则新变量值也是缺失值
        if (vars.some((v) => row[v.slice(3, -3)] === undefined)) {
          return { [name]: undefined, ...row }
        }
        const expressionWithValues = expression.replace(/:::.+?:::/g, (v) => {
          const value = row[v.slice(3, -3)]
          if (!value) {
            return 'undefined'
          } else if (!isNaN(Number(value))) {
            return `${Number(value)}`
          } else {
            return `'${String(value)}'`
          }
        })
        try {
          const result = eval(expressionWithValues)
          return { [name]: result, ...row }
        } catch (error) {
          throw new Error(
            `执行表达式失败: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      })
      const describe = new Describe([{ name }], newRows)
      return {
        dataCols: [...describe.updatedCols, ...cols],
        dataRows: newRows,
        data: state.data!.map((row, i) => ({
          [name]: newRows[i][name],
          ...row,
        })),
      }
    })
  },
  messageApi: null,
  _App_setMessageApi: (api) => set({ messageApi: api }),
  disabled: false,
  setDisabled: (disabled) => set({ disabled }),
  isDarkMode: matchMedia('(prefers-color-scheme: dark)').matches,
  _App_setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
}))

type GlobalState = {
  /**
   * 原始数据
   */
  data: Record<string, unknown>[] | null
  /**
   * 设置原始数据
   * @param data 原始数据 (WorkBook 类型)
   * @important 仅在 DataView.tsx 中使用
   */
  _DataView_setData: (data: Record<string, unknown>[] | null) => void
  /**
   * 更新数据
   * @param cols 变量列表
   * @important 仅在 VariableView.tsx 中使用
   */
  _VariableView_updateData: (cols: Variable[]) => void
  /**
   * 添加新变量
   * @param name 新变量名
   * @param expression 计算表达式
   * @important 仅在 VariableView.tsx 中使用
   */
  _VariableView_addNewVar: (name: string, expression: string) => void
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
   * @param isLargeData 是否数据量较大
   */
  _DataView_setIsLargeData: (isLargeData: boolean) => void
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
