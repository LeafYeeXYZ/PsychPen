import type { Variable } from '../../types'
import { booleanExpression } from '../utils'

/**
 * 数据过滤
 * @param dataCols 数据列
 * @param dataRows 数据行
 * @param filter 过滤表达式
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
			throw new Error(`过滤器发生错误: ${e instanceof Error ? e.message : String(e)}`)
		}
	})
	return { updatedCols: dataCols, updatedRows }
}
