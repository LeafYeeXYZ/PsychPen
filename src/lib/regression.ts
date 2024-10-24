import { ss } from './utils'
import { std, mean, corr, sqrt, abs } from 'mathjs'
// @ts-expect-error jstat 未提供类型定义
import * as jstat from 'jstat'

/** 一元线性回归 */
export class LinearRegressionOne {

  /** 
   * 构造一元线性回归
   * @param x 自变量
   * @param y 因变量
   * @throws {TypeError} 线性回归的 x 和 y 数据量必须相等
   */
  constructor(x: number[], y: number[]) {
    if (x.length !== y.length) throw new TypeError('线性回归的 x 和 y 数据量必须相等')
    this.xMean = mean(x)
    this.yMean = mean(y)
    this.xStd = Number(std(x))
    this.yStd = Number(std(y))
    this.dfE = x.length - 2
    this.dfT = x.length - 1
    this.b1 = Number(corr(x, y)) * this.yStd / this.xStd
    this.b0 = this.yMean - this.b1 * this.xMean
    this.SSt = ss(y.map((Yi) => [Yi, this.yMean]))
    this.SSr = ss(x.map((Xi) => [this.calc(Xi), this.yMean]))
    this.SSe = ss(y.map((Yi, i) => [Yi, this.calc(x[i])]))
    this.r2 = this.SSr / this.SSt
    this.F = (this.SSr / this.dfR) / (this.SSe / this.dfE)
    this.t = Number(sqrt(abs(this.F)))
    this.p = (1 - jstat.centralF.cdf(this.F, this.dfR, this.dfE)) * 2
  }

  /** 计算给定 x 的 y 预测值 */
  calc(x: number): number {
    return this.b0 + this.b1 * x
  }
  /** 截距项 */
  b0: number
  /** 斜率 */
  b1: number
  /** x 均值 */
  xMean: number
  /** y 均值 */
  yMean: number
  /** x 标准差 */
  xStd: number
  /** y 标准差 */
  yStd: number
  /** F 统计量 */
  F: number
  /** t 统计量 */
  t: number
  /** 显著性 */
  p: number
  /** 测定系数 */
  r2: number
  /** 回归自由度 (F 分布的分子自由度) */
  dfR: number = 1
  /** 残差自由度 (F 分布的分母自由度) */
  dfE: number
  /** 总自由度 */
  dfT: number
  /** 总变异平方和 (SST) */
  SSt: number
  /** 回归平方和 (SSR) */
  SSr: number
  /** 残差平方和 (SSE) */
  SSe: number

}

/** 二元线性回归 */
export class LinearRegressionTwo {
  
}