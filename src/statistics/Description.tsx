import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, Radio } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { min, max, mean, quantile, std, mode } from '@psych/lib'

type AvialableStat = 'min' | 'max' | 'mean' | 'mode' | 'q1' | 'q2' | 'q3' | 'std' | 'count' | 'unique'

const STAT_OPTIONS: { value: AvialableStat, label: string }[] = [
  { value: 'count', label: '有效值数' },
  { value: 'unique', label: '唯一值数' },
  { value: 'mean', label: '均值' },
  { value: 'std', label: '标准差' },
  { value: 'q1', label: 'Q1(25%分位数)' },
  { value: 'q2', label: 'Q2(中位数)' },
  { value: 'q3', label: 'Q3(75%分位数)' },
  { value: 'mode', label: '众数' },
  { value: 'min', label: '最小值' },
  { value: 'max', label: '最大值' },
]

type Option = {
  /** 类别 */
  type: 'peer' | 'independent'
  /** 被试间变量名 */
  variable?: string
  /** 分组变量 */
  group?: string
  /** 被试内变量名 */
  variables?: string[]
  /** 统计量 */
  statistic: AvialableStat[]
}
type Result = {
  /** 类别 */
  type: 'peer' | 'independent'
  /** 被试间变量名 */
  variable?: string
  /** 分组变量 */
  group?: string
  /** 描述性数据 */
  data: { 
    /** 变量名/组名 */
    var: string, 
    /** 统计量 */
    data: { value: string | number, label: string }[] 
  }[]
}

export function Description() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { type, variable, group, variables, statistic } = values
      if (type === 'peer') {
        const data = variables!.map((vari) => {
          const rows = dataRows
            .map((row) => row[vari])
            .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
            .map((v) => Number(v))
          const data = statistic.map((stat) => {
            switch (stat) {
              case 'min': return { value: +min(rows).toFixed(4), label: '最小值' }
              case 'max': return { value: +max(rows).toFixed(4), label: '最大值' }
              case 'mean': return { value: +mean(rows).toFixed(4), label: '均值' }
              case 'mode': return { value: +mode(rows).toFixed(4), label: '众数' }
              case 'q1': return { value: +quantile(rows, 0.25).toFixed(4), label: 'Q1(25%分位数)' }
              case 'q2': return { value: +quantile(rows, 0.5).toFixed(4), label: 'Q2(中位数)' }
              case 'q3': return { value: +quantile(rows, 0.75).toFixed(4), label: 'Q3(75%分位数)' }
              case 'std': return { value: +std(rows).toFixed(4), label: '标准差' }
              case 'count': return { value: rows.length, label: '有效值数' }
              case 'unique': return { value: new Set(rows).size, label: '唯一值数' }
            }
          })
          return { var: vari, data }
        })
        setResult({ type, data })
      } else {
        const groups = Array.from(new Set(dataRows.map((row) => row[group!])))
        const data = groups.map((g) => {
          const rows = dataRows
            .filter((row) => row[group!] === g)
            .map((row) => row[variable!])
            .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
            .map((v) => Number(v))
          const data = statistic.map((stat) => {
            switch (stat) {
              case 'min': return { value: +min(rows).toFixed(4), label: '最小值' }
              case 'max': return { value: +max(rows).toFixed(4), label: '最大值' }
              case 'mean': return { value: +mean(rows).toFixed(4), label: '均值' }
              case 'mode': return { value: +mode(rows).toFixed(4), label: '众数' }
              case 'q1': return { value: +quantile(rows, 0.25).toFixed(4), label: 'Q1(25%分位数)' }
              case 'q2': return { value: +quantile(rows, 0.5).toFixed(4), label: 'Q2(中位数)' }
              case 'q3': return { value: +quantile(rows, 0.75).toFixed(4), label: 'Q3(75%分位数)' }
              case 'std': return { value: +std(rows).toFixed(4), label: '标准差' }
              case 'count': return { value: rows.length, label: '有效值数' }
              case 'unique': return { value: new Set(rows).size, label: '唯一值数' }
            }
          })
          return { var: String(g), data }
        })
        setResult({ type, variable, group, data: data.sort((a, b) => a.var > b.var ? 1 : -1)})
      }
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  const [formType, setFormType] = useState<'peer' | 'independent'>('peer')

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
          initialValues={{
            type: 'peer',
          }}
          disabled={disabled}
        >
          <Form.Item
            name='type'
            label='待描述统计的变量类型'
            rules={[{ required: true, message: '请选择待描述统计的变量类型' }]}
          >
            <Radio.Group
              className='w-full'
              block
              onChange={(e) => setFormType(e.target.value)}
              optionType='button'
              buttonStyle='solid'
            >
              <Radio value='peer'>被试内变量</Radio>
              <Radio value='independent'>被试间变量</Radio>
            </Radio.Group>
          </Form.Item>
          {formType === 'peer' ? (
            <Form.Item
              label='选择变量(可多选)'
              name='variables'
              rules={[
                { required: true, message: '请选择变量' },
              ]}
            >
              <Select
                className='w-full'
                placeholder='请选择变量'
                mode='multiple'
                options={dataCols
                  .filter((col) => col.type === '等距或等比数据')
                  .map((col) => ({ value: col.name, label: col.name }))
                }
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                label='选择数据变量'
                name='variable'
                rules={[
                  { required: true, message: '请选择数据变量' },
                ]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择数据变量'
                  options={dataCols
                    .filter((col) => col.type === '等距或等比数据')
                    .map((col) => ({ value: col.name, label: col.name }))
                  }
                />
              </Form.Item>
              <Form.Item
                label='分组变量'
                name='group'
                rules={[{ required: true, message: '请选择分组变量' }]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择分组变量'
                  options={dataCols
                    .map((col) => ({ value: col.name, label: `${col.name} (水平数: ${col.unique})` }))
                  }
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            label='描述统计量(可多选)'
            name='statistic'
            rules={[{ required: true, message: '请选择描述统计量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择描述统计量'
              mode='multiple'
              options={STAT_OPTIONS}
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

            <p className='text-lg mb-2 text-center w-full'>描述统计</p>
            <p className='text-xs mb-3 text-center w-full'>{
              result.type === 'peer' ? 
                `被试内变量: ${result.data.map((d) => d.var).join(', ')}`
              : `被试间变量: ${result.variable} | 分组变量: ${result.group} (${result.data.map((d) => d.var).join(', ')})`
            }</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td key='header-var'>
                    {result.type === 'peer' ? '变量' : '组别'}
                  </td>
                  {result.data[0].data.map((d) => (
                    <td key={Math.random()}>
                      {d.label}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((d) => (
                  <tr key={Math.random()}>
                    <td key={Math.random()}>
                      {d.var}
                    </td>
                    {d.data.map((v) => (
                      <td key={Math.random()}>
                        {v.value}
                      </td>
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