import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, InputNumber } from 'antd'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { downloadImage } from '../../lib/utils'
import { sort, quantile, standardize, p2z, z2p } from '@psych/lib'

type Option = {
  /** X轴变量 */
  xVar: string
  /** Y轴变量 */
  yVar: string
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string
  /** 是否将变量标准化 */
  standardize: boolean
  /** 点数 */
  dotCount: number
  /** 自定义标题 */
  title?: string
  /** 自定义点大小 */
  dotSize: number
}

const MAX_DOT_COUNT = 1000
const DEFAULT_DOT_COUNT = 50
const DEFAULT_DOT_SIZE = 10

export function QQPlot() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { messageApi } = useStates()
  const [form] = Form.useForm<Option>()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)

  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      const {
        xVar,
        yVar,
        xLabel,
        yLabel,
        title,
        standardize: std,
        dotCount,
      } = values
      const filteredData = dataRows.filter((row) => {
        if (xVar !== '__stdnorm__' && typeof row[xVar] === 'undefined')
          return false
        if (yVar !== '__stdnorm__' && typeof row[yVar] === 'undefined')
          return false
        return true
      })
      const xData =
        xVar === '__stdnorm__'
          ? null
          : sort(
              std
                ? standardize(filteredData.map((row) => Number(row[xVar])))
                : filteredData.map((row) => Number(row[xVar])),
            )
      const yData =
        yVar === '__stdnorm__'
          ? null
          : sort(
              std
                ? standardize(filteredData.map((row) => Number(row[yVar])))
                : filteredData.map((row) => Number(row[yVar])),
            )
      const data = new Array(dotCount).fill(0).map((_, i) => {
        const q = (i + 1) * (1 / (dotCount + 1))
        return [
          xData ? quantile(xData, q, true) : p2z(q),
          yData ? quantile(yData, q, true) : p2z(q),
        ]
      })
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const xMin = +(
        xData && !std ? quantile(xData, z2p(-3), true) : -3
      ).toFixed(2)
      const xMax = +(xData && !std ? quantile(xData, z2p(3), true) : 3).toFixed(
        2,
      )
      const yMin = +(
        yData && !std ? quantile(yData, z2p(-3), true) : -3
      ).toFixed(2)
      const yMax = +(yData && !std ? quantile(yData, z2p(3), true) : 3).toFixed(
        2,
      )
      const option: EChartsOption = {
        title: {
          text: title,
          left: 'center',
        },
        xAxis: {
          name: xLabel || (xVar === '__stdnorm__' ? '标准正态分布' : xVar),
          nameLocation: 'middle',
          nameGap: 25,
          min: xMin,
          max: xMax,
        },
        yAxis: {
          name: yLabel || (yVar === '__stdnorm__' ? '标准正态分布' : yVar),
          nameLocation: 'middle',
          nameGap: 35,
          min: yMin,
          max: yMax,
        },
        dataset: [
          {
            source: data,
          },
          {
            source: [
              [xMin, yMin],
              [xMax, yMax],
            ],
          },
        ],
        series: [
          {
            type: 'scatter',
            datasetIndex: 0,
            symbolSize: values.dotSize || 10,
          },
          {
            type: 'line',
            datasetIndex: 1,
          },
        ],
      }
      chart.setOption(option, true)
      setRendered(true)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(
        `数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    <div className='component-main'>
      <div className='component-form'>
        <Form
          form={form}
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
            dotSize: DEFAULT_DOT_SIZE,
            dotCount: DEFAULT_DOT_COUNT,
            standardize: false,
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
                  onChange={(value) => {
                    if (value !== '__stdnorm__') {
                      const col = dataCols.find((col) => col.name === value)
                      if (col) {
                        form.setFieldsValue({
                          dotCount: Math.max(
                            4,
                            Math.min(
                              MAX_DOT_COUNT,
                              col.valid ?? DEFAULT_DOT_COUNT,
                            ),
                          ),
                        })
                      }
                    }
                  }}
                  options={[
                    { label: '标准正态分布', value: '__stdnorm__' },
                    ...dataCols
                      .filter((col) => col.type === '等距或等比数据')
                      .map((col) => ({ label: col.name, value: col.name })),
                  ]}
                />
              </Form.Item>
              <Form.Item name='xLabel' noStyle>
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
                  onChange={(value) => {
                    if (value !== '__stdnorm__') {
                      const col = dataCols.find((col) => col.name === value)
                      if (col) {
                        form.setFieldsValue({
                          dotCount: Math.max(
                            4,
                            Math.min(
                              MAX_DOT_COUNT,
                              col.valid ?? DEFAULT_DOT_COUNT,
                            ),
                          ),
                        })
                      }
                    }
                  }}
                  options={[
                    { label: '标准正态分布', value: '__stdnorm__' },
                    ...dataCols
                      .filter((col) => col.type === '等距或等比数据')
                      .map((col) => ({ label: col.name, value: col.name })),
                  ]}
                />
              </Form.Item>
              <Form.Item name='yLabel' noStyle>
                <Input className='w-max' placeholder='标签默认为变量名' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='数据标准化和取点数'>
            <Space.Compact block>
              <Form.Item name='standardize' noStyle>
                <Select
                  className='w-full'
                  placeholder='标准化'
                  options={[
                    { label: '标准化数据', value: true },
                    { label: '不标准化数据', value: false },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name='dotCount'
                noStyle
                rules={[{ required: true, message: '请输入取点数' }]}
              >
                <InputNumber
                  addonBefore='取'
                  addonAfter='个点'
                  className='w-full'
                  min={4}
                  step={1}
                  max={MAX_DOT_COUNT}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='自定义标题和点大小'>
            <Space.Compact block>
              <Form.Item name='title' noStyle>
                <Input
                  addonBefore='标题'
                  className='w-full'
                  placeholder='默认无标题'
                />
              </Form.Item>
              <Form.Item
                name='dotSize'
                noStyle
                rules={[{ required: true, message: '请输入点大小' }]}
              >
                <InputNumber
                  addonBefore='点大小'
                  className='w-52'
                  placeholder='默认10'
                  min={1}
                  step={1}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <div className='flex flex-row flex-nowrap justify-center items-center gap-4'>
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
          <p className='w-full text-center text-xs text-gray-400 mt-5'>
            横纵坐标轴的最高/低值为正/负3标准差所对应的值
          </p>
          <p className='w-full text-center text-xs text-gray-400 mt-1'>
            取点数默认为变量的有效值个数, 最大取点数为1000
          </p>
        </Form>
      </div>

      <div className='component-result'>
        <div className='w-full h-full overflow-auto'>
          <div className='w-full h-full' id='echarts-container' />
        </div>
        {!rendered && (
          <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
            请选择参数并点击生成
          </div>
        )}
      </div>
    </div>
  )
}
