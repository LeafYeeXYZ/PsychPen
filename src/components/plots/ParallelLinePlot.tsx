import { Button, ColorPicker, Form, InputNumber, Select, Space } from 'antd'
import * as echarts from 'echarts'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { downloadImage, sleep } from '../../lib/utils'

type Option = {
	/** 变量 */
	variables: string[]
	/** 标签 */
	labels: string[]
	/** 线粗细 */
	lineWidth: number
	/** 线颜色 */
	lineColor:
		| { metaColor: { r: number; g: number; b: number; a: number } }
		| string
}

export function ParallelLinePlot() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	// 图形设置相关
	const [disabled, setDisabled] = useState<boolean>(false)
	const [rendered, setRendered] = useState<boolean>(false)
	const handleFinish = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variables, labels, lineWidth, lineColor } = values
			const ele = document.getElementById('echarts-container')
			if (!ele) {
				throw new Error('无法找到图表容器')
			}
			const chart = echarts.init(ele)
			const filteredRows = dataRows.filter((row) =>
				variables.every((variable) => typeof row[variable] !== 'undefined'),
			)
			chart.setOption(
				{
					parallelAxis: variables.map((variable, index) => ({
						dim: index,
						name: labels ? labels[index] : variable,
						type:
							dataCols.find((col) => col.name === variable)?.type ===
							'等距或等比数据'
								? 'value'
								: 'category',
						data:
							dataCols.find((col) => col.name === variable)?.type ===
							'等距或等比数据'
								? undefined
								: Array.from(
										new Set(
											filteredRows.map((row) => String(row[variable])),
										).values(),
									),
					})),
					series: {
						type: 'parallel',
						lineStyle: {
							width: lineWidth,
							color:
								typeof lineColor === 'string'
									? lineColor
									: `rgba(${lineColor.metaColor.r}, ${lineColor.metaColor.g}, ${lineColor.metaColor.b}, ${lineColor.metaColor.a})`,
						},
						data: filteredRows.map((row) =>
							variables.map((variable) => {
								if (
									dataCols.find((col) => col.name === variable)?.type ===
									'等距或等比数据'
								) {
									return row[variable] as number
								}
								return row[variable] as string
							}),
						),
					},
				},
				true,
			)
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
						lineWidth: 2,
						lineColor: '#ffa0a0',
					}}
				>
					<Form.Item
						label='变量列表(X轴各点)(可多选)'
						name='variables'
						rules={[{ required: true, message: '请选择变量' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择变量'
							mode='multiple'
							options={dataCols.map((col) => ({
								label: col.name,
								value: col.name,
							}))}
						/>
					</Form.Item>
					<Form.Item
						label='变量标签(可留空,默认为变量名)'
						name='labels'
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value?.length) {
										return Promise.resolve()
									}
									if (value.length !== getFieldValue('variables').length) {
										return Promise.reject(
											new Error('标签数量必须与变量数量相同'),
										)
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请输入变量标签'
							mode='tags'
						/>
					</Form.Item>
					<Form.Item label='线宽度和颜色'>
						<Space.Compact block>
							<Form.Item name='lineWidth' noStyle>
								<InputNumber
									className='w-full'
									min={1}
									max={10}
									step={1}
									addonAfter='px'
								/>
							</Form.Item>
							<Form.Item name='lineColor' noStyle>
								<ColorPicker className='w-full' showText format='hex' />
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
