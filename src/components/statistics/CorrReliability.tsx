import { CorrRealiability } from '@psych/lib'
import { Button, Form, Select } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { sleep, uuid } from '../../lib/utils'

type Option = {
	/** 变量名 */
	variables: [string, string]
	/** 分组变量 */
	group?: string
}
type Result = {
	m: CorrRealiability
} & Option

export function CorrReliability() {
	const { dataCols, dataRows, isLargeData } = useData()
	const { messageApi } = useStates()
	const [result, setResult] = useState<Result | null>(null)
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const filteredRows = dataRows.filter((row) =>
				values.variables.every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const x1 = filteredRows.map((row) => Number(row[values.variables[0]]))
			const x2 = filteredRows.map((row) => Number(row[values.variables[1]]))
			const g = values.group
			const group = g ? filteredRows.map((row) => String(row[g])) : undefined
			const m = new CorrRealiability(x1, x2, group)
			setResult({ m, ...values })
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
				>
					<Form.Item
						label='待检验变量(两个)'
						name='variables'
						rules={[
							{ required: true, message: '请选择变量' },
							{ type: 'array', min: 2, max: 2, message: '请选择两个变量' },
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
					<Form.Item label='分组变量(可选)' name='group'>
						<Select
							className='w-full'
							placeholder='请选择变量'
							options={dataCols.map((col) => ({
								label: `${col.name} (水平数: ${col.unique})`,
								value: col.name,
							}))}
							allowClear
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
							重测信度/复本信度分析
						</p>
						<table className='three-line-table'>
							<thead>
								<tr>
									<td>分组</td>
									<td>
										相关系数(r<sub>xx</sub>)
									</td>
									<td>
										测定系数(r<sub>xx</sub>
										<sup>2</sup>)
									</td>
								</tr>
							</thead>
							<tbody>
								{result.m.r.map((_, i) => (
									<tr key={uuid()}>
										<td>{result.m.group[i]}</td>
										<td>{result.m.r[i].toFixed(3)}</td>
										<td>{result.m.r2[i].toFixed(3)}</td>
									</tr>
								))}
							</tbody>
						</table>
						<p className='text-xs mt-3 text-center w-full'>
							配对变量: {result.variables.join(', ')}
						</p>
						{result.group && (
							<p className='text-xs mt-2 text-center w-full'>
								分组变量: {result.group}
							</p>
						)}
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
