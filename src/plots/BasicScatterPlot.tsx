import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, InputNumber } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'
import type { EChartsOption } from 'echarts'

type Option = {
  /** X轴变量 */
  xVar: string
  /** Y轴变量 */
  yVar: string
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string
  /** 自定义标题 */
  title?: string
  /** 自定义点大小 */
  dotSize?: number
}

export function BasicScatterPlot() {

  const { dataCols, dataRows, messageApi, isLargeData } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)

  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const { xVar, yVar, xLabel, yLabel, title } = values
      const chart = echarts.init(document.getElementById('basic-scatter-plot')!)
      const option: EChartsOption = {
        title: {
          text: title,
          left: 'center',
        },
        xAxis: {
          name: xLabel || xVar,
          nameLocation: 'middle',
          nameGap: 25,
        },
        yAxis: {
          name: yLabel || yVar,
          nameLocation: 'middle',
          nameGap: 35,
        },
        series: [{
          data: dataRows
            .filter((row) => 
              typeof row[xVar] !== 'undefined'
              && typeof row[yVar] !== 'undefined'
            )
            .map((row) => { 
              return [Number(row[xVar]), Number(row[yVar])]
            }),
          symbolSize: values.dotSize || 10,
          type: 'scatter',
        }],
      }
      chart.setOption(option, true)
      setRendered(true)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  // 导出图片相关
  const handleSave = () => {
    html2canvas(document.getElementById('basic-scatter-plot')!.firstChild as HTMLElement).then((canvas) => {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'psychpen.png'
      a.click()
    })
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4'>

      <div className='w-1/2 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4 overflow-auto'>

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
          <Form.Item label='X轴变量及其标签'>
            <Space.Compact className='w-full'>
              <Form.Item
                name='xVar'
                noStyle
                rules={[
                  { required: true, message: '请选择X轴变量' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === getFieldValue('yVar')) {
                        return Promise.reject('请选择不同的变量')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择X轴变量'
                >
                  {dataCols.map((col) => col.type === '等距或等比数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='xLabel'
                noStyle
              >
                <Input className='w-max' placeholder='标签默认为变量名' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='Y轴变量及其标签'>
            <Space.Compact className='w-full'>
              <Form.Item
                name='yVar'
                noStyle
                rules={[
                  { required: true, message: '请选择Y轴变量' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === getFieldValue('xVar')) {
                        return Promise.reject('请选择不同的变量')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择Y轴变量'
                >
                  {dataCols.map((col) => col.type === '等距或等比数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='yLabel'
                noStyle
              >
                <Input className='w-max' placeholder='标签默认为变量名' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='自定义标题'
            name='title'
          >
            <Input className='w-full' placeholder='默认无标题' />
          </Form.Item>
          <Form.Item
            label='自定义点大小'
            name='dotSize'
          >
            <InputNumber className='w-full' placeholder='默认为 10' />
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
              onClick={handleSave}
            >
              保存图片
            </Button>
          </div>
        </Form>

      </div>

      <div className='w-full h-full relative rounded-md border bg-white overflow-auto p-4'>

        <div className='w-full h-full' id='basic-scatter-plot' />

        {!rendered && <div className='absolute w-full h-full top-0 left-0 flex items-center justify-center'>请选择参数并点击生成</div>}

      </div>

    </div>
  )
}