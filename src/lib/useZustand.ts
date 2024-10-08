import { create } from 'zustand'
import { type WorkBook, utils } from 'xlsx'
import type { MessageInstance } from 'antd/es/message/interface'

type Variable = {
  /** 变量名 */
  name: string
  /** 数据类型 */
  type?: '称名或等级数据' | '等距或等比数据'
  /** 样本量 */
  count?: number
  /** 缺失值数量 */
  missing?: number
  /** 有效值数量 */
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
  mode?: number
  /** 25%分位数 */
  q1?: number
  /** 50%分位数 */
  q2?: number
  /** 75%分位数 */
  q3?: number
  /** 标准差 */
  std?: number
}

type State = {
  // 当前页面 (实际页面切换在 App.tsx 中处理)
  activePage: 'data' | 'statistics' | 'paint' | 'variable'
  setActivePage: (page: 'data' | 'statistics' | 'paint' | 'variable') => void
  // 数据
  data: WorkBook | null
  setData: (data: WorkBook | null) => void
  dataRows: { [key: string]: any }[]
  dataCols: Variable[]
  setDataCols: (cols: Variable[]) => void
  // 可打开的文件类型
  ACCEPT_FILE_TYPES: string[]
  // 消息实例
  messageApi: MessageInstance | null
  setMessageApi: (api: MessageInstance) => void
}

export const useZustand = create<State>()((set) => ({
  activePage: 'data',
  setActivePage: (pageName) => set({ activePage: pageName }),
  data: null,
  dataRows: [],
  dataCols: [],
  setData: (data) => {
    if (data) {
      const sheet = data.Sheets[data.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet) as { [key: string]: any }[]
      const cols = Object.keys(rows[0] || {}).map((name) => ({ name }))
      set({ data, dataRows: rows, dataCols: cols })
    } else {
      set({ data, dataRows: [], dataCols: [] })
    }
  },
  setDataCols: (cols) => set({ dataCols: cols }),
  ACCEPT_FILE_TYPES: ['.xls', '.xlsx', '.csv', '.txt', '.json', '.numbers'],
  messageApi: null,
  setMessageApi: (api) => set({ messageApi: api }),
}))