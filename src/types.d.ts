declare type AIFunction = {
  label: string
  tool: import('openai/resources/index.mjs').ChatCompletionTool
}
declare type AllowedFilterMethods =
  | '等于'
  | '不等于'
  | '大于'
  | '大于等于'
  | '小于'
  | '小于等于'
  | '区间'
  | '正则表达式'
  | '高于平均值'
  | '低于平均值'
  | '高于中位数'
  | '低于中位数'
declare type AllowedInterpolationMethods =
  | '均值插值'
  | '中位数插值'
  | '最临近点插值法'
  | '拉格朗日插值法'
declare type AllowedDiscreteMethods = '等频' | '等宽' | '聚类分析'
declare type Variable = {
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
   * 自定义的过滤方法
   * 默认为空, 即不过滤
   */
  filterMethod?: AllowedFilterMethods
  filterValue?: (number | string)[]
  filterRange?: [number, number]
  filterRegex?: string
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
  missingMethod?: AllowedInterpolationMethods
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
      method: AllowedDiscreteMethods
      /** 分组数 */
      groups: number
    }
  }
}
