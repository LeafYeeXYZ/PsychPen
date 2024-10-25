import * as echarts from 'echarts'
import { Select, Button, Form, Input } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { downloadImage } from '../lib/utils'

type Option = {
  /** 变量 */
  variable: string
  /** 自定义标签 */
  labels?: string[]
  /** 自定义图例 */
  label: 'count' | 'percent' | 'both'
  /** 自定义标题 */
  title?: string
}

const LABEL_OPTIONS = {
  count: {
    config: { show: true, formatter: '{b}: {c}' },
    label: '只显示计数',
  },
  percent: {
    config: { show: true, formatter: '{b}: {d}%' },
    label: '只显示百分比',
  },
  both: {
    config: { show: true, formatter: '{b}: {c} ({d}%)' },
    label: '显示计数和百分比',
  }
}

export function BasicPiePlot() {

  const { dataCols, dataRows, messageApi, isLargeData, isDarkMode } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)

  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const { variable, title, labels, label } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const data = dataRows
        .map((row) => row[variable])
        .filter((value) => typeof value !== 'undefined')
        .map((value) => String(value))
      const value = Array.from(new Set(data)).toSorted()
      const counts = value.map((v) => data.filter((d) => d === v).length)
      const option: EChartsOption = {
        title: {
          text: title,
          left: 'center',
          textStyle: {
            color: isDarkMode ? 'white' : 'black'
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: isDarkMode ? 'white' : 'black'
          }
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            label: {
              ...LABEL_OPTIONS[label].config,
              color: isDarkMode ? 'white' : 'black'
            },
            data: counts.map((count, index) => ({ 
              value: count, 
              name: (labels && labels[index]) ?? value[index]
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
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
            label: 'percent',
          }}
        >
          <Form.Item
            name='variable'
            label='变量'
            rules={[{ required: true, message: '请选择变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              options={dataCols.map((col) => ({ label: `${col.name} (水平数: ${col.unique})`, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            name='label'
            label='图例'
            rules={[{ required: true, message: '请选择图例' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择图例'
              options={Object.entries(LABEL_OPTIONS).map(([value, { label }]) => ({ label, value }))}
            />
          </Form.Item>
          <Form.Item
            name='labels'
            label='自定义标签'
          >
            <Select className='w-full' mode='tags' placeholder='默认为属性值' />
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