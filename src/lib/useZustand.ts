import { create } from 'zustand'
import { type WorkBook, utils } from 'xlsx'

type State = {
  // 当前页面 (实际页面切换在 App.tsx 中处理)
  activePage: 'data' | 'statistics' | 'paint' | 'variable'
  setActivePage: (page: 'data' | 'statistics' | 'paint' | 'variable') => void
  // 数据
  data: WorkBook | null
  setData: (data: WorkBook | null) => void
  dataRows: { [key: string]: any }[]
  dataCols: { name: string }[]
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
  }
}))