import * as echarts from 'echarts'
import ecStat from 'echarts-stat'
import { Select, Button, Form, Input, Space, InputNumber } from 'antd'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { downloadImage } from '../../lib/utils'

const REGRESSION_TYPES = [
  { value: 'linear', label: '线性回归' },
  { value: 'exponential', label: '指数回归' },
  { value: 'logarithmic', label: '对数回归' },
  { value: 'polynomial', label: '多项式回归' },
  { value: 'none', label: '不绘制回归线' },
]

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
  /** 回归类型 */
  regression: string // 'linear' | 'exponential' | 'logarithmic' | 'polynomial' | 'none'
  /** 是否显示回归公式 */
  formula: boolean
}

export function BasicScatterPlot() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { isDarkMode, messageApi } = useStates()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)

  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && (await new Promise((resolve) => setTimeout(resolve, 500)))
      const timestamp = Date.now()
      const { xVar, yVar, xLabel, yLabel, title, regression, formula } = values
      // @ts-expect-error echarts-stat 没有提供正确的类型定义
      echarts.registerTransform(ecStat.transform.regression)
      const chart = echarts.init(document.getElementById('echarts-container')!)
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
        dataset: [
          {
            source: dataRows
              .filter(
                (row) =>
                  typeof row[xVar] !== 'undefined' &&
                  typeof row[yVar] !== 'undefined',
              )
              .map((row) => {
                return [Number(row[xVar]), Number(row[yVar])]
              }),
          },
          {
            transform: {
              type: 'ecStat:regression',
              config: {
                method: regression === 'none' ? 'linear' : regression,
              },
            },
          },
        ],
        series: [
          {
            datasetIndex: 0,
            symbolSize: values.dotSize || 10,
            type: 'scatter',
          },
          {
            datasetIndex: 1,
            name: 'line',
            type: 'line',
            smooth: true,
            symbolSize: 0.1,
            symbol: 'circle',
            label: {
              show: true,
              fontSize: 16,
              color: isDarkMode ? '#ffffff' : '#1010a0',
              opacity: 0.8,
              backgroundColor: isDarkMode ? '#101010' : '#ffffff',
            },
            labelLayout: { dx: -20 },
            encode: { label: 2, tooltip: 1 },
            // 如果 regression 为 none 则不显示回归线
            showSymbol: regression !== 'none' && formula,
            lineStyle: regression === 'none' ? { opacity: 0 } : {},
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
            dotSize: 10,
            regression: 'none',
            formula: false,
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
                <Select className='w-full' placeholder='请选择X轴变量'>
                  {dataCols.map(
                    (col) =>
                      col.type === '等距或等比数据' && (
                        <Select.Option key={col.name} value={col.name}>
                          {col.name}
                        </Select.Option>
                      ),
                  )}
                </Select>
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
                <Select className='w-full' placeholder='请选择Y轴变量'>
                  {dataCols.map(
                    (col) =>
                      col.type === '等距或等比数据' && (
                        <Select.Option key={col.name} value={col.name}>
                          {col.name}
                        </Select.Option>
                      ),
                  )}
                </Select>
              </Form.Item>
              <Form.Item name='yLabel' noStyle>
                <Input className='w-max' placeholder='标签默认为变量名' />
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
          <Form.Item label='回归线类型与通项公式'>
            <Space.Compact block>
              <Form.Item
                name='regression'
                noStyle
                rules={[{ required: true, message: '请选择回归类型' }]}
              >
                <Select>
                  {REGRESSION_TYPES.map((type) => (
                    <Select.Option key={type.value} value={type.value}>
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name='formula'
                noStyle
                rules={[
                  { required: true, message: '请选择是否显示公式' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('regression') === 'none' && value) {
                        return Promise.reject(
                          '如果要显示公式, 请选择回归线类型',
                        )
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Select>
                  <Select.Option value={true}>显示公式</Select.Option>
                  <Select.Option value={false}>不显示公式</Select.Option>
                </Select>
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
