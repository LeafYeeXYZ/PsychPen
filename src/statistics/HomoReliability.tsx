import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { variance } from 'mathjs'

type Option = {
  /** 变量名 */
  variables: string[]
}
type Result = {
  /** alpha 系数 */
  alpha: number
} & Option

export function HomoReliability() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const filteredRows = dataRows.filter((row) => values.variables.every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const items = values.variables.map((variable) => filteredRows.map((row) => Number(row[variable])))
      const total = filteredRows.map((row) => values.variables.reduce((acc, variable) => acc + Number(row[variable]), 0))
      const itemsVariance = items.map((item) => Number(variance(item))).reduce((acc, variance) => acc + variance, 0)
      const totalVariance = Number(variance(total))
      const k = values.variables.length
      const alpha = (k / (k - 1)) * (1 - itemsVariance / totalVariance)
      setResult({
        ...values,
        alpha,
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
            label='选择量表的所有变量'
            name='variables'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, message: '至少选择两个变量' },
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

            <p className='text-lg mb-2 text-center w-full'>同质性信度分析</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>量表题目数</td>
                  <td>alpha 系数</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.variables.length}</td>
                  <td>{result.alpha.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>应用中, alpha 的值至少要大于 0.5, 最好能大于 0.7</p>
            <p className='text-xs mt-2 text-center w-full'>量表题目: {result.variables.join(', ')}</p>

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