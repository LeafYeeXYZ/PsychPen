import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Select, Button, Form, Radio } from 'antd'
import { useState } from 'react'
import { LeveneTest as T } from '@psych/lib'
import { flushSync } from 'react-dom'
import { markP, markS, sleep } from '../../lib/utils'

type Option = {
  /** 类别 */
  type: 'peer' | 'independent'
  /** 被试间变量名 */
  variable?: string
  /** 被试内变量名 */
  variables?: string[]
  /** 分组变量 */
  group?: string
  /** 中心化方法 */
  center: 'mean' | 'median'
}
type Result = {
  m: T
} & Option

export function LeveneTest() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { messageApi } = useStates()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...', 0)
      isLargeData && (await sleep())
      const timestamp = Date.now()
      const { type, variable, variables, group: groups, center } = values
      let group: string[]
      let value: number[]
      // 处理被试间变量
      if (type === 'independent') {
        const filteredRows = dataRows.filter(
          (row) =>
            row[variable!] !== undefined &&
            !isNaN(Number(row[variable!])) &&
            row[groups!] !== undefined,
        )
        group = filteredRows.map((row) => String(row[groups!]))
        value = filteredRows.map((row) => Number(row[variable!]))
      } else {
        group = []
        value = []
        for (const variable of variables!) {
          const filteredRows = dataRows.filter(
            (row) =>
              row[variable] !== undefined && !isNaN(Number(row[variable])),
          )
          filteredRows.forEach((row) => {
            group.push(String(variable))
            value.push(Number(row[variable]))
          })
        }
      }
      const m = new T(value, group, center)
      setResult({
        ...values,
        m,
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
  const [formType, setFormType] = useState<'peer' | 'independent'>('peer')

  return (
    <div className='component-main'>
      <div className='component-form'>
        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          initialValues={{
            center: 'mean',
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
                label='分组变量'
                name='group'
                rules={[{ required: true, message: '请选择分组变量' }]}
              >
                <Select className='w-full' placeholder='请选择分组变量'>
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
            name='center'
            label='中心化方法'
            rules={[{ required: true, message: '请选择中心化方法' }]}
          >
            <Radio.Group
              className='w-full'
              block
              optionType='button'
              buttonStyle='solid'
            >
              <Radio value='mean'>均值</Radio>
              <Radio value='median'>中位数</Radio>
            </Radio.Group>
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
            <p className='text-lg mb-2 text-center w-full'>Levene 检验</p>
            <p className='text-xs mb-3 text-center w-full'>
              H<sub>0</sub>: 各变量/组满足方差齐性
            </p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>自由度</td>
                  <td>F (w)</td>
                  <td>p</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {result.m.dfB}, {result.m.dfW}
                  </td>
                  <td>{markS(result.m.w, result.m.p)}</td>
                  <td>{markP(result.m.p)}</td>
                </tr>
              </tbody>
            </table>

            <p className='text-lg mb-2 mt-8 text-center w-full'>描述统计</p>
            <p className='text-xs mb-3 text-center w-full'>
              中心化方法: {result.center === 'mean' ? '均值' : '中位数'}
            </p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>变量/组</td>
                  <td>样本量</td>
                  <td>原始均值</td>
                  <td>原始中位数</td>
                  <td>中心化均值</td>
                  <td>中心化中位数</td>
                </tr>
              </thead>
              <tbody>
                {result.m.groups.map((group, index) => (
                  <tr key={Math.random()}>
                    <td>{group}</td>
                    <td>{result.m.groupsCount[index]}</td>
                    <td>{result.m.groupsMeanR[index].toFixed(3)}</td>
                    <td>{result.m.groupsMedianR[index].toFixed(3)}</td>
                    <td>{result.m.groupsMeanC[index].toFixed(3)}</td>
                    <td>{result.m.groupsMedianC[index].toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>
              注: 此处中心化指离中心的"距离" (即差异的绝对值)
            </p>
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
