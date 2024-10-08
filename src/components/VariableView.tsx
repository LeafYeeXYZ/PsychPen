import { useZustand } from '../lib/useZustand'
import { Button, Table } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import * as ss from 'simple-statistics'

export function VariableView() {

  const { dataCols, setDataCols, dataRows, messageApi } = useZustand()
  const [calculating, setCalculating] = useState<boolean>(false)
  const handleCalculate = () => { // 和 DataView.tsx 中的 handleCalculate 函数相同
    try {
      const cols = dataCols.map((col) => {
        // 原始数据
        const data = dataRows.map((row) => row[col.name])
        const numData: number[] = data
          .filter((v) => typeof +v === 'number' && !isNaN(+v))
          .map((v) => +v)
        // 基础统计量
        const count = data.length
        const missing = data.filter((v) => v === undefined).length
        const valid = count - missing
        const unique = new Set(data).size
        // 判断数据类型, 并计算描述统计量
        let type: '称名或等级数据' | '等距或等比数据' = '称名或等级数据'
        if (
          numData.length > 0
          // 不是等差数列
          && !numData.every((v, i, arr) => i === 0 || v - arr[i - 1] === arr[1] - arr[0])
        ) {
          type = '等距或等比数据'
          const min = +Math.min(...numData).toFixed(4)
          const max = +Math.max(...numData).toFixed(4)
          const mean = +ss.mean(numData).toFixed(4)
          const mode = +ss.mode(numData).toFixed(4)
          const q1 = +ss.quantile(numData, 0.25).toFixed(4)
          const q2 = +ss.quantile(numData, 0.5).toFixed(4)
          const q3 = +ss.quantile(numData, 0.75).toFixed(4)
          const std = +ss.standardDeviation(numData).toFixed(4)
          return { ...col, count, missing, valid, unique, min, max, mean, mode, q1, q2, q3, std, type }
        } else {
          return { ...col, count, missing, valid, unique, type }
        }
      })
      setDataCols(cols)
    } catch (error) {
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Button
            icon={<CalculatorOutlined />}
            loading={calculating}
            disabled={calculating}
            onClick={() => {
              flushSync(() => setCalculating(true))
              handleCalculate()
              flushSync(() => setCalculating(false))
            }}
          >
            重新计算描述统计量
          </Button>
        </div>
        {/* 变量表格 */}
        <Table
          className='w-full overflow-auto text-nowrap'
          bordered
          dataSource={dataCols}
          columns={[
            { title: '变量名', dataIndex: 'name', key: 'name', width: '6rem' },
            { title: '数据类型', dataIndex: 'type', key: 'type', width: '6rem' },
            { title: '样本量', dataIndex: 'count', key: 'count', width: '6rem' },
            { title: '缺失值数量', dataIndex: 'missing', key: 'missing', width: '7rem' },
            { title: '有效值数量', dataIndex: 'valid', key: 'valid', width: '7rem' },
            { title: '唯一值数量', dataIndex: 'unique', key: 'unique', width: '7rem' },
            { title: '最小值', dataIndex: 'min', key: 'min', width: '6rem' },
            { title: '最大值', dataIndex: 'max', key: 'max', width: '6rem' },
            { title: '均值', dataIndex: 'mean', key: 'mean', width: '6rem' },
            { title: '众数', dataIndex: 'mode', key: 'mode', width: '6rem' },
            { title: '25%分位数', dataIndex: 'q1', key: 'q1', width: '7rem' },
            { title: '50%分位数', dataIndex: 'q2', key: 'q2', width: '7rem' },
            { title: '75%分位数', dataIndex: 'q3', key: 'q3', width: '7rem' },
            { title: '标准差', dataIndex: 'std', key: 'std', width: '6rem' },
          ]}
          pagination={false}
          scroll={{ 
            y: 'max(calc(100dvh - 12.5rem), calc(480px - 12.5rem))',
            x: 'max-content',
          }}
        />
      </div>
    </div>
  )
}