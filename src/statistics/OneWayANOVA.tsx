import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { markP, markS } from '../lib/utils'
import { OneWayAnova, std } from '@psych/lib'
import type { ScheffeResult, BonferroniResult } from '@psych/lib'

type Option = {
  /** 因变量 */
  value: string
  /** 分组变量 */
  group: string
  /** 事后检验方法 */
  method: ('Scheffe' | 'Bonferroni')[]
}
const METHODS = {
  Scheffe: 'Scheffe 事后检验',
  Bonferroni: 'Bonferroni 事后检验',
}
type Result = {
  m: OneWayAnova
  scheffe?: ScheffeResult[]
  bonferroni?: BonferroniResult[]
} & Option

export function OneWayANOVA() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { value, group, method } = values
      const filteredRows = dataRows.filter((row) => typeof row[value] !== 'undefined' && !isNaN(Number(row[value])) && typeof row[group] !== 'undefined')
      const valueData = filteredRows.map((row) => Number(row[value]))
      const groupData = filteredRows.map((row) => String(row[group]))
      const result = new OneWayAnova(valueData, groupData)
      setResult({
        ...values,
        m: result,
        scheffe: method && (method.includes('Scheffe') ? result.scheffe() : undefined),
        bonferroni: method && (method.includes('Bonferroni') ? result.bonferroni() : undefined),
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
          onFinish={(values) => {
            flushSync(() => setDisabled(true))
            handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
        >
          <Form.Item
            label='因变量'
            name='value'
            rules={[
              { required: true, message: '请选择因变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('group')) {
                    return Promise.reject('因变量和分组变量不能相同')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择因变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ value: col.name, label: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label='分组变量'
            name='group'
            rules={[
              { required: true, message: '请选择分组变量' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (value === getFieldValue('value')) {
                    return Promise.reject('因变量和分组变量不能相同')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择分组变量'
              options={dataCols.map((col) => ({ value: col.name, label: `${col.name} (水平数: ${col.unique})` }))}
            />
          </Form.Item>
          <Form.Item
            label='事后检验方法(可多选/留空)'
            name='method'
          >
            <Select
              className='w-full'
              placeholder='请选择事后检验方法'
              mode='multiple'
              options={Object.entries(METHODS).map(([value, label]) => ({ value, label }))}
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

      <div className='component-result'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <p className='text-lg mb-2 text-center w-full'>单因素方差分析</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 各组均值相等</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>样本量</td>
                  <td>水平数</td>
                  <td>自由度 (组间/组内)</td>
                  <td>F</td>
                  <td>p</td>
                  <td>η²</td>
                  <td>Conhen's f</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.m.dfT + 1}</td>
                  <td>{result.m.dfB + 1}</td>
                  <td>{result.m.dfB} / {result.m.dfW}</td>
                  <td>{markS(result.m.f, result.m.p)}</td>
                  <td>{markP(result.m.p)}</td>
                  <td>{result.m.r2.toFixed(3)}</td>
                  <td>{result.m.cohenF.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>因变量: {result.value} | 分组变量: {result.group}</p>

            <p className='text-lg mb-2 text-center w-full mt-8'>分析细节</p>
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
                  <td>{result.m.SSt.toFixed(3)}</td>
                  <td>{result.m.MSt.toFixed(3)}</td>
                </tr>
                <tr>
                  <td>组间 (B)</td>
                  <td>{result.m.dfB}</td>
                  <td>{result.m.SSb.toFixed(3)}</td>
                  <td>{result.m.MSb.toFixed(3)}</td>
                </tr>
                <tr>
                  <td>组内 (W)</td>
                  <td>{result.m.dfW}</td>
                  <td>{result.m.SSw.toFixed(3)}</td>
                  <td>{result.m.MSw.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>
            
            <p className='text-lg mb-2 text-center w-full mt-8'>分组描述统计</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>组别</td>
                  <td>计数</td>
                  <td>均值</td>
                  <td>标准差</td>
                  <td>总和</td>
                </tr>
              </thead>
              <tbody>
                {result.m.groups.map((group, index) => (
                  <tr key={group}>
                    <td>{group}</td>
                    <td>{result.m.groupsCount[index]}</td>
                    <td>{result.m.groupsMean[index].toFixed(3)}</td>
                    <td>{std(result.m.values[index], true, result.m.groupsMean[index]).toFixed(3)}</td>
                    <td>{result.m.groupsSum[index].toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {result.scheffe && (
              <>
                <p className='text-lg mb-2 text-center w-full mt-8'>Scheffe 事后检验</p>
                <table className='three-line-table'>
                  <thead>
                    <tr>
                      <td>组A</td>
                      <td>组B</td>
                      <td>均值差异</td>
                      <td>F</td>
                      <td>p</td>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scheffe.map((row) => (
                      <tr key={Math.random()}>
                        <td>{row.groupA}</td>
                        <td>{row.groupB}</td>
                        <td>{row.diff.toFixed(3)}</td>
                        <td>{row.f.toFixed(3)}</td>
                        <td>{markP(row.p)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className='text-xs mt-3 text-center w-full'>分组变量: {result.group}</p>
              </>
            )}

            {result.bonferroni && (
              <>
                <p className='text-lg mb-2 text-center w-full mt-8'>Bonferroni 事后检验</p>
                <table className='three-line-table'>
                  <thead>
                    <tr>
                      <td>组A</td>
                      <td>组B</td>
                      <td>均值差异</td>
                      <td>t</td>
                      <td>p</td>
                    </tr>
                  </thead>
                  <tbody>
                    {result.bonferroni.map((row) => (
                      <tr key={Math.random()}>
                        <td>{row.groupA}</td>
                        <td>{row.groupB}</td>
                        <td>{row.diff.toFixed(3)}</td>
                        <td>{row.t.toFixed(3)}</td>
                        <td className={row.p < row.sig ? 'text-red-500' : ''}>
                          {row.p.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className='text-xs mt-3 text-center w-full'>分组变量: {result.group} | 使用 MS<sub>within</sub> 代替 S<sub>p</sub><sup>2</sup> (检验更严格)</p>
                <p className='text-xs mt-2 text-center w-full'>临界显著性水平应为: <span className='text-red-500'>{result.bonferroni[0].sig.toFixed(4)}</span> (即 0.05 除以成对比较次数)</p>
              </>
            )}

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