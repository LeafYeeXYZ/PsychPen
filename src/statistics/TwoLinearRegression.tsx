import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { LinearRegressionTwo } from '@leaf/psych-lib'

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
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { x1, x2, y } = values
      const filteredRows = dataRows.filter((row) => [x1, x2, y].every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const x1Data = filteredRows.map((row) => Number(row[x1]))
      const x2Data = filteredRows.map((row) => Number(row[x2]))
      const yData = filteredRows.map((row) => Number(row[y]))
      const m = new LinearRegressionTwo(x1Data, x2Data, yData)
      setResult({ x1, x2, y, m })
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
            <p className='text-xs mb-3 text-center w-full'>模型: y = {result.m.b0.toFixed(4)} + {result.m.b1.toFixed(4)} * x<sub>1</sub> + {result.m.b2.toFixed(4)} * x<sub>2</sub></p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>b<sub>0</sub> (截距)</td>
                  <td>b<sub>1</sub> (x<sub>1</sub>偏回归系数)</td>
                  <td>b<sub>2</sub> (x<sub>2</sub>偏回归系数)</td>
                  <td>F</td>
                  <td>t</td>
                  <td>p</td>
                  <td>测定系数 (R²)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.m.b0.toFixed(4)}</td>
                  <td>{result.m.b1.toFixed(4)}</td>
                  <td>{result.m.b2.toFixed(4)}</td>
                  <td>{generatePResult(result.m.F, result.m.p).statistic}</td>
                  <td>{generatePResult(result.m.t, result.m.p).statistic}</td>
                  <td>{generatePResult(result.m.F, result.m.p).p}</td>
                  <td>{result.m.r2.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>x<sub>1</sub>: {result.x1} | x<sub>2</sub>: {result.x2} | y: {result.y}</p>

            <p className='text-lg mb-2 text-center w-full mt-8'>模型细节</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>误差项</td>
                  <td>自由度 (df)</td>
                  <td>平方和 (SS)</td>
                  <td>均方 (MS)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>总和 (T)</td>
                  <td>{result.m.dfT}</td>
                  <td>{result.m.SSt.toFixed(4)}</td>
                  <td>{(result.m.SSt / result.m.dfT).toFixed(4)}</td>
                </tr>
                <tr>
                  <td>回归 (R)</td>
                  <td>{result.m.dfR}</td>
                  <td>{result.m.SSr.toFixed(4)}</td>
                  <td>{(result.m.SSr / result.m.dfR).toFixed(4)}</td>
                </tr>
                <tr>
                  <td>残差 (E)</td>
                  <td>{result.m.dfE}</td>
                  <td>{result.m.SSe.toFixed(4)}</td>
                  <td>{(result.m.SSe / result.m.dfE).toFixed(4)}</td>
                </tr>
              </tbody>
            </table>

            <p className='text-lg mb-2 text-center w-full mt-8'>描述统计</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>变量</td>
                  <td>均值</td>
                  <td>标准差</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.x1}</td>
                  <td>{result.m.x1Mean.toFixed(4)}</td>
                  <td>{result.m.x1Std.toFixed(4)}</td>
                </tr>
                <tr>
                  <td>{result.x2}</td>
                  <td>{result.m.x2Mean.toFixed(4)}</td>
                  <td>{result.m.x2Std.toFixed(4)}</td>
                </tr>
                <tr>
                  <td>{result.y}</td>
                  <td>{result.m.yMean.toFixed(4)}</td>
                  <td>{result.m.yStd.toFixed(4)}</td>
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