import { max, mean, min, mode, quantile, sort, std } from '@psych/lib'
import type { Variable } from '../../types'

/**
 * 生成描述统计量
 * @param dataCols 数据列
 * @param dataRows 数据行
 */
export function describe(
	dataCols: Variable[],
	dataRows: { [key: string]: unknown }[],
): {
	updatedCols: Variable[]
	updatedRows: Record<string, unknown>[]
} {
	const updatedCols = dataCols.map((col) => {
		// 原始数据
		const data = dataRows.map((row) => row[col.name])
		// 基础统计量
		const count = data.length
		const missing = data.filter((v) => v === undefined).length
		const valid = count - missing
		const unique = new Set(data.filter((v) => v !== undefined)).size
		let type: '称名或等级数据' | '等距或等比数据' = '称名或等级数据'
		if (
			data.every((v) => typeof v === 'undefined' || !Number.isNaN(Number(v))) &&
			data.some((v) => !Number.isNaN(Number(v)))
		) {
			type = '等距或等比数据'
			const nums = data
				.filter((v) => typeof v !== 'undefined')
				.map((v) => Number(v))
			sort(nums, true, 'iterativeQuickSort', true)
			const _mean = mean(nums)
			return {
				...col,
				count,
				missing,
				valid,
				unique,
				type,
				min: min(nums, true),
				max: max(nums, true),
				mean: _mean,
				std: std(nums, true, _mean),
				q1: quantile(nums, 0.25, true),
				q2: quantile(nums, 0.5, true),
				q3: quantile(nums, 0.75, true),
				mode: mode(nums),
			}
		}
		return { ...col, count, missing, valid, unique, type }
	})
	const updatedRows = dataRows
	return { updatedCols, updatedRows }
}
