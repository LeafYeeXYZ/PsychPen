import { useZustand, type ALLOWED_MISSING_METHODS } from '../lib/useZustand'
import { Button, Table, Modal, Select } from 'antd'
import { CalculatorOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { utils } from 'xlsx'

export function VariableView() {

  const { data, dataCols, setDataCols, setDataRows, messageApi, CALCULATE_VARIABLES, isLargeData, disabled, setDisabled } = useZustand()
  const [modalApi, contextHolder] = Modal.useModal()
  // 处理缺失值
  const handleMissingValuesParams = useRef<{ variable?: string; missing?: unknown[] }>({})
  const handleMissingValues = async (variable: string, missing?: unknown[]) => {
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
      const { calculatedRows, calculatedCols } = CALCULATE_VARIABLES(cols, utils.sheet_to_json(sheet) as { [key: string]: unknown }[])
      setDataCols(calculatedCols)
      setDataRows(calculatedRows)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  // 处理插值
  const handleMissingMethodParams = useRef<{ targetVar?: string; method?: ALLOWED_MISSING_METHODS, peerVar?: string }>({})
  const handleMissingMethod = async (targetVar: string, method?: ALLOWED_MISSING_METHODS, peerVar?: string) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols.map((col) => {
        if (col.name === targetVar) {
          return { 
            ...col, 
            missingMethod: method, 
            missingRefer: peerVar,
          }
        } else {
          return col
        }
      })
      const sheet = data!.Sheets[data!.SheetNames[0]]
      const { calculatedRows, calculatedCols } = CALCULATE_VARIABLES(cols, utils.sheet_to_json(sheet) as { [key: string]: unknown }[])
      setDataCols(calculatedCols)
      setDataRows(calculatedRows)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
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
            icon={<ZoomOutOutlined />}
            disabled={disabled}
            onClick={async () => {
              flushSync(() => setDisabled(true))
              await modalApi.confirm({
                title: '定义变量缺失值',
                content: (
                  <div className='flex flex-col gap-4 my-4'>
                    <Select
                      placeholder='请选择变量'
                      onChange={(value) => handleMissingValuesParams.current.variable = value as string}
                    >
                      {dataCols.map((col) => (
                        <Select.Option key={col.name} value={col.name}>{col.name}</Select.Option>
                      ))}
                    </Select>
                    <Select
                      mode='tags'
                      placeholder='请输入缺失值 (可为多个值/为空)'
                      onChange={(value) => handleMissingValuesParams.current.missing = value?.length > 0 ? value : undefined}
                    />
                  </div>
                ),
                onOk: async () => {
                  if (handleMissingValuesParams.current.variable) {
                    await handleMissingValues(handleMissingValuesParams.current.variable, handleMissingValuesParams.current.missing)
                  } else {
                    messageApi?.error('请选择要定义缺失值变量')
                  }
                  handleMissingValuesParams.current.variable = undefined
                  handleMissingValuesParams.current.missing = undefined
                },
                okText: '确定',
                cancelText: '取消',
              })
              flushSync(() => setDisabled(false))
            }}
          >
            定义变量缺失值
          </Button>
          <Button
            icon={<CalculatorOutlined />}
            disabled={disabled}
            onClick={async () => {
              flushSync(() => setDisabled(true))
              await modalApi.confirm({
                title: '定义缺失值插值方式',
                content: (
                  <div className='flex flex-col gap-4 my-4'>
                    <Select
                      placeholder='请选择变量'
                      onChange={(value) => handleMissingMethodParams.current.targetVar = value as string}
                    >
                      {dataCols.map((col) => (
                        <Select.Option key={col.name} value={col.name}>{col.name}</Select.Option>
                      ))}
                    </Select>
                    <Select
                      placeholder='请选择插值方法 (留空则为直接删除法)'
                      onChange={(value) => handleMissingMethodParams.current.method = value as ALLOWED_MISSING_METHODS}
                    >
                      {['均值插值', '中位数插值', '最临近点插值法', '拉格朗日插值法'].map((method) => (
                        <Select.Option key={method} value={method}>{method}</Select.Option>
                      ))}
                    </Select>
                    <Select
                      placeholder='请选择插值参考变量 (仅部分方法需要)'
                      onChange={(value) => handleMissingMethodParams.current.peerVar = value as string}
                    >
                      {dataCols.map((col) => (
                        <Select.Option key={col.name} value={col.name}>{col.name}</Select.Option>
                      ))}
                    </Select>
                  </div>
                ),
                onOk: async () => {
                  const { targetVar, method, peerVar } = handleMissingMethodParams.current
                  if (!targetVar) {
                    messageApi?.error('请选择要定义插值方法的变量')
                  } else if (dataCols.find((col) => col.name === targetVar)?.type !== '等距或等比数据') {
                    messageApi?.error('插值方法仅适用于等距或等比数据')
                  } else if ((method === '拉格朗日插值法' || method === '最临近点插值法') && !peerVar) {
                    messageApi?.error('请选择插值参考变量')
                  } else if ((method === '拉格朗日插值法' || method === '最临近点插值法') && (targetVar === peerVar)) {
                    messageApi?.error('请选择不同的插值参考变量')
                  } else if (peerVar && dataCols.find((col) => col.name === peerVar)?.type !== '等距或等比数据') {
                    messageApi?.error('插值参考变量必须是等距或等比数据')
                  } else {
                    await handleMissingMethod(targetVar, method, peerVar)
                  }
                  handleMissingMethodParams.current.targetVar = undefined
                  handleMissingMethodParams.current.method = undefined
                  handleMissingMethodParams.current.peerVar = undefined
                },
                okText: '确定',
                cancelText: '取消',
              })
              flushSync(() => setDisabled(false))
            }}
          >
            定义缺失值插值方式
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
              missingMethod: col.missingMethod ?? '删除法',
            }
          })}
          columns={[
            { title: '变量名', dataIndex: 'name', key: 'name', width: '6rem' },
            { title: '数据类型', dataIndex: 'type', key: 'type', width: '6rem' },
            { title: '样本量', dataIndex: 'count', key: 'count', width: '6rem' },
            { title: '有效值(含插值)数', dataIndex: 'valid', key: 'valid', width: '9rem' },
            { title: '缺失值定义', dataIndex: 'missingValues', key: 'missingValues', width: '7rem' },
            { title: '未插值缺失值数', dataIndex: 'missing', key: 'missing', width: '9rem' },
            { title: '缺失值插值方法', dataIndex: 'missingMethod', key: 'missingMethod', width: '9rem' },
            { title: '插值的参考变量', dataIndex: 'missingRefer', key: 'missingRefer', width: '9rem' },
            { title: '唯一值数量', dataIndex: 'unique', key: 'unique', width: '7rem' },
            { title: '最小值', dataIndex: 'min', key: 'min', width: '6rem' },
            { title: '最大值', dataIndex: 'max', key: 'max', width: '6rem' },
            { title: '均值', dataIndex: 'mean', key: 'mean', width: '6rem' },
            { title: '25%分位数', dataIndex: 'q1', key: 'q1', width: '7rem' },
            { title: '50%分位数', dataIndex: 'q2', key: 'q2', width: '7rem' },
            { title: '75%分位数', dataIndex: 'q3', key: 'q3', width: '7rem' },
            { title: '标准差', dataIndex: 'std', key: 'std', width: '6rem' },
            { title: '众数', dataIndex: 'mode', key: 'mode', width: '6rem' },
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