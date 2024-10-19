import { useZustand } from '../lib/useZustand'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

export function VariableTable() {

  const { dataCols } = useZustand()

  return (
    <AgGridReact
      className='ag-theme-quartz w-full h-full overflow-auto'
      rowData={dataCols
        .filter((col) => col.derived !== true)
        .map((col) => {
          let subVars = ''
          if (col.subVars?.standard) subVars += '标准化'
          if (col.subVars?.center) subVars += subVars ? '和中心化' : '中心化'
          return {
            ...col,
            missingValues: col.missingValues?.join(', '),
            missingMethod: col.missingMethod ?? '删除法',
            subVars: subVars || '无',
          }
        })
      }
      columnDefs={[
        { headerName: '变量名', field: 'name', pinned: 'left', width: 150 },
        { headerName: '数据类型', field: 'type', width: 130 },
        { headerName: '样本量', field: 'count', width: 100 },
        { headerName: '有效值数(含插值)', field: 'valid', width: 150 },
        { headerName: '缺失值数(未插值)', field: 'missing', width: 150 },
        { headerName: '唯一值数', field: 'unique', width: 100 },
        { headerName: '子变量', field: 'subVars', width: 130 },
        { headerName: '缺失值定义', field: 'missingValues', width: 130 },
        { headerName: '缺失值插值方法', field: 'missingMethod', width: 130 },
        { headerName: '插值的参考变量', field: 'missingRefer', width: 130 },
        { headerName: '最小值', field: 'min', width: 130 },
        { headerName: '最大值', field: 'max', width: 130 },
        { headerName: '均值', field: 'mean', width: 130 },
        { headerName: '25%分位数', field: 'q1', width: 130 },
        { headerName: '50%分位数', field: 'q2', width: 130 },
        { headerName: '75%分位数', field: 'q3', width: 130 },
        { headerName: '标准差', field: 'std', width: 130 },
        { headerName: '众数', field: 'mode', width: 150 },
      ]}
    />
  )
}