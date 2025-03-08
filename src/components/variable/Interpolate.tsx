import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { Button, Select, Form } from 'antd'
import { flushSync } from 'react-dom'
import { ALLOWED_INTERPOLATION_METHODS } from '../../types'
import { sleep } from '../../lib/utils'

type Option = {
  /** 变量名 */
  variables: string[]
  /** 插值方法 */
  method?: ALLOWED_INTERPOLATION_METHODS
  /** 插值参考变量 */
  peer?: string
}

const INTERPOLATE_METHODS = Object.values(ALLOWED_INTERPOLATION_METHODS)

export function Interpolate() {
  const { dataCols, isLargeData, updateData } = useData()
  const { messageApi, disabled, setDisabled } = useStates()

  // 处理插值
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...', 0)
      isLargeData && (await sleep())
      const timestamp = Date.now()
      const cols = dataCols.map((col) => {
        if (values.variables.includes(col.name)) {
          return {
            ...col,
            missingMethod: values.method,
            missingRefer: values.peer,
          }
        } else {
          return col
        }
      })
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
          <Form.Item label='插值方法(留空则为直接删除缺失值)' name='method'>
            <Select
              className='w-full'
              placeholder='请选择插值方法'
              allowClear
              options={INTERPOLATE_METHODS.map((method) => ({
                label: method,
                value: method,
              }))}
            />
          </Form.Item>
          <Form.Item
            label='插值参考变量(仅部分插值方法需要)'
            name='peer'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    (getFieldValue('method') === '最临近点插值法' ||
                      getFieldValue('method') === '拉格朗日插值法') &&
                    !value
                  ) {
                    return Promise.reject('请选择插值参考变量')
                  }
                  if (
                    (getFieldValue('method') === '最临近点插值法' ||
                      getFieldValue('method') === '拉格朗日插值法') &&
                    value === getFieldValue('variable')
                  ) {
                    return Promise.reject('插值参考变量不能和原变量相同')
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择插值参考变量'
              allowClear
              options={dataCols
                .filter((col) => col.derived !== true)
                .filter((col) => col.type === '等距或等比数据')
                .map((col) => ({ label: col.name, value: col.name }))}
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

      <div className='component-result variable-view'>
        <p className='intro-text'>研究中会因为各种原因导致数据缺失</p>
        <p className='intro-text'>
          如果样本量较大, 直接删除缺失值是一个不错的选择
        </p>
        <p className='intro-text'>但在心理学研究中, 往往实验样本比较珍贵</p>
        <p className='intro-text'>
          因此, 研究者往往会选择合适的插值法来将缺失值替换为有效值
        </p>
      </div>
    </div>
  )
}
