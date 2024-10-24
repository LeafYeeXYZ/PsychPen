import * as math from 'mathjs'
import html2canvas from 'html2canvas'
import type { AllowedInterpolationMethods } from './types'

/**
 * 生成符合论文写作规范的统计量和 p 值
 * @param statistic 统计量 (如 t 值)
 * @param p 显著性水平
 * @returns 符合论文写作规范的统计量和 p 值
 */
export function generatePResult(statistic: unknown, p: unknown): { statistic: string, p: string } {
  const sv = Number(statistic)
  const pv = Number(p)
  if (pv < 0.001) {
    return { statistic: sv.toFixed(3) + '***', p: '<0.001' }
  } else if (pv < 0.01) {
    return { statistic: sv.toFixed(3) + '**', p: pv.toFixed(3) }
  } else if (pv < 0.05) {
    return { statistic: sv.toFixed(3) + '*', p: pv.toFixed(3) }
  } else {
    return { statistic: sv.toFixed(3), p: pv.toFixed(3) }
  }
}

/**
 * 计算众数
 * @param data 数据
 * @returns 众数 (若众数个数超过1个, 则返回皮尔逊经验公式结果)
 */
export function calculateMode(data: number[]): string {
  const result = math.mode(data)
  if (result.length <= 1) {
    return result[0].toFixed(4)
  } else {
    const mid = math.median(data)
    const mean = math.mean(data)
    return `${(3 * mid - 2 * mean).toFixed(4)} (皮尔逊经验公式)`
  }
}

/**
 * 插值处理
 * @param data 数据
 * @param method 插值方法
 * @param peer 参考变量
 * @returns 插值处理后的数据
 */
export function interpolate(data: (number | undefined)[], method: AllowedInterpolationMethods, peer?: (number | undefined)[]): (number | undefined)[] {

  if (method === '均值插值') {

    const mean = +math.mean(data.filter(v => typeof v !== 'undefined')).toFixed(4)
    return data.map(d => d ?? mean)

  } else if (method === '中位数插值') {

    const median = +math.median(data.filter(v => typeof v !== 'undefined')).toFixed(4)
    return data.map(d => d ?? median)

  } else if (method === '最临近点插值法' && peer) {

    // 计算配对变量存在的变量列表
    const validPeer: { value: number, index: number }[] = peer
      .map((v, i) => v ? { value: v, index: i } : undefined)
      .filter(v => typeof v !== 'undefined')
      .filter(v => typeof data[v.index] !== 'undefined')
    // 遍历数据
    const interpolatedData = data.map((v, i) => {
      if (typeof v !== 'undefined' || typeof peer[i] === 'undefined') {
        return v
      } else {
        const selfValue = peer[i]
        let distance = Infinity
        const nearest = validPeer.reduce((pre, cur) => {
          const newDistance = Math.abs(cur.value - selfValue)
          if (newDistance < distance) {
            distance = newDistance
            return cur
          } else {
            return pre
          }
        }, validPeer[0])
        return data[nearest.index]
      }
    })
    return interpolatedData

  } else if (method === '拉格朗日插值法' && peer) {

    const y = data.map((v, i) => (typeof v !== 'undefined' && typeof peer[i] !== 'undefined') ? v : undefined).filter(v => typeof v !== 'undefined')
    const x = peer.map((v, i) => (typeof v !== 'undefined' && typeof data[i] !== 'undefined') ? v : undefined).filter(v => typeof v !== 'undefined')
    const interpolatedData = data.map((v, i) => {
      if (typeof v !== 'undefined' || typeof peer[i] === 'undefined') {
        return v
      } else {
        return lagrangeInterpolation(x, y, peer[i])
      }
    })
    return interpolatedData

  } else {

    throw peer ? new Error('未知的插值方法') : new Error('未知的插值方法或缺失参考变量')

  }
}

/**
 * 拉格朗日插值函数
 * @param xValues x 值列表 (可以不去重)
 * @param yValues y 值列表 (可以不去重)
 * @param x x 值
 * @returns 插值结果 (保留 4 位小数, 若插值失败则返回 undefined)
 * @throws xValues 和 yValues 的长度不一致
 */ 
function lagrangeInterpolation(xValues: number[], yValues: number[], x: number): number | undefined {
  const DOT_COUNT = -3
  // 数组去重
  const peers = xValues.map((v, i) => ({ x: v, y: yValues[i] }))
  const uniquePeers = peers
    .filter((v, i) => peers.findIndex(p => p.x === v.x) === i)
    .filter((v, i) => peers.findLastIndex(p => p.x === v.x) === i)
    .filter((v, i) => peers.findIndex(p => p.y === v.y) === i)
    .filter((v, i) => peers.findLastIndex(p => p.y === v.y) === i)
  xValues = uniquePeers.map(v => v.x)
  yValues = uniquePeers.map(v => v.y)
  // 只使用比 x 小/大的 3 个点插值
  const upper = xValues.toSorted((a, b) => a - b).filter(v => v < x).slice(DOT_COUNT)
  const lower = xValues.toSorted((a, b) => b - a).filter(v => v > x).slice(DOT_COUNT)
  if (upper.length === 0 && lower.length === 0) {
    return undefined
  }
  xValues = [...upper, ...lower]
  yValues = xValues.map(v => yValues[xValues.indexOf(v)])
  // 拉格朗日插值
  const n = xValues.length
  let result = 0
  for (let i = 0; i < n; i++) {
    // 初始化每个项的乘积
    let term = yValues[i]
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const denominator = xValues[i] - xValues[j]
        if (denominator === 0) {
          throw new Error(`xValues 中存在重复值: xValues[${i}] = xValues[${j}] = ${xValues[i]}`)
        }
        term *= (x - xValues[j]) / denominator
      }
    }
    // 累加每一项
    result += term
  }
  return +result.toFixed(4)
}

/**
 * 计算独立样本 T 检验的 Cohen's d
 * @param mean1 样本 1 均值
 * @param mean2 样本 2 均值
 * @param sd1 样本 1 标准差
 * @param sd2 样本 2 标准差
 * @param df1 样本 1 自由度
 * @param df2 样本 2 自由度
 * @returns Cohen's d
 */
export function getCohenDOfTTest2(
  mean1: number,
  mean2: number,
  sd1: number,
  sd2: number,
  df1: number,
  df2: number,
): number {
  const top1 = (df1 - 1) * (sd1 ** 2)
  const top2 = (df2 - 1) * (sd2 ** 2)
  const bottom = df1 + df2
  const pooled = Math.sqrt((top1 + top2) / bottom)
  return (mean1 - mean2) / pooled
}

/**
 * 把当前 echarts 图表保存为图片
 */
export function downloadImage(): void {
  html2canvas(document.getElementById('echarts-container')!.firstChild as HTMLElement).then((canvas) => {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'psychpen.png'
    a.click()
  })
}

/**
 * 计算数值差的平方和 SS (Sum of Squares)
 * @param data 数据
 * @returns 数值差的平方和
 */
export function ss(data: [number, number][]): number {
  return data.reduce((pre, cur) => pre + (cur[0] - cur[1]) ** 2, 0)
}
