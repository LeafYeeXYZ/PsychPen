import normal from '@stdlib/random/base/normal'
import { Button, InputNumber, Tag, Space } from 'antd'
import { useState, useRef, useEffect } from 'react'
import { DeleteOutlined, PauseOutlined, PlaySquareOutlined } from '@ant-design/icons'
import * as math from 'mathjs'
import * as echarts from 'echarts'

const DEFAULT_MEAN = 0
const DEFAULT_STD = 2

function generateDate(
  data: number[],
) : { 
  count: number[], 
  label: number[] 
} {
  const count: number[] = []
  const label = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  label.map((value) => {
    const min = value - 0.5
    const max = value + 0.5
    count.push(data.filter((item) => item >= min && item < max).length)
  })
  return { count, label }
}

export function NormalDistribution() {

  // 基础数据
  const [mean, setMean] = useState<number>(DEFAULT_MEAN)
  const [std, setStd] = useState<number>(DEFAULT_STD)
  const [data, setData] = useState<number[]>([])
  const generate = (times: number = 1) => {
    const result: number[] = []
    for (let i = 0; i < times; i++) {
      result.push(normal(mean, std))
    }
    setData(draft => [...draft, ...result])
  }
  // 动态演示相关
  const timer = useRef<number | null>(null)
  const animate = () => {
    timer.current = setInterval(() => {
      generate(1)
    }, 200)
  }
  useEffect(() => {
    return () => {
      timer.current && clearInterval(timer.current)
    }
  }, [])
  // 绘制样本分布图
  useEffect(() => {
    const ele = document.getElementById('echart-sample-distribution')!
    const chart = echarts.init(ele)
    const { count, label } = generateDate(data)
    const option = {
      xAxis: { type: 'category', data: label, axisTick: { alignWithLabel: true } },
      yAxis: { type: 'value' },
      series: [{ data: count, type: 'bar', barWidth: '101%', label: { 
        formatter: (params: { value: number }) => {
          return `${params.value}\n${(params.value / Math.max(data.length, 1) * 100).toFixed()}%`
        }, position: 'top', show: true }
      }]
    }
    chart.setOption(option)
  }, [data])

  return (
    <div className='w-full h-full flex flex-col justify-center items-center overflow-hidden p-4'>
      
      <div className='w-full max-w-[70rem] h-[calc(100%-6rem)] flex justify-center items-center'>
        <div className='w-52 h-full flex flex-col justify-center items-center gap-4'>
          <table className='three-line-table'>
            <thead>
              <tr>
                <td>统计量</td>
                <td>数值</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>样本量</td>
                <td>{data.length}</td>
              </tr>
              <tr>
                <td><Tag color='pink'>样本</Tag>均值</td>
                <td>{data.length ? math.mean(data).toFixed(3) : ''}</td>
              </tr>
              <tr>
                <td><Tag color='pink'>样本</Tag>标准差</td>
                <td>{data.length ? Number(math.std(data)).toFixed(3) : ''}</td>
              </tr>
              <tr>
                <td><Tag color='blue'>总体</Tag>均值</td>
                <td>{mean}</td>
              </tr>
              <tr>
                <td><Tag color='blue'>总体</Tag>标准差</td>
                <td>{std}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='w-[calc(100%-13rem)] h-full flex flex-col justify-center items-center gap-4 overflow-auto'>
          <div id='echart-sample-distribution' className='w-full h-full'></div>
        </div>
      </div>

      <div className='w-full h-8 my-4 flex justify-center items-center gap-4 overflow-auto'>
        <InputNumber
          defaultValue={DEFAULT_MEAN}
          onChange={(value) => {
            timer.current && clearInterval(timer.current)
            setMean(typeof value === 'number' ? value : 0)
            setData([])
          }}
          addonBefore='均值(μ)'
          className='w-28'
        />
        <InputNumber
          defaultValue={DEFAULT_STD}
          step={0.1}
          onChange={(value) => {
            timer.current && clearInterval(timer.current)
            setStd(typeof value === 'number' ? value : 1)
            setData([])
          }}
          addonBefore='标准差(σ)'
          className='w-36'
        />
        <Button 
          onClick={() => {
            timer.current && clearInterval(timer.current)
            setData([])
          }}
          icon={<DeleteOutlined />}
        >
          清空数据
        </Button>
        <Button 
          onClick={() => {
            timer.current && clearInterval(timer.current)
          }}
          icon={<PauseOutlined />}
        >
          暂停动态演示
        </Button>
      </div>
      <div className='w-full h-8 flex justify-center items-center gap-4 overflow-auto'>
        <Space.Compact>
          <Button onClick={() => generate(1)}>抽样 <Tag className='mx-0' color='blue'>1</Tag> 次</Button>
          <Button onClick={() => generate(10)}>抽样 <Tag className='mx-0' color='blue'>10</Tag> 次</Button>
          <Button onClick={() => generate(100)}>抽样 <Tag className='mx-0' color='blue'>100</Tag> 次</Button>
          <Button onClick={() => generate(1000)}>抽样 <Tag className='mx-0' color='blue'>1000</Tag> 次</Button>
        </Space.Compact>
        <Button 
          onClick={() => animate()}
          icon={<PlaySquareOutlined />}
        >
          开始动态演示
        </Button>
      </div>

    </div>
  )
}