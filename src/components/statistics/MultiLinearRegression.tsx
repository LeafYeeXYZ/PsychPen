// 如果支持序列多元线性回归后, 修改 README.md 中的说明
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Select, Button, Form, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { markP, markS } from '../../lib/utils'
import { LinearRegression, corr } from '@psych/lib'

type Option = {
  /** 自变量 */
  x: string[]
  /** 因变量 */
  y: string
  /** 回归方式 */
  method: 'standard'
}
type Result = {
  /** 模型 */
  m: LinearRegression
} & Option

export function MultiLinearRegression() {
  const { dataCols, dataRows } = useData()
  const { messageApi } = useStates()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { x, y } = values
      const filteredRows = dataRows.filter((row) =>
        [...x, y].every(
          (variable) =>
            typeof row[variable] !== 'undefined' &&
            !isNaN(Number(row[variable])),
        ),
      )
      const xData: number[][] = []
      const yData: number[] = []
      for (const row of filteredRows) {
        const xRow = x.map((variable) => Number(row[variable]))
        xData.push(xRow)
        yData.push(Number(row[y]))
      }
      const m = new LinearRegression(xData, yData)
      setResult({ ...values, m })
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(
        `数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
      )
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
            method: 'standard',
          }}
        >
          <Form.Item
            label={
              <span>
                自变量(可多选) <Tag color='blue'>X</Tag>
              </span>
            }
            name='x'
            rules={[
              { required: true, message: '请选择自变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (
                    value?.some(
                      (variable: string) => variable === getFieldValue('y'),
                    )
                  ) {
                    return Promise.reject('自变量和因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择自变量'
              mode='multiple'
              options={dataCols
                .filter((col) => col.type === '等距或等比数据')
                .map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                因变量 <Tag color='pink'>Y</Tag>
              </span>
            }
            name='y'
            rules={[
              { required: true, message: '请选择因变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (
                    getFieldValue('x')?.some(
                      (variable: string) => variable === value,
                    )
                  ) {
                    return Promise.reject('自变量和因变量不能相同')
                  } else {
                    return Promise.resolve()
                  }
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择因变量'
              options={dataCols
                .filter((col) => col.type === '等距或等比数据')
                .map((col) => ({ label: col.name, value: col.name }))}
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
              options={[{ label: '标准回归', value: 'standard' }]}
            />
          </Form.Item>
          <Form.Item>
            <Button className='w-full mt-4' type='default' htmlType='submit'>
              计算
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className='component-result'>
        {result ? (
          <div className='w-full h-full overflow-auto'>
            <p className='text-lg mb-2 text-center w-full'>
              {result.method === 'standard' ? '标准' : ''}多元线性回归
            </p>
            <p className='text-xs mb-2 text-center w-full'>
              模型: y = {result.m.coefficients[0].toFixed(4)} +{' '}
              {result.m.coefficients
                .slice(1)
                .map(
                  (coefficient, index) =>
                    `${coefficient.toFixed(4)} * x${index + 1}`,
                )
                .join(' + ')}
            </p>
            <p className='text-xs mb-3 text-center w-full'>
              测定系数 (R<sup>2</sup>): {result.m.r2.toFixed(4)} |
              调整后测定系数 (R<sup>2</sup>
              <sub>adj</sub>): {result.m.r2adj.toFixed(4)}
            </p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>参数</td>
                  <td>值</td>
                  <td>
                    H<sub>0</sub>
                  </td>
                  <td>统计量</td>
                  <td>显著性</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>模型</td>
                  <td>
                    b0: {result.m.coefficients[0].toFixed(4)} |{' '}
                    {result.m.coefficients
                      .slice(1)
                      .map(
                        (coefficient, index) =>
                          `b${index + 1}: ${coefficient.toFixed(4)}`,
                      )
                      .join(' | ')}
                  </td>
                  <td>
                    {result.m.coefficients
                      .slice(1)
                      .map((_, index) => `b${index + 1}`)
                      .join(' + ')}{' '}
                    = 0
                  </td>
                  <td>F = {markS(result.m.F, result.m.p)}</td>
                  <td>{markP(result.m.p)}</td>
                </tr>
                {result.m.coefficients.slice(1).map((_, index) => (
                  <tr key={index}>
                    <td>b{index + 1}</td>
                    <td>
                      {result.m.coefficients[index + 1].toFixed(4)} (偏回归系数)
                    </td>
                    <td>b{index + 1} = 0</td>
                    <td>
                      t ={' '}
                      {markS(result.m.tValues[index], result.m.pValues[index])}
                    </td>
                    <td>{markP(result.m.pValues[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>
              {result.x
                .map((variable, index) => `x${index + 1}: ${variable}`)
                .join(' | ')}{' '}
              | y: {result.y}
            </p>

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
                </tr>
              </thead>
              <tbody>
                {result.x.map((variable, index) => (
                  <tr key={index}>
                    <td>
                      {variable} (x{index + 1})
                    </td>
                    <td>{result.m.ivMeans[index].toFixed(4)}</td>
                    <td>{result.m.ivStds[index].toFixed(4)}</td>
                    <td>
                      {corr(
                        result.m.iv.map((xRow) => xRow[index]),
                        result.m.dv,
                      ).toFixed(4)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>{result.y} (y)</td>
                  <td>{result.m.dvMean.toFixed(4)}</td>
                  <td>{result.m.dvStd.toFixed(4)}</td>
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
