import { create } from 'zustand'
import { utils } from 'xlsx'
import { GlobalState, Variable } from './types'
import * as math from 'mathjs'
import { interpolate, calculateMode } from './utils'

/**
 * 处理原始数据
 * @param dataCols 数据变量列表, 必须提供 name 字段, 可选提供其他字段
 * @param dataRows 原始数据(sheet_to_json), 不要传入已经处理过的数据
 * @returns 添加了描述统计量的变量列表和插值/替换缺失值的数据
 * @important 仅在 useZustand 本地使用
 */
const Calculator = ( 
  dataCols: Variable[], dataRows: { [key: string]: unknown }[] 
) : { 
  calculatedCols: Variable[], calculatedRows: { [key: string]: unknown }[] 
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
  const cols: Variable[] = dataCols.filter((col) => col.derived !== true).map((col) => {
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
      derivedCols.push({ 
        name: `${col.name}_标准化`, 
        derived: true,
        count: col.count,
        missing: col.missing,
        valid: col.valid,
        unique: col.unique,
        type: col.type,
        min: Number(col.min! - col.mean!) / col.std!,
        max: Number(col.max! - col.mean!) / col.std!,
        mean: 0,
        mode: '',
        q1: Number(col.q1! - col.mean!) / col.std!,
        q2: Number(col.q2! - col.mean!) / col.std!,
        q3: Number(col.q3! - col.mean!) / col.std!,
        std: 1,
      })
      // 添加到原始数据中
      rows.forEach((row) => {
        row[`${col.name}_标准化`] = (Number(row[col.name]) - col.mean!) / col.std!
      })
    }
    if (col.subVars?.center) {
      derivedCols.push({ 
        name: `${col.name}_中心化`, 
        derived: true,
        count: col.count,
        missing: col.missing,
        valid: col.valid,
        unique: col.unique,
        type: col.type,
        min: Number(col.min! - col.mean!),
        max: Number(col.max! - col.mean!),
        mean: 0,
        mode: '',
        q1: Number(col.q1! - col.mean!),
        q2: Number(col.q2! - col.mean!),
        q3: Number(col.q3! - col.mean!),
        std: col.std,
      })
      // 添加到原始数据中
      rows.forEach((row) => {
        row[`${col.name}_中心化`] = Number(row[col.name]) - col.mean!
      })
    }
  })
  cols.unshift(...derivedCols)
  return { calculatedCols: cols, calculatedRows: rows }
}

export const useZustand = create<GlobalState>()((set) => ({
  data: null,
  dataRows: [],
  dataCols: [],
  isLargeData: false,
  _DataView_setIsLargeData: (isLarge) => set({ isLargeData: isLarge }),
  _DataView_setData: (data) => {
    if (data) {
      const sheet = data.Sheets[data.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet) as { [key: string]: unknown }[]
      const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
      const { calculatedCols, calculatedRows } = Calculator(cols, rows)
      set({ 
        data,
        dataRows: calculatedRows,
        dataCols: calculatedCols,
      })
    } else {
      set({ data, dataRows: [], dataCols: [] })
    }
  },
  _VariableView_updateData: (cols) => {
    set((state) => {
      const sheet = state.data!.Sheets[state.data!.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet) as { [key: string]: unknown }[]
      const { calculatedCols, calculatedRows } = Calculator(cols, rows)
      return { dataCols: calculatedCols, dataRows: calculatedRows }
    })
  },
  messageApi: null,
  _App_setMessageApi: (api) => set({ messageApi: api }),
  disabled: false,
  setDisabled: (disabled) => set({ disabled }),
}))