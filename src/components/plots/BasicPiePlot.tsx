import { Button, Form, Select } from 'antd'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { downloadImage, sleep } from '../../lib/utils'

type Option = {
	/** 变量 */
	variable: string
	/** 自定义标签 */
	labels?: string[]
	/** 自定义图例 */
	label: 'count' | 'percent' | 'both'
}

const LABEL_OPTIONS = {
	count: {
		config: { show: true, formatter: '{b}: {c}' },
		label: '只显示计数',
	},
	percent: {
		config: { show: true, formatter: '{b}: {d}%' },
		label: '只显示百分比',
	},
	both: {
		config: { show: true, formatter: '{b}: {c} ({d}%)' },
		label: '显示计数和百分比',
	},
}

export function BasicPiePlot() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const isDarkMode = useStates((state) => state.isDarkMode)
	const messageApi = useStates((state) => state.messageApi)
	// 图形设置相关
	const [disabled, setDisabled] = useState<boolean>(false)
	const [rendered, setRendered] = useState<boolean>(false)

	const handleFinish = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variable, labels, label } = values
			const ele = document.getElementById('echarts-container')
			if (!ele) {
				throw new Error('无法找到图表容器')
			}
			const chart = echarts.init(ele)
			const data = dataRows
				.map((row) => row[variable])
				.filter((value) => typeof value !== 'undefined')
				.map((value) => String(value))
			const value = Array.from(new Set(data)).sort(
				(a, b) => Number(a) - Number(b),
			)
			const counts = value.map((v) => data.filter((d) => d === v).length)
			const option: EChartsOption = {
				legend: {
					orient: 'vertical',
					left: 'left',
					textStyle: {
						color: isDarkMode ? 'white' : 'black',
					},
				},
				series: [
					{
						type: 'pie',
						radius: '50%',
						label: {
							...LABEL_OPTIONS[label].config,
							color: isDarkMode ? 'white' : 'black',
						},
						data: counts.map((count, index) => ({
							value: count,
							name: labels?.[index] ?? value[index],
						})),
						emphasis: {
							itemStyle: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)',
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
						label: 'percent',
					}}
				>
					<Form.Item
						name='variable'
						label='变量'
						rules={[{ required: true, message: '请选择变量' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择变量'
							options={dataCols.map((col) => ({
								label: `${col.name} (水平数: ${col.unique})`,
								value: col.name,
							}))}
						/>
					</Form.Item>
					<Form.Item
						name='label'
						label='图例'
						rules={[{ required: true, message: '请选择图例' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择图例'
							options={Object.entries(LABEL_OPTIONS).map(
								([value, { label }]) => ({ label, value }),
							)}
						/>
					</Form.Item>
					<Form.Item name='labels' label='自定义标签'>
						<Select className='w-full' mode='tags' placeholder='默认为属性值' />
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
