import type OpenAI from 'openai'
import type { Funcs } from './tools/enum.ts'

export const ALL_VARS_IDENTIFIER = '__ALL_VARIABLES__'

export type AIFunction = {
	name: Funcs
	label: string
	tool: OpenAI.ChatCompletionTool
}

export enum ALLOWED_INTERPOLATION_METHODS {
	MEAN = '均值插值',
	MEDIAN = '中位数插值',
	NEAREST = '最临近点插值法',
	LAGRANGE = '拉格朗日插值法',
}

export enum ALLOWED_DISCRETE_METHODS {
	EQUAL_WIDTH = '等宽',
	EQUAL_FREQUENCY = '等频',
	CLUSTER = '聚类分析',
}

export type DataRow = Record<string, string | number | undefined>
export type Variable = {
	/** 变量名 */
	name: string
	/** 数据类型 */
	type?: '称名或等级数据' | '等距或等比数据'
	/** 样本量 */
	count?: number
	/** 缺失值数量 (不含已插值缺失值) */
	missing?: number
	/** 有效值数量 (含已插值缺失值) */
	valid?: number
	/** 唯一值数量 */
	unique?: number
	/** 最小值 */
	min?: number
	/** 最大值 */
	max?: number
	/** 均值 */
	mean?: number
	/** 众数 (超过一个时取皮尔逊众数) */
	mode?: number
	/** 25%分位数 */
	q1?: number
	/** 50%分位数 */
	q2?: number
	/** 75%分位数 */
	q3?: number
	/** 标准差 */
	std?: number
	/**
	 * 自定义的缺失值
	 * 默认为空, 即只把本来就是 undefined 的值作为缺失值
	 * 在比较时故意使用 == 而不是 ===, 以规避数字和字符串的比较问题
	 */
	missingValues?: unknown[]
	/**
	 * 自定义的插值方法
	 * 默认为空, 即不插值, 直接删除缺失值
	 * 先进行缺失值处理, 再进行插值处理
	 */
	missingMethod?: ALLOWED_INTERPOLATION_METHODS
	/**
	 * 用于插值的配对变量名
	 * 即另一个变量的 name 字段, 用于计算插值
	 * 仅部分方法需要此字段
	 */
	missingRefer?: string
	/**
	 * 用于标记变量是不是由另一个变量生成的
	 * 即是否是中心化或标准化的结果
	 */
	derived?: true
	/**
	 * 是否要对变量进行中心化或标准化
	 */
	subVars?: {
		/** 标准化 */
		standard?: boolean
		/** 中心化 */
		center?: boolean
		/** 离散化 */
		discrete?: {
			/** 方法 */
			method: ALLOWED_DISCRETE_METHODS
			/** 分组数 */
			groups: number
		}
	}
}
