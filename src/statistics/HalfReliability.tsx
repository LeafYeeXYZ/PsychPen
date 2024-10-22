import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { corr } from 'mathjs'
import { flushSync } from 'react-dom'

type Option = {
  /** 前一半变量名 */
  variablesA: string[]
  /** 后一半变量名 */
  variablesB: string[]
}
type Result = {
  /** 矫正后的相关系数 */
  correctedR: number
} & Option

export function HalfReliability() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const filteredRows = dataRows.filter((row) => values.variablesA.concat(values.variablesB).every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const meansA = filteredRows.map((row) => values.variablesA.reduce((acc, variable) => acc + Number(row[variable]), 0) / values.variablesA.length)
      const meansB = filteredRows.map((row) => values.variablesB.reduce((acc, variable) => acc + Number(row[variable]), 0) / values.variablesB.length)
      const r = Number(corr(meansA, meansB))
      const correctedR = 2 * r / (1 + r)
      setResult({
        ...values,
        correctedR,
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
            label='选择前一半变量'
            name='variablesA'
            rules={[
              { required: true, message: '请选择变量' },
              ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value?.some((variable: string) => getFieldValue('variablesB')?.includes(variable))) {
                      return Promise.reject('前后两半变量不能重复')
                    }
                    return Promise.resolve()
                  }
              })
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
            label='选择后一半变量'
            name='variablesB'
            rules={[
              { required: true, message: '请选择变量' },
              ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value?.some((variable: string) => getFieldValue('variablesA')?.includes(variable))) {
                      return Promise.reject('前后两半变量不能重复')
                    }
                    return Promise.resolve()
                  }
              })
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

            <p className='text-lg mb-2 text-center w-full'>分半信度分析</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>前半部分题目数</td>
                  <td>后半部分题目数</td>
                  <td>修正后相关系数(r<sub>xx</sub>)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.variablesA.length}</td>
                  <td>{result.variablesB.length}</td>
                  <td>{result.correctedR.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>前半部分题目: {result.variablesA.join(', ')}</p>
            <p className='text-xs mt-2 text-center w-full'>后半部分题目: {result.variablesB.join(', ')}</p>

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