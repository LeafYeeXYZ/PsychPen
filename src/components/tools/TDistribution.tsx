import {
	DeleteOutlined,
	PauseOutlined,
	PlaySquareOutlined,
} from '@ant-design/icons'
import { mean as m, randomNormal, std as s } from '@psych/lib'
import { Button, InputNumber, Space, Tag } from 'antd'
import * as echarts from 'echarts'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useStates } from '../../hooks/useStates.ts'
import { markS } from '../../lib/utils.ts'

const DEFAULT_MEAN = 0
const DEFAULT_STD = 2
const DEFAULT_DF = 30
const ANIMATE_INTERVAL = 500

function generateDate(data: number[]): {
	count: number[]
	label: number[]
} {
	const lag = 0.1
	const count: number[] = []
	const label = new Array(21).fill(0).map((_, i) => (i - 10) * 2 * lag)
	label.map((value) => {
		const min = value - lag
		const max = value + lag
		count.push(data.filter((item) => item >= min && item < max).length)
	})
	return { count, label }
}

export function TDistribution() {
	const isDarkMode = useStates((state) => state.isDarkMode)
	// 基础数据
	const [mean, setMean] = useState<number>(DEFAULT_MEAN)
	const [std, setStd] = useState<number>(DEFAULT_STD)
	const [df, setDf] = useState<number>(DEFAULT_DF)
	const n = useMemo(() => df + 1, [df])

	const [data, setData] = useState<
		{ mean: number; std: number; sem: number; t: number }[]
	>([])
	const generate = (times = 1) => {
		const result: { mean: number; std: number; sem: number; t: number }[] = []
		for (let i = 0; i < times; i++) {
			const raw: number[] = []
			for (let j = 0; j < n; j++) {
				raw.push(randomNormal(mean, std))
			}
			const _mean = m(raw)
			const _std = s(raw, true, _mean)
			const _sem = _std / Math.sqrt(n)
			const _t = (_mean - mean) / _sem
			result.push({ mean: _mean, std: _std, sem: _sem, t: _t })
		}
		setData((draft) => [...draft, ...result])
	}
	// 动态演示相关
	const timer = useRef<number | null>(null)
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
		const { count, label } = generateDate(data.map((item) => item.mean))
		const option = {
			xAxis: {
				type: 'category',
				data: label.map((v) => v.toFixed(1)),
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
			<div className='w-full max-w-[71rem] h-[calc(100%-6rem)] flex justify-center items-center'>
				<div className='w-56 h-full flex flex-col justify-center items-center'>
					<table className='three-line-table'>
						<thead>
							<tr>
								<td>统计量</td>
								<td>数值</td>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<Tag color='pink'>样本均值</Tag>的均值
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: data.length
											? markS(m(data.map((v) => v.mean)))
											: '',
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='pink'>样本均值</Tag>标准差
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: data.length
											? markS(s(data.map((v) => v.mean)))
											: '',
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='pink'>估计标准误</Tag>均值
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: data.length ? markS(m(data.map((v) => v.sem))) : '',
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='blue'>单个样本</Tag>样本量
								</td>
								<td>{n}</td>
							</tr>
							<tr>
								<td>
									<Tag color='blue'>T分布</Tag>的自由度
								</td>
								<td>{df}</td>
							</tr>
							<tr>
								<td>
									<Tag color='blue'>真实标准误</Tag>
								</td>
								<td
									// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了正常渲染斜体
									dangerouslySetInnerHTML={{
										__html: markS(std / Math.sqrt(n)),
									}}
								/>
							</tr>
							<tr>
								<td>
									<Tag color='blue'>总体</Tag>均值
								</td>
								<td>{mean}</td>
							</tr>
							<tr>
								<td>
									<Tag color='blue'>总体</Tag>标准差
								</td>
								<td>{std}</td>
							</tr>
						</tbody>
					</table>
					<p className='text-sm mt-4 mb-1'>
						右图中 <Tag>X</Tag>轴刻度指区间
					</p>
					<p className='text-sm'>
						如 <Tag>0</Tag>指均值在 <Tag>[-0.5,0.5)</Tag>之间
					</p>
				</div>
				<div className='w-[calc(100%-13rem)] h-full flex flex-col justify-center items-center gap-4 overflow-auto'>
					<div id={plotId} className='w-full h-full' />
				</div>
			</div>

			<div className='w-full h-8 my-4 flex justify-center items-center gap-4 overflow-auto'>
				<InputNumber
					defaultValue={DEFAULT_MEAN}
					step={0.1}
					onChange={(value) => {
						if (timer.current) {
							clearInterval(timer.current)
							timer.current = null
						}
						setMean(typeof value === 'number' ? value : 0)
						setData([])
					}}
					addonBefore={
						<span>
							总体均值{' '}
							<Tag color='blue' style={{ marginRight: '0' }}>
								μ
							</Tag>
						</span>
					}
					className='w-44'
				/>
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
					addonBefore={
						<span>
							总体标准差{' '}
							<Tag color='blue' style={{ marginRight: '0' }}>
								σ
							</Tag>
						</span>
					}
					className='w-52'
				/>
				<InputNumber
					defaultValue={DEFAULT_DF}
					min={1}
					step={1}
					onChange={(value) => {
						if (timer.current) {
							clearInterval(timer.current)
							timer.current = null
						}
						setDf(typeof value === 'number' ? value : 1)
						setData([])
					}}
					addonBefore={
						<span>
							自由度{' '}
							<Tag color='blue' style={{ marginRight: '0' }}>
								df
							</Tag>
						</span>
					}
					className='w-44'
				/>
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
						<Tag className='mx-0' color='pink'>
							1
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(10)}>
						<Tag className='mx-0' color='pink'>
							10
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(100)}>
						<Tag className='mx-0' color='pink'>
							100
						</Tag>{' '}
						次
					</Button>
					<Button onClick={() => generate(1000)}>
						<Tag className='mx-0' color='pink'>
							1000
						</Tag>{' '}
						次
					</Button>
				</Space.Compact>
				<Space.Compact>
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
						addonBefore='动态演示'
						addonAfter='次/半秒'
						className='w-52'
					/>
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
