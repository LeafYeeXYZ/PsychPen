import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, Radio } from 'antd'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { downloadImage, sleep } from '../../lib/utils'

type Option = {
  /** 数据分类 */
  type: 'peer' | 'independent'

  // 被试内
  /** 变量名 */
  variables?: string[]
  /** x 轴标签 */
  peerLabel?: string
  /** y 轴标签 */
  dataLabel?: string

  // 被试间
  /** 分组变量 */
  groupVar?: string
  /** 数据变量 */
  dataVar?: string
  /** 自定义 x轴 标签 */
  xLabel?: string
  /** 自定义 y轴 标签 */
  yLabel?: string

  /** 自定义标题 */
  title?: string
}

export function BasicBoxPlot() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { messageApi } = useStates()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...', 0)
      isLargeData && (await sleep())
      const timestamp = Date.now()
      const {
        dataVar,
        groupVar,
        xLabel,
        yLabel,
        title,
        type,
        variables,
        peerLabel,
        dataLabel,
      } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      if (type === 'independent') {
        // 被试间数据处理
        const cols = Array.from(
          new Set(dataRows.map((row) => row[groupVar!])).values(),
        )
          .filter((value) => typeof value !== 'undefined')
          .sort((a, b) => Number(a) - Number(b))
        const rows = cols.map((col) =>
          dataRows
            .filter((row) => row[groupVar!] === col)
            .map((row) => row[dataVar!])
            .filter((value) => typeof value === 'number'),
        )
        const option: EChartsOption = {
          title: [
            {
              text: title,
              left: 'center',
            },
            {
              text: '上离群值: Q3 + 1.5 * IQR\n下离群值: Q1 - 1.5 * IQR',
              borderColor: '#a0a0a0',
              borderWidth: 1,
              textStyle: {
                fontWeight: 'normal',
                fontSize: 10,
                lineHeight: 15,
                color: '#a0a0a0',
              },
              left: '10%',
              top: '90%',
            },
          ],
          grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
          },
          xAxis: {
            name: xLabel || groupVar,
            nameLocation: 'middle',
            type: 'category',
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
          yAxis: {
            type: 'value',
            name: yLabel || dataVar,
            nameLocation: 'middle',
            nameGap: 35,
            splitArea: {
              show: true,
            },
          },
          series: [
            {
              name: 'boxplot',
              type: 'boxplot',
              datasetIndex: 1,
            },
            {
              name: 'outlier',
              type: 'scatter',
              datasetIndex: 2,
            },
          ],
          dataset: [
            {
              source: rows,
            },
            {
              transform: {
                type: 'boxplot',
                config: {
                  itemNameFormatter: (value: { value: number }) =>
                    cols[value.value],
                },
              },
            },
            {
              fromDatasetIndex: 1,
              fromTransformResult: 1,
            },
          ],
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow',
            },
            formatter: (params) => {
              // @ts-expect-error 无法正确推断类型
              if (params.componentSubType === 'boxplot') {
                return [
                  // @ts-expect-error 无法正确推断类型
                  `最大值: ${params.value[5]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q3: ${params.value[4]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q2: ${params.value[3]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q1: ${params.value[2]}`,
                  // @ts-expect-error 无法正确推断类型
                  `最小值: ${params.value[1]}`,
                ].join('<br>')
              }
              // @ts-expect-error 无法正确推断类型
              return `${params.value[1]}`
            },
          },
        }
        chart.setOption(option, true)
      } else {
        // 被试内数据处理
        const cols = variables!
        const rows = variables!.map((variable) =>
          dataRows
            .map((row) => row[variable])
            .filter(
              (value) => typeof value !== 'undefined' && !isNaN(Number(value)),
            )
            .map((value) => Number(value)),
        )
        const option: EChartsOption = {
          title: [
            {
              text: title,
              left: 'center',
            },
            {
              text: '上离群值: Q3 + 1.5 * IQR\n下离群值: Q1 - 1.5 * IQR',
              borderColor: '#a0a0a0',
              borderWidth: 1,
              textStyle: {
                fontWeight: 'normal',
                fontSize: 10,
                lineHeight: 15,
                color: '#a0a0a0',
              },
              left: '10%',
              top: '90%',
            },
          ],
          grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
          },
          xAxis: {
            name: peerLabel || 'X',
            nameLocation: 'middle',
            type: 'category',
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
              show: false,
            },
            splitLine: {
              show: false,
            },
          },
          yAxis: {
            type: 'value',
            name: dataLabel || 'Y',
            nameLocation: 'middle',
            nameGap: 35,
            splitArea: {
              show: true,
            },
          },
          series: [
            {
              name: 'boxplot',
              type: 'boxplot',
              datasetIndex: 1,
            },
            {
              name: 'outlier',
              type: 'scatter',
              datasetIndex: 2,
            },
          ],
          dataset: [
            {
              source: rows,
            },
            {
              transform: {
                type: 'boxplot',
                config: {
                  itemNameFormatter: (value: { value: number }) =>
                    cols[value.value],
                },
              },
            },
            {
              fromDatasetIndex: 1,
              fromTransformResult: 1,
            },
          ],
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow',
            },
            formatter: (params) => {
              // @ts-expect-error 无法正确推断类型
              if (params.componentSubType === 'boxplot') {
                return [
                  // @ts-expect-error 无法正确推断类型
                  `最大值: ${params.value[5]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q3: ${params.value[4]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q2: ${params.value[3]}`,
                  // @ts-expect-error 无法正确推断类型
                  `Q1: ${params.value[2]}`,
                  // @ts-expect-error 无法正确推断类型
                  `最小值: ${params.value[1]}`,
                ].join('<br>')
              }
              // @ts-expect-error 无法正确推断类型
              return `${params.value[1]}`
            },
          },
        }
        chart.setOption(option, true)
      }
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
  // 被试内和被试间
  const [formType, setFormType] = useState<'peer' | 'independent'>(
    'independent',
  )

  return (
    <div className='component-main'>
      <div className='component-form'>
        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={async (values) => {
            try {
              flushSync(() => setDisabled(true))
              await handleFinish(values)
            } finally {
              setDisabled(false)
            }
          }}
          autoComplete='off'
          initialValues={{
            showOutliers: true,
            type: 'independent',
          }}
          disabled={disabled}
        >
          <Form.Item
            name='type'
            label='待绘图变量类型'
            rules={[{ required: true, message: '请选择待绘图变量类型' }]}
          >
            <Radio.Group
              block
              onChange={(e) => setFormType(e.target.value)}
              optionType='button'
              buttonStyle='solid'
            >
              <Radio value='peer'>被试内变量</Radio>
              <Radio value='independent'>被试间变量</Radio>
            </Radio.Group>
          </Form.Item>
          {formType === 'independent' ? (
            <>
              <Form.Item label='分组(X)变量及其标签'>
                <Space.Compact className='w-full'>
                  <Form.Item
                    noStyle
                    name='groupVar'
                    rules={[
                      { required: true, message: '请选择分组变量' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value === getFieldValue('dataVar')) {
                            return Promise.reject('请选择不同的变量')
                          }
                          return Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <Select className='w-full' placeholder='请选择分组变量'>
                      {dataCols.map((col) => (
                        <Select.Option key={col.name} value={col.name}>
                          {col.name} (水平数: {col.unique})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name='xLabel' noStyle>
                    <Input className='w-max' placeholder='标签默认为变量名' />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item label='数据(Y)变量及其标签'>
                <Space.Compact className='w-full'>
                  <Form.Item
                    noStyle
                    name='dataVar'
                    rules={[
                      { required: true, message: '请选择数据变量' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value === getFieldValue('groupVar')) {
                            return Promise.reject('请选择不同的变量')
                          }
                          return Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <Select className='w-full' placeholder='请选择数据变量'>
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
            </>
          ) : (
            <>
              <Form.Item
                label='选择配对变量(X轴各点)(可多选)'
                name='variables'
                rules={[
                  { required: true, message: '请选择配对变量' },
                  { type: 'array', message: '请选择一个或多个配对变量' },
                ]}
              >
                <Select
                  className='w-full'
                  placeholder='请选择配对变量'
                  mode='multiple'
                  options={dataCols
                    .filter((col) => col.type === '等距或等比数据')
                    .map((col) => ({ label: col.name, value: col.name }))}
                />
              </Form.Item>
              <Form.Item label='自定义X轴和Y轴标签'>
                <Space.Compact>
                  <Form.Item noStyle name='peerLabel'>
                    <Input className='w-full' placeholder='X轴标签默认为X' />
                  </Form.Item>
                  <Form.Item noStyle name='dataLabel'>
                    <Input className='w-full' placeholder='Y轴标签默认为Y' />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </>
          )}
          <Form.Item label='自定义标题' name='title'>
            <Input className='w-full' placeholder='默认无标题' />
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
