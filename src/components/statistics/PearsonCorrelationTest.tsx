import { PearsonCorrTest } from '@psych/lib'
import { Button, Form, InputNumber, Select } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, sleep, uuid } from '../../lib/utils'

type Option = {
	/** 变量名 */
	variable: string[]
	/** 显著性水平 */
	alpha: number
}
type Result = {
	data: {
		peer: string[]
		r: string
		r2: string
		p: string
		t: string
		df: number
		ci: string
	}[]
} & Option

export function PearsonCorrelationTest() {
	const { dataCols, dataRows, isLargeData } = useData()
	const { messageApi } = useStates()
	const [result, setResult] = useState<Result | null>(null)
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variable, alpha } = values
			const filteredRows = dataRows.filter((row) =>
				variable.every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const results: Result['data'] = []
			for (let i = 0; i < variable.length - 1; i++) {
				for (let j = i + 1; j < variable.length; j++) {
					const data = [variable[i], variable[j]].map((variable) =>
						filteredRows.map((row) => Number(row[variable])),
					)
					const result = new PearsonCorrTest(data[0], data[1], alpha)
					results.push({
						peer: [values.variable[i], values.variable[j]],
						r2: markS(result.r2, result.p),
						r: markS(result.r, result.p),
						t: markS(result.t, result.p),
						p: markP(result.p),
						df: result.df,
						ci: `[${result.ci[0].toFixed(3)}, ${result.ci[1].toFixed(3)})`,
					})
				}
			}
			setResult({
				...values,
				data: results,
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
					initialValues={{
						alpha: 0.05,
					}}
					disabled={disabled}
				>
					<Form.Item
						label='选择变量(至少两个)'
						name='variable'
						rules={[
							{ required: true, message: '请选择变量' },
							{ type: 'array', min: 2, message: '至少选择两个变量' },
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择变量'
							mode='multiple'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label='显著性水平'
						name='alpha'
						rules={[{ required: true, message: '请输入显著性水平' }]}
					>
						<InputNumber
							addonBefore='α ='
							className='w-full'
							placeholder='请输入显著性水平'
							min={0}
							max={1}
							step={0.01}
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
						<p className='text-lg mb-2 text-center w-full'>
							Pearson 相关系数检验
						</p>
						<p className='text-xs mb-3 text-center w-full'>
							H<sub>0</sub>: 两个变量的相关系数等于零 | 显著性水平(α):{' '}
							{result.alpha}
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>变量A</td>
									<td>变量B</td>
									<td>相关系数(r)</td>
									<td>测定系数(r²)</td>
									<td>{(100 - result.alpha * 100).toFixed(3)}%置信区间</td>
									<td>t</td>
									<td>p</td>
									<td>自由度</td>
								</tr>
							</thead>
							<tbody>
								{result.data.map((row) => (
									<tr key={uuid()}>
										<td>{row.peer[0]}</td>
										<td>{row.peer[1]}</td>
										<td>{row.r}</td>
										<td>{row.r2}</td>
										<td>{row.ci}</td>
										<td>{row.t}</td>
										<td>{row.p}</td>
										<td>{row.df}</td>
									</tr>
								))}
							</tbody>
						</table>

						<p className='text-lg mb-3 mt-8 text-center w-full'>相关系数矩阵</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td />
									{result.variable.map((variable) => (
										<td key={uuid()}>{variable}</td>
									))}
								</tr>
							</thead>
							<tbody>
								{result.variable.map((variableA, indexA) => (
									<tr key={uuid()}>
										<td>{variableA}</td>
										{result.variable.map((variableB, indexB) => (
											<td key={uuid()}>
												{indexA === indexB
													? '-'
													: result.data.find(
															(row) =>
																row.peer.includes(variableA) &&
																row.peer.includes(variableB),
														)?.r}
											</td>
										))}
									</tr>
								))}
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
