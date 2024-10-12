import * as math from 'mathjs'

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

export function calculateMode(data: number[]): string {
  const result = math.mode(data)
  if (result.length <= 3) {
    return result.join(' / ')
  } else {
    const mid = math.median(data)
    const mean = math.mean(data)
    return `${(3 * mid - 2 * mean).toFixed(4)} (皮尔逊经验公式)`
  }
}