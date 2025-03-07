import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Button, Input, Form, Tag, Select, Popconfirm } from 'antd'
import { flushSync } from 'react-dom'
import { useState } from 'react'

type Option = {
  /** 新变量名 */
  variable: string
  /**
   * 计算表达式
   * 变量名语法为 :::name:::
   * 输入的表达式在将变量为替换为数字后, 必须能够被按照 JS 语法计算
   */
  expression: string
}

export function ComputeVar() {
  const { dataCols, isLargeData, addNewVar } = useData()
  const { messageApi, disabled, setDisabled } = useStates()
  const [expression, setExpression] = useState<string>('')
  const [form] = Form.useForm<Option>()
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      await addNewVar(values.variable, values.expression)
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
        <Form
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
            label='新变量名'
            name='variable'
            rules={[
              { required: true, message: '请输入新变量名' },
              () => ({
                validator(_, value) {
                  if (typeof value !== 'string') return Promise.resolve()
                  if (dataCols.find(({ name }) => name === value))
                    return Promise.reject('变量名已存在')
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder='请输入新变量名' />
          </Form.Item>
          <Form.Item
            label='计算表达式'
            name='expression'
            required
            rules={[
              () => ({
                validator(_, value) {
                  if (typeof value !== 'string') return Promise.resolve()
                  if (value.replace(/\s/g, '') === '')
                    return Promise.reject('请输入计算表达式')
                  const vars = value.match(/:::.+?:::/g)
                  if (!vars) return Promise.resolve()
                  const invalid = vars.some(
                    (v) =>
                      !dataCols.find(({ name }) => name === v.slice(3, -3)),
                  )
                  return invalid
                    ? Promise.reject('表达式中存在未定义的变量')
                    : Promise.resolve()
                },
              }),
            ]}
          >
            <Input.TextArea
              placeholder='请输入计算表达式'
              autoSize
              onChange={(e) => {
                const value = e.target.value
                setExpression(typeof value === 'string' ? value : '')
              }}
            />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title='确定要生成新变量吗'
              onConfirm={form.submit}
              okText='确定'
              cancelText='取消'
            >
              <Button
                className='mt-4'
                htmlType='button'
                disabled={disabled}
                block
              >
                生成
              </Button>
            </Popconfirm>
          </Form.Item>
          <Form.Item label='表达式预览'>
            <Expression value={expression} />
          </Form.Item>
          <Form.Item label='变量列表(点击复制)'>
            <Select
              placeholder='变量列表'
              allowClear
              showSearch
              options={dataCols.map(({ name }) => ({
                label: name,
                value: name,
              }))}
              onChange={async (value) => {
                if (!value) return
                const expression = `:::${value}:::`
                try {
                  await navigator.clipboard.writeText(expression)
                  messageApi?.success(`已复制 ${expression}`)
                } catch (error) {
                  messageApi?.error(
                    `复制失败: ${error instanceof Error ? error.message : String(error)}`,
                  )
                }
              }}
            />
          </Form.Item>
        </Form>
      </div>

      <div className='component-result variable-view'>
        <p className='intro-text'>将原始数据中的多个变量计算为一个新变量</p>
        <p className='intro-text'>
          计算表达式中变量应当通过 <Tag color='blue'>:::name:::</Tag>语法引用
        </p>
        <p className='intro-text'>
          例如 <Tag color='blue'>( :::a::: + :::b::: ) * 2</Tag>表示将 a 和 b
          的和乘以 2
        </p>
        <p className='intro-text'>
          支持的运算符包括但不限于: <Tag color='blue'>+、-、*、/、**</Tag>
          (加、减、乘、除、乘方)
        </p>
        <p className='intro-text'>
          为避免歧义, 请使用小括号 <Tag color='blue'>( )</Tag>明确运算顺序
        </p>
        <p className='intro-text'>
          对数等高级运算请使用 <Tag color='green'>JavaScript</Tag>的{' '}
          <Tag color='blue'>Math</Tag>对象
        </p>
        <p className='intro-text'>
          输入的表达式将在替换变量为数字后, 按照{' '}
          <Tag color='green'>JavaScript</Tag>语法计算
        </p>
      </div>
    </div>
  )
}

function Expression({ value }: { value: string }) {
  return (
    <>
      {value.split(/(:::.+?:::)/g).map((part, index) => {
        if (part.match(/:::.+?:::/)) {
          return (
            <Tag key={index} color='green' style={{ margin: 0 }}>
              {part.slice(3, -3)}
            </Tag>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
