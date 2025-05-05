import { ALL_VARS_IDENTIFIER } from '../types'
import type { Variable } from '../types'

/**
 * 检查变量唯一值数量
 * @param variable 变量名
 * @param variables 变量列表
 * @param unique 唯一值个数 (默认 2)
 * @throws 如果变量不存在或唯一值数量不对, 则抛出异常
 */
export function isUniqueNum(
	variable: string,
	variables: Variable[],
	unique: number,
): void {
	const result = variables.find((v) => v.name == variable)
	if (!result) {
		throw new Error(`变量 ${variable} 不存在`)
	}
	if (result.unique !== unique) {
		throw new Error(`变量 ${variable} 的唯一值不是 ${unique} 个`)
	}
}

/**
 * 检查变量是否存在
 * @param variableNames 变量名列表
 * @param variables 变量列表
 * @param includeAllVars 是否包含所有变量标志符 (默认 false)
 * @throws 如果变量不存在, 则抛出异常
 */
export function isVariable(
	variableNames: string[],
	variables: Variable[],
	includeAllVars = false,
): void {
	for (const name of variableNames) {
		const variable = variables.find((v) => v.name == name)
		if (!variable) {
			if (includeAllVars && name === ALL_VARS_IDENTIFIER) {
				continue
			}
			throw new Error(`变量 ${name} 不存在`)
		}
	}
}

/**
 * 检查变量是否为数值型
 * @param variableNames 变量名列表
 * @param variables 变量列表
 * @param includeAllVars 是否包含所有变量标志符 (默认 false)
 * @throws 如果变量不存在或不是数值型, 则抛出异常
 */
export function isNumeric(
	variableNames: string[],
	variables: Variable[],
	includeAllVars = false,
): void {
	for (const name of variableNames) {
		const variable = variables.find((v) => v.name == name)
		if (!variable) {
			if (includeAllVars && name === ALL_VARS_IDENTIFIER) {
				continue
			}
			throw new Error(`变量 ${name} 不存在`)
		}
		if (variable.type !== '等距或等比数据') {
			throw new Error(`变量 ${name} 不是等距或等比数据`)
		}
	}
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
