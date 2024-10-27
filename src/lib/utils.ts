/**
 * @file 工具函数
 */

import * as math from 'mathjs'
import html2canvas from 'html2canvas'

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
