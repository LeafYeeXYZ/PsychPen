import type { Variable } from '../../types'
import { create } from 'zustand'
import { validateExpression, computeExpression } from '../utils'
import { Derive } from '../calculates/derive'
import { Missing } from '../calculates/misssing'
import { Describe } from '../calculates/describe'
import { Filter } from '../calculates/filter'
import { get, set, del } from 'idb-keyval'

type DataState = {
  /**
   * 原始数据
   */
  data: Record<string, unknown>[] | null
  /**
   * 设置原始数据
   * @param data 原始数据
   */
  setData: (data: Record<string, unknown>[] | null) => Promise<void>
  /**
   * 更新数据
   * @param cols 变量列表
   */
  updateData: (cols: Variable[]) => Promise<void>
  /**
   * 添加新变量
   * @param name 新变量名
   * @param expression 计算表达式
   */
  addNewVar: (name: string, expression: string) => Promise<void>
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
  setIsLargeData: (isLargeData: boolean) => Promise<void>
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

const enum STORE_KEYS {
  DATA = 'data',
  DATA_COLS = 'data_cols',
  DATA_ROWS = 'data_rows',
  IS_LARGE_DATA = 'is_large_data',
}

const localData =
  (await get<Record<string, unknown>[]>(STORE_KEYS.DATA)) || null
const localDataCols = (await get<Variable[]>(STORE_KEYS.DATA_COLS)) || []
const localDataRows =
  (await get<Record<string, unknown>[]>(STORE_KEYS.DATA_ROWS)) || []
const localIsLargeData = (await get<boolean>(STORE_KEYS.IS_LARGE_DATA)) || false

export const useData = create<DataState>()((setState, getState) => {
  return {
    data: localData,
    dataRows: localDataRows,
    dataCols: localDataCols,
    isLargeData: localIsLargeData,
    setIsLargeData: async (isLargeData) => {
      await set(STORE_KEYS.IS_LARGE_DATA, isLargeData)
      setState({ isLargeData })
    },
    setData: async (rows) => {
      if (rows) {
        const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
        const { calculatedCols, calculatedRows } = calculator(cols, rows)
        await set(STORE_KEYS.DATA, rows)
        await set(STORE_KEYS.DATA_COLS, calculatedCols)
        await set(STORE_KEYS.DATA_ROWS, calculatedRows)
        setState({
          data: rows,
          dataRows: calculatedRows,
          dataCols: calculatedCols,
        })
      } else {
        await del(STORE_KEYS.DATA)
        await del(STORE_KEYS.DATA_COLS)
        await del(STORE_KEYS.DATA_ROWS)
        await del(STORE_KEYS.IS_LARGE_DATA)
        setState({ data: rows, dataRows: [], dataCols: [] })
      }
    },
    updateData: async (cols) => {
      const { data } = getState()
      const { calculatedCols, calculatedRows } = calculator(cols, data!)
      await set(STORE_KEYS.DATA_COLS, calculatedCols)
      await set(STORE_KEYS.DATA_ROWS, calculatedRows)
      setState({
        dataRows: calculatedRows,
        dataCols: calculatedCols,
      })
    },
    addNewVar: async (name, expression) => {
      validateExpression(expression) // 检查表达式的安全性
      const { dataCols, dataRows, data } = getState()
      if (dataCols.find((col) => col.name == name)) {
        // 故意使用 == 而不是 ===
        throw new Error(`变量名 ${name} 已存在`)
      }
      const newRows = dataRows.map((row) => {
        const value = computeExpression(expression, dataCols, row)
        return { [name]: value, ...row }
      })
      const describe = new Describe([{ name }], newRows)
      const newCols = [...describe.updatedCols, ...dataCols]
      const newData = data!.map((row, i) => ({
        [name]: newRows[i][name],
        ...row,
      }))
      await set(STORE_KEYS.DATA, newData)
      await set(STORE_KEYS.DATA_COLS, newCols)
      await set(STORE_KEYS.DATA_ROWS, newRows)
      setState({
        dataCols: newCols,
        dataRows: newRows,
        data: newData,
      })
    },
  }
})
