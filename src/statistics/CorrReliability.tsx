import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { corr } from 'mathjs'

type Option = {
  /** 变量名 */
  variables: [string, string]
}
type Result = {
  r: number
} & Option

export function CorrReliability() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const filteredRows = dataRows.filter((row) => values.variables.every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const data = values.variables.map((variable) => filteredRows.map((row) => Number(row[variable])))
      const r = corr(data[0], data[1])
      setResult({
        ...values,
        r: Number(r),
      })
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
          className='w-full py-4'
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
            label='选择变量(两个)'
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
                  <td>配对变量A</td>
                  <td>配对变量B</td>
                  <td>相关系数(r<sub>xx</sub>)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.variables[0]}</td>
                  <td>{result.variables[1]}</td>
                  <td>{result.r.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>

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