import { useZustand } from '../lib/useZustand'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

export function VariableTable() {

  const { dataCols } = useZustand()

  return (
    <div className='w-full h-full grid grid-rows-[1fr,35%] gap-4'>
      <AgGridReact
        className='ag-theme-quartz-auto-dark w-full h-full overflow-auto'
        rowData={dataCols
          .filter((col) => col.derived !== true)
          .map((col) => ({
            name: col.name,
            type: col.type,
            count: col.count,
            valid: col.valid,
            missing: col.missing,
            unique: col.unique,
            missingValues: col.missingValues?.join(', '),
            missingMethod: col.missingMethod ?? '删除法',
            missingRefer: col.missingRefer,
            min: col.min?.toFixed(4),
            max: col.max?.toFixed(4),
            mean: col.mean?.toFixed(4),
            q1: col.q1?.toFixed(4),
            q2: col.q2?.toFixed(4),
            q3: col.q3?.toFixed(4),
            std: col.std?.toFixed(4),
            mode: col.mode?.toFixed(4),
          }))
        }
        columnDefs={[
          { headerName: '变量名', field: 'name', pinned: 'left', width: 150 },
          { headerName: '数据类型', field: 'type', width: 130 },
          { headerName: '样本量', field: 'count', width: 100 },
          { headerName: '有效值数(含插值)', field: 'valid', width: 150 },
          { headerName: '缺失值数(未插值)', field: 'missing', width: 150 },
          { headerName: '唯一值数', field: 'unique', width: 100 },
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
      <AgGridReact
        className='ag-theme-quartz-auto-dark w-full h-full overflow-auto'
        overlayNoRowsTemplate='如果定义了标准化/中心化/离散化子变量, 将显示在这里'
        rowData={dataCols
          .filter((col) => col.derived === true)
          .map((col) => ({
            name: col.name,
            unique: col.unique,
            min: col.min?.toFixed(4),
            max: col.max?.toFixed(4),
            mean: col.mean?.toFixed(4),
            q1: col.q1?.toFixed(4),
            q2: col.q2?.toFixed(4),
            q3: col.q3?.toFixed(4),
            std: col.std?.toFixed(4),
            mode: col.mode?.toFixed(4),
          }))
        }
        columnDefs={[
          { headerName: '子变量', field: 'name', pinned: 'left', width: 200 },
          { headerName: '唯一值数', field: 'unique', width: 100 },
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
    </div>
  )
}