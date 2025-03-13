import { OneSampleKSTest } from '@psych/lib'
import { Button, Form, Radio, Select } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { sleep, uuid } from '../../lib/utils'

type Option = {
	/** 类型 */
	type: 'independent' | 'paired'
	/** 被试内变量名 */
	variables?: string[]
	/** 被试间变量名 */
	variable?: string
	/** 分组 */
	group?: string
}
type Result = {
	m: (OneSampleKSTest & { name: string })[]
} & Option

export function KolmogorovSmirnovTest() {
	const { dataCols, dataRows, isLargeData } = useData()
	const { messageApi } = useStates()
	const [result, setResult] = useState<Result | null>(null)
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variables, variable, group, type } = values
			if (type === 'paired') {
				if (!variables?.length) {
					throw new Error('请选择变量')
				}
				const data: number[][] = variables.map((variable) =>
					dataRows
						.map((row) => row[variable])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v)),
				)
				const result = data.map((arr, index) => {
					const m = new OneSampleKSTest(arr)
					return {
						...m,
						name: variables[index],
					}
				})
				setResult({ ...values, m: result })
			} else {
				if (!variable || !group) {
					throw new Error('请选择数据变量和分组变量')
				}
				const groups = Array.from(new Set(dataRows.map((row) => row[group])))
					.map(String)
					.sort((a, b) => Number(a) - Number(b))
				const data: number[][] = groups.map((g) =>
					dataRows
						.filter((row) => row[group] === g)
						.map((row) => row[variable])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v)),
				)
				const result = data.map((arr, index) => {
					const m = new OneSampleKSTest(arr)
					return {
						...m,
						name: groups[index],
					}
				})
				setResult({ ...values, m: result })
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
	const [type, setType] = useState<'independent' | 'paired'>('paired')

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
						type: 'paired',
					}}
					disabled={disabled}
				>
					<Form.Item
						name='type'
						label='待检验变量类型'
						rules={[{ required: true, message: '请选择待检验变量类型' }]}
					>
						<Radio.Group
							className='w-full'
							block
							onChange={(e) => setType(e.target.value)}
							optionType='button'
							buttonStyle='solid'
						>
							<Radio value='paired'>被试内变量</Radio>
							<Radio value='independent'>被试间变量</Radio>
						</Radio.Group>
					</Form.Item>
					{type === 'paired' ? (
						<Form.Item
							label='变量(可多选)'
							name='variables'
							rules={[{ required: true, message: '请选择变量' }]}
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
					) : (
						<>
							<Form.Item
								label='数据变量'
								name='variable'
								rules={[{ required: true, message: '请选择数据变量' }]}
							>
								<Select
									className='w-full'
									placeholder='请选择数据变量'
									options={dataCols
										.filter((col) => col.type === '等距或等比数据')
										.map((col) => ({ label: col.name, value: col.name }))}
								/>
							</Form.Item>
							<Form.Item
								label='分组变量'
								name='group'
								rules={[{ required: true, message: '请选择分组变量' }]}
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
						</>
					)}
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
							单样本 Kolmogorov-Smirnov 检验
						</p>
						<p className='text-xs mb-3 text-center w-full'>
							H<sub>0</sub>: 数据符合正态分布 | 显著性水平(α): 0.05
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>{result.type === 'paired' ? '变量' : '组别'}</td>
									<td>样本量</td>
									<td>D</td>
									<td>D临界值</td>
									<td>结果</td>
								</tr>
							</thead>
							<tbody>
								{result.m.map((row) => (
									<tr key={uuid()}>
										<td>{row.name}</td>
										<td>{row?.count}</td>
										<td>{row.d?.toFixed(3)}</td>
										<td>{row.decide?.toFixed(3)}</td>
										<td>
											{row?.rejected ? '不符合正态分布' : '符合正态分布'}{' '}
											<span className='text-xs opacity-40'>
												p: {row.p?.toFixed(3)}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<p className='text-xs mt-3 text-center w-full'>
							P值使用渐进估计, 小样本时请以D临界值结果为准
							{result.type === 'independent' && ` | 分组变量: ${result.group}`}
						</p>
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
