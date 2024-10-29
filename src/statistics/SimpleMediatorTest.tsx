import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Tag, Radio } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { LinearRegressionTwo, LinearRegressionOne, ss } from '@leaf/psych-lib'
import { mean, abs } from 'mathjs'
// @ts-expect-error jstat 没有类型定义
import * as jstat from 'jstat'

type Option = {
  /** 自变量 */
  x: string
  /** 中介变量 */
  m: string
  /** 因变量 */
  y: string
}
type Result = {
  x_m: LinearRegressionOne
  x_y: LinearRegressionOne
  xm_y: LinearRegressionTwo
  /**
   * Sobel 中介效应检验
   */
  sobel: { z: number, p: number }
  /**
   * 乘积分布所需信息
   */
  product: { SEa: number, SEb: number }
} & Option

export function SimpleMediatorTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { x, m, y } = values
      const filteredRows = dataRows.filter((row) => [x, m, y].every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const xData = filteredRows.map((row) => Number(row[x]))
      const xMean = mean(xData)
      const mData = filteredRows.map((row) => Number(row[m]))
      const yData = filteredRows.map((row) => Number(row[y]))
      const x_m = new LinearRegressionOne(xData, mData)
      const x_y = new LinearRegressionOne(mData, yData)
      const xm_y = new LinearRegressionTwo(xData, mData, yData)

      const a = x_m.b1
      const b = xm_y.b2
      const SEa = Math.sqrt(x_m.SSe / (x_m.dfE * ss(xData.map((v) => [v, xMean]))))
      const SEb = Math.sqrt(xm_y.SSe / (xm_y.dfE * xm_y.SSx2))
      const sobel_SEab = Math.sqrt((SEa ** 2) * (b ** 2) + (SEb ** 2) * (a ** 2))
      const sobel_z = (a * b) / sobel_SEab
      const sobel_p = (1 - jstat.normal.cdf(abs(sobel_z), 0, 1)) * 2

      setResult({ 
        ...values, 
        x_m, 
        x_y, 
        xm_y,
        sobel: { z: sobel_z, p: sobel_p },
        product: { SEa, SEb },
      })
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  const [tab, setTab] = useState<'table' | 'chart'>('table')

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

      <div className='w-[calc(100%-24rem)] h-full flex flex-col justify-start items-center gap-4 rounded-md border bg-gray-50 overflow-hidden p-4 relative dark:bg-gray-800 dark:border-black'>

        {result ? (
          <div className='w-full h-full overflow-hidden'>

            <Radio.Group
              className='w-full h-8 mb-4 flex justify-center items-center'
              defaultValue={'table'}
              onChange={(e) => setTab(e.target.value)}
              buttonStyle='solid'
            >
              <Radio.Button value='table'>表格</Radio.Button>
              <Radio.Button value='chart'>模型图</Radio.Button>
            </Radio.Group>

            <div className='w-full h-[calc(100%-3rem)] overflow-auto border rounded-md bg-white dark:bg-gray-900 dark:border-black'>

              {tab === 'table' ? (
                <div className='w-full h-full p-4 overflow-auto'>

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
                        <td>{generatePResult(result.x_y.t, result.x_y.p).statistic}</td>
                        <td>{generatePResult(result.x_y.t, result.x_y.p).p}</td>
                      </tr>
                      <tr>
                        <td>c' (控制 m 后 x 对 y 的效应)</td>
                        <td>{result.xm_y.b1.toFixed(3)}</td>
                        <td>{generatePResult(result.xm_y.b1t, result.xm_y.b1p).statistic}</td>
                        <td>{generatePResult(result.xm_y.b1t, result.xm_y.b1p).p}</td>
                      </tr>
                      <tr>
                        <td>a (x 对 m 的效应)</td>
                        <td>{result.x_m.b1.toFixed(3)}</td>
                        <td>{generatePResult(result.x_m.t, result.x_m.p).statistic}</td>
                        <td>{generatePResult(result.x_m.t, result.x_m.p).p}</td>
                      </tr>
                      <tr>
                        <td>b (控制 x 后 m 对 y 的效应)</td>
                        <td>{result.xm_y.b2.toFixed(3)}</td>
                        <td>{generatePResult(result.xm_y.b2t, result.xm_y.b2p).statistic}</td>
                        <td>{generatePResult(result.xm_y.b2t, result.xm_y.b2p).p}</td>
                      </tr>
                      <tr className='border-t border-black'>
                        <td>c' (x 对 y 的直接效应)</td>
                        <td>{result.xm_y.b1.toFixed(3)}</td>
                        <td>{generatePResult(result.xm_y.b1t, result.xm_y.b1p).statistic}</td>
                        <td>{generatePResult(result.xm_y.b1t, result.xm_y.b1p).p}</td>
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
                  <table className='three-line-table'>
                    <thead>
                      <tr>
                        <td>方法</td>
                        <td>H<sub>0</sub></td>
                        <td>结果</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>依次检验法</td>
                        <td>a = 0, b = 0 -{'>'} ab = 0</td>
                        <td>{(result.x_m.p < 0.025 && result.xm_y.b2p < 0.025) ? '拒绝原假设' : '不通过'}</td>
                      </tr>
                      <tr>
                        <td>Sobel 检验</td>
                        <td>ab = 0</td>
                        <td>z = {generatePResult(result.sobel.z, result.sobel.p).statistic}, p = {generatePResult(result.sobel.z, result.sobel.p).p}</td>
                      </tr>
                      <tr>
                        <td>乘积分布检验</td>
                        <td>ab = 0</td>
                        <td>
                          SE<sub>a</sub>: {result.product.SEa.toFixed(3)}, SE<sub>b</sub>: {result.product.SEb.toFixed(3)} <br />
                          <a className='underline' href='https://www.public.asu.edu/~horourke/Research_in_Prevention_Laboratory_at_Arizona_State_University/PRODCLIN.html' target='_blank' rel='noreferrer'>点击下载 PRODCLIN 计算置信区间</a>
                        </td>
                      </tr>
                      <tr>
                        <td>Bootstrap 检验</td>
                        <td>ab = 0</td>
                        <td><Tag>开发中</Tag></td>
                      </tr>
                    </tbody>
                  </table>
                  <p className='text-xs mt-3 text-center w-full'>注: 依次检验法中 a、b 的显著性阈值为 0.025</p>

                </div>
              ) : (
                <div className='w-full h-full flex justify-center items-center p-4'>
                  <span>模型图功能开发中</span>
                </div>
              )}

            </div>

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