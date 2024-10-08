import { OneSampleTTest } from '../statistics/OneSampleTTest'
import { PeerSampleTTest } from '../statistics/PeerSampleTTest'
import { Cascader } from 'antd'
import { useState } from 'react'

type Option = {
  value: string
  label: string
  children?: Option[]
}
const CASCADER_OPTIONS: Option[] = [
  {
    value: 'TTest',
    label: 'T检验',
    children: [
      {
        value: 'OneSampleTTest',
        label: '单样本T检验',
      },
      {
        value: 'PeerSampleTTest',
        label: '配对样本T检验',
      },
    ],
  },
]
const CASCADER_ONCHANGE = (value: string[], set: (page: React.ReactElement) => void) => {
  switch (value[1]) {
    case 'OneSampleTTest':
      set(<OneSampleTTest />)
      break
    case 'PeerSampleTTest':
      set(<PeerSampleTTest />)
      break
    default:
      set(DEFAULT_PAGE)
  }
}
const CASCADER_DEFAULT_VALUE = ['TTest', 'OneSampleTTest']
const DEFAULT_PAGE = <OneSampleTTest />

export function StatisticsView() {
  
  // 加入新统计: 导入并修改常数定义
  const [page, setPage] = useState<React.ReactElement>(DEFAULT_PAGE)
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Cascader
            placeholder='请选择统计方法'
            defaultValue={CASCADER_DEFAULT_VALUE}
            options={CASCADER_OPTIONS}
            onChange={(value) => CASCADER_ONCHANGE(value, setPage)}
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