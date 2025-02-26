import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, InputNumber } from 'antd'
import { useZustand } from '../../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import 'echarts-gl'
import { downloadImage } from '../../lib/utils'

type Option = {
  /** X轴变量 */
  xVar: string
  /** Y轴变量 */
  yVar: string
  /** Z轴变量 */
  zVar: string
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string
  /** 自定义 z轴 标签 */
  zLabel?: string
  /** 自定义标题 */
  title?: string
  /** 自定义点大小 */
  dotSize: number
}

export function ThreeDScatterPlot() {

  const { dataCols, dataRows, messageApi, isLargeData, isDarkMode } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)

  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const timestamp = Date.now()
      const { xVar, yVar, zVar ,xLabel, yLabel, zLabel, title, dotSize } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const option: EChartsOption = {
        title: {
          text: title,
          left: 'center',
        },
        xAxis3D: {
          name: xLabel || xVar,
          nameLocation: 'middle',
          nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
        },
        yAxis3D: {
          name: yLabel || yVar,
          nameLocation: 'middle',
          nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
        },
        zAxis3D: {
          name: zLabel || zVar,
          nameLocation: 'middle',
          nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
        },
        grid3D: {},
        // @ts-expect-error echarts-gl 没有提供类型定义
        series: [{
          type: 'scatter3D',
          symbolSize: dotSize,
          data: dataRows
            .filter((row) => 
              typeof row[xVar] !== 'undefined'
              && typeof row[yVar] !== 'undefined'
              && typeof row[zVar] !== 'undefined'
            )
            .map((row) => { 
              return [Number(row[xVar]), Number(row[yVar]), Number(row[zVar])]
            }),
        }],
      }
      chart.setOption(option, true)
      setRendered(true)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className='component-main'>

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
          initialValues={{
            dotSize: 8,
          }}
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
                      if (value === getFieldValue('yVar') || value === getFieldValue('zVar')) {
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
                      if (value === getFieldValue('xVar') || value === getFieldValue('zVar')) {
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
          <Form.Item label='Z轴变量及其标签'>
            <Space.Compact className='w-full'>
              <Form.Item
                name='zVar'
                noStyle
                rules={[
                  { required: true, message: '请选择Z轴变量' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === getFieldValue('xVar') || value === getFieldValue('yVar')) {
                        return Promise.reject('请选择不同的变量')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择Z轴变量'
                >
                  {dataCols.map((col) => col.type === '等距或等比数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='zLabel'
                noStyle
              >
                <Input className='w-max' placeholder='标签默认为变量名' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label='自定义标题和点大小'
          >
            <Space.Compact block>
              <Form.Item
                name='title'
                noStyle
              >
                <Input addonBefore='标题' className='w-full' placeholder='默认无标题' />
              </Form.Item>
              <Form.Item
                name='dotSize'
                noStyle
                rules={[{ required: true, message: '请输入点大小' }]}
              >
                <InputNumber addonBefore='点大小' className='w-52' placeholder='默认8' min={1} step={1} />
              </Form.Item>
            </Space.Compact>
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