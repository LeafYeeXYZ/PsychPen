import { OneSampleTTest as T } from '@psych/lib'
import { Button, Form, Input, InputNumber, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

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

export function OneSampleTTest() {
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
			const { variable, expect, twoside, alpha } = values
			const data = dataRows
				.map((row) => row[variable])
				.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
				.map((v) => Number(v))
			const m = new T(data, expect, twoside, alpha)
			setStatResult(`
## 1 单样本T检验

对变量"${variable}"进行${twoside ? '双尾' : '单尾'}单样本T检验 (Student's T Test). 原假设 (H<sub>0</sub>) 为"均值 = ${expect}"; 显著性水平 (α) 为 ${alpha}.

结果如表 1 所示.

> 表 1 - 单样本T检验结果

| 样本均值 | 自由度 | t | p | ${(100 - alpha * 100).toFixed(3)}%置信区间 | 效应量 (Cohen's d) | 测定系数 (R<sup>2</sup>) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ${m.mean.toFixed(3)} | ${m.df.toFixed(3)} | ${markS(m.t, m.p)} | ${markP(m.p)} | [${m.ci[0].toFixed(3)}, ${m.ci[1].toFixed(3)}) | ${m.cohenD.toFixed(3)} | ${m.r2.toFixed(3)} |

## 2 描述统计

对自变量"${variable}"进行描述统计. 

结果如表 2 所示.

> 表 2 - 描述统计结果

| 均值 | 标准差 | 样本量 | 自由度 |
| :---: | :---: | :---: | :---: |
| ${m.mean.toFixed(3)} | ${m.std.toFixed(3)} | ${m.df + 1} | ${m.df} |
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
