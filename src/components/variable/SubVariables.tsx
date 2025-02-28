import { useZustand } from '../../lib/useZustand'
import { Button, Select, Form, Tag, InputNumber, Space } from 'antd'
import { flushSync } from 'react-dom'
import { useState } from 'react'

type Option = {
  /** 变量名 */
  variables: string[]
  /** 子变量 */
  subVars?: string[]

  /** 离散化算法 */
  discretizeMethod?: '等宽' | '等频' | '聚类分析'
  /** 离散化分组数 */
  discretizeGroups?: number
}

const ALLOW_SUBVARS: {
  en: string
  cn: string
}[] = [
  { en: 'standard', cn: '标准化' },
  { en: 'center', cn: '中心化' },
  { en: 'discretize', cn: '离散化' },
]

export function SubVariables() {
  const {
    dataCols,
    messageApi,
    isLargeData,
    disabled,
    setDisabled,
    _VariableView_updateData,
  } = useZustand()

  // 定义子变量
  const [showDiscretize, setShowDiscretize] = useState(false)
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      const cols = dataCols.map((col) => {
        if (values.variables.includes(col.name)) {
          return {
            ...col,
            subVars: values.subVars
              ? {
                  standard: values.subVars.includes('standard'),
                  center: values.subVars.includes('center'),
                  discrete: values.subVars.includes('discretize')
                    ? {
                        method: values.discretizeMethod!,
                        groups: values.discretizeGroups!,
                      }
                    : undefined,
                }
              : undefined,
          }
        } else {
          return col
        }
      })
      _VariableView_updateData(cols)
      messageApi?.destroy()
      messageApi?.success(
        `数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
        1,
      )
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(
        `数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    <div className='component-main variable-view'>
      <div className='component-form'>
        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleFinish(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
        >
          <Form.Item
            label='源变量(可多选)'
            name='variables'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
              options={dataCols
                .filter((col) => col.derived !== true)
                .filter((col) => col.type === '等距或等比数据')
                .map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item label='子变量(可多选/留空)' name='subVars'>
            <Select
              mode='multiple'
              className='w-full'
              placeholder='请选择子变量'
              options={ALLOW_SUBVARS.map((subVar) => ({
                label: subVar.cn,
                value: subVar.en,
              }))}
              onChange={(value) =>
                setShowDiscretize(value.includes('discretize'))
              }
            />
          </Form.Item>
          {showDiscretize && (
            <Form.Item label='离散化方法和分组数'>
              <Space.Compact block>
                <Form.Item
                  noStyle
                  name='discretizeMethod'
                  rules={[{ required: true, message: '请选择离散化方法' }]}
                >
                  <Select
                    className='w-full'
                    placeholder='请选择离散化方法'
                    options={[
                      { label: '等宽', value: '等宽' },
                      { label: '等频', value: '等频' },
                      { label: '聚类分析', value: '聚类分析' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  name='discretizeGroups'
                  rules={[{ required: true, message: '请输入离散化分组数' }]}
                >
                  <InputNumber
                    className='w-full'
                    addonAfter='组'
                    addonBefore='离散为'
                    placeholder='请输入'
                    min={2}
                    step={1}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          )}
          <Form.Item>
            <Button
              className='mt-4'
              htmlType='submit'
              disabled={disabled}
              block
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className='component-result variable-view'>
        <p className='intro-text'>在数据分析中, 有时需要对原始数据进行处理</p>
        <p className='intro-text'>
          标准化是指把 <Tag>x</Tag>转换为 <Tag>(x - μ) / σ</Tag>,
          从而让数据的均值为0, 方差为1
        </p>
        <p className='intro-text'>
          中心化是指把 <Tag>x</Tag>转换为 <Tag>x - μ</Tag>, 从而让数据的均值为0,
          方差不变
        </p>
        <p className='intro-text'>两种处理均不会改变数据的分布形状</p>
        <p className='intro-text'>
          离散化是指把数据转换为分类数据, 分为等宽、等频和聚类分析{' '}
          <Tag>k-means</Tag> 三种方法
        </p>
        <p className='intro-text'>
          进行这些操作时, <b>PsychPen 不会改变原始数据, 而是生成新的子变量</b>
        </p>
      </div>
    </div>
  )
}
