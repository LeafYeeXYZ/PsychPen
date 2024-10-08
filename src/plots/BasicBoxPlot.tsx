import { Box } from '@ant-design/plots'
import { Select, Button, Form, Radio, Input } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'

type Option = {
  /** 分组变量 */
  groupVar: string
  /** 数据变量 */
  dataVar: string
  /** 是否显示异常点 */
  showOutliers: boolean
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string
}

type Config = {
  data: { [key: string]: any }[]
  boxType: 'boxplot'
  xField: string
  yField: string
  style: {
    point: boolean
  }
}

export function BasicBoxPlot() {

  const { dataCols, dataRows, messageApi } = useZustand()
  // 图形设置相关
  const [config, setConfig] = useState<Config | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const [customXLabel, setCustomXLabel] = useState<string>('')
  const [customYLabel, setCustomYLabel] = useState<string>('')
  const handleFinish = (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      const data = dataRows
        .map((row) => ({ [values.groupVar]: row[values.groupVar], [values.dataVar]: +row[values.dataVar] }))
        .sort((a, b) => a[values.groupVar] - b[values.groupVar])
      setConfig({ 
        data,
        boxType: 'boxplot',
        xField: values.groupVar,
        yField: values.dataVar,
        style: {
          point: values.showOutliers,
        },
      })
      setCustomXLabel(values.xLabel || '')
      setCustomYLabel(values.yLabel || '')
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
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

      <div className='w-1/2 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4'>

        <Form<Option>
          className='w-full'
          layout='vertical'
          onFinish={(values) => {
            flushSync(() => setDisabled(true))
            handleFinish(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          initialValues={{
            showOutliers: true,
          }}
          disabled={disabled}
        >
          <Form.Item
            label='选择分组变量'
            name='groupVar'
            rules={[{ required: true, message: '请选择分组变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择分组变量'
            >
              {dataCols.map((col) => (
                <Select.Option key={col.name} value={col.name}>
                  {col.name} (水平数: {col.unique})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='选择数据变量'
            name='dataVar'
            rules={[{ required: true, message: '请选择数据变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择数据变量'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='异常点处理方式'
            name='showOutliers'
            rules={[{ required: true, message: '请选择异常点处理方式' }]}
          >
            <Radio.Group block>
              <Radio.Button value={true}>标注并排除</Radio.Button>
              <Radio.Button value={false}>不特殊处理</Radio.Button>
            </Radio.Group>
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
            <Box {...config} className='p-4' />
            <p className='absolute bottom-3 left-[45%] text-gray-700'>
              {customXLabel.length > 0 ? customXLabel : config.xField}
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