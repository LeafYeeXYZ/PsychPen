import { mean, median } from '@psych/lib'
import {
	ALLOWED_INTERPOLATION_METHODS,
	type DataRow,
	type Variable,
} from '../../types'

/**
 * 缺失值替换和插值
 * @param dataCols 数据列
 * @param dataRows 数据行
 * @important 返回值将排除派生变量 (即应在创建派生变量前调用)
 */
export function missing(
	dataCols: Variable[],
	dataRows: DataRow[],
): {
	updatedCols: Variable[]
	updatedRows: DataRow[]
} {
	// 根据定义的缺失值替换数据
	for (const col of dataCols) {
		if (col.missingValues?.length) {
			for (const row of dataRows) {
				// biome-ignore lint/suspicious/noDoubleEquals: 故意使用 == 而不是 ===, 因为可能存在字符串和数字的比较
				row[col.name] = col.missingValues?.some((m) => row[col.name] == m)
					? undefined
					: row[col.name]
			}
		}
	}
	// 插值处理
	const copy = JSON.parse(JSON.stringify(dataRows)) as DataRow[]
	for (const col of dataCols) {
		if (col.missingMethod) {
			const data = copy.map((row) => row[col.name])
			if (data.some((v) => typeof v === 'string')) {
				throw new Error(`变量 ${col.name} 不是等距或等比数据, 无法进行插值处理`)
			}
			const refer = col.missingRefer
			const peer = refer ? copy.map((row) => row[refer]) : undefined
			if (peer?.some((v) => typeof v === 'string')) {
				throw new Error(
					`插值参考变量 ${refer} 不是等距或等比数据, 无法进行插值处理`,
				)
			}
			const interpolatedData = new Interpolate(
				data as (number | undefined)[],
				col.missingMethod,
				peer as (number | undefined)[],
			).interpolatedData
			copy.forEach((row, i) => {
				row[col.name] = interpolatedData[i]
			})
		}
	}
	return { updatedCols: dataCols, updatedRows: copy }
}

/** 插值处理 */
class Interpolate {
	/**
	 * 插值处理
	 * @param data 数据
	 * @param method 插值方法
	 * @param peer 参考变量
	 * @returns 插值处理后的数据
	 */
	constructor(
		data: (number | undefined)[],
		method: ALLOWED_INTERPOLATION_METHODS,
		peer?: (number | undefined)[],
	) {
		switch (method) {
			case ALLOWED_INTERPOLATION_METHODS.MEAN:
				this.interpolatedData = this.#mean(data)
				break
			case ALLOWED_INTERPOLATION_METHODS.MEDIAN:
				this.interpolatedData = this.#median(data)
				break
			case ALLOWED_INTERPOLATION_METHODS.NEAREST:
				if (!peer) throw new Error('缺失插值参考变量')
				this.interpolatedData = this.#nearest(data, peer)
				break
			case ALLOWED_INTERPOLATION_METHODS.LAGRANGE:
				if (!peer) throw new Error('缺失插值参考变量')
				this.interpolatedData = this.#lagrange(data, peer)
				break
		}
	}

	/** 插值处理后的数据 */
	interpolatedData: (number | undefined)[]

	/** 处理均值插值 */
	#mean(data: (number | undefined)[]): (number | undefined)[] {
		const m = mean(data.filter((v) => v !== undefined))
		return data.map((d) => d ?? m)
	}
	/** 处理中位数插值 */
	#median(data: (number | undefined)[]): (number | undefined)[] {
		const m = median(data.filter((v) => v !== undefined))
		return data.map((d) => d ?? m)
	}
	/** 处理最临近点插值法 */
	#nearest(
		data: (number | undefined)[],
		peer: (number | undefined)[],
	): (number | undefined)[] {
		const valid = peer
			.map((v, i) => ({ v, i }))
			.filter((p) => p.v !== undefined)
			.filter((p) => data[p.i] !== undefined) as {
			v: number
			i: number
		}[]
		return data.map((v, i, a) => {
			if (v !== undefined || peer[i] === undefined) {
				return v
			}
			const current = peer[i]
			const nearest = valid.reduce(
				(acc, cur) =>
					Math.abs(cur.v - current) < Math.abs(acc.v - current) ? cur : acc,
				valid[0],
			)
			return a[nearest.i]
		})
	}
	/** 处理拉格朗日插值法 */
	#lagrange(
		data: (number | undefined)[],
		peer: (number | undefined)[],
	): (number | undefined)[] {
		const xy = peer
			.map((v, i) => [v, data[i]])
			.filter((p) => p[0] !== undefined && p[1] !== undefined)
		return data.map((v, i) => {
			if (v !== undefined || peer[i] === undefined) {
				return v
			}
			return this.#lagrangeInterpolation(xy as [number, number][], peer[i])
		})
	}

	/**
	 * 拉格朗日插值函数
	 * @param xy 供参考的 x, y 值
	 * @param x 待插值的 x 值
	 * @returns 插值结果 (若插值失败则返回 undefined)
	 */
	#lagrangeInterpolation(
		xy: [number, number][],
		x: number,
	): number | undefined {
		// 只使用比 x 小/大的 3 个点插值
		const DOT_COUNT = -3

		// 数组去重
		const unique = Array.from(
			new Map(
				Array.from(new Map(xy).entries()).map((v) => [v[1], v[0]]),
			).entries(),
		)
		const X = unique.map((v) => v[1])
		const Y = unique.map((v) => v[0])

		// 只使用比 x 小/大的 3 个点插值
		const upper = X.toSorted((a, b) => a - b)
			.filter((v) => v < x)
			.slice(DOT_COUNT)
		const lower = X.toSorted((a, b) => b - a)
			.filter((v) => v > x)
			.slice(DOT_COUNT)
		if (upper.length === 0 && lower.length === 0) return undefined
		const useX = [...upper, ...lower]
		const useY = useX.map((v) => Y[X.indexOf(v)])

		// 拉格朗日插值
		let result = 0
		for (let i = 0; i < useX.length; i++) {
			// 初始化每个项的乘积
			let term = useY[i]
			// 计算每一项的乘积
			for (let j = 0; j < useX.length; j++) {
				if (i !== j) {
					term *= (x - useX[j]) / (useX[i] - useX[j])
				}
			}
			// 累加每一项
			result += term
		}
		return result
	}
}
