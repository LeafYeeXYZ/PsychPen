import { ExportOutlined } from '@ant-design/icons'
import { OneSampleTTest as T } from '@psych/lib'
import { Button, Form, Input, InputNumber, Popover, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { markP, markS, sleep } from '../../lib/utils.ts'
import { Result } from '../widgets/Result.tsx'

type Option = {
	/** 变量名 */
	variable: string
	/** 检验值, 默认 0 */
	expect: number
	/** 单双尾检验, 默认双尾 */
	twoside: boolean
	/** 显著性水平, 默认 0.05 */
	alpha: number
}

export function oneSampleTTestCalculator(config: {
	variable: string
	expect: number
	twoside: boolean
	alpha: number
	data: number[]
}): string {
	const { variable, expect, twoside, alpha, data } = config
	const m = new T(data, expect, twoside, alpha)
	return `
## 1 单样本T检验

对变量"${variable}"进行${twoside ? '双尾' : '单尾'}单样本T检验 (Student's T Test). 原假设 (H<sub>0</sub>) 为"均值 = ${expect}"; 显著性水平 (α) 为 ${alpha}.

结果如表 1 所示.

> 表 1 - 单样本T检验结果

| 样本均值 | 自由度 | t | p | ${markS(100 - alpha * 100)}%置信区间 | 效应量 (Cohen's d) | 测定系数 (R<sup>2</sup>) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ${markS(m.mean)} | ${markS(m.df)} | ${markS(m.t, m.p)} | ${markP(m.p)} | [${markS(m.ci[0])}, ${markS(m.ci[1])}) | ${markS(m.cohenD)} | ${markS(m.r2)} |

## 2 描述统计

对自变量"${variable}"进行描述统计. 

结果如表 2 所示.

> 表 2 - 描述统计结果

| 均值 | 标准差 | 样本量 | 自由度 |
| :---: | :---: | :---: | :---: |
| ${markS(m.mean)} | ${markS(m.std)} | ${m.df + 1} | ${m.df} |
	`
}

export function OneSampleTTest() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
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
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variable, expect, twoside, alpha } = values
			const data = dataRows
				.map((row) => row[variable])
				.filter((v) => typeof v === 'number')
			setStatResult(
				oneSampleTTestCalculator({ variable, expect, twoside, alpha, data }),
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
					initialValues={{
						expect: 0,
						twoside: true,
						alpha: 0.05,
					}}
					disabled={disabled}
				>
					<Form.Item
						label='选择变量'
						name='variable'
						rules={[{ required: true, message: '请选择变量' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择变量'
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
