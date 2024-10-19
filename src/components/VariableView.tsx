import { useZustand, type ALLOWED_MISSING_METHODS } from '../lib/useZustand'
import { Button, Modal, Select, Tag } from 'antd'
import { CalculatorOutlined, ZoomOutOutlined, BoxPlotOutlined } from '@ant-design/icons'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { utils } from 'xlsx'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

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
  // 定义子变量 (同时注意下面所有地方在遍历 dataCols 时过滤掉 derived 变量)
  const handleSubVarsParams = useRef<{ targetVar?: string; standard?: boolean; center?: boolean }>({})
  const handleSubVars = async (targetVar: string, options?: { standard?: boolean; center?: boolean }) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols.map((col) => {
        if (col.name === targetVar) {
          return { 
            ...col, 
            subVars: options,
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
                      {dataCols.map((col) => col.derived !== true && (
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
                      {dataCols.map((col) => col.derived !== true && (
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
                      {dataCols.map((col) => col.derived !== true && (
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
          <Button
            icon={<BoxPlotOutlined />}
            disabled={disabled}
            onClick={async () => {
              flushSync(() => setDisabled(true))
              await modalApi.confirm({
                title: '定义中心化/标准化子变量',
                content: (
                  <div className='flex flex-col gap-4 my-4'>
                    <Select
                      placeholder='请选择变量'
                      onChange={(value) => handleSubVarsParams.current.targetVar = value as string}
                    >
                      {dataCols.map((col) => col.derived !== true && (
                        <Select.Option key={col.name} value={col.name}>{col.name}</Select.Option>
                      ))}
                    </Select>
                    <Select
                      mode='multiple'
                      placeholder='请选择要生成的子变量 (可多选/留空)'
                      onChange={(value) => {
                        handleSubVarsParams.current.standard = value.includes('标准化')
                        handleSubVarsParams.current.center = value.includes('中心化')
                      }}
                    >
                      <Select.Option key='标准化' value='标准化'>标准化 <Tag color='pink'>(x-mean)/std</Tag></Select.Option>
                      <Select.Option key='中心化' value='中心化'>中心化 <Tag color='pink'>x-mean</Tag></Select.Option>
                    </Select>
                  </div>
                ),
                onOk: async () => {
                  const { targetVar, standard, center } = handleSubVarsParams.current
                  if (!targetVar) {
                    messageApi?.error('请选择要定义子变量的变量')
                  } else if (dataCols.find((col) => col.name === targetVar)?.type !== '等距或等比数据') {
                    messageApi?.error('子变量生成仅适用于等距或等比数据')
                  } else if (!standard && !center) {
                    await handleSubVars(targetVar)
                  } else {
                    await handleSubVars(targetVar, { standard, center })
                  }
                  handleSubVarsParams.current.targetVar = undefined
                  handleSubVarsParams.current.standard = undefined
                  handleSubVarsParams.current.center = undefined
                },
                okText: '确定',
                cancelText: '取消',
              })
              flushSync(() => setDisabled(false))
            }}
          >
            定义中心化/标准化子变量
          </Button>
        </div>
        {/* 变量表格 */}
        <AgGridReact
          className='ag-theme-quartz w-full h-full overflow-auto'
          rowData={dataCols
            .filter((col) => col.derived !== true)
            .map((col) => {
              let subVars = ''
              if (col.subVars?.standard) subVars += '标准化'
              if (col.subVars?.center) subVars += subVars ? '和中心化' : '中心化'
              return {
                ...col,
                missingValues: col.missingValues?.join(', '),
                missingMethod: col.missingMethod ?? '删除法',
                subVars: subVars || '无',
              }
            })
          }
          columnDefs={[
            { headerName: '变量名', field: 'name', pinned: 'left', width: 150 },
            { headerName: '数据类型', field: 'type', width: 130 },
            { headerName: '样本量', field: 'count', width: 100 },
            { headerName: '有效值数(含插值)', field: 'valid', width: 150 },
            { headerName: '缺失值数(未插值)', field: 'missing', width: 150 },
            { headerName: '唯一值数', field: 'unique', width: 100 },
            { headerName: '子变量', field: 'subVars', width: 130 },
            { headerName: '缺失值定义', field: 'missingValues', width: 130 },
            { headerName: '缺失值插值方法', field: 'missingMethod', width: 130 },
            { headerName: '插值的参考变量', field: 'missingRefer', width: 130 },
            { headerName: '最小值', field: 'min', width: 130 },
            { headerName: '最大值', field: 'max', width: 130 },
            { headerName: '均值', field: 'mean', width: 130 },
            { headerName: '25%分位数', field: 'q1', width: 130 },
            { headerName: '50%分位数', field: 'q2', width: 130 },
            { headerName: '75%分位数', field: 'q3', width: 130 },
            { headerName: '标准差', field: 'std', width: 130 },
            { headerName: '众数', field: 'mode', width: 150 },
          ]}
        />
      </div>
      {contextHolder}
    </div>
  )
}