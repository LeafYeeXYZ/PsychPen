import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form } from 'antd'
import { useState } from 'react'
import ttest2 from '@stdlib/stats/ttest2'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'
import { std } from 'mathjs'

type Option = {
  /** 数据变量 */
  dataVar: string
  /** 分组变量 (水平数应为2) */
  groupVar: string
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

export function TwoSampleTTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const data1: number[] = []
      const data2: number[] = []
      const groups = Array.from((new Set(dataRows.map((value) => value[values.groupVar]))).values())
      for (const row of dataRows) {
        if (
          typeof row[values.dataVar] !== 'undefined' 
          && !isNaN(Number(row[values.dataVar]))
          && typeof row[values.groupVar] !== 'undefined'
        ) {
          row[values.groupVar] === groups[0] && data1.push(Number(row[values.dataVar]))
          row[values.groupVar] === groups[1] && data2.push(Number(row[values.dataVar]))
        }
      }
      const result = ttest2(data1, data2, { difference: +values.expect, alpha: +values.alpha, alternative: values.alternative })
      setResult({ 
        dataVar: values.dataVar, 
        groupVar: values.groupVar, 
        expect: +values.expect,
        groups,
        std: [
          Number(std(data1)),
          Number(std(data2)),
        ],
        count: [
          data1.length,
          data2.length,
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

      <div className='w-1/2 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4 overflow-auto'>

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
            label='选择数据变量'
            name='dataVar'
            rules={[
              { required: true, message: '请选择数据变量' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === getFieldValue('groupVar')) {
                    return Promise.reject('请选择不同的变量')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择数据变量'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='选择分组变量'
            name='groupVar'
            rules={[
              { required: true, message: '请选择分组变量' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === getFieldValue('dataVar')) {
                    return Promise.reject('请选择不同的变量')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择分组变量'
            >
              {dataCols.map((col) => col.unique === 2 && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name} (水平数: 2)
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
          <div className='w-max h-full flex flex-col justify-center items-center p-4 overflow-auto'>
           
           <div>
            <p className='text-lg mb-3 text-center w-full'>独立样本T检验 ({result.alternative === 'two-sided' ? '双尾' : '单尾'})</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>均值差异</td>
                  <td>自由度</td>
                  <td>t</td>
                  <td>p</td>
                  <td>置信区间 (α={result.alpha})</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{((result.xmean as number) - (result.ymean as number)).toFixed(3)}</td>
                  <td>{(result.df as number).toFixed(3)}</td>
                  <td>{generatePResult(result.statistic, result.pValue).statistic}</td>
                  <td>{generatePResult(result.statistic, result.pValue).p}</td>
                  <td>{`[${(result.ci as [number, number])[0].toFixed(3)}, ${(result.ci as [number, number])[1].toFixed(3)})`}</td>
                </tr>
              </tbody>
            </table>
            <p className='w-full text-left text-sm pl-2 mt-2 text-gray-800'>
              方法: Student's T Test
            </p>
            <p className='w-full text-left text-sm pl-2 text-gray-800'>
              H<sub>0</sub>: 均值差异={result.expect}
            </p>
            <p className='w-full text-left text-sm pl-2 text-gray-800'>
              缺失值处理: 删除法
            </p>
          </div>
          <div className='mt-10'>
            <p className='text-lg mb-3 text-center w-full'>描述统计</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>组别</td>
                  <td>均值</td>
                  <td>标准差</td>
                  <td>样本量</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{String((result.groups as unknown[])[0])}</td>
                  <td>{(result.xmean as number).toFixed(3)}</td>
                  <td>{(result.std as number[])[0].toFixed(3)}</td>
                  <td>{(result.count as number[])[0]}</td>
                </tr>
                <tr>
                  <td>{String((result.groups as unknown[])[1])}</td>
                  <td>{(result.ymean as number).toFixed(3)}</td>
                  <td>{(result.std as number[])[1].toFixed(3)}</td>
                  <td>{(result.count as number[])[1]}</td>
                </tr>
              </tbody>
              <p className='w-full text-left text-sm pl-2 mt-2 text-gray-800'>
                分组变量: {result.groupVar}
              </p>
            </table>
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