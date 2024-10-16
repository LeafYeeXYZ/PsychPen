import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import kstest from '@stdlib/stats/kstest'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { mean, std, min, max } from 'mathjs'

type Option = {
  /** 变量名 */
  variable: string[]
  /** 检验分布 */
  expect: string
  /** 显著性水平, 默认 0.05 */
  alpha: number
  /** 单双尾检验, 默认 two-sided */
  alternative: 'two-sided' | 'less' | 'greater'
}
type Result = {
  data: {
    name: string,
    count: number
    D: string,
    p: string,
  }[]
} & Option

// 记得还要修改 handleCalculate 函数中的 switch case
const DISTRIBUTIONS: { 
  en: string, 
  cn: string,
}[] = [
  { en: 'normal', cn: '正态分布' },
  { en: 'uniform', cn: '连续均匀分布' },
]

export function KolmogorovSmirnovTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const data: number[][] = values.variable.map((variable) => dataRows
        .map((row) => row[variable])
        .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
        .map((v) => Number(v))
      )
      const result = data.map((arr, index) => {
        const result = {
          name: values.variable[index],
          count: arr.length,
          D: '',
          p: '',
        }
        switch (values.expect) {
          case 'normal': {
            const _mean = mean(arr)
            const _std = Number(std(arr))
            const { pValue, statistic } = kstest(arr.map((v) => ((v - _mean) / _std)), 'normal' ,0 ,1 ,{
              alpha: values.alpha,
              alternative: values.alternative,
            })
            const text = generatePResult(statistic, pValue)
            result.D = text.statistic
            result.p = text.p
            break
          }
          case 'uniform': {
            const { pValue, statistic } = kstest(arr, 'uniform', min(arr), max(arr), {
              alpha: values.alpha,
              alternative: values.alternative,
            })
            const text = generatePResult(statistic, pValue)
            result.D = text.statistic
            result.p = text.p
            break
          }
        }
        return result
      })
      setResult({
        ...values,
        data: result
      })
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4'>

      <div className='w-96 h-full flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4 overflow-auto'>

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
            expect: 'normal',
            alpha: 0.05,
            alternative: 'two-sided',
          }}
          disabled={disabled}
        >
          <Form.Item
            label='选择变量 (可多选)'
            name='variable'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量 (可多选)'
              mode='tags'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='检验分布'
            name='expect'
            rules={[{ required: true, message: '请选择检验分布' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择检验分布'
            >
              {DISTRIBUTIONS.map((dist) => (
                <Select.Option key={dist.en} value={dist.en}>
                  {dist.cn}
                </Select.Option>
              ))}
            </Select>
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
              <Select.Option value='two-sided'>双尾检验(分布相同)</Select.Option>
              <Select.Option value='less'>单尾检验(小于)</Select.Option>
              <Select.Option value='greater'>单尾检验(大于)</Select.Option>
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

            <p className='text-lg mb-2 text-center w-full'>单样本 Kolmogorov-Smirnov 检验 ({result.alternative === 'two-sided' ? '双尾' : '单尾'})</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 变量满足{DISTRIBUTIONS.find((dist) => dist.en === result.expect)?.cn} | 显著性水平(α): {result.alpha}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>变量</td>
                  <td>样本量</td>
                  <td>D</td>
                  <td>p</td>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                    <td>{row.D}</td>
                    <td>{row.p}</td>
                  </tr>
                ))}
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