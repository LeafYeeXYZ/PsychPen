import { useZustand } from '../lib/useZustand'
import { Select, Button, Form, InputNumber, Space } from 'antd'
import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
// @ts-expect-error ml.js 未提供类型定义
import { DecisionTreeClassifier } from 'ml-cart'
import * as echarts from 'echarts'

type Model = {
  splitValue: number
  splitColumn: number
  right?: Model
  left?: Model
  numberSamples?: number
  distribution?: {
    data: [Float64Array]
  }
}

type Chart = {
  name: string
  children?: Chart[]
}

function Model2Chart(model: Model, x: string[], y: string, name?: string): Chart {
  const children = []
  if (model.left) {
    children.push(Model2Chart(model.left, x, y, `${x[model.splitColumn]} <= ${model.splitValue}`))
  }
  if (model.right) {
    children.push(Model2Chart(model.right, x, y, `${x[model.splitColumn]} > ${model.splitValue}`))
  }
  if (model.numberSamples && model.numberSamples > 0) {
    return {
      name: name ? 
        `${name} (${model.numberSamples})` : 
        `根节点 (${model.numberSamples})`,
      children: model.distribution ?
        Array.from(model.distribution.data[0]).map((value, index) => {
          return index === 0 ?
          { name: `${x[model.splitColumn]} <= ${model.splitValue} --- ${y} = ${value.toFixed(4)}` }
          :
          { name: `${x[model.splitColumn]} > ${model.splitValue} --- ${y} = ${value.toFixed(4)}` }
        }) :
        children
    } 
  } else {
    return { name: `${name} (0)` }
  }
}

type Option = {
  /** 自变量 */
  x: string[]
  /** 因变量 */
  y: string
  /** 最大深度, 默认 Infinity */
  maxDepth?: number
  /** 叶子的最小样本数, 默认 3 */
  minNumSamples?: number
}
type Result = {
  /** 训练后的决策树 */
  m: Model
} & Option

export function DecisionTree() {

  const { dataCols, dataRows, messageApi, isDarkMode, isLargeData } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
      const timestamp = Date.now()
      const { x, y, maxDepth, minNumSamples } = values
      const filteredData = dataRows.filter((row) => [...x, y].every((col) => typeof row[col] !== 'undefined'))
      const trainingSet = filteredData.map((row) => x.map((col) => Number(row[col])))
      const predictions = filteredData.map((row) => Number(row[y]))
      const options = {
        gainFunction: 'gini',
        maxDepth: maxDepth || Infinity,
        minNumSamples: minNumSamples || 3,
      }
      const cart = new DecisionTreeClassifier(options)
      cart.train(trainingSet, predictions)
      setResult({ x, y, maxDepth, minNumSamples, m: cart.toJSON().root })
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  useEffect(() => {
    if (!result) return
    const chart = echarts.init(document.getElementById('decision-tree'))
    chart.setOption({
      series: [
        {
          type: 'tree',
          data: [Model2Chart(result.m, result.x, result.y)],
          symbolSize: 7,
          right: '25%',
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 9,
            color: isDarkMode ? 'white' : 'black'
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },
          expandAndCollapse: true,
          initialTreeDepth: -1,
        }
      ]
    }, true)
  }, [result])

  return (
    <div className='component-main'>

      <div className='component-form'>

        <Form<Option>
          className='w-full py-4'
          layout='vertical'
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
        >
          <Form.Item
            label='自变量(可多选)'
            name='x'
            rules={[{ required: true, message: '请选择自变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择自变量'
              mode='multiple'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item
            label='因变量'
            name='y'
            rules={[
              { required: true, message: '请选择因变量' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('x').includes(value)) {
                    return Promise.reject('因变量不能与自变量相同')
                  }
                  return Promise.resolve()
                }
              })
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择因变量'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item label='最大深度和叶子的最小样本数'>
            <Space.Compact block>
              <Form.Item
                name='maxDepth'
                noStyle
              >
                <InputNumber
                  className='w-full'
                  placeholder='深度默认无限'
                  min={1}
                  step={1}
                />
              </Form.Item>
              <Form.Item
                name='minNumSamples'
                noStyle
              >
                <InputNumber
                  className='w-full'
                  placeholder='默认最少三个样本'
                  min={1}
                  step={1}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item>
            <Button
              className='w-full mt-4'
              type='default'
              htmlType='submit'
            >
              计算
            </Button>
          </Form.Item>
        </Form>

      </div>

      <div className='component-result'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <div id='decision-tree' className='w-full h-full' />

          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <span>请填写参数并点击计算</span>
          </div>
        )}
        
      </div>

    </div>
  )
}