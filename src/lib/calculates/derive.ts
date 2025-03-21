import { max, min } from '@psych/lib'
import { kmeans } from 'ml-kmeans'
import { ALLOWED_DISCRETE_METHODS, type Variable } from '../../types'

/**
 * 生成子变量
 * @param dataCols 数据列
 * @param dataRows 数据行
 */
export function derive(
	dataCols: Variable[],
	dataRows: { [key: string]: unknown }[],
): {
	updatedCols: Variable[]
	updatedRows: Record<string, unknown>[]
} {
	const derivedCols: Variable[] = []
	for (const col of dataCols) {
		if (col.derived) {
			continue
		}
		if (col.subVars?.standard) {
			if (!col.mean || !col.std) {
				throw new Error('仅等距或等比变量可以标准化')
			}
			derivedCols.push({
				name: `${col.name}_标准化`,
				derived: true,
				count: col.count,
				missing: col.missing,
				valid: col.valid,
				unique: col.unique,
				type: col.type,
			})
			for (const row of dataRows) {
				row[`${col.name}_标准化`] = (Number(row[col.name]) - col.mean) / col.std
			}
		}
		if (col.subVars?.center) {
			if (!col.mean) {
				throw new Error('仅等距或等比变量可以中心化')
			}
			derivedCols.push({
				name: `${col.name}_中心化`,
				derived: true,
				count: col.count,
				missing: col.missing,
				valid: col.valid,
				unique: col.unique,
				type: col.type,
			})
			for (const row of dataRows) {
				row[`${col.name}_中心化`] = Number(row[col.name]) - col.mean
			}
		}
		if (col.subVars?.discrete) {
			const groups = col.subVars.discrete.groups
			const method = col.subVars.discrete.method
			const discrete = new Discrete(
				dataRows
					.filter((row) => typeof row[col.name] !== 'undefined')
					.map((row) => Number(row[col.name])),
				groups,
				method,
			)
			const predictedData = dataRows.map((row) =>
				discrete.predictor(
					typeof row[col.name] !== 'undefined'
						? Number(row[col.name])
						: undefined,
				),
			)
			derivedCols.push({
				name: `${col.name}_${method}离散`,
				derived: true,
				count: col.count,
				missing: col.missing,
				valid: col.valid,
				unique: groups,
				type: col.type,
			})
			predictedData.forEach((v, i) => {
				dataRows[i][`${col.name}_${method}离散`] = v
			})
		}
	}
	const updatedCols = [...derivedCols, ...dataCols]
	const updatedRows = dataRows
	return { updatedCols, updatedRows }
}

/** 变量离散化 */
class Discrete {
	/**
	 * 变量离散化
	 * @param data 原始数据
	 * @param groups 分组数
	 * @param methed 离散化方法
	 */
	constructor(
		data: number[],
		groups: number,
		methed: ALLOWED_DISCRETE_METHODS,
	) {
		this.method = methed
		this.groups = groups
		this.#data = data.toSorted((a, b) => a - b)
		this.#min = min(data)
		this.#max = max(data)
		switch (methed) {
			case ALLOWED_DISCRETE_METHODS.EQUAL_WIDTH: {
				this.predictor = (data: number | undefined) => {
					if (typeof data === 'undefined') return undefined
					return Math.floor((data - this.#min) / (this.#range / this.groups))
				}
				break
			}
			case ALLOWED_DISCRETE_METHODS.EQUAL_FREQUENCY: {
				this.predictor = (data: number | undefined) => {
					if (typeof data === 'undefined') return undefined
					return Math.floor(
						this.#data.findIndex((v) => v >= data) /
							(this.#count / this.groups),
					)
				}
				break
			}
			case ALLOWED_DISCRETE_METHODS.CLUSTER: {
				const { clusters } = kmeans(
					data.map((v) => [v]),
					groups,
					{},
				)
				this.#kmeans = new Map(clusters.map((v, i) => [data[i], v]))
				this.predictor = (index: number | undefined) => {
					if (typeof index === 'undefined') return undefined
					return this.#kmeans?.get(index)
				}
				break
			}
		}
	}

	/** 分组器 */
	predictor: (data: number | undefined) => number | undefined
	/** 分组方法 */
	method: ALLOWED_DISCRETE_METHODS
	/** 分组数 */
	groups: number
	/** 排序后数据 */
	#data: number[]
	/** 数据最小值 */
	#min: number
	/** 数据最大值 */
	#max: number
	/** 数据全距 */
	get #range() {
		return this.#max - this.#min
	}
	/** 数据量 */
	get #count() {
		return this.#data.length
	}
	/** 聚类分析的分析结果 (原始数据 => 分组) */
	#kmeans?: Map<number, number>
}
