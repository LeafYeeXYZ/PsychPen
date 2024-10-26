import { useZustand } from '../lib/useZustand'
import { Select, Input, Button, Form, Radio } from 'antd'
import { useState } from 'react'
import leveneTest from '@stdlib/stats/levene-test'
import { flushSync } from 'react-dom'
import { generatePResult } from '../lib/utils'

type Option = {
  /** 类别 */
  type: 'peer' | 'independent'
  /** 被试间变量名 */
  variable?: string
  /** 被试内变量名 */
  variables?: string[]
  /** 显著性水平, 默认 0.05 */
  alpha: number
  /** 分组变量 */
  group?: string
}
type Result = {
  F: string,
  p: string,
  df: number[],
  groups: string[],
} & Option

export function LeveneTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      let groups: string[] = []
      let data: number[][] = []
      // 处理被试间变量
      if (values.type === 'independent') {
        const emptyIndex: number[] = []
        groups = Array.from(new Set(dataRows.map((row) => row[values.group!]))).map(String)
        data = groups.map((group) => dataRows
          .filter((row) => row[values.group!] == group)
          .map((row) => row[values.variable!])
          .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
          .map((v) => Number(v))
        ).filter((arr, index) => {
          if (arr.length === 0) {
            emptyIndex.push(index)
            return false
          }
          return true
        })
        groups = groups.filter((_, index) => !emptyIndex.includes(index))
      // 处理被试内变量
      } else {
        groups = values.variables!
        data = (values.variables!).map((variable) => dataRows
          .map((row) => row[variable])
          .filter((v) => typeof v !== 'undefined' && !isNaN(Number(v)))
          .map((v) => Number(v))
        ) // 理论上这里也要过滤掉空数组, 但是正常使用不会出现这种情况, 故为了性能暂不处理
      }
      // @ts-expect-error 类型推断错误, 实际没写错
      const { statistic, pValue, df } = leveneTest.apply(null, [...data, { alpha: values.alpha }])
      const result = generatePResult(statistic, pValue)
      setResult({
        ...values,
        F: result.statistic,
        p: result.p,
        df: df as unknown as number[],
        groups,
      })
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
            expect: 'normal',
            alpha: 0.05,
            alternative: 'two-sided',
            type: 'peer',
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
              label='选择变量(至少两个)'
              name='variables'
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
          ) : (
            <>
              <Form.Item
                label='选择数据变量'
                name='variable'
                rules={[
                  { required: true, message: '请选择数据变量' },
                  { type: 'string', message: '只能选择一个数据变量' },
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

      <div className='component-result'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <p className='text-lg mb-2 text-center w-full'>Levene 检验</p>
            <p className='text-xs mb-3 text-center w-full'>H<sub>0</sub>: 各变量/组满足方差齐性 | 显著性水平(α): {result.alpha}</p>
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
            <p className='text-xs mt-3 text-center w-full'>检验变量/组: {result.groups.sort().join(', ')}</p>

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