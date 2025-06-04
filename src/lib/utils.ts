import html2canvas from 'html2canvas-pro'
import katexCss from 'katex/dist/katex.min.css?raw'
import { marked } from 'marked'
import themeCss from '../styles/statResult.css?raw'
import type { DataRow, Variable } from '../types'

/**
 * 尝试执行一个函数, 如果失败则抛出指定的错误
 * @param func 函数
 * @param errorMessage 错误信息
 * @returns 函数返回值
 */
export async function tryCatch<T>(
	func: (() => Promise<T>) | (() => T),
	errorMessage: string,
): Promise<T> {
	try {
		return await func()
	} catch {
		throw new Error(errorMessage)
	}
}

const MAX_VALUE = Number.MAX_SAFE_INTEGER / 10000
const MIN_VALUE = Number.MIN_SAFE_INTEGER / 10000
/**
 * 把数据转换为 DataRow
 * @param data 数据
 * @returns DataRow
 */
export function transformData(data: Record<string, unknown>): DataRow {
	return Object.fromEntries(
		Object.entries(data).map(([key, value]) => {
			if (value === null) {
				return [key, undefined]
			}
			const num = Number(value)
			if (Number.isNaN(num) || num > MAX_VALUE || num < MIN_VALUE) {
				return [key, String(value)]
			}
			return [key, num]
		}),
	)
}

/**
 * 把统计结果渲染为 HTML
 * @param result 统计结果
 * @returns HTML
 */
export function renderStatResult(result: string): string {
	return `
		<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>预览</title>
      <style>${`\n${themeCss}\n`}</style>
      <style>${`\n${katexCss}\n`}</style>
      <style>
        * { scrollbar-width: none; }
      </style>
    </head>
    <body>
		  <div style="max-width: 100%">
				${marked.parse(result, { async: false })}
			</div>
    </body>
    </html>
	`
}

/**
 * 生成随机 ID
 * @returns 随机 ID
 */
export function shortId(): string {
	return Math.random().toString(36).slice(2, 10)
}

/**
 * 在指定时间后兑现
 * @param ms 时间 (毫秒)
 * @returns Promise
 */
