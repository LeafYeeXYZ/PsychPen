import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import { ttest } from '@stdlib/stats'
import { flushSync } from 'react-dom'

type Option = {
  /** 变量名 */
  variable: string
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

export function OneSampleTTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const data = dataRows
        .map((row) => row[values.variable])
        .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
        .map((v) => Number(v))
      const result = ttest(data, { mu: +values.expect, alpha: +values.alpha, alternative: values.alternative })
      setResult({ variable: values.variable, expect: +values.expect, ...result } as Result)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4'>

      <div className='w-1/2 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4'>

        <Form<Option>
          className='w-full'
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
            label='选择变量'
            name='variable'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
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

      <div className='w-full h-full flex flex-col justify-start items-center gap-4 rounded-md border bg-white overflow-auto p-4'>

        {result ? (
          <div className='w-full h-full flex flex-col justify-start items-center gap-4 p-4'>
            <div key='header' className='w-72 flex justify-between items-center border-t-[2px] border-b-[1px] border-black p-2'>
              <span>统计量</span>
              <span>值</span>
            </div>
            {Object.keys(result).map((key) => !(result[key] instanceof Function) && (
              <div key={key} className='w-72 flex justify-between items-center px-2'>
                <span>{key}</span>
                <span>{
                  typeof result[key] === 'number' ? result[key].toFixed(4) :
                  typeof result[key] === 'string' ? result[key] :
                  typeof result[key] === 'boolean' ? String(result[key]) :
                  result[key] instanceof Array ? result[key].map((v) => +v.toFixed(4)).join(', ') :
                  ''
                }</span>
              </div>
            ))}
            <div key='footer' className='w-72 flex justify-between items-center border-t-[2px] border-black py-2' />
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