import { OneSampleTTest } from '../statistics/OneSampleTTest'
import { PeerSampleTTest } from '../statistics/PeerSampleTTest'
import { TwoSampleTTest } from '../statistics/TwoSampleTTest'
import { KolmogorovSmirnovTest } from '../statistics/KolmogorovSmirnovTest'
import { PearsonCorrelationTest } from '../statistics/PearsonCorrelationTest'
import { LeveneTest } from '../statistics/LeveneTest'
import { Description } from '../statistics/Description'
import { CorrReliability } from '../statistics/CorrReliability'
import { HalfReliability } from '../statistics/HalfReliability'
import { HomoReliability } from '../statistics/HomoReliability'
import { OneLinearRegression } from '../statistics/OneLinearRegression'
import { TwoLinearRegression } from '../statistics/TwoLinearRegression'
import { KurtosisSkewness } from '../statistics/KurtosisSkewness'
import { SimpleMediatorTest } from '../statistics/SimpleMediatorTest'
import { WelchTTest } from '../statistics/WelchTTest'
import { OneWayANOVA } from '../statistics/OneWayANOVA'
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
    value: 'Description',
    label: '描述统计',
  },
  {
    value: 'TTest',
    label: 'T检验',
    children: [
      {
        value: 'OneSampleTTest',
        label: '单样本T检验',
      },
      {
        value: 'TwoSampleTTest',
        label: '独立样本T检验',
      },
      {
        value: 'PeerSampleTTest',
        label: '配对样本T检验',
      },
      {
        value: 'WelchTTest',
        label: '不等方差T检验 (Welch\'s T Test)',
      }
    ],
  },
  {
    value: 'ANOVA',
    label: '方差分析',
    children: [
      {
        value: 'OneWayANOVA',
        label: '单因素方差分析',
      },
    ],
  },
  {
    value: 'NonParametricTest',
    label: '非参数检验',
    children: [
      {
        value: 'KolmogorovSmirnovTest',
        label: 'Kolmogorov-Smirnov 检验 (正态分布检验)',
      },
      {
        value: 'KurtosisSkewness',
        label: '峰度和偏度检验 (正态分布检验)',
      },
      {
        value: 'LeveneTest',
        label: 'Levene 检验 (方差齐性检验)'
      },
    ],
  },
  {
    value: 'CorrelationOrRegression',
    label: '相关和回归',
    children: [
      {
        value: 'PearsonCorrelationTest',
        label: 'Pearson 相关检验',
      },
      {
        value: 'OneLinearRegression',
        label: '一元线性回归',
      },
      {
        value: 'TwoLinearRegression',
        label: '二元线性回归',
      },
    ],
  },
  {
    value: 'Reliability',
    label: '信度分析',
    children: [
      {
        value: 'CorrReliability',
        label: '重测或复本信度',
      },
      {
        value: 'HalfReliability',
        label: '分半信度',
      },
      {
        value: 'HomoReliability',
        label: '同质性信度',
      },
    ],
  },
  {
    value: 'Mediation',
    label: '中介效应分析',
    children: [
      {
        value: 'SimpleMediatorTest',
        label: '简单中介效应检验',
      },
    ],
  },
]
const CASCADER_ONCHANGE = (value: string[], set: (page: React.ReactElement) => void) => {
  switch (value[1]) {
    case 'OneWayANOVA':
      set(<OneWayANOVA />)
      break
    case 'WelchTTest':
      set(<WelchTTest />)
      break
    case 'OneSampleTTest':
      set(<OneSampleTTest />)
      break
    case 'PeerSampleTTest':
      set(<PeerSampleTTest />)
      break
    case 'TwoSampleTTest':
      set(<TwoSampleTTest />)
      break
    case 'KolmogorovSmirnovTest':
      set(<KolmogorovSmirnovTest />)
      break
    case 'LeveneTest':
      set(<LeveneTest />)
      break
    case 'PearsonCorrelationTest':
      set(<PearsonCorrelationTest />)
      break
    case 'CorrReliability':
      set(<CorrReliability />)
      break
    case 'HalfReliability':
      set(<HalfReliability />)
      break
    case 'HomoReliability':
      set(<HomoReliability />)
      break
    case 'OneLinearRegression':
      set(<OneLinearRegression />)
      break
    case 'TwoLinearRegression':
      set(<TwoLinearRegression />)
      break
    case 'KurtosisSkewness':
      set(<KurtosisSkewness />)
      break
    case 'SimpleMediatorTest':
      set(<SimpleMediatorTest />)
      break
    default:
      set(<Description />)
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
            expandTrigger='hover'
            allowClear={false}
            className='w-max'
          />
        </div>
        {/* 统计界面 */}
        <div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
          {page}
        </div>
      </div>
    </div>
  )
}