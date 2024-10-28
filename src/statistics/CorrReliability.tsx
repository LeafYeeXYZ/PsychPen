import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { corr } from 'mathjs'

type Option = {
  /** 变量名 */
  variables: [string, string]
  /** 分组变量 */
  group?: string
}
type Result = {
  /** 相关系数 */
  r: number[]
  /** 组名 */
  groups: string[]
} & Option

export function CorrReliability() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const filteredRows = dataRows.filter((row) => values.variables.every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      if (!values.group) {
        const data = values.variables.map((variable) => filteredRows.map((row) => Number(row[variable])))
        const r = Number(corr(data[0], data[1]))
        setResult({ r: [r], groups: ['-'], ...values })
      } else {
        const groups = Array.from(new Set(filteredRows.map((row) => row[values.group!])))
        const result: Result = { r: [], groups: [], ...values }
        for (const group of groups) {
          const data = values.variables.map((variable) => filteredRows.filter((row) => row[values.group!] == group).map((row) => Number(row[variable])))
          const r = Number(corr(data[0], data[1]))
          result.r.push(r)
          result.groups.push(String(group))
        }
        setResult(result)
      }
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='component-main'>

      <div className='component-form'>

        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={(values) => {
            flushSync(() => setDisabled(true))
            handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
        >
          <Form.Item
            label='待检验变量(两个)'
            name='variables'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, max: 2, message: '请选择两个变量' },
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='分组变量(可选)'
            name='group'
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              options={dataCols.map((col) => ({ label: `${col.name} (水平数: ${col.unique})`, value: col.name }))}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Button
              className='w-full mt-4'
              type='default'
              htmlType='submit'
            >
              计算
            </Button>
          </Form.Item>
        </Form>

      </div>

      <div className='component-result'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <p className='text-lg mb-2 text-center w-full'>重测信度/复本信度分析</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>分组</td>
                  <td>相关系数(r<sub>xx</sub>)</td>
                </tr>
              </thead>
              <tbody>
                {result.r.map((r, index) => (
                  <tr key={index}>
                    <td>{result.groups[index]}</td>
                    <td>{r.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>配对变量: {result.variables.join(', ')}</p>
            {result.group && <p className='text-xs mt-2 text-center w-full'>分组变量: {result.group}</p>}

          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <span>请填写参数并点击计算</span>
          </div>
        )}
        
      </div>

    </div>
  )
}