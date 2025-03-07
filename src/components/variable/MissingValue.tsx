import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Button, Select, Form, Tag } from 'antd'
import { flushSync } from 'react-dom'

type Option = {
  /** 变量名 */
  variable: string[]
  /** 缺失值 */
  missing?: unknown[] // 比较时务必用 == 而不是 ===
}

export function MissingValue() {
  const { dataCols, isLargeData, updateData } = useData()
  const { messageApi, disabled, setDisabled } = useStates()

  // 处理缺失值
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      const { variable, missing } = values
      const cols = dataCols
      if (variable.includes('__ALL_VARIABLES__')) {
        cols.forEach((col) => {
          if (col.derived !== true) {
            col.missingValues = missing
          }
        })
      } else {
        variable.forEach((variable) => {
          const col = cols.findIndex((col) => col.name === variable)
          if (col !== -1) {
            cols[col].missingValues = missing
          }
        })
      }
      await updateData(cols)
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
            label='变量名(可选择多个变量)'
            name='variable'
            rules={[
              { required: true, message: '请选择变量' },
              () => ({
                validator(_, value) {
                  if (
                    value?.includes('__ALL_VARIABLES__') &&
                    value?.length > 1
                  ) {
                    return Promise.reject(
                      '已选择全部变量, 请不要再选择其他变量',
                    )
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
              options={[
                {
                  label: `全部变量 (共${dataCols.filter((col) => col.derived !== true).length}个)`,
                  value: '__ALL_VARIABLES__',
                },
                ...dataCols
                  .filter((col) => col.derived !== true)
                  .map((col) => ({ label: col.name, value: col.name })),
              ]}
            />
          </Form.Item>
          <Form.Item label='缺失值(可输入多个值/留空)' name='missing'>
            <Select mode='tags' className='w-full' placeholder='请输入缺失值' />
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

      <div className='component-result variable-view'>
        <p className='intro-text'>通常, 在研究数据中不会直接将缺失值留空</p>
        <p className='intro-text'>
          而是将缺失值替换为特定的值, 以便于后续的数据处理
        </p>
        <p className='intro-text'>
          例如用 <Tag>-1</Tag>、<Tag>-99</Tag>、<Tag>99</Tag> 表示缺失值
        </p>
        <p className='intro-text'>
          你可以在此页面定义这些缺失值, 以便将它们删除或插值
        </p>
      </div>
    </div>
  )
}
