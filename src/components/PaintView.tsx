import { BasicBoxPlot } from '../plots/BasicBoxPlot'
import { BasicScatterPlot } from '../plots/BasicScatterPlot'
import { Cascader } from 'antd'
import { useState } from 'react'

type Option = {
  value: string
  label: string
  disabled?: boolean
  children?: Option[]
}
const CASCADER_OPTIONS: Option[] = [
  {
    value: 'Box',
    label: '箱线图',
    children: [
      {
        value: 'BasicBoxPlot',
        label: '基础箱线图',
      },
      {
        value: 'GroupedBoxPlot',
        label: '分组箱线图',
        disabled: true,
      },
    ],
  },
  {
    value: 'Scatter',
    label: '散点图',
    children: [
      {
        value: 'BasicScatterPlot',
        label: '基础散点图',
      },
      {
        value: 'GroupedScatterPlot',
        label: '分组散点图',
        disabled: true,
      },
    ],
  },
]
const CASCADER_ONCHANGE = (value: string[], set: (page: React.ReactElement) => void) => {
  switch (value[1]) {
    case 'BasicBoxPlot':
      set(<BasicBoxPlot />)
      break
    case 'BasicScatterPlot':
      set(<BasicScatterPlot />)
      break
    default:
      set(DEFAULT_PAGE)
  }
}
const CASCADER_DEFAULT_VALUE = ['Scatter', 'BasicScatterPlot']
const DEFAULT_PAGE = <BasicScatterPlot />

export function PaintView() {

  // 加入新图: 导入并修改常数定义
  const [page, setPage] = useState<React.ReactElement>(DEFAULT_PAGE)
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Cascader
            placeholder='请选择绘图类型'
            defaultValue={CASCADER_DEFAULT_VALUE}
            options={CASCADER_OPTIONS}
            onChange={(value) => CASCADER_ONCHANGE(value, setPage)}
            expandTrigger='hover'
            allowClear={false}
          />
        </div>
        {/* 画图界面 */}
        <div className='w-full h-full overflow-auto border rounded-md'>
          {page}
        </div>
      </div>
    </div>
  )
}