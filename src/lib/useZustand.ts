import { create } from 'zustand'
import { type WorkBook, utils } from 'xlsx'
import type { MessageInstance } from 'antd/es/message/interface'
import * as ss from 'simple-statistics'

const ACCEPT_FILE_TYPES = ['.xls', '.xlsx', '.csv', '.txt', '.json', '.numbers', '.dta']
const EXPORT_FILE_TYPES = ['.xlsx', '.csv', '.numbers']
const CALCULATE_VARIABLES = (dataCols: Variable[], dataRows: { [key: string]: unknown }[]): Variable[] => {
  const cols = dataCols.map((col) => {
    // 原始数据
    const data = dataRows.map((row) => row[col.name])
    // 基础统计量
    const count = data.length
    const missing = data.filter((v) => v === undefined).length
    const valid = count - missing
    const unique = new Set(data.filter((v) => v !== undefined)).size
    // 判断数据类型, 并计算描述统计量
    let type: '称名或等级数据' | '等距或等比数据' = '称名或等级数据'
    if ( 
      data.every((v) => typeof v === 'undefined' || !isNaN(Number(v))) &&
      data.some((v) => !isNaN(Number(v)))
    ) {
      const numData: number[] = data
        .filter((v) => typeof v !== 'undefined')
        .map((v) => Number(v))
      type = '等距或等比数据'
      const min = +Math.min(...numData).toFixed(4)
      const max = +Math.max(...numData).toFixed(4)
      const mean = +ss.mean(numData).toFixed(4)
      const mode = +ss.mode(numData).toFixed(4)
      const q1 = +ss.quantile(numData, 0.25).toFixed(4)
      const q2 = +ss.quantile(numData, 0.5).toFixed(4)
      const q3 = +ss.quantile(numData, 0.75).toFixed(4)
      const std = +ss.standardDeviation(numData).toFixed(4)
      return { ...col, count, missing, valid, unique, min, max, mean, mode, q1, q2, q3, std, type }
    } else {
      return { ...col, count, missing, valid, unique, type }
    }
  })
  return cols
}
const LARGE_DATA_SIZE = 2 * 1024 * 1024

type Variable = {
  /** 变量名 */
  name: string
  /** 数据类型 */
  type?: '称名或等级数据' | '等距或等比数据'
  /** 样本量 */
  count?: number
  /** 缺失值数量 */
  missing?: number
  /** 有效值数量 */
  valid?: number
  /** 唯一值数量 */
  unique?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 均值 */
  mean?: number
  /** 众数 */
  mode?: number
  /** 25%分位数 */
  q1?: number
  /** 50%分位数 */
  q2?: number
  /** 75%分位数 */
  q3?: number
  /** 标准差 */
  std?: number
  /** 
   * 自定义的缺失值   
   * 默认为空, 即只把 undefined 作为缺失值  
   * 在 VariableView.tsx 中改变后, 将把缺失值为 missingValues 的数据项置为 undefined  
   * 同时, 在比较时故意使用 == 而不是 ===, 以规避数字和字符串的比较问题  
   * 缺失值设置只改变 dataRows 和 dataCols 的值, 不改变 data 的值
   */
  missingValues?: unknown[]
}

type State = {
  // 数据
  data: WorkBook | null
  setData: (data: WorkBook | null) => void // 仅在导入和清空数据时使用
  dataRows: { [key: string]: unknown }[]
  dataCols: Variable[]
  setDataCols: (cols: Variable[]) => void
  setDataRows: (rows: { [key: string]: unknown }[]) => void
  // 是否数据量过大
  LARGE_DATA_SIZE: number
  isLargeData: boolean
  setIsLargeData: (isLarge: boolean) => void
  // 可打开的文件类型
  ACCEPT_FILE_TYPES: string[]
  // 可导出的文件类型
  EXPORT_FILE_TYPES: string[]
  // 计算变量描述统计量的函数
  CALCULATE_VARIABLES: (dataCols: Variable[], dataRows: { [key: string]: unknown }[]) => Variable[]
  // 消息实例
  messageApi: MessageInstance | null
  setMessageApi: (api: MessageInstance) => void
  // 是否禁用导航栏
  disabled: boolean
  setDisabled: (disabled: boolean) => void
}

export const useZustand = create<State>()((set) => ({
  data: null,
  dataRows: [],
  dataCols: [],
  isLargeData: false,
  setIsLargeData: (isLarge) => set({ isLargeData: isLarge }),
  setData: (data) => {
    if (data) {
      const sheet = data.Sheets[data.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet) as { [key: string]: unknown }[]
      const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
      set({ 
        data,
        dataRows: rows,
        dataCols: CALCULATE_VARIABLES(cols, rows),
      })
    } else {
      set({ data, dataRows: [], dataCols: [] })
    }
  },
  setDataCols: (cols) => set({ dataCols: cols }),
  setDataRows: (rows) => set({ dataRows: rows }),
  ACCEPT_FILE_TYPES,
  EXPORT_FILE_TYPES,
  CALCULATE_VARIABLES,
  LARGE_DATA_SIZE,
  messageApi: null,
  setMessageApi: (api) => set({ messageApi: api }),
  disabled: false,
  setDisabled: (disabled) => set({ disabled }),
}))