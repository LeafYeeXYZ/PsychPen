import { del, get, set } from 'idb-keyval'
import { create } from 'zustand'
import { derive } from '../lib/calculates/derive'
import { describe } from '../lib/calculates/describe'
import { filter } from '../lib/calculates/filter'
import { missing } from '../lib/calculates/misssing'
import { computeExpression, validateExpression } from '../lib/utils'
import type { DataRow, Variable } from '../types'

type DataState = {
	/**
	 * 原始数据
	 */
	data: DataRow[] | null
	/**
	 * 设置原始数据
	 * @param data 原始数据
	 */
	setData: (data: DataRow[] | null, isLarge?: boolean) => Promise<void>
	/**
	 * 更新数据
	 * @param cols 变量列表
	 */
	updateData: (cols: Variable[]) => Promise<void>
	/**
	 * 添加新变量
	 * @param name 新变量名
	 * @param expression 计算表达式
	 */
	addNewVar: (name: string, expression: string) => Promise<void>
	/**
	 * 数据列表
	 */
	dataRows: DataRow[]
	/**
	 * 变量列表
	 */
	dataCols: Variable[]
	/**
	 * 是否数据量较大 (超过 LARGE_DATA_SIZE)
	 */
	isLargeData: boolean
	/**
	 * 过滤表达式
	 */
	filterExpression: string
	/**
	 * 设置过滤表达式
	 * @param filterExpression 过滤表达式
	 */
	setFilterExpression: (filterExpression: string) => Promise<void>
}

/**
 * 处理原始数据
 * @param dataCols 数据变量列表, 必须提供 name 字段, 可选提供其他字段 (请确保已经过滤掉了 derived 的变量)
 * @param dataRows 原始数据, 不要传入已经处理过的数据
 * @returns 处理后的数据变量列表和数据行
 */
const calculator = (
	dataCols: Variable[],
	dataRows: DataRow[],
	filterExpression?: string,
): {
	calculatedCols: Variable[]
	calculatedRows: DataRow[]
} => {
	const a = missing(dataCols, dataRows)
	const b = derive(a.updatedCols, a.updatedRows)
	const c = describe(b.updatedCols, b.updatedRows)
	const d = filter(c.updatedCols, c.updatedRows, filterExpression)
	return { calculatedCols: d.updatedCols, calculatedRows: d.updatedRows }
}

enum STORE_KEYS {
	DATA = 'data',
	DATA_COLS = 'data_cols',
	DATA_ROWS = 'data_rows',
	IS_LARGE_DATA = 'is_large_data',
	FILTER_EXPRESSION = 'filter_expression',
}

let localData = (await get<DataRow[]>(STORE_KEYS.DATA)) || null
let localDataCols = (await get<Variable[]>(STORE_KEYS.DATA_COLS)) || []
let localDataRows = (await get<DataRow[]>(STORE_KEYS.DATA_ROWS)) || []
let localIsLargeData = (await get<boolean>(STORE_KEYS.IS_LARGE_DATA)) || false
let localFilterExpression =
	(await get<string>(STORE_KEYS.FILTER_EXPRESSION)) || ''

const TARGET_DATA_VERSION = '3'
if (localStorage.getItem('data_version') !== TARGET_DATA_VERSION) {
	localData = localData
		? (localData.map((row) => {
				return Object.fromEntries(
					Object.entries(row).map(([key, value]) => [
						key,
						value === null
							? undefined
							: !Number.isNaN(Number(value))
								? Number(value)
								: String(value),
					]),
				)
			}) as DataRow[])
		: null
	await set(STORE_KEYS.DATA, localData)
	try {
		localDataRows = localDataRows
			? calculator(
					localDataCols.filter((col) => col.derived !== true),
					localData || [],
					localFilterExpression,
				).calculatedRows
			: []
		await set(STORE_KEYS.DATA_ROWS, localDataRows)
	} catch (e) {
		console.error('自动升级数据版本失败:', e)
		localData = null
		localDataCols = []
		localDataRows = []
		localIsLargeData = false
		localFilterExpression = ''
		await del(STORE_KEYS.DATA)
		await del(STORE_KEYS.DATA_COLS)
		await del(STORE_KEYS.DATA_ROWS)
		await del(STORE_KEYS.IS_LARGE_DATA)
		await del(STORE_KEYS.FILTER_EXPRESSION)
	}
	localStorage.setItem('data_version', TARGET_DATA_VERSION)
}

