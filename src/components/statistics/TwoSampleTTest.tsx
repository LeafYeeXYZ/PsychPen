import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Select, Input, Button, Form, InputNumber, Space } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { markP, markS, sleep } from '../../lib/utils'
import { TwoSampleTTest as T } from '@psych/lib'

type Option = {
  /** 数据变量 */
  dataVar: string
  /** 分组变量 (水平数应为2) */
  groupVar: string
  /** 检验值, 默认 0 */
  expect: number
  /** 单双尾检验, 默认双尾 */
  twoside: boolean
  /** 显著性水平, 默认 0.05 */
  alpha: number
}
type Result = {
  groups: string[]
  m: T
} & Option

export function TwoSampleTTest() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { messageApi } = useStates()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...', 0)
      isLargeData && (await sleep())
      const timestamp = Date.now()
      const { dataVar, groupVar, expect, twoside, alpha } = values
      const data1: number[] = []
      const data2: number[] = []
      const groups = Array.from(
        new Set(dataRows.map((value) => value[groupVar])).values(),
      )
      for (const row of dataRows) {
        if (
          typeof row[dataVar] !== 'undefined' &&
          !isNaN(Number(row[dataVar])) &&
          typeof row[groupVar] !== 'undefined'
        ) {
          row[groupVar] == groups[0] && data1.push(Number(row[dataVar]))
          row[groupVar] == groups[1] && data2.push(Number(row[dataVar]))
        }
      }
      setResult({
        ...values,
        groups: groups.map(String),
        m: new T(data1, data2, twoside, expect, alpha),
      })
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
          onFinish={async (values) => {
            try {
              flushSync(() => setDisabled(true))
              await handleCalculate(values)
            } finally {
              setDisabled(false)
            }
          }}
          autoComplete='off'
          initialValues={{
            expect: 0,
            twoside: true,
            alpha: 0.05,
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
            <Select className='w-full' placeholder='请选择数据变量'>
              {dataCols.map(
                (col) =>
                  col.type === '等距或等比数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name}
                    </Select.Option>
                  ),
              )}
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
            <Select className='w-full' placeholder='请选择分组变量'>
              {dataCols.map(
                (col) =>
                  col.unique === 2 && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name} (水平数: 2)
                    </Select.Option>
                  ),
              )}
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
          <Form.Item label='单双尾检验和显著性水平'>
            <Space.Compact block>
              <Form.Item
                noStyle
                name='twoside'
                rules={[{ required: true, message: '请选择单双尾检验' }]}
              >
                <Select className='w-full' placeholder='请选择单双尾检验'>
                  <Select.Option value={true}>双尾检验</Select.Option>
                  <Select.Option value={false}>单尾检验</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                name='alpha'
                rules={[{ required: true, message: '请输入显著性水平' }]}
              >
                <InputNumber
                  addonBefore='α ='
                  className='w-full'
                  placeholder='请输入显著性水平'
                  min={0}
                  max={1}
                  step={0.01}
                />
              </Form.Item>
            </Space.Compact>
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
              独立样本T检验 ({result.twoside ? '双尾' : '单尾'})
            </p>
            <p className='text-xs mb-3 text-center w-full'>
              方法: Student's T Test | H<sub>0</sub>: 均值差异={result.expect} |
              显著性水平(α): {result.alpha}
            </p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>均值差异</td>
                  <td>自由度</td>
                  <td>t</td>
                  <td>p</td>
                  <td>{(100 - result.alpha * 100).toFixed(3)}%置信区间</td>
                  <td>效应量 (Cohen's d)</td>
                  <td>
                    测定系数 (R<sup>2</sup>)
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.m.meanDiff.toFixed(3)}</td>
                  <td>{result.m.df.toFixed(3)}</td>
                  <td>{markS(result.m.t, result.m.p)}</td>
                  <td>{markP(result.m.p)}</td>
                  <td>{`[${result.m.ci[0].toFixed(3)}, ${result.m.ci[1].toFixed(3)})`}</td>
                  <td>{result.m.cohenD.toFixed(3)}</td>
                  <td>{result.m.r2.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>

            <p className='text-lg mb-2 text-center w-full mt-8'>描述统计</p>
            <p className='text-xs mb-3 text-center w-full'>
              分组变量: {result.groupVar}
            </p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>组别</td>
                  <td>均值</td>
                  <td>标准差</td>
                  <td>样本量</td>
                  <td>自由度</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.groups[0]}</td>
                  <td>{result.m.meanA.toFixed(3)}</td>
                  <td>{result.m.stdA.toFixed(3)}</td>
                  <td>{result.m.dfA + 1}</td>
                  <td>{result.m.dfA}</td>
                </tr>
                <tr>
                  <td>{result.groups[1]}</td>
                  <td>{result.m.meanB.toFixed(3)}</td>
                  <td>{result.m.stdB.toFixed(3)}</td>
                  <td>{result.m.dfB + 1}</td>
                  <td>{result.m.dfB}</td>
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
