import { ss, sp } from './utils'
import { std, mean, corr, sqrt, abs } from 'mathjs'
// @ts-expect-error jstat 未提供类型定义
import * as jstat from 'jstat'

/** 线性回归 */
interface LinearRegression {
  /** F 统计量 */
  F: number
  /** t 统计量 */
  t: number
  /** 显著性 */
  p: number
  /** 测定系数 */
  r2: number
  /** 回归自由度 (F 分布的分子自由度) */
  dfR: number
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

/** 一元线性回归 */
export class LinearRegressionOne implements LinearRegression {

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
export class LinearRegressionTwo implements LinearRegression {

  /** 
   * 构造二元线性回归
   * @param x1 第一个自变量
   * @param x2 第二个自变量
   * @param y 因变量
   * @throws {TypeError} 线性回归的 x 和 y 数据量必须相等
   */
  constructor(x1: number[], x2: number[], y: number[]) {
    if (x1.length !== x2.length || x1.length !== y.length) throw new TypeError('线性回归的 x 和 y 数据量必须相等')
    this.x1Mean = mean(x1)
    this.x2Mean = mean(x2)
    this.yMean = mean(y)
    this.x1Std = Number(std(x1))
    this.x2Std = Number(std(x2))
    this.yStd = Number(std(y))
    this.SSx1 = ss(x1.map((Xi) => [Xi, this.x1Mean]))
    this.SSx2 = ss(x2.map((Xi) => [Xi, this.x2Mean]))
    this.SSy = ss(y.map((Yi) => [Yi, this.yMean]))
    this.SPx1x2 = sp(x1.map((Xi, i) => [Xi, x2[i]]))
    this.SPx1y = sp(x1.map((Xi, i) => [Xi, y[i]]))
    this.SPx2y = sp(x2.map((Xi, i) => [Xi, y[i]]))
    this.b1 = (this.SPx1y * this.SSx2 - this.SPx2y * this.SPx1x2) / (this.SSx1 * this.SSx2 - this.SPx1x2 ** 2)
    this.b2 = (this.SPx2y * this.SSx1 - this.SPx1y * this.SPx1x2) / (this.SSx1 * this.SSx2 - this.SPx1x2 ** 2)
    this.b0 = this.yMean - this.b1 * this.x1Mean - this.b2 * this.x2Mean
    this.dfE = x1.length - 1 - this.dfR
    this.dfT = x1.length - 1
    this.SSt = this.SSy
    this.SSr = ss(y.map((_, i) => [this.calc(x1[i], x2[i]), this.yMean]))
    this.SSe = ss(y.map((Yi, i) => [Yi, this.calc(x1[i], x2[i])]))
    this.r2 = this.SSr / this.SSt
    this.F = (this.SSr / this.dfR) / (this.SSe / this.dfE)
    this.t = Number(sqrt(abs(this.F)))
    this.p = (1 - jstat.centralF.cdf(this.F, this.dfR, this.dfE)) * 2
  }

  /** 计算给定 x1, x2 的 y 预测值 */
  calc(x1: number, x2: number): number {
    return this.b0 + this.b1 * x1 + this.b2 * x2
  }
  /** 截距项 */
  b0: number
  /** x1 的偏回归系数 */
  b1: number
  /** x2 的偏回归系数 */
  b2: number
  /** x1 均值 */
  x1Mean: number
  /** x2 均值 */
  x2Mean: number
  /** y 均值 */
  yMean: number
  /** x1 标准差 */
  x1Std: number
  /** x2 标准差 */
  x2Std: number
  /** y 标准差 */
  yStd: number
  /** SSx1 */
  SSx1: number
  /** SSx2 */
  SSx2: number
  /** SSy */
  SSy: number
  /** SPx1x2 */
  SPx1x2: number
  /** SPx1y */
  SPx1y: number
  /** SPx2y */
  SPx2y: number

  /** 测定系数 R^2 */
  r2: number
  /** F 统计量 */
  F: number
  /** t 统计量 */
  t: number
  /** 显著性 */
  p: number
  /** 回归自由度 (F 分布的分子自由度) */
  dfR: number = 2
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