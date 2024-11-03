/**
 * @file 工具函数
 */

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
