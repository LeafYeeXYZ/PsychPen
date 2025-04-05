import type { DataRow, Variable } from '../../types'
import { embedValues } from '../utils'

/**
 * 数据过滤
 * @param dataCols 数据列
 * @param dataRows 数据行
 * @param filter 过滤表达式
 */
export function filter(
	dataCols: Variable[],
	dataRows: DataRow[],
	filter?: string,
): {
	updatedCols: Variable[]
	updatedRows: DataRow[]
} {
	if (!filter) {
		return { updatedCols: dataCols, updatedRows: dataRows }
	}
	const updatedRows = dataRows.filter((row) => {
		try {
			return booleanExpression(filter, dataCols, row)
		} catch (e) {
			throw new Error(
				`过滤器发生错误: ${e instanceof Error ? e.message : String(e)}`,
			)
		}
	})
	return { updatedCols: dataCols, updatedRows }
}

function booleanExpression(
	expression: string,
	variables: Variable[],
	data: DataRow,
): boolean {
	try {
		const vars = expression.match(/:::.+?:::/g)
		if (vars) {
			for (const v of vars) {
				const name = v.slice(3, -3)
				if (!variables.find((v) => v.name == name)) {
					throw new Error(`变量 ${name} 不存在`)
				}
				const value = data[name]
				if (value === undefined) {
					return false
				}
			}
		}
		const value = Boolean(eval(embedValues(expression, variables, data)))
		return value
	} catch (e) {
		throw new Error(
			`执行表达式失败: ${e instanceof Error ? e.message : String(e)}`,
		)
	}
}
