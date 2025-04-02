import html2canvas from 'html2canvas-pro'
import katexCss from 'katex/dist/katex.min.css?raw'
import { marked } from 'marked'
import themeCss from '../styles/statResult.css?raw'
import type { Variable } from '../types'

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
 * 生成 UUID
 * @returns UUID
 */
export function uuid(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c == 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

/**
 * 生成给定字符串的 MD5 哈希值
 * @param str 字符串
 * @returns MD5 哈希值
 */
export function md5(str: string): string {
	let hash = 0
	if (str.length == 0) return hash.toString()
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash
	}
	return hash.toString()
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
 * 将表达式转为布尔值
 * @param expression 表达式
 * @param variables 变量列表
 * @param data 数据
 * @throws 如果表达式不合法, 则抛出异常
 * @returns 布尔值
 */
export function booleanExpression(
	expression: string,
	variables: Variable[],
	data: Record<string, unknown>,
): boolean {
	try {
		const value = eval(
			`Boolean(${embedValues(expression, variables, data, true)})`,
		)
		return value
	} catch (e) {
		throw new Error(
			`执行表达式失败: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
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
	data: Record<string, unknown>,
): number | string | undefined {
	try {
		const vars = expression.match(/:::.+?:::/g)
		if (vars) {
			for (const v of vars) {
				const name = v.slice(3, -3)
				if (!variables.find((v) => v.name == name)) {
					throw new Error(`变量 ${name} 不存在`)
				}
			}
			if (
				vars.some((v) => {
					const name = v.slice(3, -3)
					const value = data[name]
					return value === undefined || value === null
				})
			) {
				return undefined
			}
		}
		const value = eval(embedValues(expression, variables, data))
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
	data: Record<string, unknown>,
	allowUndefinedAndNull = false,
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
		if ((value === undefined || value === null) && !allowUndefinedAndNull) {
			throw new Error(`变量 ${name} 的值不存在`)
		}
		if (value === undefined) {
			return 'undefined'
		}
		if (value === null) {
			return 'null'
		}
		if (!Number.isNaN(Number(value))) {
			return `${Number(value)}`
		}
		return `"${String(value)}"`
	})
	return exp
}

/**
 * 检查计算变量的表达式的安全性
 * @param expression 计算变量的表达式
 * @throws 如果表达式不安全, 则抛出异常
 */
export function validateExpression(expression: string): void {
	// 先排除变量名
	const exp = expression.replace(/:::.+?:::/g, '')
	if (
		// 阻止数据泄露
		exp.includes('http://') ||
		exp.includes('https://') ||
		exp.includes('//') ||
		exp.includes('fetch') ||
		exp.includes('XMLHttpRequest') ||
		// 阻止外部代码执行
		exp.includes('import') ||
		exp.includes('eval') ||
		exp.includes('Function') ||
		exp.includes('setTimeout') ||
		exp.includes('setInterval') ||
		exp.includes('setImmediate') ||
		// 阻止本地存储
		exp.includes('localStorage') ||
		exp.includes('sessionStorage')
	) {
		throw new Error('表达式不安全, 拒绝执行')
	}
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
export function markS(statistic: number, p: number, hideZero = false): string {
	if (hideZero) {
		if (p < 0.001) {
			return `${statistic.toFixed(3).slice(1)}***`
		}
		if (p < 0.01) {
			return `${statistic.toFixed(3).slice(1)}**`
		}
		if (p < 0.05) {
			return `${statistic.toFixed(3).slice(1)}*`
		}
		return statistic.toFixed(3).slice(1)
	}
	if (p < 0.001) {
		return `${statistic.toFixed(3)}***`
	}
	if (p < 0.01) {
		return `${statistic.toFixed(3)}**`
	}
	if (p < 0.05) {
		return `${statistic.toFixed(3)}*`
	}
	return statistic.toFixed(3)
}

/**
 * 生成含 *, **, *** 的 p 值
 * @param p 显著性水平
 * @param hideZero 是否隐藏 p 值前的 0
 * @returns p 值
 */
export function markP(p: number, hideZero = false): string {
	if (hideZero) {
		if (p < 0.001) {
			return '<.001***'
		}
		if (p < 0.01) {
			return `${p.toFixed(3).slice(1)}**`
		}
		if (p < 0.05) {
			return `${p.toFixed(3).slice(1)}*`
		}
		if (p < 1) {
			return p.toFixed(3).slice(1)
		}
		return '1'
	}
	if (p < 0.001) {
		return '<0.001***'
	}
	if (p < 0.01) {
		return `${p.toFixed(3)}**`
	}
	if (p < 0.05) {
		return `${p.toFixed(3)}*`
	}
	if (p < 1) {
		return p.toFixed(3)
	}
	return '1'
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
