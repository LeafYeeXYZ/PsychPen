import { useZustand } from '../lib/useZustand'
import { Button, Table } from 'antd'
import { CalculatorOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { flushSync } from 'react-dom'

export function VariableView() {

  const { dataCols, setDataCols, dataRows, messageApi, CALCULATE_VARIABLES } = useZustand()
  const [calculating, setCalculating] = useState<boolean>(false)
  const handleCalculate = () => {
    try {
      messageApi?.loading('正在处理数据...')
      const cols = CALCULATE_VARIABLES(dataCols, dataRows)
      setDataCols(cols)
      messageApi?.destroy()
      messageApi?.open({
        type: 'success',
        content: '数据处理完成',
        duration: 0.5,
      })
    } catch (error) {
      messageApi?.destroy()
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
          <Button
            icon={<ZoomOutOutlined />}
            disabled={calculating || true}
          >
            手动定义变量缺失值
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