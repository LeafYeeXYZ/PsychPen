/**
 * @file 生成描述统计量
 */

import type { Variable } from '../types'
import { min, max, mean, quantile, std, mode, sort } from '@psych/lib'

/** 生成描述统计量 */
export class Describe {

  /**
   * 生成描述统计量
   * @param dataCols 数据列
   * @param dataRows 数据行
   */
  constructor(
    dataCols: Variable[], 
    dataRows: { [key: string]: unknown }[]
  ) {
    this.updatedCols = dataCols.map((col) => {
      // 原始数据
      const data = dataRows.map((row) => row[col.name])
      // 基础统计量
      const count = data.length
      const missing = data.filter((v) => v === undefined).length
      const valid = count - missing
      const unique = new Set(data.filter((v) => v !== undefined)).size
      let type: '称名或等级数据' | '等距或等比数据' = '称名或等级数据'
      if ( 
        data.every((v) => typeof v === 'undefined' || !isNaN(Number(v))) &&
        data.some((v) => !isNaN(Number(v)))
      ) {
        type = '等距或等比数据'
        const nums = data.filter((v) => typeof v !== 'undefined').map((v) => Number(v))
        sort(nums, true, 'iterativeQuickSort', true)
        const _mean = mean(nums)
        return { ...col, count, missing, valid, unique, type, 
          min: min(nums, true),
          max: max(nums, true),
          mean: _mean,
          std: std(nums, true, _mean),
          q1: quantile(nums, 0.25, true),
          q2: quantile(nums, 0.5, true),
          q3: quantile(nums, 0.75, true),
          mode: mode(nums),
        }
      } else {
        return { ...col, count, missing, valid, unique, type }
      }
    })
    this.updatedRows = dataRows 
  }

  /** 更新后的数据列 */
  updatedCols: Variable[]
  /** 更新后的数据行 */
  updatedRows: { [key: string]: unknown }[]

}