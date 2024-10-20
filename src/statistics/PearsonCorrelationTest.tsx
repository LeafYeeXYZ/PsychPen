import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import pearsonTest from '@stdlib/stats/pcorrtest'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'

type Option = {
  /** 变量名 */
  variable: string[]
  /** 显著性水平, 默认 0.05 */
  alpha: number
  /** 单双尾检验, 默认 two-sided */
  alternative: 'two-sided' | 'less' | 'greater'
}
type Result = {
  data: {
    peer: string[]
    r: string
    p: string
    t: string
    df: number
    /** 95%置信区间 */
    ci: string
  }[]
} & Option

export function PearsonCorrelationTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const filteredRows = dataRows.filter((row) => values.variable.every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const results: Result['data'] = []
      for (let i = 0; i < values.variable.length - 1; i++) {
        for (let j = i + 1; j < values.variable.length; j++) {
          const data = [values.variable[i], values.variable[j]].map((variable) => filteredRows.map((row) => Number(row[variable])))
          const result = pearsonTest(data[0], data[1], {
            alpha: values.alpha,
            alternative: values.alternative,
          })
          const r = generatePResult(result.pcorr, result.pValue)
          const t = generatePResult(result.statistic, result.pValue)
          results.push({
            peer: [values.variable[i], values.variable[j]],
            r: r.statistic,
            t: t.statistic,
            p: r.p,
            df: data[0].length - 2,
            ci: `[${result.ci[0].toFixed(3)}, ${result.ci[1].toFixed(3)})`,
          })
        }
      }
      setResult({
        ...values,
        data: results,
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
            label='选择变量(至少两个)'
            name='variable'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, message: '至少选择两个变量' },
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
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

            <p className='text-lg mb-2 text-center w-full'>Pearson 相关系数检验</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 两个变量的相关系数{result.alternative === 'two-sided' ? '等于' : result.alternative === 'less' ? '小于' : '大于'}零 | 显著性水平(α): {result.alpha}</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>配对变量A</td>
                  <td>配对变量B</td>
                  <td>相关系数(r)</td>
                  <td>95%置信区间</td>
                  <td>t</td>
                  <td>p</td>
                  <td>自由度</td>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.peer[0]}</td>
                    <td>{row.peer[1]}</td>
                    <td>{row.r}</td>
                    <td>{row.ci}</td>
                    <td>{row.t}</td>
                    <td>{row.p}</td>
                    <td>{row.df}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className='text-lg mb-3 mt-8 text-center w-full'>相关系数矩阵</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td></td>
                  {result.variable.map((variable) => (
                    <td key={variable}>{variable}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.variable.map((variableA, indexA) => (
                  <tr key={variableA}>
                    <td>{variableA}</td>
                    {result.variable.map((variableB, indexB) => (
                      <td key={variableB}>{indexA === indexB ? '-' : result.data.find((row) => row.peer.includes(variableA) && row.peer.includes(variableB))?.r}</td>
                    ))}
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