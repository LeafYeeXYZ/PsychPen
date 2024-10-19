import { useZustand } from '../lib/useZustand'
import { Button, Select, Form, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { utils } from 'xlsx'

type Option = {
  /** 变量名 */
  variable: string
  /** 子变量 */
  subVars?: string[]
}

const ALLOW_SUBVARS: {
  en: string,
  cn: string,
}[] = [
  { en: 'standard', cn: '标准化' },
  { en: 'center', cn: '中心化' },
]

export function SubVariables() {

  const { data, dataCols, setDataCols, setDataRows, messageApi, CALCULATE_VARIABLES, isLargeData, disabled, setDisabled } = useZustand()

  // 定义子变量
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const cols = dataCols.map((col) => {
        if (col.name === values.variable) {
          return { 
            ...col, 
            subVars: values.subVars ? {
              standard: values.subVars.includes('standard'),
              center: values.subVars.includes('center'),
            } : undefined,
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
            label='子变量 (可多选/留空)'
            name='subVars'
          >
            <Select
              mode='multiple'
              className='w-full'
              placeholder='请选择子变量'
              options={ALLOW_SUBVARS.map((subVar) => ({ label: subVar.cn, value: subVar.en }))}
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
        <p className='intro-text'>在数据分析中, 有时需要对原始数据进行处理</p>
        <p className='intro-text'>标准化是指把 <Tag>x</Tag>转换为 <Tag>(x - μ) / σ</Tag>, 从而让数据的均值为0, 方差为1</p>
        <p className='intro-text'>中心化是指把 <Tag>x</Tag>转换为 <Tag>x - μ</Tag>, 从而让数据的均值为0, 方差不变</p>
        <p className='intro-text'>两种处理均不会改变数据的分布形状</p>
      </div>

    </div>
  )
}