import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag, InputNumber } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { markP, markS } from '../lib/utils'
import { LinearRegressionTwo, LinearRegressionOne, mean, bootstrapTest, standardize } from '@psych/lib'

type Option = {
  /** 自变量 */
  x: string
  /** 中介变量 */
  m: string
  /** 因变量 */
  y: string
  /** Bootstrap 重抽样次数 */
  B: number
}
type Result = {
  x_m: LinearRegressionOne
  x_y: LinearRegressionOne
  xm_y: LinearRegressionTwo
  count: number
  /**
   * 非参数 Bootstrap 检验
   */
  bootstrap: { lower: number, upper: number }
  /**
   * 标准化的 ab
   */
  standardizedAB: number
} & Option

export function SimpleMediatorTest() {

  const { dataCols, dataRows, messageApi, isLargeData } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const { x, m, y, B } = values
      if (isLargeData || B > 1000) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      const timestamp = Date.now()
      const filteredRows = dataRows.filter((row) => [x, m, y].every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))

      const xData = filteredRows.map((row) => Number(row[x]))
      const mData = filteredRows.map((row) => Number(row[m]))
      const yData = filteredRows.map((row) => Number(row[y]))
      const xMean = mean(xData)
      const mMean = mean(mData)
      const yMean = mean(yData)
      const x_m = new LinearRegressionOne(xData, mData)
      const x_y = new LinearRegressionOne(mData, yData)
      const xm_y = new LinearRegressionTwo(xData, mData, yData)
      const stded_x = standardize(xData, true, false, xMean)
      const stded_m = standardize(mData, true, false, mMean)
      const stded_y = standardize(yData, true, false, yMean)
      const [lower, upper] = bootstrapTest('ab', B, 0.05, xData, mData, yData)
      setResult({ 
        ...values, 
        x_m, 
        x_y, 
        xm_y,
        count: filteredRows.length,
        bootstrap: { lower, upper },
        standardizedAB: (new LinearRegressionOne(stded_x, stded_m).b1) * (new LinearRegressionTwo(stded_x, stded_m, stded_y).b2)
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
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
          initialValues={{ B: 1000 }}
        >
          <Form.Item
            label={<span>自变量 <Tag color='blue'>X</Tag></span>}
            name='x'
            rules={[
              { required: true, message: '请选择自变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('m') || value === getFieldValue('y')) {
                    return Promise.reject('自变量、中介变量、因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择自变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label={<span>中介变量 <Tag color='green'>M</Tag></span>}
            name='m'
            rules={[
              { required: true, message: '请选择中介变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('x') || value === getFieldValue('y')) {
                    return Promise.reject('自变量、中介变量、因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择中介变量'
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
                  if (value === getFieldValue('x') || value === getFieldValue('m')) {
                    return Promise.reject('自变量、中介变量、因变量不能相同')
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
            label='Bootstrap 抽样次数'
            name='B'
            rules={[{ required: true, message: '请输入 Bootstrap 抽样次数' }]}
          >
            <InputNumber className='w-full' min={100} max={100000} step={100} addonBefore='重复抽样' addonAfter='次' placeholder='请输入' />
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

            <p className='text-lg mb-2 text-center w-full'>简单中介效应模型</p>
            <p className='text-xs mb-3 text-center w-full'>模型: x ({result.x}) -{'>'} m ({result.m}) -{'>'} y ({result.y})</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>参数</td>
                  <td>值</td>
                  <td>统计量 (t)</td>
                  <td>显著性 (p)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>c (x 对 y 的总效应)</td>
                  <td>{result.x_y.b1.toFixed(3)}</td>
                  <td>{markS(result.x_y.t, result.x_y.p)}</td>
                  <td>{markP(result.x_y.p)}</td>
                </tr>
                <tr>
                  <td>c' (控制 m 后 x 对 y 的效应 / x 对 y 的直接效应)</td>
                  <td>{result.xm_y.b1.toFixed(3)}</td>
                  <td>{markS(result.xm_y.b1t!, result.xm_y.b1p)}</td>
                  <td>{markP(result.xm_y.b1p)}</td>
                </tr>
                <tr>
                  <td>a (x 对 m 的效应)</td>
                  <td>{result.x_m.b1.toFixed(3)}</td>
                  <td>{markS(result.x_m.t, result.x_m.p)}</td>
                  <td>{markP(result.x_m.p)}</td>
                </tr>
                <tr>
                  <td>b (控制 x 后 m 对 y 的效应)</td>
                  <td>{result.xm_y.b2.toFixed(3)}</td>
                  <td>{markS(result.xm_y.b2t!, result.xm_y.b2p)}</td>
                  <td>{markP(result.xm_y.b2p)}</td>
                </tr>
                <tr>
                  <td>ab (x 对 y 的中介效应)</td>
                  <td>{(result.x_m.b1 * result.xm_y.b2).toFixed(3)}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>

            <p className='text-lg mb-2 text-center w-full mt-8'>中介效应显著性检验</p>
            <p className='text-xs mb-3 text-center w-full'>样本量: {result.count} | Bootstrap 抽样次数: {result.B}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>方法</td>
                  <td>H<sub>0</sub></td>
                  <td>统计量</td>
                  <td>结果</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>依次检验法</td>
                  <td>a = 0 或 b = 0</td>
                  <td>p<sub>a</sub>: {result.x_m.p.toFixed(3)}, p<sub>b</sub>: {result.xm_y.b2p.toFixed(3)}</td>
                  <td>{(result.x_m.p < 0.025 && result.xm_y.b2p < 0.025) ? '拒绝原假设' : '不通过'}</td>
                </tr>
                <tr>
                  <td>非参数 Bootstrap 检验</td>
                  <td>ab = 0</td>
                  <td>95%置信区间: {'['}{result.bootstrap.lower.toFixed(3)}, {result.bootstrap.upper.toFixed(3)}{')'}</td>
                  <td>{result.bootstrap.lower > 0 || result.bootstrap.upper < 0 ? '拒绝原假设' : '不通过'}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>注: 依次检验法中 a、b 的显著性阈值为 0.025</p>

            <p className='text-lg mb-2 text-center w-full mt-8'>中介效应的效应量</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>方法</td>
                  <td>结果</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>P<sub>M</sub> = ab / c (中介效应占总效应的比例)</td>
                  <td>{(result.x_m.b1 * result.xm_y.b2 / result.x_y.b1).toFixed(3)}</td>
                </tr>
                <tr>
                  <td>R<sub>M</sub> = ab / c' (中介效应与直接效应之比)</td>
                  <td>{(result.x_m.b1 * result.xm_y.b2 / result.xm_y.b1).toFixed(3)}</td>
                </tr>
                <tr>
                  <td>v<sup>2</sup> = a<sup>2</sup>b<sup>2</sup></td>
                  <td>{((result.x_m.b1 ** 2) * (result.xm_y.b2 ** 2)).toFixed(3)}</td>
                </tr>
                <tr>
                  <td>标准化的 ab</td>
                  <td>{result.standardizedAB.toFixed(3)}</td>
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