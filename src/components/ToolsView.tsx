// 注意: 本组件及其子组件不应当使用全局状态
import { NormalDistribution } from '../tools/NormalDistribution'
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
]
const CASCADER_ONCHANGE = (value: string[], set: (page: React.ReactElement) => void) => {
  switch (value[0]) {
    case 'NormalDistribution':
      set(<NormalDistribution />)
      break
    default:
      set(DEFAULT_PAGE)
  }
}
const CASCADER_DEFAULT_VALUE = ['NormalDistribution']
const DEFAULT_PAGE = <NormalDistribution />

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
        <div className='w-full h-full overflow-auto border rounded-md'>
          {page}
        </div>
      </div>
    </div>
  )
}