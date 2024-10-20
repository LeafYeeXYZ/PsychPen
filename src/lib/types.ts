import type { MessageInstance } from 'antd/es/message/interface'
import type { WorkBook } from 'xlsx'

export type AllowedInterpolationMethods = '均值插值' | '中位数插值' | '最临近点插值法' | '拉格朗日插值法'

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
  /** 众数 */
  mode?: string // 计算方法不同, 用字符串显示
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
   * 缺失值设置只改变 dataRows 和 dataCols 的值, 不改变 data 的值
   */
  missingValues?: unknown[]
  /**
   * 自定义的插值方法  
   * 默认为空, 即不插值, 直接删除缺失值  
   * 先进行缺失值处理, 再进行插值处理  
   * 插值处理只改变 dataRows 和 dataCols 的值, 不改变 data 的值
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
    standard?: boolean
    center?: boolean
  }
}

export type GlobalState = {
  /**
   * 原始数据
   */
  data: WorkBook | null
  /**
   * 设置原始数据
   * @param data 原始数据 (WorkBook 类型)
   * @important 仅在 DataView.tsx 中使用
   */
  _DataView_setData: (data: WorkBook | null) => void
  /**
   * 更新数据
   * @param cols 变量列表
   * @important 仅在 VariableView.tsx 中使用
   */
  _VariableView_updateData: (cols: Variable[]) => void
  /**
   * 数据列表
   */
  dataRows: { [key: string]: unknown }[]
  /**
   * 变量列表
   */
  dataCols: Variable[]
  /**
   * 是否数据量较大 (超过 LARGE_DATA_SIZE)
   */
  isLargeData: boolean
  /**
   * 设置数据量是否较大
   * @param isLarge 是否数据量较大
   */
  _DataView_setIsLargeData: (isLarge: boolean) => void
  /**
   * 消息提示 API
   */
  messageApi: MessageInstance | null
  /**
   * 设置消息提示 API
   * @param api 消息提示 API
   */
  _App_setMessageApi: (api: MessageInstance) => void
  /**
   * 是否禁用各种按钮等
   */
  disabled: boolean
  /**
   * 设置是否禁用各种按钮等
   * @param disabled 是否禁用
   */
  setDisabled: (disabled: boolean) => void
}
