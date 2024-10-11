import { useZustand } from '../lib/useZustand'
import { Button, Table, Modal, Select } from 'antd'
import { CalculatorOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { utils } from 'xlsx'

export function VariableView() {

  const { data, dataCols, setDataCols, dataRows, setDataRows, messageApi, CALCULATE_VARIABLES, isLargeData } = useZustand()
  const [calculating, setCalculating] = useState<boolean>(false)
  const handleCalculate = async () => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = CALCULATE_VARIABLES(dataCols, dataRows)
      setDataCols(cols)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  // 处理缺失值
  const handleMissingParams = useRef<{ variable?: string; missing?: unknown[] }>({})
  const handleMissing = async (variable: string, missing?: unknown[]) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols.map((col) => {
        if (col.name === variable) {
          return { ...col, missingValues: missing }
        } else {
          return col
        }
      })
      const sheet = data!.Sheets[data!.SheetNames[0]]
      const rows = (utils.sheet_to_json(sheet) as { [key: string]: unknown }[]).map((row) => {
        const value = row[variable]
        if (missing && missing.some((m) => value == m)) {
          return { ...row, [variable]: undefined }
        } else {
          return row
        }
      })
      setDataCols(CALCULATE_VARIABLES(cols, rows))
      setDataRows(rows)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  const [modalApi, contextHolder] = Modal.useModal()

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Button
            icon={<CalculatorOutlined />}
            disabled={calculating}
            onClick={async () => {
              flushSync(() => setCalculating(true))
              await handleCalculate()
              flushSync(() => setCalculating(false))
            }}
          >
            重新计算统计量
          </Button>
          <Button
            icon={<ZoomOutOutlined />}
            disabled={calculating}
            onClick={async () => {
              flushSync(() => setCalculating(true))
              await modalApi.confirm({
                title: '定义变量缺失值',
                content: (
                  <div className='flex flex-col gap-4 my-4'>
                    <Select
                      placeholder='请选择变量'
                      defaultValue={handleMissingParams.current.variable}
                      onChange={(value) => handleMissingParams.current.variable = value as string}
                    >
                      {dataCols.map((col) => (
                        <Select.Option key={col.name} value={col.name}>{col.name}</Select.Option>
                      ))}
                    </Select>
                    <Select
                      mode='tags'
                      placeholder='请输入缺失值 (可为多个值/为空)'
                      defaultValue={handleMissingParams.current.missing}
                      onChange={(value) => handleMissingParams.current.missing = value?.length > 0 ? value : undefined}
                    />
                  </div>
                ),
                onOk: async () => {
                  if (handleMissingParams.current.variable) {
                    await handleMissing(handleMissingParams.current.variable, handleMissingParams.current.missing)
                  }
                },
                okText: '确定',
                cancelText: '取消',
              })
              flushSync(() => setCalculating(false))
            }}
          >
            定义变量缺失值
          </Button>
        </div>
        {/* 变量表格 */}
        <Table
          className='w-full overflow-auto text-nowrap'
          bordered
          dataSource={dataCols.map((col, index) => {
            return {
              key: `${col.name}-${index}`,
              ...col, // 如果 col 中有 key 字段, 会覆盖 key: index
              missingValues: col.missingValues?.join(', '),
            }
          })}
          columns={[
            { title: '变量名', dataIndex: 'name', key: 'name', width: '6rem' },
            { title: '数据类型', dataIndex: 'type', key: 'type', width: '6rem' },
            { title: '样本量', dataIndex: 'count', key: 'count', width: '6rem' },
            { title: '缺失值定义', dataIndex: 'missingValues', key: 'missingValues', width: '7rem' },
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
          pagination={{
            hideOnSinglePage: false,
            position: ['bottomLeft'],
            defaultPageSize: 25,
            showSizeChanger: true,
            pageSizeOptions: [25, 50, 100],
          }}
          scroll={{ 
            y: 'max(calc(100dvh - 16rem), calc(480px - 16rem))',
            x: 'max-content',
          }}
        />
      </div>
      {contextHolder}
    </div>
  )
}