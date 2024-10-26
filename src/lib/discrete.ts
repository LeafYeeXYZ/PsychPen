import { kmeans } from 'ml-kmeans'
import type { AllowedDiscreteMethods } from './types'
import { max, min } from 'mathjs'

/** 变量离散化 */
export class Discrete {
  
  /**
   * 变量离散化
   * @param data 原始数据
   * @param groups 分组数
   * @param methed 离散化方法
   */
  constructor(data: number[], groups: number, methed: AllowedDiscreteMethods) {

    this.method = methed
    this.groups = groups
    this.#data = data.toSorted()
    this.#min = min(data)
    this.#max = max(data)
    switch (methed) {
      case '等宽':
        this.predictor = (data: number | undefined) => {
          if (typeof data === 'undefined') return undefined
          return Math.floor((data - this.#min) / (this.#range / this.groups))
        }
        break
      case '等频':
        this.predictor = (data: number | undefined) => {
          if (typeof data === 'undefined') return undefined
          return Math.floor(this.#data.findIndex((v) => v >= data) / (this.#count / this.groups))
        }
        break
      case '聚类分析':
        const { clusters } = kmeans(data.map((v) => [v]), groups, {})
        this.#kmeans = new Map(clusters.map((v, i) => [data[i], v]))
        this.predictor = (index: number | undefined) => {
          if (typeof index === 'undefined') return undefined
          return this.#kmeans?.get(index)
        }
        break
    }

  }

  /** 分组器 */
  predictor: (data: number | undefined) => number | undefined
  /** 分组方法 */
  method: AllowedDiscreteMethods
  /** 分组数 */
  groups: number
  /** 排序后数据 */
  #data: number[]
  /** 数据最小值 */
  #min: number
  /** 数据最大值 */
  #max: number
  /** 数据全距 */
  get #range() { return this.#max - this.#min }
  /** 数据量 */
  get #count() { return this.#data.length }
  /** 聚类分析的分析结果 (原始数据 => 分组) */
  #kmeans?: Map<number, number>

}

