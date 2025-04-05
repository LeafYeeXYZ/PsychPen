import { max, min } from '@psych/lib'
import { kmeans } from 'ml-kmeans'
import {
	ALLOWED_DISCRETE_METHODS,
	type DataRow,
	type Variable,
} from '../../types'

/**
 * 生成子变量
 * @param dataCols 数据列
 * @param dataRows 数据行
 */
export function derive(
	dataCols: Variable[],
	dataRows: DataRow[],
): {
	updatedCols: Variable[]
	updatedRows: DataRow[]
} {
	const derivedCols: Variable[] = []
	for (const col of dataCols) {
		if (col.derived) {
			continue
		}
		if (col.subVars?.standard) {
			if (col.type === '称名或等级数据') {
				throw new Error('称名或等级数据不能进行标准化')
			}
			if (!col.mean || !col.std) {
				throw new Error(`变量 ${col.name} 没有计算均值或标准差, 可能为内部错误`)
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
			if (col.type === '称名或等级数据') {
				throw new Error('称名或等级数据不能进行中心化')
			}
			if (!col.mean) {
				throw new Error(`变量 ${col.name} 没有计算均值, 可能为内部错误`)
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
			if (col.type === '称名或等级数据') {
				throw new Error('称名或等级数据不能进行离散化')
			}
			const data = dataRows.map((row) => row[col.name])
			if (data.some((v) => typeof v === 'string')) {
				throw new Error(`变量 ${col.name} 含有非数值数据, 可能为内部错误`)
			}
			const groups = col.subVars.discrete.groups
			const method = col.subVars.discrete.method
			const discrete = new Discrete(
				data.filter((v) => typeof v === 'number'),
				groups,
				method,
			)
			const predictedData = data.map(
				(v) => v && discrete.predictor(v as number),
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
					if (data === undefined || data === null) return undefined
					return Math.floor((data - this.#min) / (this.#range / this.groups))
				}
				break
			}
			case ALLOWED_DISCRETE_METHODS.EQUAL_FREQUENCY: {
				this.predictor = (data: number | undefined) => {
					if (data === undefined || data === null) return undefined
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
