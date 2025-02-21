import { useZustand } from '../../lib/useZustand'
import { Select, Button, Form, Radio } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { markP, markS } from '../../lib/utils'
import { KurtosisTest, SkewnessTest } from '@psych/lib'

type Option = {
  /** 类型 */
  type: 'independent' | 'paired'
  /** 被试内变量名 */
  variables?: string[]
  /** 被试间变量名 */
  variable?: string
  /** 分组 */
  group?: string
}
type Result = {
  kurtosis: KurtosisTest[]
  skewness: SkewnessTest[]
  labels: string[]
  counts: number[]
} & Option

export function KurtosisSkewness() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { variables, variable, group, type } = values
      if (type === 'paired') {
        const data: number[][] = (variables!).map((variable) => dataRows
          .map((row) => row[variable])
          .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
          .map((v) => Number(v))
        )
        const k = data.map((arr) => new KurtosisTest(arr))
        const s = data.map((arr) => new SkewnessTest(arr))
        setResult({ kurtosis: k, skewness: s, labels: variables!, counts: data.map((arr) => arr.length), ...values })
      } else {
        const groups = Array.from(new Set(dataRows.map((row) => row[group!]))).map(String)
        const data: number[][] = groups.map((g) => dataRows
          .filter((row) => row[group!] === g)
          .map((row) => row[variable!])
          .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
          .map((v) => Number(v))
        )
        const k = data.map((arr) => new KurtosisTest(arr))
        const s = data.map((arr) => new SkewnessTest(arr))
        setResult({ kurtosis: k, skewness: s, labels: groups, counts: data.map((arr) => arr.length), ...values })
      }
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  const [type, setType] = useState<'independent' | 'paired'>('paired')

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
            type: 'paired',
          }}
          disabled={disabled}
        >
          <Form.Item
            name='type'
            label='待检验变量类型'
            rules={[{ required: true, message: '请选择待检验变量类型' }]}
          >
            <Radio.Group
              className='w-full'
              block
              onChange={(e) => setType(e.target.value)}
              optionType='button'
              buttonStyle='solid'
            >
              <Radio value='paired'>被试内变量</Radio>
              <Radio value='independent'>被试间变量</Radio>
            </Radio.Group>
          </Form.Item>
          {type === 'paired' ? (
            <Form.Item
              label='变量(可多选)'
              name='variables'
              rules={[ { required: true, message: '请选择变量' } ]}
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
          ) : (
            <>
              <Form.Item
                label='数据变量'
                name='variable'
                rules={[ { required: true, message: '请选择数据变量' } ]}
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
                label='分组变量'
                name='group'
                rules={[{ required: true, message: '请选择分组变量' }]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择分组变量'
                >
                  {dataCols.map((col) => (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name} (水平数: {col.unique})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
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

            <p className='text-lg mb-2 text-center w-full'>峰度和偏度检验</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 峰度/偏度等于零 | 显著性水平(α): 0.05</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>{result.type === 'paired' ? '变量' : '组别'}</td>
                  <td>样本量</td>
                  <td>峰度</td>
                  <td>z</td>
                  <td>p</td>
                  <td>偏度</td>
                  <td>z</td>
                  <td>p</td>
                </tr>
              </thead>
              <tbody>
                {result.labels.map((label, i) => (
                  <tr key={i}>
                    <td>{label}</td>
                    <td>{result.counts[i]}</td>
                    <td>{result.kurtosis[i].kurtosis.toFixed(3)}</td>
                    <td>{markS(result.kurtosis[i].z, result.kurtosis[i].p)}</td>
                    <td>{markP(result.kurtosis[i].p)}</td>
                    <td>{result.skewness[i].skewness.toFixed(3)}</td>
                    <td>{markS(result.skewness[i].z, result.skewness[i].p)}</td>
                    <td>{markP(result.skewness[i].p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.type === 'independent' && (<p className='text-xs mt-3 text-center w-full'>分组变量: {result.group}</p>)}

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