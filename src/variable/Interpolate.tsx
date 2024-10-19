import { useZustand, type ALLOWED_MISSING_METHODS } from '../lib/useZustand'
import { Button, Select, Form } from 'antd'
import { flushSync } from 'react-dom'
import { utils } from 'xlsx'

type Option = {
  /** 变量名 */
  variable: string
  /** 插值方法 */
  method?: ALLOWED_MISSING_METHODS
  /** 插值参考变量 */
  peer?: string
}

const INTERPOLATE_METHODS: ALLOWED_MISSING_METHODS[] = ['均值插值', '中位数插值', '最临近点插值法', '拉格朗日插值法']

export function Interpolate() {

  const { data, dataCols, setDataCols, setDataRows, messageApi, CALCULATE_VARIABLES, isLargeData, disabled, setDisabled } = useZustand()

  // 处理插值
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols.map((col) => {
        if (col.name === values.variable) {
          return { 
            ...col, 
            missingMethod: values.method,
            missingRefer: values.peer,
          }
        } else {
          return col
        }
      })
      const sheet = data!.Sheets[data!.SheetNames[0]]
      const { calculatedRows, calculatedCols } = CALCULATE_VARIABLES(cols, utils.sheet_to_json(sheet) as { [key: string]: unknown }[])
      setDataCols(calculatedCols)
      setDataRows(calculatedRows)
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
            label='变量名'
            name='variable'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              options={dataCols
                .filter((col) => col.derived !== true)
                .filter((col) => col.type === '等距或等比数据')
                .map((col) => ({ label: col.name, value: col.name }))
              }
            />
          </Form.Item>
          <Form.Item 
            label='插值方法 (留空则为直接删除缺失值)'
            name='method'
          >
            <Select
              className='w-full'
              placeholder='请选择插值方法'
              allowClear
              options={INTERPOLATE_METHODS.map((method) => ({ label: method, value: method }))}
            />
          </Form.Item>
          <Form.Item 
            label='插值参考变量 (仅部分插值方法需要)'
            name='peer'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    (getFieldValue('method') === '最临近点插值法' || getFieldValue('method') === '拉格朗日插值法')
                    && !value
                  ) {
                    return Promise.reject('请选择插值参考变量')
                  }
                  if (
                    (getFieldValue('method') === '最临近点插值法' || getFieldValue('method') === '拉格朗日插值法')
                    && (value === getFieldValue('variable'))
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
                .map((col) => ({ label: col.name, value: col.name }))
              }
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
        <p className='intro-text'>研究中会因为各种原因导致数据缺失</p>
        <p className='intro-text'>如果样本量较大, 直接删除缺失值是一个不错的选择</p>
        <p className='intro-text'>但在心理学研究中, 往往实验样本比较珍贵</p>
        <p className='intro-text'>因此, 研究者往往会选择合适的插值法来将缺失值替换为有效值</p>

      </div>

    </div>
  )
}