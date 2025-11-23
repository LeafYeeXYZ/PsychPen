import { mean, std as sd } from '@psych/lib'
import { Button, Form, Input, InputNumber, Radio, Select, Space } from 'antd'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { downloadImage, sleep } from '../../lib/utils.ts'

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

	/** 是否显示数据标签 */
	label: 'mean' | 'std' | 'both' | 'none'
	/** 误差棒数据 */
	error: 0 | 1 | 2 | 3 | 1.96 | 2.58
	/** 自定义 y 轴最大值 */
	maxY?: number
}

export function BasicBarPlot() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const isDarkMode = useStates((state) => state.isDarkMode)
	const messageApi = useStates((state) => state.messageApi)
	// 图形设置相关
	const [disabled, setDisabled] = useState<boolean>(false)
	const [rendered, setRendered] = useState<boolean>(false)
	const plotId = useId()
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
				variables,
				peerLabel,
				dataLabel,
				type,
				label,
				error,
				maxY,
			} = values
			const ele = document.getElementById(plotId)
			if (!ele) {
				throw new Error('无法找到图表容器')
			}
			const chart = echarts.init(ele)
			const data: number[] = []
			const std: [number, number, number, number][] = []
			if (type === 'independent') {
				if (!(dataVar && groupVar)) {
					throw new Error('请选择数据变量和分组变量')
				}
				const filteredRows = dataRows.filter(
					(row) =>
						typeof row[dataVar] === 'number' && row[groupVar] !== undefined,
				)
				// 被试间数据处理
				const cols = Array.from(
					new Set(filteredRows.map((row) => row[groupVar])).values(),
				).sort((a, b) => Number(a) - Number(b))
				const rows: number[][] = cols.map((col) =>
					filteredRows
						.filter((row) => row[groupVar] === col)
						.map((row) => row[dataVar] as number),
				)
				for (const [i, row] of rows.entries()) {
					const _mean = +mean(row).toFixed(4)
					const _std = +sd(row).toFixed(4)
					data.push(_mean)
					std.push([i, _mean - error * _std, _mean + error * _std, _std])
				}
				const option: EChartsOption = {
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
						max: maxY ?? Math.max(...std.map((item) => item[2])),
					},
					series: [
						{
							type: 'bar',
							data,
							label: {
								show: label !== 'none',
								formatter: (params) => {
									if (label === 'mean') {
										return `均值: ${params.value}`
									}
									if (label === 'std') {
										return `标准差: ${std[params.dataIndex][3]}`
									}
									return `均值: ${params.value}\n标准差: ${std[params.dataIndex][3]}`
								},
							},
							emphasis: {
								label: {
									show: true,
								},
							},
						},
						error !== 0
							? {
									type: 'custom',
									data: std,
									zlevel: 2,
									renderItem(_, api) {
										const xValue = api.value(0)
										const lowPoint = api.coord([xValue, api.value(1)])
										const highPoint = api.coord([xValue, api.value(2)])
										const halfWidth = Math.min(
											15,
											// @ts-expect-error 没问题
											Number(api.size([1, 0])[0] / 8),
										)
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
								}
							: {},
					],
					legend: {
						show: false,
					},
				}
				chart.setOption(option, true)
			} else {
				if (!variables?.length) {
					throw new Error('请选择配对变量')
				}
				const filteredRows = dataRows.filter((row) =>
					variables.every((variable) => typeof row[variable] === 'number'),
				)
				// 被试内数据处理
				for (const [i, variable] of variables.entries()) {
					const row = filteredRows.map((row) => row[variable] as number)
					const _mean = +mean(row).toFixed(4)
					const _std = +sd(row).toFixed(4)
					data.push(_mean)
					std.push([i, _mean - error * _std, _mean + error * _std, _std])
				}
				const option: EChartsOption = {
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
						max: maxY ?? Math.max(...std.map((item) => item[2])),
					},
					series: [
						{
							type: 'bar',
							data,
							label: {
								show: label !== 'none',
								formatter: (params) => {
									if (label === 'mean') {
										return `均值: ${params.value}`
									}
									if (label === 'std') {
										return `标准差: ${std[params.dataIndex][3]}`
									}
									return `均值: ${params.value}\n标准差: ${std[params.dataIndex][3]}`
								},
							},
							emphasis: {
								label: {
									show: true,
								},
							},
						},
						error !== 0
							? {
									type: 'custom',
									data: std,
									zlevel: 2,
									renderItem(_, api) {
										const xValue = api.value(0)
										const lowPoint = api.coord([xValue, api.value(1)])
										const highPoint = api.coord([xValue, api.value(2)])
										const halfWidth = Math.min(
											15,
											// @ts-expect-error 没问题
											Number(api.size([1, 0])[0] / 8),
										)
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
								}
							: {},
					],
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
					disabled={disabled}
					initialValues={{
						type: 'independent',
						label: 'none',
						error: 1,
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
												.map((col) => ({ label: col.name, value: col.name }))}
										/>
									</Form.Item>
									<Form.Item name='yLabel' noStyle>
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
					<Form.Item label='数据标签内容' name='label'>
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
					<Form.Item label='误差棒内容和Y轴最大值'>
						<Space.Compact block>
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
							<Space.Addon className='text-nowrap'>Y轴最大为</Space.Addon>
							<Form.Item noStyle name='maxY'>
								<InputNumber className='w-full!' placeholder='默认自动' />
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
									await downloadImage(plotId)
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
					<div className='w-full h-full' id={plotId} />
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
