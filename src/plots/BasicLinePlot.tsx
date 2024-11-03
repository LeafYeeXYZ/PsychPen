import * as echarts from 'echarts'
import { Select, Button, Form, Input, Space, Radio } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import type { EChartsOption } from 'echarts'
import { min, max, mean, median, sum } from 'psych-lib'
import { downloadImage } from '../lib/utils'

type Statistic = 'mean' | 'median' | 'max' | 'min' | 'sum' | 'count'

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
  /** 折线图统计量 */
  statistic: Statistic
  /** 是否启用曲线平滑 */
  smooth: boolean
  /** 是否显示数据标签 */
  label: boolean
}

export function BasicLinePlot() {

  const { dataCols, dataRows, messageApi, isLargeData } = useZustand()
  // 图形设置相关
  const [disabled, setDisabled] = useState<boolean>(false)
  const [rendered, setRendered] = useState<boolean>(false)
  const handleFinish = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const timestamp = Date.now()
      const { dataVar, groupVar, xLabel, yLabel, title, variables, peerLabel, dataLabel, type, statistic, smooth, label } = values
      const chart = echarts.init(document.getElementById('echarts-container')!)
      if (type === 'independent') {
        // 被试间数据处理
        const cols = Array
          .from(new Set(dataRows.map((row) => row[groupVar!])).values())
          .filter((value) => typeof value !== 'undefined')
          .sort()
        const data: number[] = []
        const rows: number[][] = cols
          .map((col) => dataRows
            .filter((row) => row[groupVar!] === col)
            .map((row) => row[dataVar!])
            .filter((value) => typeof value !== 'undefined' && !isNaN(Number(value)))
            .map((value) => Number(value))
          )
        rows.map((row) => {
          switch (statistic) {
            case 'mean':
              data.push(+mean(row).toFixed(4))
              break
            case 'median':
              data.push(+median(row).toFixed(4))
              break
            case 'max':
              data.push(+max(row).toFixed(4))
              break
            case 'min':
              data.push(+min(row).toFixed(4))
              break
            case 'sum':
              data.push(+sum(row).toFixed(4))
              break
            case 'count':
              data.push(row.length)
              break
          }
        })
        const option: EChartsOption = {
          title: [
            {
              text: title,
              left: 'center',
            },
          ],
          xAxis: {
            name: xLabel || groupVar,
            nameLocation: 'middle',
            type: 'category',
            data: cols.map((col) => String(col)),
            nameGap: 30,
          },
          yAxis: {
            type: 'value',
            name: yLabel || dataVar,
            nameLocation: 'middle',
            nameGap: 35,
          },
          series: [{
            type: 'line',
            data: data,
            smooth: smooth,
            label: {
              show: label,
            },
            emphasis: {
              label: {
                show: true,
              },
            },
          }],
          legend: {
            show: false,
          },
        }
        chart.setOption(option, true)
      } else {
        // 被试内数据处理
        const option: EChartsOption = {
          title: [
            {
              text: title,
              left: 'center',
            },
          ],
          xAxis: {
            name: peerLabel || 'X',
            nameLocation: 'middle',
            type: 'category',
            data: variables,
            nameGap: 30,
          },
          yAxis: {
            type: 'value',
            name: dataLabel || 'Y',
            nameLocation: 'middle',
            nameGap: 35,
          },
          series: [{
            type: 'line',
            data: variables!.map((variable) => {
              const row = dataRows
                .map((row) => row[variable])
                .filter((value) => typeof value !== 'undefined' && !isNaN(Number(value)))
                .map((value) => Number(value))
              switch (statistic) {
                case 'mean':
                  return +mean(row).toFixed(4)
                case 'median':
                  return +median(row).toFixed(4)
                case 'max':
                  return +max(row).toFixed(4)
                case 'min':
                  return +min(row).toFixed(4)
                case 'sum':
                  return +sum(row).toFixed(4)
                case 'count':
                  return row.length
              }
            }),
            smooth: smooth,
            label: {
              show: label,
              
            },
            emphasis: {
              label: {
                show: true,
              },
            },
          }],
          legend: {
            show: false,
          },
        }
        chart.setOption(option, true)
      }
      setRendered(true)
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  // 被试内和被试间
  const [formType, setFormType] = useState<'peer' | 'independent'>('independent')

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
            type: 'independent',
            statistic: 'mean',
            smooth: false,
            label: true,
          }}
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
                    <Select
                      className='w-full'
                      placeholder='请选择分组变量'
                      options={dataCols.map((col) => (
                        { label: `${col.name} (水平数: ${col.unique})`, value: col.name }
                      ))}
                    />
                  </Form.Item>
                  <Form.Item
                    name='xLabel'
                    noStyle
                  >
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
                    <Select
                      className='w-full'
                      placeholder='请选择数据变量'
                      options={dataCols
                        .filter((col) => col.type === '等距或等比数据')
                        .map((col) => ({ label: col.name, value: col.name })
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name='yLabel'
                    noStyle
                  >
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
                    .map((col) => ({ label: col.name, value: col.name })
                  )}
                />
              </Form.Item>
              <Form.Item label='自定义X轴和Y轴标签'>
                <Space.Compact>
                  <Form.Item
                    noStyle
                    name='peerLabel'
                  >
                    <Input className='w-full' placeholder='X轴标签默认为X' />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name='dataLabel'
                  >
                    <Input className='w-full' placeholder='Y轴标签默认为Y' />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </>
          )}
          <Form.Item label='折线统计量和图形设置'>
            <Space.Compact className='w-full'>
              <Form.Item
                noStyle
                name='statistic'
              >
                <Select className='w-full'>
                  <Select.Option value='mean'>均值</Select.Option>
                  <Select.Option value='count'>计数</Select.Option>
                  <Select.Option value='median'>中位数</Select.Option>
                  <Select.Option value='max'>最大值</Select.Option>
                  <Select.Option value='min'>最小值</Select.Option>
                  <Select.Option value='sum'>总和</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                name='smooth'
              >
                <Select
                  className='w-full'
                  placeholder='曲线平滑'
                >
                  <Select.Option value={true}>启用曲线平滑</Select.Option>
                  <Select.Option value={false}>关闭曲线平滑</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                name='label'
              >
                <Select
                  className='w-full'
                  placeholder='数据标签'
                >
                  <Select.Option value={true}>显示数据标签</Select.Option>
                  <Select.Option value={false}>隐藏数据标签</Select.Option>
                </Select>
              </Form.Item>
            </Space.Compact>
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