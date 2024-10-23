import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
// import { generatePResult } from '../lib/utils'
import { tensor2d, sequential, layers } from '@tensorflow/tfjs'

type Option = {
  /** x1 变量 */
  x1: string
  /** x2 变量 */
  x2: string
  /** y 变量 */
  y: string
  /** 优化器 */
  optimizer: 'sgd' | 'adam'
}
type Result = {
  /** 数据量 */
  dataSize: number
  /** 模型: y = a * x1 + b * x2 + c */
  model: { a: number, b: number, c: number }
} & Option

export function MultipleLinearRegression() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据(训练模型)...', 0)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const { x1, x2, y, optimizer } = values
      const filteredRows = dataRows.filter((row) => [x1, x2, y].every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const xData = tensor2d(filteredRows.map((row) => [Number(row[x1]), Number(row[x2])]), [filteredRows.length, 2])
      const yData = tensor2d(filteredRows.map((row) => [Number(row[y])]), [filteredRows.length, 1])
      const model = sequential()
      model.add(layers.dense({ units: 1, inputShape: [2] }))
      model.compile({ loss: 'meanSquaredError', optimizer: optimizer })
      await model.fit(xData, yData, { epochs: 100 })
      const [a, b] = model.getWeights().map((weight) => (weight.arraySync() as number[])[0])
      const c = model.getWeights().map((weight) => (weight.arraySync() as number[])[1])[0]
      setResult({
        ...values,
        dataSize: filteredRows.length,
        model: { 
          a: +Number(a).toFixed(4),
          b: +Number(b).toFixed(4),
          c: +Number(c).toFixed(4),
        },
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
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
          initialValues={{
            optimizer: 'adam',
          }}
        >
          <Form.Item
            label={<span>第一个自变量 <Tag color='blue'>X<sub>1</sub></Tag></span>}
            name='x1'
            rules={[
              { required: true, message: '请选择第一个自变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('x2')) {
                    return Promise.reject('第一个自变量和第二个自变量不能相同')
                  } else if (value === getFieldValue('y')) {
                    return Promise.reject('自变量和因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择第一个自变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label={<span>第二个自变量 <Tag color='blue'>X<sub>2</sub></Tag></span>}
            name='x2'
            rules={[
              { required: true, message: '请选择第二个自变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('x1')) {
                    return Promise.reject('第一个自变量和第二个自变量不能相同')
                  } else if (value === getFieldValue('y')) {
                    return Promise.reject('自变量和因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择第二个自变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label={<span>因变量 <Tag color='pink'>Y</Tag></span>}
            name='y'
            rules={[
              { required: true, message: '请选择因变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('x1') || value === getFieldValue('x2')) {
                    return Promise.reject('自变量和因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择因变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label='优化器'
            name='optimizer'
            rules={[{ required: true, message: '请选择优化方式' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择优化方式'
              options={[
                { label: 'Stochastic Gradient Descent', value: 'sgd' },
                { label: 'Adaptive Moment Estimation', value: 'adam' },
              ]}
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

            <p className='text-lg mb-2 text-center w-full'>多元线性回归</p>
            <p className='text-xs mb-3 text-center w-full'>数据量: {result.dataSize}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>变量</td>
                  <td>参数</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>因变量 <Tag color='pink' className='mr-0'>Y</Tag>: {result.y}</td>
                  <td>模型: Y = {result.model.a} * X1 + {result.model.b} * X2 + {result.model.c}</td>
                </tr>
                <tr>
                  <td>第一个自变量 <Tag color='blue' className='mr-0'>X<sub>1</sub></Tag>: {result.x1}</td>
                  <td>参数: {result.model.a}</td>
                </tr>
                <tr>
                  <td>第二个自变量 <Tag color='blue' className='mr-0'>X<sub>2</sub></Tag>: {result.x2}</td>
                  <td>参数: {result.model.b}</td>
                </tr>
                <tr>
                  <td>截距项</td>
                  <td>数值: {result.model.c}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>本功能暂时基于 TensorFlow 实现, 模型具有随机性, 不能作为心理统计学结论</p>

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