import { ExportOutlined } from '@ant-design/icons'
import { SimpleMediationModel } from '@psych/lib'
import { Button, Collapse, Form, InputNumber, Popover, Select, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { markP, markS, sleep } from '../../lib/utils.ts'
import { Result } from '../widgets/Result.tsx'

type Option = {
	/** 自变量 */
	x: string
	/** 中介变量 */
	m: string
	/** 因变量 */
	y: string
	/** Bootstrap 重抽样次数 */
	B: number
}

export function simpleMediationTestCalculator(config: {
	x: string
	m: string
	y: string
	B: number
	N: number
	xData: number[]
	mData: number[]
	yData: number[]
}): string {
	const { x, m, y, B, N, xData, mData, yData } = config
	const model = new SimpleMediationModel(xData, mData, yData)
	const bs = model.bootstrap(B)
	const es = model.effectSize
	const includeZero = (bs.ab[0] < 0) && (bs.ab[1] > 0)
	return `
## 1 简单中介效应模型

以"${x}"为自变量，"${m}"为中介变量，"${y}"为因变量构建简单中介效应模型; 样本量为 ${N}. 置信区间通过 Bootstrap 抽样获得, 抽样次数为 ${B}. 中介效应的置信区间${includeZero ? '包含零' : '不包含零'}, 中介效应${includeZero ? '不显著' : '显著'}.

结果如表 1 所示.

> 表 1 - 简单中介效应模型

| 参数 | 值 | 统计量 (t) | 显著性 (p) | 95%置信区间 |
| :---: | :---: | :---: | :---: | :---: |
| c (x 对 y 的总效应) | ${markS(model.c)} | ${markS(model.cT, model.cP)} | ${markP(model.cP)} | [${markS(bs.c[0])}, ${markS(bs.c[1])}) |
| c' (控制 m 后 x 对 y 的效应 / x 对 y 的直接效应) | ${markS(model.cPrime)} | ${markS(model.cPrimeT, model.cPrimeP)} | ${markP(model.cPrimeP)} | [${markS(bs.cPrime[0])}, ${markS(bs.cPrime[1])}) |
| a (x 对 m 的效应) | ${markS(model.a)} | ${markS(model.aT, model.aP)} | ${markP(model.aP)} | [${markS(bs.a[0])}, ${markS(bs.a[1])}) |
| b (控制 x 后 m 对 y 的效应) | ${markS(model.b)} | ${markS(model.bT, model.bP)} | ${markP(model.bP)} | [${markS(bs.b[0])}, ${markS(bs.b[1])}) |
| ab (x 对 y 的中介效应) | ${markS(model.ab)} | - | - | [${markS(bs.ab[0])}, ${markS(bs.ab[1])}) |

## 2 中介效应的效应量

结果如表 2 所示.

> 表 2 - 中介效应的效应量

| 方法 | 结果 |
| :---: | :---: |
| P<sub>M</sub> = ab / c (中介效应占总效应的比例) | ${markS(es.PM)} |
| R<sub>M</sub> = ab / c' (中介效应与直接效应之比) | ${markS(es.RM)} |
| v<sup>2</sup> = a<sup>2</sup>b<sup>2</sup> | ${markS(es.v2)} |
| 标准化的 ab | ${markS(es.standarizedAB())} |
	`
}

export function SimpleMediatorTest() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const messageApi = useStates((state) => state.messageApi)
	const statResult = useStates((state) => state.statResult)
	const setStatResult = useStates((state) => state.setStatResult)
	// biome-ignore lint/correctness/useExhaustiveDependencies: 仅在组件加载时清空结果
	useEffect(() => {
		setStatResult('')
	}, [])
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			await sleep()
			const { x, m, y, B } = values
			const timestamp = Date.now()
			const filteredRows = dataRows.filter((row) =>
				[x, m, y].every((variable) => typeof row[variable] === 'number'),
			)
			const xData = filteredRows.map((row) => row[x]) as number[]
			const mData = filteredRows.map((row) => row[m]) as number[]
			const yData = filteredRows.map((row) => row[y]) as number[]
			setStatResult(
				simpleMediationTestCalculator({
					x,
					m,
					y,
					B,
					N: filteredRows.length,
					xData,
					mData,
					yData,
				}),
			)
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
							await handleCalculate(values)
						} finally {
							setDisabled(false)
						}
					}}
					autoComplete='off'
					disabled={disabled}
					initialValues={{ B: 5000 }}
				>
					<div className='mb-4'>
						<Collapse
							items={[
								{
									key: 'smm',
									label: '简单中介效应模型示意图 (点击展开)',
									children: (
										<img
											src='/smm.png'
											alt='simple mediator model'
											className='w-full'
										/>
									),
								},
							]}
						/>
					</div>
					<Form.Item
						label={
							<span>
								自变量 <Tag color='blue'>X</Tag>
							</span>
						}
						name='x'
						rules={[
							{ required: true, message: '请选择自变量' },
							({ getFieldValue }) => ({
								validator: (_, value) => {
									if (
										value === getFieldValue('m') ||
										value === getFieldValue('y')
									) {
										return Promise.reject('自变量、中介变量、因变量不能相同')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择自变量'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label={
							<span>
								中介变量 <Tag color='green'>M</Tag>
							</span>
						}
						name='m'
						rules={[
							{ required: true, message: '请选择中介变量' },
							({ getFieldValue }) => ({
								validator: (_, value) => {
									if (
										value === getFieldValue('x') ||
										value === getFieldValue('y')
									) {
										return Promise.reject('自变量、中介变量、因变量不能相同')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择中介变量'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label={
							<span>
								因变量 <Tag color='pink'>Y</Tag>
							</span>
						}
						name='y'
						rules={[
							{ required: true, message: '请选择因变量' },
							({ getFieldValue }) => ({
								validator: (_, value) => {
									if (
										value === getFieldValue('x') ||
										value === getFieldValue('m')
									) {
										return Promise.reject('自变量、中介变量、因变量不能相同')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择因变量'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label='Bootstrap 抽样次数'
						name='B'
						rules={[{ required: true, message: '请输入 Bootstrap 抽样次数' }]}
					>
						<InputNumber
							className='w-full'
							min={100}
							max={100000}
							step={100}
							addonBefore='重复抽样'
							addonAfter='次'
							placeholder='请输入'
						/>
					</Form.Item>
					<div className='flex flex-row flex-nowrap justify-center items-center gap-4'>
						<Button
							className='w-full mt-4'
							type='default'
							htmlType='submit'
							autoInsertSpace={false}
						>
							计算
						</Button>
						<Popover
							content={
								<div>
									导出的结果为 Markdown 格式, 可直接粘贴到 Markdown
									编辑器中使用. 也可使用
									<Button
										className='mx-1'
										size='small'
										icon={<ExportOutlined />}
										onClick={() => {
											window.open(
												'https://github.com/LeafYeeXYZ/EasyPaper',
												'_blank',
											)
										}}
									>
										EasyPaper
									</Button>
									生成三线表等符合学术规范的格式
								</div>
							}
							trigger={['hover', 'click']}
						>
							<Button
								className='w-full mt-4'
								type='default'
								autoInsertSpace={false}
								disabled={!statResult}
								onClick={() => {
									navigator.clipboard
										.writeText(statResult)
										.then(() => messageApi?.success('已复制结果到剪贴板'))
										.catch((e) =>
											messageApi?.error(
												`复制失败: ${e instanceof Error ? e.message : String(e)}`,
											),
										)
								}}
							>
								复制结果
							</Button>
						</Popover>
					</div>
				</Form>
			</div>

			<div className='component-result'>
				{statResult ? (
					<div className='w-full h-full overflow-auto'>
						<Result result={statResult} />
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
