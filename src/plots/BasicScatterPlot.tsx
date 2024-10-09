import { Scatter } from '@ant-design/plots'
import { Select, Button, Form, Input, Space } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'

type Option = {
  /** X轴变量 */
  xVar: string
  /** Y轴变量 */
  yVar: string
  /** Z轴(分组)变量 */
  zVar?: string
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string
  /** 自定义 z轴 标签 */
  zLabel?: string
}

type Config = {
  data: { [key: string]: unknown }[]
  boxType: 'boxplot'
  xField: string
  yField: string
  colorField?: string
}

export function BasicScatterPlot() {

  const { dataCols, dataRows, messageApi, isLargeData } = useZustand()
  // 图形设置相关
  const [config, setConfig] = useState<Config | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const [customXLabel, setCustomXLabel] = useState<string>('')
  const [customYLabel, setCustomYLabel] = useState<string>('')
  const [customZLabel, setCustomZLabel] = useState<string>('')
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const data = dataRows
        .filter((row) => 
          typeof row[values.xVar] !== 'undefined'
          && typeof row[values.yVar] !== 'undefined'
          && !isNaN(Number(row[values.xVar]))
          && !isNaN(Number(row[values.yVar]))
          // 分组变量
          && (!values.zVar || (typeof row[values.zVar] !== 'undefined'))
        )
        .map((row) => ({ 
          [values.xVar]: Number(row[values.xVar]),
          [values.yVar]: Number(row[values.yVar]),
          // 分组变量
          ...(values.zVar && { [values.zVar]: row[values.zVar] }),
        }))
      setConfig({ 
        data,
        boxType: 'boxplot',
        xField: values.xVar,
        yField: values.yVar,
        colorField: values.zVar,
      })
      setCustomXLabel(values.xLabel || '')
      setCustomYLabel(values.yLabel || '')
      setCustomZLabel(values.zLabel || '')
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp - (isLargeData ? 500 : 0)} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  // 导出图片相关
  const imgRef = useRef<HTMLDivElement>(null)
  const handleSave = () => {
    if (imgRef.current) {
      html2canvas(imgRef.current).then((canvas) => {
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = url
        a.download = 'psychpen.png'
        a.click()
      })
    }
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
          <Form.Item
            label='X轴变量'
            name='xVar'
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
              {dataCols.map((col) => (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='Y轴变量'
            name='yVar'
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
              {dataCols.map((col) => (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='分组变量及其标签'
          >
            <Space.Compact
              className='w-full'
            >
              <Form.Item name='zVar' noStyle>
                <Select
                  className='w-full'
                  placeholder='请选择分组变量'
                  allowClear
                >
                  {dataCols.map((col) => col.type === '称名或等级数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name} (水平数: {col.unique})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name='zLabel' noStyle>
                <Input className='w-max' placeholder='留空则不显示' allowClear />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='自定义X轴标签'
            name='xLabel'
          >
            <Input className='w-full' placeholder='可留空, 默认为变量名' />
          </Form.Item>
          <Form.Item
            label='自定义Y轴标签'
            name='yLabel'
          >
            <Input className='w-full' placeholder='可留空, 默认为变量名' />
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
              disabled={!config}
              onClick={handleSave}
            >
              保存图片
            </Button>
          </div>
        </Form>

      </div>

      <div className='w-full h-full flex flex-col justify-center items-center gap-4 rounded-md border bg-white overflow-auto p-4'>

        {config ? (
          <div className='flex flex-col justify-center items-center relative m-4 bg-white' ref={imgRef}>
            <p className='absolute top-[50%] left-2 -rotate-90 transform -translate-x-1/2 -translate-y-1/2 text-gray-700'>
              {/* 纵向文字 */}
              {customYLabel.length > 0 ? customYLabel : config.yField}
            </p>
            <Scatter {...config} className='p-4' />
            <p className='absolute bottom-3 left-[45%] text-gray-700'>
              {customXLabel.length > 0 ? customXLabel : config.xField}
            </p>
            <p className='absolute top-0 left-10 text-gray-700'>
              {customZLabel.length > 0 ? customZLabel : config.colorField}
            </p>
          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <span>请选择参数并点击生成</span>
          </div>
        )}

      </div>

    </div>
  )
}