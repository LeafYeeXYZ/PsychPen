import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import leveneTest from '@stdlib/stats/levene-test'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'

type Option = {
  /** 变量名 */
  variable: string[]
  /** 显著性水平, 默认 0.05 */
  alpha: number
}
type Result = {
  F: string,
  p: string,
  df: number[],
} & Option

export function LeveneTest() {

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
      // @ts-expect-error 类型推断错误, 实际没写错
      const { statistic, pValue, df } = leveneTest.apply(null, [...data, { alpha: values.alpha }])
      const result = generatePResult(statistic, pValue)
      setResult({
        ...values,
        F: result.statistic,
        p: result.p,
        df: df as unknown as number[],
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
            label='选择变量 (至少两个)'
            name='variable'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, message: '至少选择两个变量' },
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
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

            <p className='text-lg mb-2 text-center w-full'>Levene 检验</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 各组满足方差齐性 | 显著性水平(α): {result.alpha}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>自由度</td>
                  <td>F</td>
                  <td>p</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.df.join(', ')}</td>
                  <td>{result.F}</td>
                  <td>{result.p}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>检验变量: {result.variable.join(', ')}</p>

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