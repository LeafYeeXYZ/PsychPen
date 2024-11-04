import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { LinearRegressionTwo } from '@psych/lib'

type Option = {
  /** x1 变量 */
  x1: string
  /** x2 变量 */
  x2: string
  /** y 变量 */
  y: string
  /** 回归方式 */
  method: 'standard' | 'sequential'
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
      const { x1, x2, y, method } = values
      const filteredRows = dataRows.filter((row) => [x1, x2, y].every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const x1Data = filteredRows.map((row) => Number(row[x1]))
      const x2Data = filteredRows.map((row) => Number(row[x2]))
      const yData = filteredRows.map((row) => Number(row[y]))
      const m = new LinearRegressionTwo(x1Data, x2Data, yData, method)
      setResult({ ...values, m })
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
            method: 'standard'
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
            label='回归方式'
            name='method'
            rules={[{ required: true, message: '请选择回归方式' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择回归方式'
              options={[
                { label: '标准回归', value: 'standard' },
                { label: '序列回归', value: 'sequential' },
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

            <p className='text-lg mb-2 text-center w-full'>{result.method === 'standard' ? '标准' : '序列'}二元线性回归</p>
            <p className='text-xs mb-2 text-center w-full'>模型: y = {result.m.b0.toFixed(4)} + {result.m.b1.toFixed(4)} * x<sub>1</sub> + {result.m.b2.toFixed(4)} * x<sub>2</sub></p>
            <p className='text-xs mb-3 text-center w-full'>测定系数 (R<sup>2</sup>): {result.m.r2.toFixed(4)} | 调整后测定系数 (R<sup>2</sup><sub>adj</sub>): {result.m.r2adj.toFixed(4)}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>参数</td>
                  <td>值</td>
                  <td>H<sub>0</sub></td>
                  <td>统计量</td>
                  <td>显著性</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>模型</td>
                  <td>b0: {result.m.b0.toFixed(4)} | b1: {result.m.b1.toFixed(4)} | b2: {result.m.b2.toFixed(4)}</td>
                  <td>b1 = b2 = 0</td>
                  <td>F = {generatePResult(result.m.F, result.m.p).statistic}</td>
                  <td>{generatePResult(result.m.F, result.m.p).p}</td>
                </tr>
                <tr>
                  <td>b1</td>
                  <td>{result.m.b1.toFixed(4)}{result.method === 'standard' ? ' (偏回归系数)' : ' (含两自变量的共同效应)'}</td>
                  <td>b1 = 0</td>
                  <td>{result.method === 'standard' ? (
                    `t = ${generatePResult(result.m.b1t, result.m.b1p).statistic}`
                  ) : (
                    `F = ${generatePResult(result.m.b1F, result.m.b1p).statistic}`
                  )}</td>
                  <td>{result.method === 'standard' ? (
                    generatePResult(result.m.b1t, result.m.b1p).p
                  ) : (
                    generatePResult(result.m.b1F, result.m.b1p).p
                  )}</td>
                </tr>
                <tr>
                  <td>b2</td>
                  <td>{result.m.b2.toFixed(4)}{result.method === 'standard' ? ' (偏回归系数)' : ' (不含两自变量的共同效应)'}</td>
                  {result.method === 'standard' ? (<td>b2 = 0</td>) : (<td>加入 x2 后 r2 变化量为 0</td>)}
                  <td>{result.method === 'standard' ? (
                    `t = ${generatePResult(result.m.b2t, result.m.b2p).statistic}`
                  ) : (
                    `F = ${generatePResult(result.m.b2F, result.m.b2p).statistic}`
                  )}</td>
                  <td>{result.method === 'standard' ? (
                    generatePResult(result.m.b2t, result.m.b2p).p
                  ) : (
                    generatePResult(result.m.b2F, result.m.b2p).p
                  )}</td>
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
                  <td>与Y相关系数</td>
                  <td>与Y偏相关系数</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.x1} (x1)</td>
                  <td>{result.m.x1Mean.toFixed(4)}</td>
                  <td>{result.m.x1Std.toFixed(4)}</td>
                  <td>{result.m.rYX1.toFixed(4)}</td>
                  <td>{result.m.prYX1.toFixed(4)}</td>
                </tr>
                <tr>
                  <td>{result.x2} (x2)</td>
                  <td>{result.m.x2Mean.toFixed(4)}</td>
                  <td>{result.m.x2Std.toFixed(4)}</td>
                  <td>{result.m.rYX2.toFixed(4)}</td>
                  <td>{result.m.prYX2.toFixed(4)}</td>
                </tr>
                <tr>
                  <td>{result.y} (y)</td>
                  <td>{result.m.yMean.toFixed(4)}</td>
                  <td>{result.m.yStd.toFixed(4)}</td>
                  <td>1</td>
                  <td>1</td>
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