import { LinearRegressionOne } from '@psych/lib'
import { Button, Form, Select, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** x 变量 */
	x: string
	/** y 变量 */
	y: string
}

export function OneLinearRegression() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const statResult = useStates((state) => state.statResult)
	const setStatResult = useStates((state) => state.setStatResult)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setStatResult('')
	}, [])
	const [disabled, setDisabled] = useState<boolean>(false)
	const handleCalculate = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { x, y } = values
			const filteredRows = dataRows.filter((row) =>
				[x, y].every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const xData = filteredRows.map((row) => Number(row[x]))
			const yData = filteredRows.map((row) => Number(row[y]))
			const m = new LinearRegressionOne(xData, yData)
			setStatResult(`
## 1 一元线性回归

对自变量 (x) "${x}"和因变量 (y) "${y}"进行一元线性回归分析. 原假设 (H<sub>0</sub>) 为"斜率 = 0"; 显著性水平 (α) 为 0.05. 最终模型为 y = ${m.b0.toFixed(4)} + ${m.b1.toFixed(4)} * x.

结果如表 1 和表 2 所示.

> 表 1 - 一元线性回归模型

| a (截距) | b (斜率) | F | t | p | 测定系数 (R²) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ${m.b0.toFixed(4)} | ${m.b1.toFixed(4)} | ${markS(m.F, m.p)} | ${markS(m.t, m.p)} | ${markP(m.p)} | ${m.r2.toFixed(4)} |

> 表 2 - 模型细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${m.dfT} | ${m.SSt.toFixed(4)} | ${(m.SSt / m.dfT).toFixed(4)} |
| 回归 (R) | ${m.dfR} | ${m.SSr.toFixed(4)} | ${(m.SSr / m.dfR).toFixed(4)} |
| 残差 (E) | ${m.dfE} | ${m.SSe.toFixed(4)} | ${(m.SSe / m.dfE).toFixed(4)} |

## 2 描述统计

对自变量"${x}"和因变量"${y}"进行描述统计分析. 

结果如表 3 所示.

> 表 3 - 描述统计

| 变量 | 均值 | 标准差 |
| :---: | :---: | :---: |
| ${x} | ${m.xMean.toFixed(4)} | ${m.xStd.toFixed(4)} |
| ${y} | ${m.yMean.toFixed(4)} | ${m.yStd.toFixed(4)} |
			`)
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
						optimizer: 'adam',
					}}
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
									if (value === getFieldValue('y')) {
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
									if (value === getFieldValue('x')) {
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
					<Form.Item>
						<Button className='w-full mt-4' type='default' htmlType='submit'>
							计算
						</Button>
					</Form.Item>
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
