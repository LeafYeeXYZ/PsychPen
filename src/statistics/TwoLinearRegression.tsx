import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { LinearRegressionTwo } from '../lib/regression'

type Option = {
  /** x1 变量 */
  x1: string
  /** x2 变量 */
  x2: string
  /** y 变量 */
  y: string
}
type Result = {
  /** 模型 */
  m: LinearRegressionTwo
} & Option

export function TwoLinearRegression() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      
      

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

            <p className='text-lg mb-2 text-center w-full'>二元线性回归</p>
            <p className='text-xs mb-3 text-center w-full'></p>
            <table className='three-line-table'>
              <thead>
                
              </thead>
              <tbody>

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