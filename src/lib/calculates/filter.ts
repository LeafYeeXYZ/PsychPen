/**
 * @file 处理数据过滤
 */

import { mean, median } from '@psych/lib'
import type { Variable } from '../../types'

/** 缺失值替换和插值 */
export class Filter {
  /**
   * 缺失值替换和插值
   * @param dataCols 数据列
   * @param dataRows 数据行
   * @important 返回值将排除派生变量 (即应在创建派生变量前调用)
   */
  constructor(dataCols: Variable[], dataRows: { [key: string]: unknown }[]) {
    for (const col of dataCols) {
      if (col.filterMethod === '等于' && col.filterValue?.length) {
        dataRows = dataRows.filter((row) =>
          col.filterValue!.some((value) => row[col.name] == value),
        ) // 故意使用 == 而非 ===
        continue
      }
      if (col.filterMethod === '不等于' && col.filterValue?.length) {
        dataRows = dataRows.filter((row) =>
          col.filterValue!.every((value) => row[col.name] != value),
        ) // 故意使用 != 而非 !==
        continue
      }
      if (col.filterMethod === '正则表达式' && col.filterRegex) {
        const regex = new RegExp(col.filterRegex)
        dataRows = dataRows.filter((row) => regex.test(String(row[col.name])))
        continue
      }
      if (col.filterMethod === '大于' && col.filterValue?.length === 1) {
        dataRows = dataRows.filter(
          (row) => Number(row[col.name]) > Number(col.filterValue![0]),
        )
        continue
      }
      if (col.filterMethod === '大于等于' && col.filterValue?.length === 1) {
        dataRows = dataRows.filter(
          (row) => Number(row[col.name]) >= Number(col.filterValue![0]),
        )
        continue
      }
      if (col.filterMethod === '小于' && col.filterValue?.length === 1) {
        dataRows = dataRows.filter(
          (row) => Number(row[col.name]) < Number(col.filterValue![0]),
        )
        continue
      }
      if (col.filterMethod === '小于等于' && col.filterValue?.length === 1) {
        dataRows = dataRows.filter(
          (row) => Number(row[col.name]) <= Number(col.filterValue![0]),
        )
        continue
      }
      if (col.filterMethod === '区间' && col.filterRange?.length === 2) {
        dataRows = dataRows.filter(
          (row) =>
            Number(row[col.name]) >= Number(col.filterRange![0]) &&
            Number(row[col.name]) <= Number(col.filterRange![1]),
        )
        continue
      }
      if (col.filterMethod === '高于平均值') {
        const avg = mean(
          dataRows
            .filter((row) => row[col.name] !== undefined)
            .map((row) => Number(row[col.name])),
        )
        dataRows = dataRows.filter((row) => Number(row[col.name]) > avg)
        continue
      }
      if (col.filterMethod === '低于平均值') {
        const avg = mean(
          dataRows
            .filter((row) => row[col.name] !== undefined)
            .map((row) => Number(row[col.name])),
        )
        dataRows = dataRows.filter((row) => Number(row[col.name]) < avg)
        continue
      }
      if (col.filterMethod === '高于中位数') {
        const med = median(
          dataRows
            .filter((row) => row[col.name] !== undefined)
            .map((row) => Number(row[col.name])),
        )
        dataRows = dataRows.filter((row) => Number(row[col.name]) > med)
        continue
      }
      if (col.filterMethod === '低于中位数') {
        const med = median(
          dataRows
            .filter((row) => row[col.name] !== undefined)
            .map((row) => Number(row[col.name])),
        )
        dataRows = dataRows.filter((row) => Number(row[col.name]) < med)
        continue
      }
    }
    this.updatedCols = dataCols
    this.updatedRows = dataRows
  }

  /** 更新后的数据列 */
  updatedCols: Variable[]
  /** 更新后的数据行 */
  updatedRows: { [key: string]: unknown }[]
}
