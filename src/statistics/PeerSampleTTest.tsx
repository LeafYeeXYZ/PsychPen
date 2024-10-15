import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import ttest from '@stdlib/stats/ttest'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { std, mean } from 'mathjs'

type Option = {
  /** 变量名1 */
  variable1: string
  /** 变量名2 */
  variable2: string
  /** 检验值, 默认 0 */
  expect: number
  /** 显著性水平, 默认 0.05 */
  alpha: number
  /** 单双尾检验, 默认 two-sided */
  alternative: 'two-sided' | 'less' | 'greater'
}
type Result = {
  [key: string]: unknown
} & Option

export function PeerSampleTTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const data1: number[] = []
      const data2: number[] = []
      for (const row of dataRows) {
        if (
          typeof row[values.variable1] !== 'undefined' 
          && !isNaN(Number(row[values.variable1]))
          && typeof row[values.variable2] !== 'undefined'
          && !isNaN(Number(row[values.variable2]))
        ) {
          data1.push(Number(row[values.variable1]))
          data2.push(Number(row[values.variable2]))
        }
      }
      const result = ttest(data1, data2, { mu: +values.expect, alpha: +values.alpha, alternative: values.alternative })
      const diff = data1.map((v, i) => v - data2[i])
      setResult({ 
        variable1: values.variable1, 
        variable2: values.variable2, 
        expect: +values.expect,
        means: [
          mean(data1),
          mean(data2),
          mean(diff),
        ],
        std: [
          Number(std(data1)),
          Number(std(data2)),
          Number(std(diff)),
        ],
        count: [
          data1.length,
          data2.length,
          diff.length,
        ],
        ...result 
      } as Result)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4'>

      <div className='w-96 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4 overflow-auto'>

        <Form<Option>
          className='w-full py-4'
          layout='vertical'
          onFinish={(values) => {
            flushSync(() => setDisabled(true))
            handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          initialValues={{
            expect: 0,
            alpha: 0.05,
            alternative: 'two-sided',
          }}
          disabled={disabled}
        >
          <Form.Item
            label='选择配对变量'
            name='variable1'
            rules={[
              { required: true, message: '请选择配对变量' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === getFieldValue('variable2')) {
                    return Promise.reject('请选择不同的变量')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择配对变量'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='选择配对变量'
            name='variable2'
            rules={[
              { required: true, message: '请选择配对变量' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === getFieldValue('variable1')) {
                    return Promise.reject('请选择不同的变量')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择配对变量'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='检验值'
            name='expect'
            rules={[{ required: true, message: '请输入检验值' }]}
          >
            <Input
              className='w-full'
              placeholder='请输入检验值'
              type='number'
            />
          </Form.Item>
          <Form.Item
            label='显著性水平'
            name='alpha'
            rules={[{ required: true, message: '请输入显著性水平' }]}
          >
            <Input
              className='w-full'
              placeholder='请输入显著性水平'
              type='number'
            />
          </Form.Item>
          <Form.Item
            label='单双尾检验'
            name='alternative'
            rules={[{ required: true, message: '请选择单双尾检验' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择单双尾检验'
            >
              <Select.Option value='two-sided'>双尾检验</Select.Option>
              <Select.Option value='less'>单尾检验(左)</Select.Option>
              <Select.Option value='greater'>单尾检验(右)</Select.Option>
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

      <div className='w-[calc(100%-24rem)] h-full flex flex-col justify-start items-center gap-4 rounded-md border bg-white overflow-auto p-8'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <p className='text-lg mb-2 text-center w-full'>配对样本T检验 ({result.alternative === 'two-sided' ? '双尾' : '单尾'})</p>
            <p className='text-xs mb-3 text-center w-full'>方法: Student's T Test | H<sub>0</sub>: 均值差异={result.expect}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>均值差异</td>
                  <td>自由度</td>
                  <td>t</td>
                  <td>p</td>
                  <td>置信区间 (α={result.alpha})</td>
                  <td>效应量 (Cohen's d)</td>
                  <td>测定系数 (R<sup>2</sup>)</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{(result.mean as number).toFixed(3)}</td>
                  <td>{(result.df as number).toFixed(3)}</td>
                  <td>{generatePResult(result.statistic, result.pValue).statistic}</td>
                  <td>{generatePResult(result.statistic, result.pValue).p}</td>
                  <td>{`[${(result.ci as [number, number])[0].toFixed(3)}, ${(result.ci as [number, number])[1].toFixed(3)})`}</td>
                  <td>{(((result.mean as number) - result.expect) / (result.std as number[])[2]).toFixed(3)}</td>
                  <td>{(((result.statistic as number) ** 2) / (((result.statistic as number) ** 2) + (result.df as number))).toFixed(3)}</td>
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
                  <td>样本量</td>
                  <td>自由度</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{String(result.variable1)}</td>
                  <td>{(result.means as number[])[0].toFixed(3)}</td>
                  <td>{(result.std as number[])[0].toFixed(3)}</td>
                  <td>{(result.count as number[])[0]}</td>
                  <td>{(result.count as number[])[0] - 1}</td>
                </tr>
                <tr>
                  <td>{String(result.variable2)}</td>
                  <td>{(result.means as number[])[1].toFixed(3)}</td>
                  <td>{(result.std as number[])[1].toFixed(3)}</td>
                  <td>{(result.count as number[])[1]}</td>
                  <td>{(result.count as number[])[1] - 1}</td>
                </tr>
                <tr>
                  <td>差异</td>
                  <td>{(result.means as number[])[2].toFixed(3)}</td>
                  <td>{(result.std as number[])[2].toFixed(3)}</td>
                  <td>{(result.count as number[])[2]}</td>
                  <td>{(result.count as number[])[2] - 1}</td>
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