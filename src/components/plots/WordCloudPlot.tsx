import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { Button, ColorPicker, Form, InputNumber, Select, Space } from 'antd'
import init, { cut } from 'jieba-wasm'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { downloadImage, sleep } from '../../lib/utils'

const SPAPE_OPTIONS = [
	{ value: 'circle', label: '圆形' },
	{ value: 'cardioid', label: '心形' },
	{ value: 'diamond', label: '菱形' },
	{ value: 'triangle-forward', label: '倒三角形' },
	{ value: 'triangle', label: '三角形' },
	{ value: 'pentagon', label: '五边形' },
	{ value: 'star', label: '星形' },
]
const ROTATION_OPTIONS = [
	{ value: 'x', label: '水平', rotationRange: [0, 0], rotationStep: 90 },
	{
		value: 'y',
		label: '水平/垂直',
		rotationRange: [-90, 90],
		rotationStep: 90,
	},
	{
		value: 'z',
		label: '水平/垂直/倾斜',
		rotationRange: [-90, 90],
		rotationStep: 45,
	},
]
const FILTER_OPTIONS = [
	{
		value: '__punctuation',
		label: '标点符号',
		reg: /[\p{P}\p{S}\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/u,
	},
	{ value: '__number', label: '数字', reg: /\d/ },
	{ value: '__english', label: '英文', reg: /[a-zA-Z]/ },
	{ value: '__single', label: '单个字', reg: /^.$/ },
	{ value: '__nonChinese', label: '非中文常见字', reg: /[^\u4e00-\u9fa5]/ },
]

type Option = {
	/** 变量 */
	variable: string
	/** 词云形状 */
	shape: string
	/** 词云颜色 */
	color: { metaColor: { r: number; g: number; b: number; a: number } } | string
	/** 单词最小尺寸 */
	min: number // 默认 12, 单位 px
	/** 单词最大尺寸 */
	max: number // 默认 60, 单位 px
	/** 单词方向 */
	rotation: string
	/** 过滤设置 */
	filter?: string[]
	/** 是否启用词语切分 */
	split: boolean
}

export function WordCloudPlot() {
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
			const { variable, shape, min, max, rotation, filter, color, split } =
				values
			const ele = document.getElementById('echarts-container')
			if (!ele) {
				throw new Error('无法找到图表容器')
			}
			const chart = echarts.init(ele)
			const raw = dataRows.map((row) => String(row[variable]))
			let data: string[] = []
			if (split) {
				await init()
				data = cut(raw.join('\n'), true)
			} else {
				data = raw
			}
			if (filter) {
				for (const f of filter) {
					const reg =
						FILTER_OPTIONS.find((filter) => filter.value === f)?.reg ??
						new RegExp(f)
					data = data.filter((word) => !reg.test(word))
				}
			}
			const counts = data.reduce(
				(acc, cur) => {
					acc[cur] = (acc[cur] || 0) + 1
					return acc
				},
				{} as { [key: string]: number },
			)
			const wordCloudData = Object.entries(counts).map(([name, value]) => ({
				name,
				value,
			}))
			chart.setOption(
				{
					series: [
						{
							type: 'wordCloud',
							shape: shape,
							left: 'center',
							top: 'center',
							width: '80%',
							height: '80%',
							textStyle: {
								color:
									typeof color === 'string'
										? color
										: `rgba(${color.metaColor.r}, ${color.metaColor.g}, ${color.metaColor.b}, ${color.metaColor.a})`,
							},
							sizeRange: [min, max],
							rotationRange: ROTATION_OPTIONS.find((r) => r.value === rotation)
								?.rotationRange,
							rotationStep: ROTATION_OPTIONS.find((r) => r.value === rotation)
								?.rotationStep,
							data: wordCloudData,
						},
					],
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
						shape: 'circle',
						min: 12,
						max: 60,
						rotation: 'x',
						filter: ['__punctuation'],
						color: isDarkMode ? '#ffffff' : '#000000',
						split: true,
					}}
				>
					<Form.Item
						label='变量'
						name='variable'
						rules={[{ required: true, message: '请选择变量' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择变量'
							options={dataCols.map((col) => ({
								label: (
									<span>
										{col.name} {'('}重复值占比:{' '}
										{(
											100 -
											((col.unique ?? Number.NaN) / (col.count ?? Number.NaN)) *
												100
										).toFixed(2)}
										{')'}
									</span>
								),
								value: col.name,
							}))}
						/>
					</Form.Item>
					<Form.Item label='词云形状和颜色'>
						<Space.Compact block>
							<Form.Item
								noStyle
								name='shape'
								rules={[{ required: true, message: '请选择词云形状' }]}
							>
								<Select
									className='w-full'
									placeholder='词云形状'
									options={SPAPE_OPTIONS.map((shape) => ({
										label: shape.label,
										value: shape.value,
									}))}
								/>
							</Form.Item>
							<Form.Item
								noStyle
								name='color'
								rules={[{ required: true, message: '请选择词云颜色' }]}
							>
								<ColorPicker className='w-full' showText format='hex' />
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item label='单词最小/最大尺寸和方向'>
						<Space.Compact block>
							<Form.Item
								noStyle
								name='min'
								rules={[
									{ required: true, message: '请输入最小尺寸' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (value >= getFieldValue('max')) {
												return Promise.reject('最小尺寸必须小于最大尺寸')
											}
											return Promise.resolve()
										},
									}),
								]}
							>
								<InputNumber
									addonAfter='px'
									className='w-52'
									placeholder='最小尺寸'
									step={1}
									min={1}
									max={100}
								/>
							</Form.Item>
							<Form.Item
								noStyle
								name='max'
								rules={[
									{ required: true, message: '请输入最大尺寸' },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (value <= getFieldValue('min')) {
												return Promise.reject('最大尺寸必须大于最小尺寸')
											}
											return Promise.resolve()
										},
									}),
								]}
							>
								<InputNumber
									addonAfter='px'
									className='w-52'
									placeholder='最大尺寸'
									step={1}
									min={1}
									max={100}
								/>
							</Form.Item>
							<Form.Item
								noStyle
								name='rotation'
								rules={[{ required: true, message: '请选择单词方向' }]}
							>
								<Select
									className='w-full'
									placeholder='单词方向'
									options={ROTATION_OPTIONS.map((rotation) => ({
										label: rotation.label,
										value: rotation.value,
									}))}
								/>
							</Form.Item>
						</Space.Compact>
					</Form.Item>
					<Form.Item
						label='内容过滤设置(可输入正则表达式)'
						name='filter'
						rules={[
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!getFieldValue('split') && value?.length) {
										return Promise.reject(
											'如果需要进行内容过滤, 请启用词语切分',
										)
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='留空则不过滤'
							mode='tags'
							options={FILTER_OPTIONS.map((filter) => ({
								label: filter.label,
								value: filter.value,
							}))}
						/>
					</Form.Item>
					<Form.Item label='词语切分' name='split'>
						<Select
							className='w-full'
							placeholder='请选择是否启用词语切分'
							options={[
								{ label: '启用', value: true },
								{ label: '不启用', value: false },
							]}
						/>
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
					<p className='w-full text-center text-xs text-gray-400 mt-5'>
						如果启用词语切分, 首次生成时会加载分词模块, 请耐心等待
					</p>
					<p className='w-full text-center text-xs text-gray-400 mt-1'>
						如果形状不明显, 请调小最小单词尺寸
					</p>
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
