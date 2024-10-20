import { useZustand } from '../lib/useZustand'
import { Button, Select, Form, Tag } from 'antd'
import { flushSync } from 'react-dom'

type Option = {
  /** 变量名 */
  variable: string[]
  /** 缺失值 */
  missing?: unknown[] // 比较时务必用 == 而不是 ===
}

export function MissingValue() {

  const { dataCols, messageApi, isLargeData, disabled, setDisabled, _VariableView_updateData } = useZustand()

  // 处理缺失值
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols
      values.variable.forEach((variable) => {
        const col = cols.findIndex((col) => col.name === variable)
        if (col !== -1) {
          cols[col].missingValues = values.missing
        }
      })
      _VariableView_updateData(cols)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4 border rounded-md'>

      <div className='w-96 h-full flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4 overflow-auto'>
        <Form<Option>
          className='w-full py-4'
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
            label='变量名(可选择多个变量)'
            name='variable'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
              options={dataCols.filter((col) => col.derived !== true).map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item 
            label='缺失值(可输入多个值/留空)'
          >
            <Select
              mode='tags'
              className='w-full'
              placeholder='请输入缺失值'
            />
          </Form.Item>
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

      <div className='w-[calc(100%-24rem)] h-full flex flex-col justify-center items-center rounded-md border bg-white overflow-auto p-8'>
        <p className='intro-text'>通常, 在研究数据中不会直接将缺失值留空</p>
        <p className='intro-text'>而是将缺失值替换为特定的值, 以便于后续的数据处理</p>
        <p className='intro-text'>例如用 <Tag>-1</Tag>、<Tag>-99</Tag>、<Tag>99</Tag> 表示缺失值</p>
        <p className='intro-text'>你可以在此页面定义这些缺失值, 以便将它们删除或插值</p>
      </div>

    </div>
  )
}