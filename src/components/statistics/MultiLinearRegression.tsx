import {
	LinearRegressionSequential,
	LinearRegressionStandard,
	LinearRegressionStepwise,
	corr,
} from '@psych/lib'
import { Button, Form, Select, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

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
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const statResult = useStates((state) => state.statResult)
	const setStatResult = useStates((state) => state.setStatResult)
	useEffect(() => {
		setStatResult('')
	}, [setStatResult])
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
					setStatResult(
						getStandardLinearRegressionResult({
							result: {
								...values,
								m: new LinearRegressionStandard(xData, yData),
							},
						}),
					)
					break
				case 'sequence':
					setStatResult(
						getSequenceLinearRegressionResult({
							result: {
								...values,
								m: new LinearRegressionSequential(xData, yData),
							},
						}),
					)
					break
				default:
					setStatResult(
						getStepwiseLinearRegressionResult({
							result: {
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
							},
						}),
					)
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
				{statResult ? (
					<div className='w-full h-full overflow-auto'>
						<iframe
							srcDoc={renderStatResult(statResult)}
							className='w-full h-full'
							title='statResult'
						/>
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

function getSequenceLinearRegressionResult({
	result,
}: { result: Result<'sequence'> }): string {
	return `
## 1 序列多元线性回归

基于自变量${result.x.map((v, i) => `"${v}" (x${i + 1})`).join('、')}和因变量"${result.y}"构建序列多元线性回归模型.

结果如表 1 所示.

> 表 1 - 序列多元线性回归模型

| 模型 | 参数 | F<sub>model</sub> | p<sub>model</sub> | R<sup>2</sup> | 调整后R<sup>2</sup> | R<sup>2</sup>变化量 | F<sub>inc</sub> | p<sub>inc</sub> |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${result.m.models
	.map(
		(model, index) => `| 模型 ${index + 1} | ${model.coefficients
			.map(
				(coefficient, i) =>
					`b${i}: ${coefficient.toFixed(4)}${i === 0 ? ' (截距)' : ''}`,
			)
			.join(
				'<br />',
			)} | ${markS(model.F, model.p)} | ${markP(model.p)} | ${model.r2.toFixed(4)} | ${model.r2adj.toFixed(4)} | ${result.m.r2Changes[index].toFixed(4)} | ${markS(result.m.fChanges[index], result.m.pChanges[index])} | ${markP(result.m.pChanges[index])} |
`,
	)
	.join('')}

## 2 最终模型

最终模型为: y = ${result.m.model.coefficients[0].toFixed(4)} + ${result.m.model.coefficients
		.slice(1)
		.map((coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`)
		.join(
			' + ',
		)}, 模型的测定系数 (R<sup>2</sup>) 为 ${result.m.model.r2.toFixed(4)}, 调整后测定系数 (R<sup>2</sup><sub>adj</sub>) 为 ${result.m.model.r2adj.toFixed(4)}.

具体参数和细节如表 2 和表 3 所示.

> 表 2 - 最终模型参数

| 参数 | 值 | H<sub>0</sub> | 统计量 | 显著性 |
| :---: | :---: | :---: | :---: | :---: |
| 模型 | ${result.m.model.coefficients.map((v, i) => `b${i}: ${v.toFixed(4)}${i === 0 ? ' (截距)' : ''}`).join('<br />')} | ${result.m.model.coefficients
		.slice(1)
		.map((_, index) => `b${index + 1}`)
		.join(
			' = ',
		)} = 0 | F = ${markS(result.m.model.F, result.m.model.p)} | ${markP(result.m.model.p)} |
${result.m.model.coefficients
	.slice(1)
	.map(
		(_, index) =>
			`| b${index + 1} | ${result.m.model.coefficients[index + 1].toFixed(
				4,
			)} (偏回归系数) | b${index + 1} = 0 | t = ${markS(
				result.m.model.tValues[index],
				result.m.model.pValues[index],
			)} | ${markP(result.m.model.pValues[index])} |`,
	)
	.join('\n')}

> 表 3 - 模型细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${result.m.model.dfT} | ${result.m.model.SSt.toFixed(4)} | ${(result.m.model.SSt / result.m.model.dfT).toFixed(4)} |
| 回归 (R) | ${result.m.model.dfR} | ${result.m.model.SSr.toFixed(4)} | ${(result.m.model.SSr / result.m.model.dfR).toFixed(4)} |
| 残差 (E) | ${result.m.model.dfE} | ${result.m.model.SSe.toFixed(4)} | ${(result.m.model.SSe / result.m.model.dfE).toFixed(4)} |

## 3 描述统计

对自变量${result.x.map((v, i) => `"${v}" (x${i + 1})`).join('、')}和因变量"${result.y}"进行描述统计分析. 

结果如表 4 所示.

> 表 4 - 描述统计

| 变量 | 均值 | 标准差 | 与Y相关系数 |
| :---: | :---: | :---: | :---: |
${result.x
	.map(
		(variable, index) =>
			`| ${variable} (x${index + 1}) | ${result.m.ivMeans[index].toFixed(4)} | ${result.m.ivStds[index].toFixed(4)} | ${corr(
				result.m.iv.map((xRow) => xRow[index]),
				result.m.dv,
			).toFixed(4)} |`,
	)
	.join('\n')}
| ${result.y} (y) | ${result.m.dvMean.toFixed(4)} | ${result.m.dvStd.toFixed(4)} | 1 |
	`
}

function getStepwiseLinearRegressionResult({
	result,
}: { result: Result<'stepwise'> }): string {
	return `
## 1 逐步多元线性回归 (${
		result.method === 'stepwise-fwd'
			? '向前选择'
			: result.method === 'stepwise-bwd'
				? '向后剔除'
				: '双向选择'
	})