export const useData = create<DataState>()((setState, getState) => {
	return {
		data: localData,
		dataRows: localDataRows,
		dataCols: localDataCols,
		isLargeData: localIsLargeData,
		filterExpression: localFilterExpression,
		setFilterExpression: async (filterExpression) => {
			validateExpression(filterExpression) // 检查表达式的安全性
			const { data, dataCols } = getState()
			if (!data) {
				throw new Error('数据为空')
			}
			const { calculatedCols, calculatedRows } = calculator(
				dataCols.filter((col) => col.derived !== true),
				data,
				filterExpression,
			)
			await set(STORE_KEYS.FILTER_EXPRESSION, filterExpression)
			await set(STORE_KEYS.DATA_COLS, calculatedCols)
			await set(STORE_KEYS.DATA_ROWS, calculatedRows)
			setState({
				filterExpression,
				dataRows: calculatedRows,
				dataCols: calculatedCols,
			})
		},
		setData: async (rawRows, isLarge) => {
			if (rawRows) {
				const rows = rawRows.map((row) => {
					return Object.fromEntries(
						Object.entries(row).map(([key, value]) => [
							key,
							value === null
								? undefined
								: !Number.isNaN(Number(value))
									? Number(value)
									: String(value),
						]),
					)
				}) as DataRow[]
				const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
				const { calculatedCols, calculatedRows } = calculator(cols, rows)
				await set(STORE_KEYS.DATA, rows)
				await set(STORE_KEYS.DATA_COLS, calculatedCols)
				await set(STORE_KEYS.DATA_ROWS, calculatedRows)
				await set(STORE_KEYS.FILTER_EXPRESSION, '')
				await set(STORE_KEYS.IS_LARGE_DATA, Boolean(isLarge))
				setState({
					data: rows,
					dataRows: calculatedRows,
					dataCols: calculatedCols,
					filterExpression: '',
					isLargeData: Boolean(isLarge),
				})
			} else {
				await del(STORE_KEYS.DATA)
				await del(STORE_KEYS.DATA_COLS)
				await del(STORE_KEYS.DATA_ROWS)
				await del(STORE_KEYS.IS_LARGE_DATA)
				await del(STORE_KEYS.FILTER_EXPRESSION)
				setState({
					data: null,
					dataRows: [],
					dataCols: [],
					filterExpression: '',
					isLargeData: false,
				})
			}
		},
		updateData: async (cols) => {
			const { data, filterExpression } = getState()
			if (!data) {
				throw new Error('数据为空')
			}
			const { calculatedCols, calculatedRows } = calculator(
				cols.filter((col) => col.derived !== true),
				data,
				filterExpression,
			)
			await set(STORE_KEYS.DATA_COLS, calculatedCols)
			await set(STORE_KEYS.DATA_ROWS, calculatedRows)
			setState({
				dataRows: calculatedRows,
				dataCols: calculatedCols,
			})
		},
		addNewVar: async (name, expression) => {
			validateExpression(expression) // 检查表达式的安全性
			const { dataCols, dataRows, data, filterExpression } = getState()
			if (!data) {
				throw new Error('数据为空')
			}
			if (dataCols.find((col) => col.name == name)) {
				// 故意使用 == 而不是 ===
				throw new Error(`变量名 ${name} 已存在`)
			}
			let rows = dataRows
			if (rows.length !== data.length) {
				// 说明数据被过滤了, 需要临时重新计算
				rows = calculator(
					dataCols.filter((col) => col.derived !== true),
					data,
					'',
				).calculatedRows
			}
			const newData = data.map((row, i) => ({
				[name]: computeExpression(expression, dataCols, rows[i]),
				...row,
			}))
			const newCol = describe([{ name }], newData).updatedCols[0]
			const { calculatedCols, calculatedRows } = calculator(
				[newCol, ...dataCols.filter((col) => col.derived !== true)],
				newData,
				filterExpression,
			)
			await set(STORE_KEYS.DATA, newData)
			await set(STORE_KEYS.DATA_COLS, calculatedCols)
			await set(STORE_KEYS.DATA_ROWS, calculatedRows)
			setState({
				data: newData,
				dataCols: calculatedCols,
				dataRows: calculatedRows,
			})
		},
	}
})
