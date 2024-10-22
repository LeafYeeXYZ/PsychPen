import * as echarts from 'echarts'
import { Select, Button, Form, Input, InputNumber, ColorPicker, Space } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { downloadImage } from '../lib/utils'

type Option = {
  /** 变量 */
  variables: string[]
  /** 标签 */
  labels: string[]
  /** 标题 */
  title?: string
  /** 线粗细 */
  lineWidth: number
  /** 线颜色 */
  lineColor: { metaColor: { r: number, g: number, b: number, a: number } } | string
}

export function ParallelLinePlot() {

  const { dataCols, dataRows, messageApi, isLargeData } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const { variables, labels, title, lineWidth, lineColor } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const filteredRows = dataRows.filter((row) => variables.every((variable) => typeof row[variable] !== 'undefined'))
      chart.setOption({
        title: [{ text: title || '', left: 'center' }],
        parallelAxis: variables.map((variable, index) => ({
          dim: index,
          name: labels ? labels[index] : variable,
          type: dataCols.find((col) => col.name === variable)?.type === '等距或等比数据' ? 'value' : 'category',
          data: dataCols.find((col) => col.name === variable)?.type === '等距或等比数据' ? undefined : Array.from(new Set(filteredRows.map((row) => String(row[variable]))).values())
        })),
        series: {
          type: 'parallel',
          lineStyle: {
            width: lineWidth,
            color: typeof lineColor === 'string' ? lineColor : `rgba(${lineColor.metaColor.r}, ${lineColor.metaColor.g}, ${lineColor.metaColor.b}, ${lineColor.metaColor.a})`
          },
          data: filteredRows.map((row) => variables.map((variable) => {
            if (dataCols.find((col) => col.name === variable)?.type === '等距或等比数据') {
              return Number(row[variable])
            } else {
              return String(row[variable])
            }
          }))
        }
      }, true)
      setRendered(true)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='component-main'>

      <div className='component-form'>

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
          initialValues={{
            lineWidth: 2,
            lineColor: '#ffa0a0',
          }}
        >
          <Form.Item
            label='变量列表(X轴各点)(可多选)'
            name='variables'
            rules={[ { required: true, message: '请选择变量' } ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
              options={dataCols.map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label='变量标签(可留空,默认为变量名)'
            name='labels'
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value?.length) {
                    return Promise.resolve()
                  }
                  if (value.length !== getFieldValue('variables').length) {
                    return Promise.reject(new Error('标签数量必须与变量数量相同'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Select
              className='w-full'
              placeholder='请输入变量标签'
              mode='tags'
            />
          </Form.Item>
          <Form.Item label='线宽度和颜色'>
            <Space.Compact block>
              <Form.Item
                name='lineWidth'
                noStyle
              >
                <InputNumber className='w-full' min={1} max={10} step={1} />
              </Form.Item>
              <Form.Item
                name='lineColor'
                noStyle
              >
                <ColorPicker className='w-full' showText format='hex' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='自定义标题'
            name='title'
          >
            <Input className='w-full' placeholder='默认无标题' />
          </Form.Item>
          <div
            className='flex flex-row flex-nowrap justify-center items-center gap-4'
          >
            <Button
              className='w-full mt-4'
              type='default'
              htmlType='submit'
              autoInsertSpace={false}
            >
              生成
            </Button>
            <Button
              className='w-full mt-4'
              type='default'
              autoInsertSpace={false}
              disabled={!rendered}
              onClick={downloadImage}
            >
              保存图片
            </Button>
          </div>
        </Form>

      </div>

      <div className='component-result'>
        <div className='w-full h-full overflow-auto'>
          <div className='w-full h-full' id='echarts-container' />
        </div>
        {!rendered && <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>请选择参数并点击生成</div>}
      </div>

    </div>
  )
}