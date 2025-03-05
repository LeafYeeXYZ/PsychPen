import { useZustand } from '../../lib/useZustand'
import {
  Button,
  Select,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
} from 'antd'
import type { FormInstance } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { ALLOWED_FILTER_METHODS } from '../../types'

type Option = {
  /** 变量名 */
  variable: string
  /** 过滤方法 */
  method?: ALLOWED_FILTER_METHODS
  /** 过滤参考值 */
  value?: (number | string)[] | (string | number)
  /** 过滤区间 */
  rangeMin?: number
  rangeMax?: number
  /** 过滤正则表达式 */
  regex?: string
}

const FILTER_METHODS = Object.values(ALLOWED_FILTER_METHODS)

export function DataFilter() {
  const {
    dataCols,
    dataRows,
    messageApi,
    isLargeData,
    disabled,
    setDisabled,
    _VariableView_updateData,
  } = useZustand()
  const [form] = Form.useForm()
  const handleClear = async () => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      await _VariableView_updateData(
        dataCols.map((col) => ({
          ...col,
          filterMethod: undefined,
          filterValue: undefined,
          filterRange: undefined,
          filterRegex: undefined,
        })),
      )
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
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      const cols = dataCols.map((col) => {
        if (values.variable === col.name) {
          return {
            ...col,
            filterMethod: values.method,
            filterValue:
              values.value === undefined
                ? undefined
                : Array.isArray(values.value)
                  ? values.value
                  : [values.value],
            filterRange:
              values.rangeMin !== undefined && values.rangeMax !== undefined
                ? ([values.rangeMin, values.rangeMax] as [number, number])
                : undefined,
            filterRegex: values.regex,
          }
        } else {
          return col
        }
      })
      await _VariableView_updateData(cols)
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
  const [step2Options, setStep2Options] = useState<
    { label: string; value: string }[]
  >([])
  const [step2Key, setStep2Key] = useState<string>('default')
  const [step3Element, setStep3Element] = useState<React.ReactElement | null>(
    null,
  )
  const getStep3Element = (
    method: ALLOWED_FILTER_METHODS,
    form: FormInstance<Option>,
  ): React.ReactElement | null => {
    if (
      method === ALLOWED_FILTER_METHODS.GREATER_THAN ||
      method === ALLOWED_FILTER_METHODS.GREATER_THAN_OR_EQUAL ||
      method === ALLOWED_FILTER_METHODS.LESS_THAN ||
      method === ALLOWED_FILTER_METHODS.LESS_THAN_OR_EQUAL
    ) {
      return (
        <Form.Item
          label='过滤参考值'
          name='value'
          rules={[{ required: true, message: '请输入参考值' }]}
        >
          <InputNumber
            className='w-full'
            addonBefore={`只保留${method}`}
            addonAfter='的数据'
          />
        </Form.Item>
      )
    } else if (method === ALLOWED_FILTER_METHODS.RANGE) {
      return (
        <Form.Item label='过滤参考区间'>
          <Space.Compact block>
            <Form.Item
              noStyle
              name='rangeMin'
              rules={[
                { required: true, message: '请输入区间下限' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      value === undefined ||
                      getFieldValue('rangeMax') === undefined ||
                      value < getFieldValue('rangeMax')
                    ) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('区间下限必须小于上限'))
                  },
                }),
              ]}
            >
              <InputNumber
                placeholder='请输入'
                className='w-full'
                addonBefore='下限为'
              />
            </Form.Item>
            <Form.Item
              noStyle
              name='rangeMax'
              rules={[
                { required: true, message: '请输入区间上限' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      value === undefined ||
                      getFieldValue('rangeMin') === undefined ||
                      value > getFieldValue('rangeMin')
                    ) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('区间上限必须大于下限'))
                  },
                }),
              ]}
            >
              <InputNumber
                placeholder='请输入'
                className='w-full'
                addonBefore='上限为'
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
      )
    } else if (method === ALLOWED_FILTER_METHODS.REGEX) {
      return (
        <Form.Item
          label='过滤正则表达式'
          name='regex'
          rules={[{ required: true, message: '请输入正则表达式' }]}
        >
          <Input className='w-full' />
        </Form.Item>
      )
    } else if (
      method === ALLOWED_FILTER_METHODS.ABOVE_MEAN ||
      method === ALLOWED_FILTER_METHODS.BELOW_MEAN ||
      method === ALLOWED_FILTER_METHODS.ABOVE_MEDIAN ||
      method === ALLOWED_FILTER_METHODS.BELOW_MEDIAN
    ) {
      return null
    } else if (method === ALLOWED_FILTER_METHODS.EQUAL || method === ALLOWED_FILTER_METHODS.NOT_EQUAL) {
      const variable = form.getFieldValue('variable')
      const options = Array.from(new Set(dataRows.map((row) => row[variable])))
        .sort((a, b) => Number(a) - Number(b))
        .map((value) => ({ label: String(value), value }))
      return (
        <Form.Item
          label='过滤参考值(可多选)'
          name='value'
          rules={[{ required: true, message: '请输入参考值' }]}
        >
          <Select
            className='w-full'
            placeholder='请选择参考值'
            mode='tags'
            options={options}
          />
        </Form.Item>
      )
    }
    return null
  }

  return (
    <div className='component-main variable-view'>
      <div className='component-form'>
        <Form<Option>
          form={form}
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
            label='变量名'
            name='variable'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              allowClear
              options={dataCols
                .filter((col) => col.derived !== true)
                .map((col) => ({ label: col.name, value: col.name }))}
              onChange={(value) => {
                if (!dataCols.some((col) => col.name === value)) {
                  setStep2Options([])
                  setStep2Key('default')
                  return
                } else if (
                  dataCols.find((col) => col.name === value)!.type ===
                  '等距或等比数据'
                ) {
                  setStep2Options(
                    FILTER_METHODS.map((method) => ({
                      label: method,
                      value: method,
                    })),
                  )
                  setStep2Key(value)
                } else {
                  setStep2Options(
                    ['等于', '不等于', '正则表达式'].map((method) => ({
                      label: method,
                      value: method,
                    })),
                  )
                  setStep2Key(value)
                }
              }}
            />
          </Form.Item>
          <Form.Item label='过滤方法(留空则不过滤)' name='method'>
            <Select
              key={step2Key}
              className='w-full'
              placeholder='请选择插值方法'
              allowClear
              disabled={step2Options.length === 0}
              options={step2Options}
              onChange={(value) =>
                setStep3Element(
                  getStep3Element(value as ALLOWED_FILTER_METHODS, form),
                )
              }
            />
          </Form.Item>
          {step3Element ?? (
            <Form.Item label='过滤参考值'>
              <Select disabled />
            </Form.Item>
          )}
          <div className='flex flex-row flex-nowrap justify-center items-center gap-4'>
            <Button
              className='mt-4 w-full'
              htmlType='submit'
              autoInsertSpace={false}
              disabled={disabled}
            >
              确定
            </Button>
            <Popconfirm
              title={<span>是否确认清除所有过滤规则</span>}
              onConfirm={async () => {
                flushSync(() => setDisabled(true))
                await handleClear()
                flushSync(() => setDisabled(false))
              }}
              okText='确定'
              cancelText='取消'
            >
              <Button
                className='mt-4 w-full'
                autoInsertSpace={false}
                disabled={disabled}
              >
                清除所有过滤规则
              </Button>
            </Popconfirm>
          </div>
        </Form>
      </div>

      <div className='component-result variable-view'>
        <p className='intro-text'>数据过滤可以让你根据自己的需求</p>
        <p className='intro-text'>
          选择性地<b>保留</b>满足过滤规则的数据
        </p>
        <p className='intro-text'>过滤基于原数据, 过滤后会生成新描述统计数据</p>
      </div>
    </div>
  )
}
