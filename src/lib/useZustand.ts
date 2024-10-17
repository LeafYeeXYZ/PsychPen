import { create } from 'zustand'
import { type WorkBook, utils } from 'xlsx'
import type { MessageInstance } from 'antd/es/message/interface'
import { calculateMode, interpolate } from './utils'
import * as math from 'mathjs'

const ACCEPT_FILE_TYPES = ['.xls', '.xlsx', '.csv', '.txt', '.json', '.numbers', '.dta', '.sav']
const EXPORT_FILE_TYPES = ['.xlsx', '.csv', '.numbers']
export type ALLOWED_MISSING_METHODS = '均值插值' | '中位数插值' | '最临近点插值法' | '拉格朗日插值法'
const CALCULATE_VARIABLES = (
  // 必须提供 name 字段, 可选提供 missingValues 字段
  dataCols: Variable[],
  // 根据需求, 传入 原始数据(sheet_to_json) 或 dataRows(已经替换缺失值的数据)
  dataRows: { [key: string]: unknown }[]
) : {
  // 添加了描述统计量的变量列表
  calculatedCols: Variable[]
  // 添加了插值/替换缺失值的数据
  calculatedRows: { [key: string]: unknown }[]
} => {
  const rows: { [key: string]: unknown }[] = dataRows.map((row) => {
    // 替换缺失值
    dataCols.forEach((col) => {
      if (col.missingValues?.length) {
        // 故意使用 == 而不是 ===
        row[col.name] = col.missingValues?.some((m) => row[col.name] == m) ? undefined : row[col.name]
      }
    })
    return row
  })
  const cols: Variable[] = dataCols.map((col) => {
    // 插值
    if (col.missingMethod) {
      const data = rows.map((row) => typeof row[col.name] !== 'undefined' ? Number(row[col.name]) : undefined) as number[]
      const peer = col.missingRefer ? rows.map((row) => typeof row[col.missingRefer!] !== 'undefined' ? Number(row[col.missingRefer!]) : undefined) as number[] : undefined
      const interpolatedData = interpolate(data, col.missingMethod, peer)
      rows.forEach((row, i) => {
        row[col.name] = interpolatedData[i]
      })
    }
    // 原始数据
    const data = rows.map((row) => row[col.name])
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
      const min = +math.min(numData).toFixed(4)
      const max = +math.max(numData).toFixed(4)
      const mean = +math.mean(numData).toFixed(4)
      const mode = calculateMode(numData)
      const q1 = +math.quantileSeq(numData, 0.25).toFixed(4)
      const q2 = +math.quantileSeq(numData, 0.5).toFixed(4)
      const q3 = +math.quantileSeq(numData, 0.75).toFixed(4)
      const std = +Number(math.std(numData)).toFixed(4)
      return { ...col, count, missing, valid, unique, min, max, mean, mode, q1, q2, q3, std, type }
    } else {
      return { ...col, count, missing, valid, unique, type }
    }
  })
  // 处理标准化子变量
  const derivedCols: Variable[] = []
  cols.map((col) => {
    if (col.subVars?.standard) {
      derivedCols.push({ ...col, name: `${col.name}_标准化`, derived: true })
      // 添加到原始数据中
      rows.forEach((row) => {
        row[`${col.name}_标准化`] = (Number(row[col.name]) - col.mean!) / col.std!
      })
    }
    if (col.subVars?.center) {
      derivedCols.push({ ...col, name: `${col.name}_中心化`, derived: true })
      // 添加到原始数据中
      rows.forEach((row) => {
        row[`${col.name}_中心化`] = Number(row[col.name]) - col.mean!
      })
    }
  })
  cols.unshift(...derivedCols)
  return { calculatedCols: cols, calculatedRows: rows }
}
const LARGE_DATA_SIZE = 1 * 1024 * 1024

export type Variable = {
  /** 变量名 */
  name: string
  /** 数据类型 */
  type?: '称名或等级数据' | '等距或等比数据'
  /** 样本量 */
  count?: number
  /** 缺失值数量 (不含已插值缺失值) */
  missing?: number
  /** 有效值数量 (含已插值缺失值) */
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
  mode?: string // 计算方法不同, 用字符串显示
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
   * 默认为空, 即只把本来就是 undefined 的值作为缺失值  
   * 在比较时故意使用 == 而不是 ===, 以规避数字和字符串的比较问题  
   * 缺失值设置只改变 dataRows 和 dataCols 的值, 不改变 data 的值
   */
  missingValues?: unknown[]
  /**
   * 自定义的插值方法  
   * 默认为空, 即不插值, 直接删除缺失值  
   * 先进行缺失值处理, 再进行插值处理  
   * 插值处理只改变 dataRows 和 dataCols 的值, 不改变 data 的值
   */
  missingMethod?: ALLOWED_MISSING_METHODS
  /** 
   * 用于插值的配对变量名  
   * 即另一个变量的 name 字段, 用于计算插值  
   * 仅部分方法需要此字段  
   */
  missingRefer?: string
  /**
   * 用于标记变量是不是由另一个变量生成的  
   * 即是否是中心化或标准化的结果  
   */
  derived?: true
  /**
   * 是否要对变量进行中心化或标准化  
   */
  subVars?: {
    standard?: boolean
    center?: boolean
  }
}

type State = {
  // 数据
  data: WorkBook | null
  setData: (data: WorkBook | null) => void // 仅在 DataView.tsx 中使用
  dataRows: { [key: string]: unknown }[]
  dataCols: Variable[]
  setDataCols: (cols: Variable[]) => void // 仅在 VariableView.tsx 中使用
  setDataRows: (rows: { [key: string]: unknown }[]) => void // 仅在 VariableView.tsx 中使用
  // 是否数据量过大
  LARGE_DATA_SIZE: number
  isLargeData: boolean
  setIsLargeData: (isLarge: boolean) => void
  // 可打开的文件类型
  ACCEPT_FILE_TYPES: string[]
  // 可导出的文件类型
  EXPORT_FILE_TYPES: string[]
  // 计算变量描述统计量的函数
  CALCULATE_VARIABLES: (dataCols: Variable[], dataRows: { [key: string]: unknown }[]) => { calculatedCols: Variable[], calculatedRows: { [key: string]: unknown }[] }
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
      const { calculatedCols, calculatedRows } = CALCULATE_VARIABLES(cols, rows)
      set({ 
        data,
        dataRows: calculatedRows,
        dataCols: calculatedCols,
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