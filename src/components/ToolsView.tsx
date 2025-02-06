// 注意: 本组件及其子组件不应当使用除 isDarkMode 之外的全局状态
import { NormalDistribution } from '../tools/NormalDistribution'
import { TDistribution } from '../tools/TDistribution'
import { StatisticToPvalue } from '../tools/StatisticToPvalue'
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
    value: 'NormalDistribution',
    label: '正态分布动态演示',
  },
  {
    value: 'TDistribution',
    label: 'T分布动态演示',
  },
  {
    value: 'StatisticToPvalue',
    label: '统计量与P值相互转换',
  },
]
const CASCADER_ONCHANGE = (value: string[], set: (page: React.ReactElement) => void) => {
  switch (value[0]) {
    case 'TDistribution':
      set(<TDistribution />)
      break
    case 'NormalDistribution':
      set(<NormalDistribution />)
      break
    case 'StatisticToPvalue':
      set(<StatisticToPvalue />)
      break
    default:
      set(DEFAULT_PAGE)
  }
}
const CASCADER_DEFAULT_VALUE = ['StatisticToPvalue']
const DEFAULT_PAGE = <StatisticToPvalue />

export function ToolsView() {

  // 加入新工具: 导入并修改常数定义
  const [page, setPage] = useState<React.ReactElement>(DEFAULT_PAGE)
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Cascader
            placeholder='请选择工具'
            defaultValue={CASCADER_DEFAULT_VALUE}
            options={CASCADER_OPTIONS}
            onChange={(value) => CASCADER_ONCHANGE(value, setPage)}
            expandTrigger='hover'
            allowClear={false}
          />
        </div>
        {/* 工具界面 */}
        <div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
          {page}
        </div>
      </div>
    </div>
  )
}