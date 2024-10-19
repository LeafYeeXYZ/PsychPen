import { useZustand } from '../lib/useZustand'
import { Button } from 'antd'
import { useState } from 'react'
import { CalculatorOutlined, ZoomOutOutlined, BoxPlotOutlined, TableOutlined } from '@ant-design/icons'
import { VariableTable } from '../variable/VariableTable'
import { Interpolate } from '../variable/Interpolate'
import { MissingValue } from '../variable/MissingValue'
import { SubVariables } from '../variable/SubVariables'

export function VariableView() {

  const [page, setPage] = useState<React.ReactElement>(<VariableTable />)
  const [activePage, setActivePage] = useState<string>('VariableTable')

  const { disabled } = useZustand()

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Button
            icon={<TableOutlined />}
            disabled={disabled}
            onClick={() => {
              if (activePage === 'VariableTable') return
              setPage(<VariableTable />)
              setActivePage('VariableTable')
            }}
            type={activePage === 'VariableTable' ? 'primary' : 'default'}
            autoInsertSpace={false}
          >
            变量表格
          </Button>
          <Button
            icon={<ZoomOutOutlined />}
            disabled={disabled}
            onClick={() => {
              if (activePage === 'MissingValue') return
              setPage(<MissingValue />)
              setActivePage('MissingValue')
            }}
            type={activePage === 'MissingValue' ? 'primary' : 'default'}
            autoInsertSpace={false}
          >
            定义变量缺失值
          </Button>
          <Button
            icon={<CalculatorOutlined />}
            disabled={disabled}
            onClick={() => {
              if (activePage === 'Interpolate') return
              setPage(<Interpolate />)
              setActivePage('Interpolate')
            }}
            type={activePage === 'Interpolate' ? 'primary' : 'default'}
            autoInsertSpace={false}
          >
            缺失值插值
          </Button>
          <Button
            icon={<BoxPlotOutlined />}
            disabled={disabled}
            onClick={() => {
              if (activePage === 'SubVariables') return
              setPage(<SubVariables />)
              setActivePage('SubVariables')
            }}
            type={activePage === 'SubVariables' ? 'primary' : 'default'}
            autoInsertSpace={false}
          >
            定义中心化/标准化子变量
          </Button>
        </div>
        {/* 页面内容 */}
        {page}
      </div>
    </div>
  )
}