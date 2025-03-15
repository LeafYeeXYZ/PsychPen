import {
	LinearRegressionSequential,
	LinearRegressionStandard,
	LinearRegressionStepwise,
	corr,
} from '@psych/lib'
import { Button, Form, Select, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, sleep, uuid } from '../../lib/utils'

type Option = {
	/** 自变量 */
	x: string[]
	/** 因变量 */
	y: string
	/** 回归方式 */
	method:
		| 'standard'
		| 'stepwise-fwd'
		| 'stepwise-bwd'
		| 'stepwise-both'
		| 'sequence'
}
type Result<T extends 'standard' | 'stepwise' | 'sequence'> = Option & {
	m: T extends 'standard'
		? LinearRegressionStandard
		: T extends 'stepwise'
			? LinearRegressionStepwise
			: LinearRegressionSequential
}

export function MultiLinearRegression() {
	const { dataCols, dataRows, isLargeData } = useData()
	const { messageApi } = useStates()
	const [result, setResult] = useState<
		Result<'standard'> | Result<'stepwise'> | Result<'sequence'> | null
	>(null)
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { x, y } = values
			const filteredRows = dataRows.filter((row) =>
				[...x, y].every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const xData: number[][] = []
			const yData: number[] = []
			for (const row of filteredRows) {
				const xRow = x.map((variable) => Number(row[variable]))
				xData.push(xRow)
				yData.push(Number(row[y]))
			}
			switch (values.method) {
				case 'standard':
					setResult({
						...values,
						m: new LinearRegressionStandard(xData, yData),
					})
					break
				case 'sequence':
					setResult({
						...values,
						m: new LinearRegressionSequential(xData, yData),
					})
					break
				default:
					setResult({
						...values,
						m: new LinearRegressionStepwise(
							xData,
							yData,
							values.method === 'stepwise-fwd'
								? 'forward'
								: values.method === 'stepwise-bwd'
									? 'backward'
									: 'both',
						),
					})
					break
			}
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
					initialValues={{
						method: 'standard',
					}}
				>
					<Form.Item
						label={
							<span>
								自变量(可多选) <Tag color='blue'>X</Tag>
							</span>
						}
						name='x'
						rules={[
							{ required: true, message: '请选择自变量' },
							({ getFieldValue }) => ({
								validator: (_, value) => {
									if (
										value?.some(
											(variable: string) => variable === getFieldValue('y'),
										)
									) {
										return Promise.reject('自变量和因变量不能相同')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择自变量'
							mode='multiple'
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
										getFieldValue('x')?.some(
											(variable: string) => variable === value,
										)
									) {
										return Promise.reject('自变量和因变量不能相同')
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
						label='回归方式'
						name='method'
						rules={[{ required: true, message: '请选择回归方式' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择回归方式'
							options={[
								{ label: '标准回归 (同时进入)', value: 'standard' },
								{ label: '逐步回归 (向前选择)', value: 'stepwise-fwd' },
								{ label: '逐步回归 (向后剔除)', value: 'stepwise-bwd' },
								{ label: '逐步回归 (双向选择)', value: 'stepwise-both' },
								{ label: '序列回归 (分层回归)', value: 'sequence' },
							]}
						/>
					</Form.Item>
					<Form.Item>
						<Button className='w-full mt-4' type='default' htmlType='submit'>
							计算
						</Button>
					</Form.Item>
					<p className='w-full text-center text-xs text-gray-400 mt-5'>
						逐步回归的加入和剔除标准为 p {'<'} 0.05
					</p>
				</Form>
			</div>

			<div className='component-result'>
				{result?.method === 'standard' ? (
					<StandardLinearRegressionResult
						result={result as Result<'standard'>}
					/>
				) : result?.method === 'sequence' ? (
					<SequenceLinearRegressionResult
						result={result as Result<'sequence'>}
					/>
				) : result ? (
					<StepwiseLinearRegressionResult
						result={result as Result<'stepwise'>}
					/>
				) : (
					<div className='w-full h-full flex justify-center items-center'>
						<span>请填写参数并点击计算</span>
					</div>
				)}
			</div>
		</div>
	)
}

function SequenceLinearRegressionResult({
	result,
}: { result: Result<'sequence'> }) {
	return (
		<div className='w-full h-full overflow-auto'>
			<p className='text-lg mb-2 text-center w-full'>序列多元线性回归</p>
			<p className='text-xs mb-2 text-center w-full'>
				因变量: {result.y} | 自变量: {result.x.map((v, i) => `${v} (b${i + 1})`).join('、')}
			</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>模型</td>
						<td>参数</td>
						<td>
							F<sub>model</sub>
						</td>
						<td>p<sub>model</sub></td>
						<td>
							R<sup>2</sup>
						</td>
						<td>
							调整后R<sup>2</sup>
						</td>
						<td>
						  R<sup>2</sup>变化量
						</td>
						<td>F<sub>inc</sub></td>
						<td>p<sub>inc</sub></td>
					</tr>
				</thead>
				<tbody>
					{result.m.models.map((model, index) => (
						<tr key={uuid()}>
							<td>模型 {index + 1}</td>
							<td>
								b0: {model.coefficients[0].toFixed(4)}{' (截距)'}
								<br />
								{model.coefficients
									.slice(1)
									.map(
										(coefficient, index) =>
											(<span key={uuid()}>
												{`b${index + 1}: ${coefficient.toFixed(4)}`}
												{index !== model.coefficients.length - 2 && <br />}
											</span>),
									)
								}
							</td>
							<td>{markS(model.F, model.p)}</td>
							<td>{markP(model.p)}</td>
							<td>{model.r2.toFixed(4)}</td>
							<td>{model.r2adj.toFixed(4)}</td>
							<td>
								{result.m.r2Changes[index].toFixed(4)}
							</td>
							<td>
								{markS(result.m.fChanges[index], result.m.pChanges[index])}
							</td>
							<td>
								{markP(result.m.pChanges[index])}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<p className='text-lg mb-2 text-center w-full mt-8'>最终模型</p>
			<p className='text-xs mb-2 text-center w-full'>
				y = {result.m.model.coefficients[0].toFixed(4)} +{' '}
				{result.m.model.coefficients
					.slice(1)
					.map(
						(coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`,
					)
					.join(' + ')}
			</p>
			<p className='text-xs mb-3 text-center w-full'>
				测定系数 (R<sup>2</sup>): {result.m.model.r2.toFixed(4)} |
				调整后测定系数 (R
				<sup>2</sup>
				<sub>adj</sub>): {result.m.model.r2adj.toFixed(4)}
			</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>参数</td>
						<td>值</td>
						<td>
							H<sub>0</sub>
						</td>
						<td>统计量</td>
						<td>显著性</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>模型</td>
						<td>
							b0: {result.m.model.coefficients[0].toFixed(4)} |{' '}
							{result.m.model.coefficients
								.slice(1)
								.map(
									(coefficient, index) =>
										`b${index + 1}: ${coefficient.toFixed(4)}`,
								)
								.join(' | ')}
						</td>
						<td>
							{result.m.model.coefficients
								.slice(1)
								.map((_, index) => `b${index + 1}`)
								.join(' = ')}{' '}
							= 0
						</td>
						<td>F = {markS(result.m.model.F, result.m.model.p)}</td>
						<td>{markP(result.m.model.p)}</td>
					</tr>
					{result.m.model.coefficients.slice(1).map((_, index) => (
						<tr key={uuid()}>
							<td>b{index + 1}</td>
							<td>
								{result.m.model.coefficients[index + 1].toFixed(4)} (偏回归系数)
							</td>
							<td>b{index + 1} = 0</td>
							<td>
								t ={' '}
								{markS(
									result.m.model.tValues[index],
									result.m.model.pValues[index],
								)}
							</td>
							<td>{markP(result.m.model.pValues[index])}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className='text-xs mt-3 text-center w-full'>
				{result.x
					.map((variable, index) => `x${index + 1}: ${variable}`)
					.join(' | ')}{' '}
				| y: {result.y}
			</p>

			<p className='text-lg mb-2 text-center w-full mt-8'>模型细节</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>误差项</td>
						<td>自由度 (df)</td>
						<td>平方和 (SS)</td>
						<td>均方 (MS)</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>总和 (T)</td>
						<td>{result.m.model.dfT}</td>
						<td>{result.m.model.SSt.toFixed(4)}</td>
						<td>{(result.m.model.SSt / result.m.model.dfT).toFixed(4)}</td>
					</tr>
					<tr>
						<td>回归 (R)</td>
						<td>{result.m.model.dfR}</td>
						<td>{result.m.model.SSr.toFixed(4)}</td>
						<td>{(result.m.model.SSr / result.m.model.dfR).toFixed(4)}</td>
					</tr>
					<tr>
						<td>残差 (E)</td>
						<td>{result.m.model.dfE}</td>
						<td>{result.m.model.SSe.toFixed(4)}</td>
						<td>{(result.m.model.SSe / result.m.model.dfE).toFixed(4)}</td>
					</tr>
				</tbody>
			</table>

			<p className='text-lg mb-2 text-center w-full mt-8'>描述统计</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>变量</td>
						<td>均值</td>
						<td>标准差</td>
						<td>与Y相关系数</td>
					</tr>
				</thead>
				<tbody>
					{result.x.map((variable, index) => (
						<tr key={uuid()}>
							<td>
								{variable} (x{index + 1})
							</td>
							<td>{result.m.ivMeans[index].toFixed(4)}</td>
							<td>{result.m.ivStds[index].toFixed(4)}</td>
							<td>
								{corr(
									result.m.iv.map((xRow) => xRow[index]),
									result.m.dv,
								).toFixed(4)}
							</td>
						</tr>
					))}
					<tr>
						<td>{result.y} (y)</td>
						<td>{result.m.dvMean.toFixed(4)}</td>
						<td>{result.m.dvStd.toFixed(4)}</td>
						<td>1</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}

function StepwiseLinearRegressionResult({
	result,
}: { result: Result<'stepwise'> }) {
	return (
		<div className='w-full h-full overflow-auto'>
			<p className='text-lg mb-2 text-center w-full'>
				逐步多元线性回归 (
				{result.method === 'stepwise-fwd'
					? '向前选择'
					: result.method === 'stepwise-bwd'
						? '向后剔除'
						: '双向选择'}
				)
			</p>
			<p className='text-xs mb-2 text-center w-full'>
				模型: y = {result.m.coefficients[0].toFixed(4)} +{' '}
				{result.m.coefficients
					.slice(1)
					.map(
						(coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`,
					)
					.join(' + ')}
			</p>
			<p className='text-xs mb-3 text-center w-full'>
				测定系数 (R<sup>2</sup>): {result.m.r2.toFixed(4)} | 调整后测定系数 (R
				<sup>2</sup>
				<sub>adj</sub>): {result.m.r2adj.toFixed(4)}
			</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>参数</td>
						<td>值</td>
						<td>
							H<sub>0</sub>
						</td>
						<td>统计量</td>
						<td>显著性</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>模型</td>
						<td>
							b0: {result.m.coefficients[0].toFixed(4)} |{' '}
							{result.m.coefficients
								.slice(1)
								.map(
									(coefficient, index) =>
										`b${index + 1}: ${coefficient.toFixed(4)}`,
								)
								.join(' | ')}
						</td>
						<td>
							{result.m.coefficients
								.slice(1)
								.map((_, index) => `b${index + 1}`)
								.join(' + ')}{' '}
							= 0
						</td>
						<td>F = {markS(result.m.F, result.m.p)}</td>
						<td>{markP(result.m.p)}</td>
					</tr>
					{result.m.coefficients.slice(1).map((_, index) => (
						<tr key={uuid()}>
							<td>
								b{index + 1} ({result.x[result.m.selectedVariables[index]]})
							</td>
							<td>
								{result.m.coefficients[index + 1].toFixed(4)} (偏回归系数)
							</td>
							<td>b{index + 1} = 0</td>
							<td>
								t = {markS(result.m.tValues[index], result.m.pValues[index])}
							</td>
							<td>{markP(result.m.pValues[index])}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className='text-xs mt-3 text-center w-full'>
				{result.m.selectedVariables
					.map((index, i) => `x${i + 1}: ${result.x[index]}`)
					.join(' | ')}{' '}
				| y: {result.y} | 已剔除变量:{' '}
				{result.x
					.filter((_, index) => !result.m.selectedVariables.includes(index))
					.map((variable) => variable)
					.join('、')}
			</p>

			<p className='text-lg mb-2 text-center w-full mt-8'>模型细节</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>误差项</td>
						<td>自由度 (df)</td>
						<td>平方和 (SS)</td>
						<td>均方 (MS)</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>总和 (T)</td>
						<td>{result.m.dfT}</td>
						<td>{result.m.SSt.toFixed(4)}</td>
						<td>{(result.m.SSt / result.m.dfT).toFixed(4)}</td>
					</tr>
					<tr>
						<td>回归 (R)</td>
						<td>{result.m.dfR}</td>
						<td>{result.m.SSr.toFixed(4)}</td>
						<td>{(result.m.SSr / result.m.dfR).toFixed(4)}</td>
					</tr>
					<tr>
						<td>残差 (E)</td>
						<td>{result.m.dfE}</td>
						<td>{result.m.SSe.toFixed(4)}</td>
						<td>{(result.m.SSe / result.m.dfE).toFixed(4)}</td>
					</tr>
				</tbody>
			</table>

			<p className='text-lg mb-2 text-center w-full mt-8'>描述统计</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>变量</td>
						<td>均值</td>
						<td>标准差</td>
						<td>与Y相关系数</td>
					</tr>
				</thead>
				<tbody>
					{result.x.map((variable, index) => (
						<tr key={uuid()}>
							<td>
								{variable} (
								{result.m.selectedVariables.findIndex((i) => i === index) + 1
									? `x${result.m.selectedVariables.findIndex((i) => i === index) + 1}`
									: '已剔除'}
								)
							</td>
							<td>{result.m.ivMeans[index].toFixed(4)}</td>
							<td>{result.m.ivStds[index].toFixed(4)}</td>
							<td>
								{corr(
									result.m.iv.map((xRow) => xRow[index]),
									result.m.dv,
								).toFixed(4)}
							</td>
						</tr>
					))}
					<tr>
						<td>{result.y} (y)</td>
						<td>{result.m.dvMean.toFixed(4)}</td>
						<td>{result.m.dvStd.toFixed(4)}</td>
						<td>1</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}

function StandardLinearRegressionResult({
	result,
}: { result: Result<'standard'> }) {
	return (
		<div className='w-full h-full overflow-auto'>
			<p className='text-lg mb-2 text-center w-full'>标准多元线性回归</p>
			<p className='text-xs mb-2 text-center w-full'>
				模型: y = {result.m.coefficients[0].toFixed(4)} +{' '}
				{result.m.coefficients
					.slice(1)
					.map(
						(coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`,
					)
					.join(' + ')}
			</p>
			<p className='text-xs mb-3 text-center w-full'>
				测定系数 (R<sup>2</sup>): {result.m.r2.toFixed(4)} | 调整后测定系数 (R
				<sup>2</sup>
				<sub>adj</sub>): {result.m.r2adj.toFixed(4)}
			</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>参数</td>
						<td>值</td>
						<td>
							H<sub>0</sub>
						</td>
						<td>统计量</td>
						<td>显著性</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>模型</td>
						<td>
							b0: {result.m.coefficients[0].toFixed(4)} |{' '}
							{result.m.coefficients
								.slice(1)
								.map(
									(coefficient, index) =>
										`b${index + 1}: ${coefficient.toFixed(4)}`,
								)
								.join(' | ')}
						</td>
						<td>
							{result.m.coefficients
								.slice(1)
								.map((_, index) => `b${index + 1}`)
								.join(' + ')}{' '}
							= 0
						</td>
						<td>F = {markS(result.m.F, result.m.p)}</td>
						<td>{markP(result.m.p)}</td>
					</tr>
					{result.m.coefficients.slice(1).map((_, index) => (
						<tr key={uuid()}>
							<td>b{index + 1}</td>
							<td>
								{result.m.coefficients[index + 1].toFixed(4)} (偏回归系数)
							</td>
							<td>b{index + 1} = 0</td>
							<td>
								t = {markS(result.m.tValues[index], result.m.pValues[index])}
							</td>
							<td>{markP(result.m.pValues[index])}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className='text-xs mt-3 text-center w-full'>
				{result.x
					.map((variable, index) => `x${index + 1}: ${variable}`)
					.join(' | ')}{' '}
				| y: {result.y}
			</p>

			<p className='text-lg mb-2 text-center w-full mt-8'>模型细节</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>误差项</td>
						<td>自由度 (df)</td>
						<td>平方和 (SS)</td>
						<td>均方 (MS)</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>总和 (T)</td>
						<td>{result.m.dfT}</td>
						<td>{result.m.SSt.toFixed(4)}</td>
						<td>{(result.m.SSt / result.m.dfT).toFixed(4)}</td>
					</tr>
					<tr>
						<td>回归 (R)</td>
						<td>{result.m.dfR}</td>
						<td>{result.m.SSr.toFixed(4)}</td>
						<td>{(result.m.SSr / result.m.dfR).toFixed(4)}</td>
					</tr>
					<tr>
						<td>残差 (E)</td>
						<td>{result.m.dfE}</td>
						<td>{result.m.SSe.toFixed(4)}</td>
						<td>{(result.m.SSe / result.m.dfE).toFixed(4)}</td>
					</tr>
				</tbody>
			</table>

			<p className='text-lg mb-2 text-center w-full mt-8'>描述统计</p>
			<table className='three-line-table'>
				<thead>
					<tr>
						<td>变量</td>
						<td>均值</td>
						<td>标准差</td>
						<td>与Y相关系数</td>
					</tr>
				</thead>
				<tbody>
					{result.x.map((variable, index) => (
						<tr key={uuid()}>
							<td>
								{variable} (x{index + 1})
							</td>
							<td>{result.m.ivMeans[index].toFixed(4)}</td>
							<td>{result.m.ivStds[index].toFixed(4)}</td>
							<td>
								{corr(
									result.m.iv.map((xRow) => xRow[index]),
									result.m.dv,
								).toFixed(4)}
							</td>
						</tr>
					))}
					<tr>
						<td>{result.y} (y)</td>
						<td>{result.m.dvMean.toFixed(4)}</td>
						<td>{result.m.dvStd.toFixed(4)}</td>
						<td>1</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
