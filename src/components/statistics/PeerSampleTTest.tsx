import { ExportOutlined } from '@ant-design/icons'
import { PeerSampleTTest as T } from '@psych/lib'
import { Button, Form, Input, InputNumber, Popover, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 变量名1 */
	variable1: string
	/** 变量名2 */
	variable2: string
	/** 检验值, 默认 0 */
	expect: number
	/** 单双尾检验, 默认双尾 */
	twoside: boolean
	/** 显著性水平, 默认 0.05 */
	alpha: number
}

export function PeerSampleTTest() {
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
			const { variable1, variable2, expect, twoside, alpha } = values
			const data1: number[] = []
			const data2: number[] = []
			for (const row of dataRows) {
				if (
					typeof row[variable1] !== 'undefined' &&
					!Number.isNaN(Number(row[variable1])) &&
					typeof row[variable2] !== 'undefined' &&
					!Number.isNaN(Number(row[variable2]))
				) {
					data1.push(Number(row[variable1]))
					data2.push(Number(row[variable2]))
				}
			}
			const m = new T(data1, data2, twoside, expect, alpha)
			setStatResult(`
## 1 配对样本T检验

对被试内变量"${variable1}"和"${variable2}"进行${twoside ? '双尾' : '单尾'}配对样本T检验 (Student's T Test). 原假设 (H<sub>0</sub>) 为"均值差异 = ${expect}"; 显著性水平 (α) 为 ${alpha}.

结果如表 1 所示.

> 表 1 - 配对样本T检验结果

| 均值差异 | 自由度 | t | p | ${(100 - alpha * 100).toFixed(3)}%置信区间 | 效应量 (Cohen's d) | 测定系数 (R<sup>2</sup>) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ${m.meanDiff.toFixed(3)} | ${m.df.toFixed(3)} | ${markS(m.t, m.p)} | ${markP(m.p)} | [${m.ci[0].toFixed(3)}, ${m.ci[1].toFixed(3)}) | ${m.cohenD.toFixed(3)} | ${m.r2.toFixed(3)} |

## 2 描述统计

对被试内变量"${variable1}"和"${variable2}"进行描述统计.

结果如表 2 所示.

> 表 2 - 描述统计结果

| 变量 | 均值 | 标准差 | 样本量 | 自由度 |
| :---: | :---: | :---: | :---: | :---: |
| ${variable1} | ${m.meanA.toFixed(3)} | ${m.stdA.toFixed(3)} | ${m.df + 1} | ${m.df} |
| ${variable2} | ${m.meanB.toFixed(3)} | ${m.stdB.toFixed(3)} | ${m.df + 1} | ${m.df} |
| 差异 | ${m.meanDiff.toFixed(3)} | ${m.stdDiff.toFixed(3)} | ${m.df + 1} | ${m.df} |
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
					initialValues={{
						expect: 0,
						twoside: true,
						alpha: 0.05,
					}}
					disabled={disabled}
				>
					<Form.Item
						label='选择配对变量'
						name='variable1'
						rules={[
							{ required: true, message: '请选择配对变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (value === getFieldValue('variable2')) {
										return Promise.reject('请选择不同的变量')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择配对变量'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label='选择配对变量'
						name='variable2'
						rules={[
							{ required: true, message: '请选择配对变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (value === getFieldValue('variable1')) {
										return Promise.reject('请选择不同的变量')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择配对变量'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ label: col.name, value: col.name }))}
						/>
					</Form.Item>
					<Form.Item
						label='检验值'
						name='expect'
						rules={[{ required: true, message: '请输入检验值' }]}
					>
						<Input
							className='w-full'
							placeholder='请输入检验值'
							type='number'
						/>
					</Form.Item>
					<Form.Item label='单双尾检验和显著性水平'>
						<Space.Compact block>
							<Form.Item
								noStyle
								name='twoside'
								rules={[{ required: true, message: '请选择单双尾检验' }]}
							>
								<Select className='w-full' placeholder='请选择单双尾检验'>
									<Select.Option value={true}>双尾检验</Select.Option>
									<Select.Option value={false}>单尾检验</Select.Option>
								</Select>
							</Form.Item>
							<Form.Item
								noStyle
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
						</Space.Compact>
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