export function sleep(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 计算变量的表达式 (如果引用的变量有缺失值, 则返回 undefined)
 * @param expression 表达式
 * @param variables 变量列表
 * @param data 数据
 * @throws 如果表达式不合法, 则抛出异常
 * @returns 计算结果
 */
export function computeExpression(
	expression: string,
	variables: Variable[],
	data: DataRow,
): number | string | undefined {
	try {
		if (!data) {
			throw new Error('数据不存在')
		}
		const vars = expression.match(/:::.+?:::/g)
		if (vars) {
			for (const v of vars) {
				const name = v.slice(3, -3)
				if (!variables.find((v) => v.name == name)) {
					throw new Error(`变量 ${name} 不存在`)
				}
				const value = data[name]
				if (value === undefined) {
					return undefined
				}
			}
		}
		const embeded = embedValues(expression, variables, data)
		const value = new Function(`return ${embeded}`)()
		if (typeof value !== 'number' && typeof value != 'string' && typeof value != 'undefined') {
			throw new Error('表达式计算结果不是数字、字符串或缺失值')
		}
		return value
	} catch (e) {
		throw new Error(
			`执行表达式失败: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}

/**
 * 将数值或统计量嵌入表达式
 * @param expression 表达式
 * @param variables 变量列表
 * @param data 数据
 * @throws 如果变量不存在/引用了不存在的变量统计量, 则抛出异常
 * @returns 嵌入数值或统计量后的表达式
 */
export function embedValues(
	expression: string,
	variables: Variable[],
	data: DataRow,
): string {
	let exp = expression
	// min(:::name:::)
	exp = exp.replace(/min\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(7, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.min === undefined)
			throw new Error(`变量 ${name} 没有最小值, 请确认变量类型`)
		return variable.min.toString()
	})
	// max(:::name:::)
	exp = exp.replace(/max\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(7, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.max === undefined)
			throw new Error(`变量 ${name} 没有最大值, 请确认变量类型`)
		return variable.max.toString()
	})
	// mean(:::name:::)
	exp = exp.replace(/mean\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(8, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.mean === undefined)
			throw new Error(`变量 ${name} 没有均值, 请确认变量类型`)
		return variable.mean.toString()
	})
	// mode(:::name:::)
	exp = exp.replace(/mode\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(8, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.mode === undefined)
			throw new Error(`变量 ${name} 没有众数, 请确认变量类型`)
		return variable.mode.toString()
	})
	// q1(:::name:::)
	exp = exp.replace(/q1\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(6, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.q1 === undefined)
			throw new Error(`变量 ${name} 没有 25% 分位数, 请确认变量类型`)
		return variable.q1.toString()
	})
	// q2(:::name:::)
	exp = exp.replace(/q2\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(6, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.q2 === undefined)
			throw new Error(`变量 ${name} 没有 50% 分位数, 请确认变量类型`)
		return variable.q2.toString()
	})
	// q3(:::name:::)
	exp = exp.replace(/q3\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(6, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.q3 === undefined)
			throw new Error(`变量 ${name} 没有 75% 分位数, 请确认变量类型`)
		return variable.q3.toString()
	})
	// std(:::name:::)
	exp = exp.replace(/std\((:::.+?:::)\)/g, (v) => {
		const name = v.slice(7, -4)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		if (variable.std === undefined)
			throw new Error(`变量 ${name} 没有标准差, 请确认变量类型`)
		return variable.std.toString()
	})
	// :::name:::
	exp = exp.replace(/:::.+?:::/g, (v) => {
		const name = v.slice(3, -3)
		const variable = variables.find((v) => v.name == name)
		if (!variable) throw new Error(`变量 ${name} 不存在`)
		const value = data[name]
		if (value === undefined) {
			throw new Error(`变量 ${name} 的值不存在`)
		}
		if (typeof value === 'number') {
			return String(value)
		}
		return `"${String(value)}"`
	})
	return exp
}

/**
 * 把数组对象转换为 R 的数据框
 * @param obj 数组对象
 * @returns R 的数据框
 */
export function jsObjectToRDataFrame(obj: Record<string, number[]>): string {
	return `data.frame(\n${Object.entries(obj)
		.map(([key, value]) => `${key} = c(${value.join(', ')})`)
		.join(',\n')}\n)`
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
export function markS(statistic: number, p?: number, hideZero = true): string {
	if (Number.isNaN(statistic)) {
		return '(无)'
	}
	// 格式化统计量
	let formattedStat = statistic.toFixed(3)
	// 处理隐藏前导零的情况
	if (hideZero) {
		if (statistic < 1 && statistic >= 0) {
			formattedStat = formattedStat.slice(1) // 正数去掉0
		}
		if (statistic > -1 && statistic < 0) {
			formattedStat = `-${Math.abs(statistic).toFixed(3).slice(1)}` // 负数特殊处理
		}
	}
	// 添加显著性标记
	if (p !== undefined) {
		if (p < 0.001) {
			return `<i>${formattedStat}***</i>`
		}
		if (p < 0.01) {
			return `<i>${formattedStat}**</i>`
		}
		if (p < 0.05) {
			return `<i>${formattedStat}*</i>`
		}
	}
	return `<i>${formattedStat}</i>`
}

/**
 * 生成含 *, **, *** 的 p 值
 * @param p 显著性水平
 * @param hideZero 是否隐藏 p 值前的 0
 * @returns p 值
 */
export function markP(p: number, hideZero = true): string {
	if (Number.isNaN(p)) {
		return '(无)'
	}
	// 处理极端情况
	if (p <= 0) return hideZero ? '<i><.001***</i>' : '<i><0.001***</i>'
	if (p >= 1) return '<i>1</i>'
	// 处理非常小的p值
	if (p < 0.001) {
		return hideZero ? '<i><.001***</i>' : '<i><0.001***</i>'
	}
	// 格式化p值
	let formattedP = p.toFixed(3)
	if (hideZero && p < 1) {
		formattedP = formattedP.slice(1)
	}
	// 添加显著性标记
	if (p < 0.01) return `<i>${formattedP}**</i>`
	if (p < 0.05) return `<i>${formattedP}*</i>`
	return `<i>${formattedP}</i>`
}

/**
 * 把当前 echarts 图表保存为图片
 */
export async function downloadImage(): Promise<void> {
	const ele = document.getElementById('echarts-container')?.firstChild
	if (!(ele instanceof HTMLElement)) {
		throw new Error('图表元素不存在')
	}
	const canvas = await html2canvas(ele)
	const url = canvas.toDataURL('image/png')
	const a = document.createElement('a')
	a.href = url
	a.download = 'psychpen.png'
	a.click()
}
