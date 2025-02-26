import html2canvas from 'html2canvas'

/**
 * 把数组对象转换为 R 的数据框
 * @param obj 数组对象
 * @returns R 的数据框
 */
export function jsObjectToRDataFrame(obj: Record<string, number[]>): string {
  return `data.frame(\n${Object.entries(obj).map(([key, value]) => `${key} = c(${value.join(', ')})`).join(',\n')}\n)`
}

/**
 * 把二维数组转换为 R 的矩阵
 * @param arr 二维数组
 * @param transpose 是否转置 (默认不转置)
 * @returns R 的矩阵 
 */
export function jsArrayToRMatrix(arr: number[][], transpose = false): string {
  const matrix = `matrix(c(${arr.flat().join(', ')}), nrow = ${arr.length})`
  return transpose ? `t(${matrix})` : matrix
}

/**
 * 生成含 *, **, *** 的统计量
 * @param statistic 统计量
 * @param p 显著性水平
 * @param hideZero 是否隐藏统计量前的 0
 * @returns 统计量
 */
export function markS(statistic: number, p: number, hideZero = false): string {
  if (hideZero) {
    if (p < 0.001) {
      return `${statistic.toFixed(3).slice(1)}***`
    } else if (p < 0.01) {
      return `${statistic.toFixed(3).slice(1)}**`
    } else if (p < 0.05) {
      return `${statistic.toFixed(3).slice(1)}*`
    } else {
      return statistic.toFixed(3).slice(1)
    }
  } else {
    if (p < 0.001) {
      return `${statistic.toFixed(3)}***`
    } else if (p < 0.01) {
      return `${statistic.toFixed(3)}**`
    } else if (p < 0.05) {
      return `${statistic.toFixed(3)}*`
    } else {
      return statistic.toFixed(3)
    }
  }
}

/**
 * 生成含 *, **, *** 的 p 值
 * @param p 显著性水平
 * @param hideZero 是否隐藏 p 值前的 0
 * @returns p 值
 */
export function markP(p: number, hideZero = false): string {
  if (hideZero) {
    console.log(p)
    if (p < 0.001) {
      return '<.001***'
    } else if (p < 0.01) {
      return `${p.toFixed(3).slice(1)}**`
    } else if (p < 0.05) {
      return `${p.toFixed(3).slice(1)}*`
    } else if (p < 1) {
      return p.toFixed(3).slice(1)
    } else {
      return '1'
    }
  } else {
    if (p < 0.001) {
      return '<0.001***'
    } else if (p < 0.01) {
      return `${p.toFixed(3)}**`
    } else if (p < 0.05) {
      return `${p.toFixed(3)}*`
    } else if (p < 1) {
      return p.toFixed(3)
    } else {
      return '1'
    }
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
