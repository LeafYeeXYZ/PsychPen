import type { Variable } from '../../types'
import { booleanExpression } from '../utils'

/**
 * 数据过滤
 * @param dataCols 数据列
 * @param dataRows 数据行
 * @param filter 过滤表达式
 * @important 返回值将排除派生变量 (即应在创建派生变量前调用)
 */
export function filter(
	dataCols: Variable[],
	dataRows: { [key: string]: unknown }[],
	filter?: string,
): {
	updatedCols: Variable[]
	updatedRows: Record<string, unknown>[]
} {
	if (!filter) {
		return { updatedCols: dataCols, updatedRows: dataRows }
	}
	const updatedRows = dataRows.filter((row) => {
		try {
			return booleanExpression(filter, dataCols, row)
		} catch (e) {
			console.error('过滤器发生错误:', e)
			return false
		}
	})
	return { updatedCols: dataCols, updatedRows }
}
