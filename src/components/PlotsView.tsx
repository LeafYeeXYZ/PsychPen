import { BasicBoxPlot } from '../plots/BasicBoxPlot'
import { BasicScatterPlot } from '../plots/BasicScatterPlot'
import { ThreeDScatterPlot } from '../plots/ThreeDScatterPlot'
import { BasicLinePlot } from '../plots/BasicLinePlot'
import { WordCloudPlot } from '../plots/WordCloudPlot'
import { ThreeDBarPlot } from '../plots/ThreeDBarPlot'
import { ParallelLinePlot } from '../plots/ParallelLinePlot'
import { BasicPiePlot } from '../plots/BasicPiePlot'
import { BasicBarPlot } from '../plots/BasicBarPlot'
import { DecisionTree } from '../plots/DecisionTree'
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
    value: 'Line',
    label: '折线图',
    children: [
      {
        value: 'BasicLinePlot',
        label: '基础折线图',
      },
      {
        value: 'ParallelLinePlot',
        label: '平行折线图',
      },
    ],
  },
  {
    value: 'Box',
    label: '箱线图',
    children: [
      {
        value: 'BasicBoxPlot',
        label: '基础箱线图',
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
        value: 'ThreeDScatterPlot',
        label: '三维散点图',
      },
    ],
  },
  {
    value: 'Bar',
    label: '柱状图',
    children: [
      {
        value: 'BasicBarPlot',
        label: '基础柱状图',
      },
      {
        value: 'ThreeDBarPlot',
        label: '三维柱状图',
      },
    ],
  },
  {
    value: 'Pie',
    label: '饼图',
    children: [
      {
        value: 'BasicPiePlot',
        label: '基础饼图',
      },
    ],
  },
  {
    value: 'Others',
    label: '其他',
    children: [
      {
        value: 'WordCloudPlot',
        label: '词云图',
      },
      {
        value: 'DecisionTree',
        label: 'CART 决策树',
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
    case 'ThreeDScatterPlot':
      set(<ThreeDScatterPlot />)
      break
    case 'BasicLinePlot':
      set(<BasicLinePlot />)
      break
    case 'WordCloudPlot':
      set(<WordCloudPlot />)
      break
    case 'ThreeDBarPlot':
      set(<ThreeDBarPlot />)
      break
    case 'ParallelLinePlot':
      set(<ParallelLinePlot />)
      break
    case 'BasicPiePlot':
      set(<BasicPiePlot />)
      break
    case 'BasicBarPlot':
      set(<BasicBarPlot />)
      break
    case 'DecisionTree':
      set(<DecisionTree />)
      break
    default:
      set(DEFAULT_PAGE)
  }
}
const CASCADER_DEFAULT_VALUE = ['Scatter', 'BasicScatterPlot']
const DEFAULT_PAGE = <BasicScatterPlot />

export function PlotsView() {

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
        <div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
          {page}
        </div>
      </div>
    </div>
  )
}