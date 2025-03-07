import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, InputNumber } from 'antd'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { mean as mn, std as sd } from '@psych/lib'
import { downloadImage } from '../../lib/utils'

type Option = {
  /** 每组显示的被试内变量名 */
  variables: string[]
  /** 分组变量 */
  group: string
  /** 自定义分组变量各组的标签 */
  gLabel?: string[]
  /** 自定义每组的不同变量的标签 */
  iLabel?: string[]

  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string

  /** 是否显示数据标签 */
  label: 'mean' | 'std' | 'both' | 'none'
  /** 误差棒数据 */
  error: 0 | 1 | 2 | 3 | 1.96 | 2.58
  /** 自定义 y 轴最大值 */
  maxY?: number
  /** 自定义 y 轴最小值 */
  minY?: number
}

export function GroupedBarPlot() {
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
      const {
        group,
        xLabel,
        yLabel,
        gLabel,
        label,
        error,
        maxY,
        minY,
        iLabel,
      } = values
      let { variables } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      const filteredRows = dataRows
        .filter((row) => row[group] !== undefined)
        .filter((row) =>
          variables.every(
            (variable) =>
              row[variable] !== undefined && !isNaN(Number(row[variable])),
          ),
        )
        .map((row) => ({
          [group]: String(row[group]),
          ...variables.reduce(
            (acc, cur) => {
              acc[cur] = Number(row[cur])
              return acc
            },
            {} as Record<string, number>,
          ),
        }))
      const cols = Array.from(
        new Set(filteredRows.map((row) => row[group])).values(),
      ).sort((a, b) => Number(a) - Number(b))
      const mean: number[][] = Array.from(
        { length: variables.length },
        () => [],
      )
      const std: [number, number, number, number][][] = Array.from(
        { length: variables.length },
        () => [],
      )
      variables.forEach((variable, i) => {
        const row = cols.map((col) =>
          filteredRows
            .filter((row) => row[group] === col)
            .map((row) => row[variable]),
        ) as number[][]
        const _mean = row.map((r) => +mn(r).toFixed(4))
        const _std = row.map((r) => +sd(r).toFixed(4))
        mean[i] = _mean
        std[i] = _mean.map((m, j) => [
          j,
          m - error * _std[j],
          m + error * _std[j],
          _std[j],
        ])
      })
      if (iLabel) {
        variables = variables.map((variable, i) => iLabel?.[i] ?? variable)
      }
      const option: EChartsOption = {
        xAxis: {
          name: xLabel || group,
          nameLocation: 'middle',
          type: 'category',
          data: cols.map((col, i) => gLabel?.[i] ?? col),
          nameGap: 30,
        },
        yAxis: {
          type: 'value',
          name: yLabel || 'Y',
          nameLocation: 'middle',
          nameGap: 35,
          max: maxY ?? Math.max(...std.flat().map((item) => item[2])),
          min: minY ?? undefined,
        },
        legend: {
          data: variables,
          show: true,
          top: 20,
          textStyle: { color: isDarkMode ? '#fff' : '#000' },
        },
        // @ts-expect-error 套了一层数组后, 类型推断出错
        series: [
          ...mean.map((m, i) => ({
            type: 'bar',
            data: m,
            name: variables[i],
            label: {
              show: label !== 'none',
              // @ts-expect-error 套了一层数组后, 类型推断出错
              formatter: (params) => {
                if (label === 'mean') return `均值: ${params.value}`
                if (label === 'std')
                  return `标准差: ${std[i][params.dataIndex][3]}`
                if (label === 'both')
                  return `均值: ${params.value}\n标准差: ${std[i][params.dataIndex][3]}`
                return ''
              },
              rotate: 90,
              align: 'left',
              verticalAlign: 'middle',
              position: 'insideBottom',
              distance: 15,
            },
            emphasis: {
              label: {
                show: true,
              },
            },
          })),
          ...(error !== 0
            ? std.map((s) => ({
                type: 'custom',
                data: s,
                zlevel: 2,
                // @ts-expect-error 套了一层数组后, 类型推断出错
                renderItem(params, api) {
                  const xValue = api.value(0)
                  const currentSeriesIndices = api.currentSeriesIndices()
                  // 获取柱状图布局信息
                  const barLayout = api.barLayout({
                    count: variables.length,
                  })
                  // 获取当前系列在所有柱状图系列中的索引
                  const barIndex =
                    currentSeriesIndices.indexOf(params.seriesIndex) -
                    variables.length
                  const lowPoint = api.coord([xValue, api.value(1)])
                  const highPoint = api.coord([xValue, api.value(2)])
                  // 使用布局信息调整 x 坐标
                  const offset = barLayout[barIndex].offsetCenter
                  lowPoint[0] += offset
                  highPoint[0] += offset
                  const halfWidth = Math.min(15, barLayout[barIndex].width / 4)
                  return {
                    type: 'group',
                    children: [
                      {
                        // 顶部横线
                        type: 'line',
                        shape: {
                          x1: lowPoint[0] - halfWidth,
                          y1: highPoint[1],
                          x2: lowPoint[0] + halfWidth,
                          y2: highPoint[1],
                        },
                        style: {
                          stroke: isDarkMode ? '#fff' : '#000',
                        },
                      },
                      {
                        // 底部横线
                        type: 'line',
                        shape: {
                          x1: lowPoint[0] - halfWidth,
                          y1: lowPoint[1],
                          x2: lowPoint[0] + halfWidth,
                          y2: lowPoint[1],
                        },
                        style: {
                          stroke: isDarkMode ? '#fff' : '#000',
                        },
                      },
                      {
                        // 竖线
                        type: 'line',
                        shape: {
                          x1: lowPoint[0],
                          y1: lowPoint[1],
                          x2: lowPoint[0],
                          y2: highPoint[1],
                        },
                        style: {
                          stroke: isDarkMode ? '#fff' : '#000',
                        },
                      },
                    ],
                  }
                },
              }))
            : []),
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
            label: 'none',
            error: 1,
          }}
        >
          <Form.Item label='分组(X)变量及其标签'>
            <Space.Compact block>
              <Form.Item
                noStyle
                name='group'
                rules={[{ required: true, message: '请选择分组变量' }]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择分组变量'
                  options={dataCols.map((col) => ({
                    label: `${col.name} (水平数: ${col.unique})`,
                    value: col.name,
                  }))}
                />
              </Form.Item>
              <Form.Item noStyle name='xLabel'>
                <Input className='w-full' placeholder='默认为分组变量名' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='数据(Y)变量及其标签'>
            <Space.Compact block>
              <Form.Item
                noStyle
                name='variables'
                rules={[{ required: true, message: '请选择数据变量' }]}
              >
                <Select
                  className='w-full'
                  placeholder='可多选'
                  mode='multiple'
                  options={dataCols
                    .filter((col) => col.type === '等距或等比数据')
                    .map((col) => ({ label: col.name, value: col.name }))}
                />
              </Form.Item>
              <Form.Item noStyle name='yLabel'>
                <Input className='w-full' placeholder='默认为Y' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='数据标签和误差棒内容'>
            <Space.Compact className='w-full'>
              <Form.Item noStyle name='label'>
                <Select
                  className='w-full'
                  placeholder='数据标签内容'
                  options={[
                    { label: '只显示均值', value: 'mean' },
                    { label: '只显示标准差', value: 'std' },
                    { label: '均值和标准差', value: 'both' },
                    { label: '隐藏数据标签', value: 'none' },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle name='error'>
                <Select
                  className='w-full'
                  placeholder='误差棒内容'
                  options={[
                    { label: '上下1.96倍标准差', value: 1.96 },
                    { label: '上下2.58倍标准差', value: 2.58 },
                    { label: '上下3倍标准差', value: 3 },
                    { label: '上下2倍标准差', value: 2 },
                    { label: '上下1倍标准差', value: 1 },
                    { label: '不显示误差棒', value: 0 },
                  ]}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='自定义不同组的标签和组内不同变量的标签'>
            <Space.Compact block>
              <Form.Item noStyle name='gLabel'>
                <Select
                  className='w-full'
                  placeholder='默认为分组变量值'
                  mode='tags'
                />
              </Form.Item>
              <Form.Item noStyle name='iLabel'>
                <Select
                  className='w-full'
                  placeholder='默认为数据变量名'
                  mode='tags'
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label='自定义Y轴最大值和最小值'>
            <Space.Compact className='w-full'>
              <Form.Item noStyle name='maxY'>
                <InputNumber
                  className='w-full'
                  addonBefore='最大值'
                  placeholder='默认自动设置'
                />
              </Form.Item>
              <Form.Item noStyle name='minY'>
                <InputNumber
                  className='w-full'
                  addonBefore='最小值'
                  placeholder='默认自动设置'
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
