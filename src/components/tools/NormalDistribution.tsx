import {
	DeleteOutlined,
	PauseOutlined,
	PlaySquareOutlined,
} from '@ant-design/icons'
import { mean as m, randomNormal, std as s } from '@psych/lib'
import { Button, InputNumber, Space, Tag } from 'antd'
import * as echarts from 'echarts'
import { useEffect, useId, useRef, useState } from 'react'
import { useStates } from '../../hooks/useStates.ts'
import { markS } from '../../lib/utils.ts'

const DEFAULT_MEAN = 0
const DEFAULT_STD = 2
const ANIMATE_INTERVAL = 500

function generateDate(data: number[]): {
	count: number[]
	label: number[]
} {
	const count: number[] = []
	const label = [
		-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	]
	for (const value of label) {
		const min = value - 0.5
		const max = value + 0.5
		count.push(data.filter((item) => item >= min && item < max).length)
	}
	return { count, label }
}

export function NormalDistribution() {
	const isDarkMode = useStates((state) => state.isDarkMode)
	// 基础数据
	const [mean, setMean] = useState<number>(DEFAULT_MEAN)
	const [std, setStd] = useState<number>(DEFAULT_STD)
	const [data, setData] = useState<number[]>([])
	const generate = (times = 1) => {
		const result: number[] = []
		for (let i = 0; i < times; i++) {
			result.push(randomNormal(mean, std))
		}
		setData((draft) => [...draft, ...result])
	}
	// 动态演示相关
	const timer = useRef<ReturnType<typeof setInterval> | null>(null)
	const [speed, setSpeed] = useState<number>(1)
	const animate = () => {
		timer.current = setInterval(() => {
			generate(speed)
		}, ANIMATE_INTERVAL)
	}
	useEffect(() => {
		return () => {
			timer.current && clearInterval(timer.current)
		}
	}, [])
	// 绘制样本分布图
	const plotId = useId()
	useEffect(() => {
		const ele = document.getElementById(plotId)
		const chart = echarts.init(ele)
		const { count, label } = generateDate(data)
		const option = {
			xAxis: {
				type: 'category',
				data: label,
				axisTick: { alignWithLabel: true },
			},
			yAxis: { type: 'value' },
			series: [
				{
					data: count,
					type: 'bar',
					barWidth: '101%',
					label: {
						formatter: (params: { value: number }) => {
							return `${params.value}\n${((params.value / Math.max(data.length, 1)) * 100).toFixed()}%\n`
						},
						color: isDarkMode ? '#ffffff' : '#000000',
						position: 'top',
						show: true,
					},
					itemStyle: {
						color: '#ff68c0',
						opacity: 0.5,
					},
				},
				{
					data: count,
					type: 'line',
					smooth: true,
					showSymbol: false,
					lineStyle: {
						color: '#ff68c0',
						opacity: 0.7,
					},
				},
			],
		}
		chart.setOption(option)
	}, [data, isDarkMode, plotId])

	return (
		<div className='w-full h-full flex flex-col justify-center items-center overflow-hidden p-4'>
			<div className='w-full max-w-280 h-[calc(100%-6rem)] flex justify-center items-center'>
				<div className='w-52 h-full flex flex-col justify-center items-center'>
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
								<td>
									<Tag color='pink' variant='outlined'>
										样本
									</Tag>{' '}
									均值
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: data.length ? markS(m(data)) : '',
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='pink' variant='outlined'>
										样本
									</Tag>{' '}
									标准差
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: data.length ? markS(s(data)) : '',
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='blue' variant='outlined'>
										总体
									</Tag>{' '}
									均值
								</td>
								<td>{mean}</td>
							</tr>
							<tr>
								<td>
									<Tag color='blue' variant='outlined'>
										总体
									</Tag>{' '}
									标准差
								</td>
								<td>{std}</td>
							</tr>
						</tbody>
					</table>
					<p className='text-sm mt-4 mb-1'>
						右图中 <Tag variant='outlined'>X</Tag> 轴刻度指区间
					</p>
					<p className='text-sm'>
						如 <Tag variant='outlined'>0</Tag> 指{' '}
						<Tag variant='outlined'>[-0.5,0.5)</Tag>
					</p>
				</div>
				<div className='w-[calc(100%-13rem)] h-full flex flex-col justify-center items-center gap-4 overflow-auto'>
					<div id={plotId} className='w-full h-full' />
				</div>
			</div>

			<div className='w-full h-8 my-4 flex justify-center items-center gap-4 overflow-auto'>
				<Space.Compact>
					<Space.Addon className='text-nowrap'>
						总体均值
						<Tag variant='outlined' color='blue' className='ml-1!'>
							μ
						</Tag>
					</Space.Addon>
					<InputNumber
						defaultValue={DEFAULT_MEAN}
						onChange={(value) => {
							if (timer.current) {
								clearInterval(timer.current)
								timer.current = null
							}
							setMean(typeof value === 'number' ? value : 0)
							setData([])
						}}
					/>
				</Space.Compact>
				<Space.Compact>
					<Space.Addon className='text-nowrap'>
						总体标准差{' '}
						<Tag variant='outlined' color='blue' className='ml-1!'>
							σ
						</Tag>
					</Space.Addon>
					<InputNumber
						defaultValue={DEFAULT_STD}
						step={0.1}
						onChange={(value) => {
							if (timer.current) {
								clearInterval(timer.current)
								timer.current = null
							}
							setStd(typeof value === 'number' ? value : 1)
							setData([])
						}}
					/>
				</Space.Compact>
				<Button
					onClick={() => {
						if (timer.current) {
							clearInterval(timer.current)
							timer.current = null
						}
						setData([])
					}}
					icon={<DeleteOutlined />}
				>
					清空数据
				</Button>
			</div>
			<div className='w-full h-8 flex justify-center items-center gap-4 overflow-auto'>
				<Space.Compact>
					<div className='w-[4.7rem] border rounded-l-md border-r-0 border-gray-300 flex items-center justify-center text-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-700'>
						手动抽样
					</div>
					<Button onClick={() => generate(1)}>
						<Tag variant='outlined' color='pink'>
							1
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(10)}>
						<Tag variant='outlined' color='pink'>
							10
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(100)}>
						<Tag variant='outlined' color='pink'>
							100
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(1000)}>
						<Tag variant='outlined' color='pink'>
							1000
						</Tag>{' '}
						次
					</Button>
				</Space.Compact>
				<Space.Compact>
					<Space.Addon className='text-nowrap'>动态演示</Space.Addon>
					<InputNumber
						defaultValue={1}
						min={1}
						step={1}
						max={100}
						onChange={(value) => {
							if (timer.current) {
								clearInterval(timer.current)
								timer.current = setInterval(() => {
									generate(typeof value === 'number' ? value : 1)
								}, ANIMATE_INTERVAL)
							}
							setSpeed(typeof value === 'number' ? value : 1)
						}}
					/>
					<Space.Addon>次/半秒</Space.Addon>
					<Button
						onClick={() => {
							if (timer.current) {
								clearInterval(timer.current)
								timer.current = null
							}
							animate()
						}}
						autoInsertSpace={false}
						icon={<PlaySquareOutlined />}
					>
						开始
					</Button>
					<Button
						onClick={() => {
							if (timer.current) {
								clearInterval(timer.current)
								timer.current = null
							}
						}}
						autoInsertSpace={false}
						icon={<PauseOutlined />}
					>
						暂停
					</Button>
				</Space.Compact>
			</div>
		</div>
	)
}
