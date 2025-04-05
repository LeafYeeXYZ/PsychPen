import { ExportOutlined } from '@ant-design/icons'
import { LinearRegressionOne } from '@psych/lib'
import { Button, Form, Popover, Select, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { markP, markS, sleep } from '../../lib/utils'
import { Result } from '../widgets/Result'

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
				[x, y].every((variable) => typeof row[variable] === 'number'),
			)
			const xData = filteredRows.map((row) => row[x] as number)
			const yData = filteredRows.map((row) => row[y] as number)
			const m = new LinearRegressionOne(xData, yData)
			setStatResult(`
## 1 一元线性回归

对自变量 (x) "${x}"和因变量 (y) "${y}"进行一元线性回归分析. 原假设 (H<sub>0</sub>) 为"斜率 = 0"; 显著性水平 (α) 为 0.05. 最终模型为 y = ${markS(m.b0)} + ${markS(m.b1)} * x.

结果如表 1 和表 2 所示.

> 表 1 - 一元线性回归模型

| a (截距) | b (斜率) | F | t | p | 测定系数 (R²) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ${markS(m.b0)} | ${markS(m.b1)} | ${markS(m.F, m.p)} | ${markS(m.t, m.p)} | ${markP(m.p)} | ${markS(m.r2)} |

> 表 2 - 模型细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${m.dfT} | ${markS(m.SSt)} | ${markS(m.SSt / m.dfT)} |
| 回归 (R) | ${m.dfR} | ${markS(m.SSr)} | ${markS(m.SSr / m.dfR)} |
| 残差 (E) | ${m.dfE} | ${markS(m.SSe)} | ${markS(m.SSe / m.dfE)} |

## 2 描述统计

对自变量"${x}"和因变量"${y}"进行描述统计分析. 

结果如表 3 所示.

> 表 3 - 描述统计

| 变量 | 均值 | 标准差 |
| :---: | :---: | :---: |
| ${x} | ${markS(m.xMean)} | ${markS(m.xStd)} |
| ${y} | ${markS(m.yMean)} | ${markS(m.yStd)} |
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