最终模型为 y = ${result.m.coefficients[0].toFixed(4)} + ${result.m.coefficients
		.slice(1)
		.map((coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`)
		.join(' + ')}, 其中${result.m.selectedVariables
		.map((index, i) => `"${result.x[index]}" (x${i + 1})`)
		.join(
			'、',
		)}为自变量, 因变量为"${result.y}". 模型的测定系数 (R<sup>2</sup>) 为 ${result.m.r2.toFixed(4)}, 调整后测定系数 (R<sup>2</sup><sub>adj</sub>) 为 ${result.m.r2adj.toFixed(4)}.

变量${result.x
		.filter((_, index) => !result.m.selectedVariables.includes(index))
		.map((variable) => `"${variable}"`)
		.join('、')}已在逐步回归中剔除.

结果如表 1 和表 2 所示.

> 表 1 - 模型参数

| 参数 | 值 | H<sub>0</sub> | 统计量 | 显著性 |
| :---: | :---: | :---: | :---: | :---: |
| 模型 | b0: ${result.m.coefficients[0].toFixed(4)} | ${result.m.coefficients
		.slice(1)
		.map((_, index) => `b${index + 1}`)
		.join(
			' + ',
		)} = 0 | F = ${markS(result.m.F, result.m.p)} | ${markP(result.m.p)} |
${result.m.coefficients
	.slice(1)
	.map(
		(_, index) =>
			`| b${index + 1} (${result.x[result.m.selectedVariables[index]]}) | ${result.m.coefficients[
				index + 1
			].toFixed(4)} (偏回归系数) | b${index + 1} = 0 | t = ${markS(
				result.m.tValues[index],
				result.m.pValues[index],
			)} | ${markP(result.m.pValues[index])} |`,
	)
	.join('\n')}

> 表 2 - 模型细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${result.m.dfT} | ${result.m.SSt.toFixed(4)} | ${(result.m.SSt / result.m.dfT).toFixed(4)} |
| 回归 (R) | ${result.m.dfR} | ${result.m.SSr.toFixed(4)} | ${(result.m.SSr / result.m.dfR).toFixed(4)} |
| 残差 (E) | ${result.m.dfE} | ${result.m.SSe.toFixed(4)} | ${(result.m.SSe / result.m.dfE).toFixed(4)} |

## 2 描述统计

对输入的自变量${result.x.map((v) => `"${v}"`).join('、')}和因变量"${result.y}"进行描述统计分析.

结果如表 3 所示.

> 表 3 - 变量描述统计

| 变量 | 均值 | 标准差 | 与Y相关系数 |
| :---: | :---: | :---: | :---: |
${result.x
	.map(
		(variable, index) =>
			`| ${variable} (${
				result.m.selectedVariables.findIndex((i) => i === index) + 1
					? `x${result.m.selectedVariables.findIndex((i) => i === index) + 1}`
					: '已剔除'
			}) | ${result.m.ivMeans[index].toFixed(4)} | ${result.m.ivStds[index].toFixed(4)} | ${corr(
				result.m.iv.map((xRow) => xRow[index]),
				result.m.dv,
			).toFixed(4)} |`,
	)
	.join('\n')}
| ${result.y} (y) | ${result.m.dvMean.toFixed(4)} | ${result.m.dvStd.toFixed(4)} | 1 |
    `
}

function getStandardLinearRegressionResult({
	result,
}: { result: Result<'standard'> }): string {
	return `
## 1 标准多元线性回归

对自变量${result.x.map((v, i) => `"${v}" (x${i + 1})`).join('、')}和因变量"${result.y}"进行标准多元线性回归分析. 原假设 (H<sub>0</sub>) 为"所有自变量的回归系数均为0", 显著性水平 (α) 为 0.05. 

最终模型为 y = ${result.m.coefficients[0].toFixed(4)} + ${result.m.coefficients
		.slice(1)
		.map((coefficient, index) => `${coefficient.toFixed(4)} * x${index + 1}`)
		.join(' + ')}
, 模型的测定系数 (R<sup>2</sup>) 为 ${result.m.r2.toFixed(4)}, 调整后测定系数 (R<sup>2</sup><sub>adj</sub>) 为 ${result.m.r2adj.toFixed(4)}.

结果如表 1 和表 2 所示.

> 表 1 - 模型参数

| 参数 | 值 | H<sub>0</sub> | 统计量 | 显著性 |
| :---: | :---: | :---: | :---: | :---: |
| 模型 | ${result.m.coefficients.map((v, i) => `b${i}: ${v.toFixed(4)}${i === 0 ? ' (截距)' : ''}`).join('<br />')} | ${result.m.coefficients
		.slice(1)
		.map((_, index) => `b${index + 1}`)
		.join(
			' + ',
		)} = 0 | F = ${markS(result.m.F, result.m.p)} | ${markP(result.m.p)} |
${result.m.coefficients
	.slice(1)
	.map(
		(_, index) =>
			`| b${index + 1} | ${result.m.coefficients[index + 1].toFixed(
				4,
			)} (偏回归系数) | b${index + 1} = 0 | t = ${markS(
				result.m.tValues[index],
				result.m.pValues[index],
			)} | ${markP(result.m.pValues[index])} |`,
	)
	.join('\n')}

> 表 2 - 模型细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${result.m.dfT} | ${result.m.SSt.toFixed(4)} | ${(result.m.SSt / result.m.dfT).toFixed(4)} |
| 回归 (R) | ${result.m.dfR} | ${result.m.SSr.toFixed(4)} | ${(result.m.SSr / result.m.dfR).toFixed(4)} |
| 残差 (E) | ${result.m.dfE} | ${result.m.SSe.toFixed(4)} | ${(result.m.SSe / result.m.dfE).toFixed(4)} |

## 2 描述统计

对自变量${result.x.map((v, i) => `"${v}" (x${i + 1})`).join('、')}和因变量"${result.y}"进行描述统计分析.

结果如表 3 所示.

> 表 3 - 变量描述统计

| 变量 | 均值 | 标准差 | 与Y相关系数 |
| :---: | :---: | :---: | :---: |
${result.x
	.map(
		(variable, index) =>
			`| ${variable} (x${index + 1}) | ${result.m.ivMeans[index].toFixed(4)} | ${result.m.ivStds[index].toFixed(4)} | ${corr(
				result.m.iv.map((xRow) => xRow[index]),
				result.m.dv,
			).toFixed(4)} |`,
	)
	.join('\n')}
| ${result.y} (y) | ${result.m.dvMean.toFixed(4)} | ${result.m.dvStd.toFixed(4)} | 1 |
    `
}
