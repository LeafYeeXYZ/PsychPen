import * as echarts from 'echarts'
import 'echarts-gl'
import { max, mean, median, min } from '@psych/lib'
import { Button, Form, Input, InputNumber, Select, Space } from 'antd'
import type { EChartsOption } from 'echarts'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { downloadImage, sleep } from '../../lib/utils'

type Statistic = 'mean' | 'median' | 'max' | 'min' | 'sum' | 'count'

type Option = {
	/** X轴(分类)变量 */
	xVar: string
	/** Y轴(分类)变量 */
	yVar: string
	/** Z轴(数据)变量 */
	zVar: string
	/** 自定义 x轴 标签 */
	xLabel?: string
	/** 自定义 y轴 标签 */
	yLabel?: string
	/** 自定义 z轴 标签 */
	zLabel?: string
	/** 自定义标题 */
	title?: string
	/** 统计量 */
	statistic: Statistic
	/** 柱状图透明度 */
	opacity: number // 默认 0.4
}

export function ThreeDBarPlot() {
	const { dataCols, dataRows, isLargeData } = useData()
	const { isDarkMode, messageApi } = useStates()
	// 图形设置相关
	const [disabled, setDisabled] = useState<boolean>(false)
	const [rendered, setRendered] = useState<boolean>(false)
	const handleFinish = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const {
				xVar,
				yVar,
				zVar,
				xLabel,
				yLabel,
				zLabel,
				title,
				statistic,
				opacity,
			} = values
			const ele = document.getElementById('echarts-container')
			if (!ele) {
				throw new Error('无法找到图表容器')
			}
			const chart = echarts.init(ele)
			const x: string[] = Array.from(new Set(dataRows.map((row) => row[xVar])))
				.sort((a, b) => Number(a) - Number(b))
				.map(String)
			const y: string[] = Array.from(new Set(dataRows.map((row) => row[yVar])))
				.sort((a, b) => Number(a) - Number(b))
				.map(String)
			const z: number[][] = []
			for (const row of dataRows) {
				const i = x.indexOf(String(row[xVar]))
				const j = y.indexOf(String(row[yVar]))
				if (i !== -1 && j !== -1) {
					switch (statistic) {
						case 'count': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								prev[2] += 1
								z[z.indexOf(prev)] = prev
							} else {
								z.push([i, j, 1])
							}
							break
						}
						case 'mean': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								// @ts-expect-error 这里为了简便, 混用 number 和 number[]
								prev[2].push(Number(row[zVar]))
								z[z.indexOf(prev)] = prev
							} else {
								// @ts-expect-error 这里为了简便, 混用 number 和 number[]
								z.push([i, j, [Number(row[zVar])]])
							}
							break
						}
						case 'sum': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								prev[2] += Number(row[zVar])
								z[z.indexOf(prev)] = prev
							} else {
								z.push([i, j, Number(row[zVar])])
							}
							break
						}
						case 'max': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								prev[2] = Math.max(prev[2], Number(row[zVar]))
								z[z.indexOf(prev)] = prev
							} else {
								z.push([i, j, Number(row[zVar])])
							}
							break
						}
						case 'min': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								prev[2] = Math.min(prev[2], Number(row[zVar]))
								z[z.indexOf(prev)] = prev
							} else {
								z.push([i, j, Number(row[zVar])])
							}
							break
						}
						case 'median': {
							const prev = z.find((item) => item[0] === i && item[1] === j)
							if (prev) {
								// @ts-expect-error 这里为了简便, 混用 number 和 number[]
								prev[2].push(Number(row[zVar]))
								z[z.indexOf(prev)] = prev
							} else {
								// @ts-expect-error 这里为了简便, 混用 number 和 number[]
								z.push([i, j, [Number(row[zVar])]])
							}
							break
						}
					}
				}
			}
			// 处理均值和中位数
			switch (statistic) {
				case 'mean': {
					for (const item of z) {
						item[2] = +mean(item[2] as unknown as number[]).toFixed(4)
					}
					break
				}
				case 'median': {
					for (const item of z) {
						item[2] = +median(item[2] as unknown as number[]).toFixed(4)
					}
					break
				}
			}
			const option: EChartsOption = {
				title: {
					text: title,
					left: 'center',
				},
				xAxis3D: {
					name: xLabel || xVar,
					type: 'category',
					nameLocation: 'middle',
					data: x,
					nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
				},
				yAxis3D: {
					name: yLabel || yVar,
					type: 'category',
					nameLocation: 'middle',
					data: y,
					nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
				},
				zAxis3D: {
					name: zLabel || zVar,
					type: 'value',
					nameLocation: 'middle',
					nameTextStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
				},
				grid3D: {
					boxWidth: 200,
					boxDepth: 80,
					light: {
						main: {
							intensity: 1.2,
						},
						ambient: {
							intensity: 0.3,
						},
					},
				},
				visualMap: {
					max: max(z.map((item) => item[2])),
					min: min(z.map((item) => item[2])),
					inRange: {
						color: [
							'#313695',
							'#4575b4',
							'#74add1',
							'#abd9e9',
							'#e0f3f8',
							'#ffffbf',
							'#fee090',
							'#fdae61',
							'#f46d43',
							'#d73027',
							'#a50026',
						],
					},
				},
				tooltip: {
					show: true,
					formatter: (params) => {
						// @ts-expect-error 没问题
						return `${xLabel || xVar}: ${x[params.value[0]]}<br />${yLabel || yVar}: ${y[params.value[1]]}<br />${zLabel || zVar}: ${params.value[2]}`
					},
				},
				// @ts-expect-error echarts-gl 没有提供类型定义
				series: [
					{
						type: 'bar3D',
						data: z,
						shading: 'color',
						label: {
							show: false,
							fontSize: 16,
							borderWidth: 1,
						},
						itemStyle: {
							opacity: opacity,
						},
						emphasis: {
							label: {
								fontSize: 20,
								color: '#900',
							},
							itemStyle: {
								color: '#900',
							},
						},
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
						try {
							flushSync(() => setDisabled(true))
							await handleFinish(values)
						} finally {
							setDisabled(false)
						}
					}}
					autoComplete='off'
					disabled={disabled}
					initialValues={{
						statistic: 'mean',
						opacity: 0.4,
					}}
				>
					<Form.Item label='X轴(分类)变量及其标签'>
						<Space.Compact className='w-full'>
							<Form.Item
								name='xVar'
								noStyle
								rules={[
									{ required: true, message: '请选择X轴变量' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (
												value === getFieldValue('yVar') ||
												value === getFieldValue('zVar')
											) {
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
									options={dataCols.map((col) => ({
										label: `${col.name} (水平数: ${col.unique})`,
										value: col.name,
									}))}
								/>
							</Form.Item>
							<Form.Item name='xLabel' noStyle>
								<Input className='w-max' placeholder='标签默认为变量名' />
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item label='Y轴(分类)变量及其标签'>
						<Space.Compact className='w-full'>
							<Form.Item
								name='yVar'
								noStyle
								rules={[
									{ required: true, message: '请选择Y轴变量' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (
												value === getFieldValue('xVar') ||
												value === getFieldValue('zVar')
											) {
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
									options={dataCols.map((col) => ({
										label: `${col.name} (水平数: ${col.unique})`,
										value: col.name,
									}))}
								/>
							</Form.Item>
							<Form.Item name='yLabel' noStyle>
								<Input className='w-max' placeholder='标签默认为变量名' />
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item label='Z轴(数据)变量及其标签'>
						<Space.Compact className='w-full'>
							<Form.Item
								name='zVar'
								noStyle
								rules={[
									{ required: true, message: '请选择Z轴变量' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (
												value === getFieldValue('xVar') ||
												value === getFieldValue('yVar')
											) {
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
									options={dataCols
										.filter((col) => col.type === '等距或等比数据')
										.map((col) => ({ label: col.name, value: col.name }))}
								/>
							</Form.Item>
							<Form.Item name='zLabel' noStyle>
								<Input className='w-max' placeholder='标签默认为变量名' />
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item label='柱状图统计量和透明度'>
						<Space.Compact block>
							<Form.Item
								noStyle
								name='statistic'
								rules={[{ required: true, message: '请选择柱状图统计量' }]}
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
								name='opacity'
								rules={[{ required: true, message: '请选择柱状图透明度' }]}
							>
								<InputNumber
									addonBefore='透明度'
									className='w-full'
									min={0}
									max={1}
									step={0.1}
									placeholder='柱状图透明度'
								/>
							</Form.Item>
						</Space.Compact>
					</Form.Item>
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
							onClick={async () => {
								try {
									flushSync(() => setDisabled(true))
									await downloadImage()
									messageApi?.success('图片保存成功')
								} catch (e) {
									messageApi?.error(
										`图片保存失败: ${
											e instanceof Error ? e.message : String(e)
										}`,
									)
								} finally {
									setDisabled(false)
								}
							}}
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
