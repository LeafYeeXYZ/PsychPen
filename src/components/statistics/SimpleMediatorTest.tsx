import { SimpleMediationModel } from '@psych/lib'
import { Button, Form, InputNumber, Select, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, sleep } from '../../lib/utils'

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
type Result = {
	count: number
	model: SimpleMediationModel
	bootstrap: {
		a: [number, number]
		b: [number, number]
		ab: [number, number]
		c: [number, number]
		cPrime: [number, number]
	}
	effectSize: {
		PM: number
		RM: number
		v2: number
		standarizedAB: number
	}
} & Option

export function SimpleMediatorTest() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const messageApi = useStates((state) => state.messageApi)
	const [result, setResult] = useState<Result | null>(null)
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			await sleep()
			const { x, m, y, B } = values
			const timestamp = Date.now()
			const filteredRows = dataRows.filter((row) =>
				[x, m, y].every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const xData = filteredRows.map((row) => Number(row[x]))
			const mData = filteredRows.map((row) => Number(row[m]))
			const yData = filteredRows.map((row) => Number(row[y]))
			const model = new SimpleMediationModel(xData, mData, yData)
			const bs = model.bootstrap(B)
			const es = model.effectSize
			setResult({
				...values,
				count: filteredRows.length,
				model: model,
				bootstrap: bs,
				effectSize: {
					PM: es.PM,
					RM: es.RM,
					v2: es.v2,
					standarizedAB: es.standarizedAB(),
				},
			})
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
					<Form.Item>
						<Button className='w-full mt-4' type='default' htmlType='submit'>
							计算
						</Button>
					</Form.Item>
				</Form>
			</div>

			<div className='component-result'>
				{result ? (
					<div className='w-full h-full overflow-auto'>
						<p className='text-lg mb-2 text-center w-full'>简单中介效应模型</p>
						<p className='text-xs mb-3 text-center w-full'>
							模型: x ({result.x}) -{'>'} m ({result.m}) -{'>'} y ({result.y})
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>参数</td>
									<td>值</td>
									<td>统计量 (t)</td>
									<td>显著性 (p)</td>
									<td>95%置信区间</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>c (x 对 y 的总效应)</td>
									<td>{result.model.c.toFixed(3)}</td>
									<td>{markS(result.model.cT, result.model.cP)}</td>
									<td>{markP(result.model.cP)}</td>
									<td>
										{'['}
										{result.bootstrap.c[0].toFixed(3)},{' '}
										{result.bootstrap.c[1].toFixed(3)}
										{')'}
									</td>
								</tr>
								<tr>
									<td>c' (控制 m 后 x 对 y 的效应 / x 对 y 的直接效应)</td>
									<td>{result.model.cPrime.toFixed(3)}</td>
									<td>{markS(result.model.cPrimeT, result.model.cPrimeP)}</td>
									<td>{markP(result.model.cPrimeP)}</td>
									<td>
										{'['}
										{result.bootstrap.cPrime[0].toFixed(3)},{' '}
										{result.bootstrap.cPrime[1].toFixed(3)}
										{')'}
									</td>
								</tr>
								<tr>
									<td>a (x 对 m 的效应)</td>
									<td>{result.model.a.toFixed(3)}</td>
									<td>{markS(result.model.aT, result.model.aP)}</td>
									<td>{markP(result.model.aP)}</td>
									<td>
										{'['}
										{result.bootstrap.a[0].toFixed(3)},{' '}
										{result.bootstrap.a[1].toFixed(3)}
										{')'}
									</td>
								</tr>
								<tr>
									<td>b (控制 x 后 m 对 y 的效应)</td>
									<td>{result.model.b.toFixed(3)}</td>
									<td>{markS(result.model.bT, result.model.bP)}</td>
									<td>{markP(result.model.bP)}</td>
									<td>
										{'['}
										{result.bootstrap.b[0].toFixed(3)},{' '}
										{result.bootstrap.b[1].toFixed(3)}
										{')'}
									</td>
								</tr>
								<tr>
									<td>ab (x 对 y 的中介效应)</td>
									<td>{result.model.ab.toFixed(3)}</td>
									<td>-</td>
									<td>-</td>
									<td>
										{'['}
										{result.bootstrap.ab[0].toFixed(3)},{' '}
										{result.bootstrap.ab[1].toFixed(3)}
										{')'}
									</td>
								</tr>
							</tbody>
						</table>

						<p className='text-lg mb-2 text-center w-full mt-8'>
							中介效应显著性检验
						</p>
						<p className='text-xs mb-3 text-center w-full'>
							样本量: {result.count} | Bootstrap 抽样次数: {result.B}
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>方法</td>
									<td>
										H<sub>0</sub>
									</td>
									<td>统计量</td>
									<td>结果</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>依次检验法</td>
									<td>a = 0 或 b = 0</td>
									<td>
										p<sub>a</sub>: {result.model.aP.toFixed(3)}, p<sub>b</sub>:{' '}
										{result.model.bP.toFixed(3)}
									</td>
									<td>
										{result.model.aP < 0.025 && result.model.bP < 0.025
											? '拒绝原假设'
											: '不通过'}
									</td>
								</tr>
								<tr>
									<td>非参数 Bootstrap 检验</td>
									<td>ab = 0</td>
									<td>
										95%置信区间: {'['}
										{result.bootstrap.ab[0].toFixed(3)},{' '}
										{result.bootstrap.ab[1].toFixed(3)}
										{')'}
									</td>
									<td>
										{result.bootstrap.ab[0] > 0 || result.bootstrap.ab[1] < 0
											? '拒绝原假设'
											: '不通过'}
									</td>
								</tr>
							</tbody>
						</table>
						<p className='text-xs mt-3 text-center w-full'>
							注: 依次检验法中 a、b 的显著性阈值为 0.025
						</p>

						<p className='text-lg mb-2 text-center w-full mt-8'>
							中介效应的效应量
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>方法</td>
									<td>结果</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										P<sub>M</sub> = ab / c (中介效应占总效应的比例)
									</td>
									<td>{result.effectSize.PM.toFixed(3)}</td>
								</tr>
								<tr>
									<td>
										R<sub>M</sub> = ab / c' (中介效应与直接效应之比)
									</td>
									<td>{result.effectSize.RM.toFixed(3)}</td>
								</tr>
								<tr>
									<td>
										v<sup>2</sup> = a<sup>2</sup>b<sup>2</sup>
									</td>
									<td>{result.effectSize.v2.toFixed(3)}</td>
								</tr>
								<tr>
									<td>标准化的 ab</td>
									<td>{result.effectSize.standarizedAB.toFixed(3)}</td>
								</tr>
							</tbody>
						</table>
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
