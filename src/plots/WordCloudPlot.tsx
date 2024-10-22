import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { Select, Button, Form, Space, InputNumber, ColorPicker } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { downloadImage } from '../lib/utils'
// 开发模式下, Vite 没有返回 .wasm 文件的正确 MIME 类型, 会报错
// 但打包后, 运行 vite preview 时, 可以正常加载 .wasm 文件
import init, { cut } from 'jieba-wasm'

const SPAPE_OPTIONS = [
  { value: 'circle', label: '圆形' },
  { value: 'cardioid', label: '心形' },
  { value: 'diamond', label: '菱形' },
  { value: 'triangle-forward', label: '倒三角形' },
  { value: 'triangle', label: '三角形' },
  { value: 'pentagon', label: '五边形' },
  { value: 'star', label: '星形' },
]
const ROTATION_OPTIONS = [
  { value: 'x', label: '水平', rotationRange: [0, 0], rotationStep: 90 },
  { value: 'y', label: '水平/垂直', rotationRange: [-90, 90], rotationStep: 90 },
  { value: 'z', label: '水平/垂直/倾斜', rotationRange: [-90, 90], rotationStep: 45 },
]
const FILTER_OPTIONS = [
  { value: 'punctuation', label: '标点符号', reg: /[\p{P}\u2000-\u206F\u2E00-\u2E7F]/u },
  { value: 'number', label: '数字', reg: /\d/ },
  { value: 'english', label: '英文', reg: /[a-zA-Z]/ },
]

type Option = {
  /** 变量 */
  variable: string
  /** 词云形状 */
  shape: string
  /** 词云颜色 */
  color: { metaColor: { r: number, g: number, b: number, a: number } } | string
  /** 单词最小尺寸 */
  min: number // 默认 12, 单位 px
  /** 单词最大尺寸 */
  max: number // 默认 60, 单位 px
  /** 单词方向 */
  rotation: string
  /** 过滤设置 */
  filter?: string[]
}

export function WordCloudPlot() {

  const { dataCols, dataRows, messageApi, isLargeData, isDarkMode } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)
  const handleFinish = async (values: Option) => {
    const timestamp = Date.now()
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const { variable, shape, min, max, rotation, filter, color } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const raw = dataRows.map((row) => String(row[variable]))
      let data: string[] = []
      await init()
      for (const text of raw) {
        const words = cut(text, true)
        data.push(...words)
      }
      if (filter) {
        for (const f of filter) {
          data = data.filter((word) => !FILTER_OPTIONS.find((filter) => filter.value === f)?.reg.test(word))
        }
      }
      const counts = data.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
      const wordCloudData = Object.entries(counts).map(([name, value]) => ({ name, value }))
      chart.setOption({
        series: [{
          type: 'wordCloud',
          shape: shape,
          left: 'center',
          top: 'center',
          width: '80%',
          height: '80%',
          textStyle: { color: typeof color === 'string' ? color : `rgba(${color.metaColor.r}, ${color.metaColor.g}, ${color.metaColor.b}, ${color.metaColor.a})` },
          sizeRange: [min, max],
          rotationRange: ROTATION_OPTIONS.find((r) => r.value === rotation)?.rotationRange,
          rotationStep: ROTATION_OPTIONS.find((r) => r.value === rotation)?.rotationStep,
          data: wordCloudData,
        }],
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
            shape: 'circle',
            min: 12,
            max: 60,
            rotation: 'x',
            filter: ['punctuation'],
            color: isDarkMode ? '#ffffff' : '#000000',
          }}
        >
          <Form.Item
            label='变量'
            name='variable'
            rules={[ { required: true, message: '请选择变量' } ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
            >
              {dataCols.map((col) => (
                <Select.Option key={col.name} value={col.name}>
                  {col.name} (唯一值占比: {((col.unique! / col.count!)*100).toFixed()}%)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='词云形状和颜色'>
            <Space.Compact block>
              <Form.Item
                noStyle
                name='shape'
                rules={[ { required: true, message: '请选择词云形状' } ]}
              >
                <Select
                  className='w-full'
                  placeholder='词云形状'
                  options={SPAPE_OPTIONS.map((shape) => ({ label: shape.label, value: shape.value }))}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name='color'
                rules={[ { required: true, message: '请选择词云颜色' } ]}
              >
                <ColorPicker 
                  className='w-full' 
                  showText 
                  format='hex'
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='词云形状'
            name='shape'
            rules={[ { required: true, message: '请选择词云形状' } ]}
          >
            <Select
              className='w-full'
              placeholder='请选择词云形状'
            >
              {SPAPE_OPTIONS.map((shape) => (
                <Select.Option key={shape.value} value={shape.value}>
                  {shape.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='单词最小/最大尺寸和方向'>
            <Space.Compact block>
              <Form.Item
                noStyle
                name='min'
                rules={[ 
                  { required: true, message: '请输入最小尺寸' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value >= getFieldValue('max')) {
                        return Promise.reject('最小尺寸必须小于最大尺寸')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber
                  addonAfter='px'
                  className='w-52'
                  placeholder='最小尺寸'
                  step={1}
                  min={1}
                  max={100}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name='max'
                rules={[ 
                  { required: true, message: '请输入最大尺寸' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value <= getFieldValue('min')) {
                        return Promise.reject('最大尺寸必须大于最小尺寸')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <InputNumber
                  addonAfter='px'
                  className='w-52'
                  placeholder='最大尺寸'
                  step={1}
                  min={1}
                  max={100}
                />
              </Form.Item>
              <Form.Item
                noStyle
                name='rotation'
                rules={[ { required: true, message: '请选择单词方向' } ]}
              >
                <Select
                  className='w-full'
                  placeholder='单词方向'
                >
                  {ROTATION_OPTIONS.map((rotation) => (
                    <Select.Option key={rotation.value} value={rotation.value}>
                      {rotation.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='内容过滤设置'
            name='filter'
          >
            <Select
              className='w-full'
              placeholder='留空则不过滤'
              mode='multiple'
            >
              {FILTER_OPTIONS.map((filter) => (
                <Select.Option key={filter.value} value={filter.value}>
                  {filter.label}
                </Select.Option>
              ))}
            </Select>
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
        <p className='text-xs text-gray-400 mt-1'>
          首次生成时, 会加载外部的中文分词模块, 请耐心等待
        </p>
        <p className='text-xs text-gray-400 mt-1 mb-4'>
          如果形状不明显, 请调小最小单词尺寸
        </p>

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