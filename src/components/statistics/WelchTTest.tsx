import { WelchTTest as T } from '@psych/lib'
import { Button, Form, Input, InputNumber, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 数据变量 */
	dataVar: string
	/** 分组变量 (水平数应为2) */
	groupVar: string
	/** 检验值, 默认 0 */
	expect: number
	/** 单双尾检验, 默认双尾 */
	twoside: boolean
	/** 显著性水平, 默认 0.05 */
	alpha: number
}

export function WelchTTest() {
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
			const { dataVar, groupVar, expect, twoside, alpha } = values
			const data1: number[] = []
			const data2: number[] = []
			const groups = Array.from(
				new Set(dataRows.map((value) => value[groupVar])).values(),
			)
			for (const row of dataRows) {
				if (
					typeof row[dataVar] !== 'undefined' &&
					!Number.isNaN(Number(row[dataVar])) &&
					typeof row[groupVar] !== 'undefined'
				) {
					row[groupVar] == groups[0] && data1.push(Number(row[dataVar]))
					row[groupVar] == groups[1] && data2.push(Number(row[dataVar]))
				}
			}
			const m = new T(data1, data2, twoside, expect, alpha)
			setStatResult(`
## 1 Welch's T Test

对被试间变量"${dataVar}" (分组变量: "${groupVar}") 进行${twoside ? '双尾' : '单尾'} Welch's T Test. 原假设 (H<sub>0</sub>) 为"均值差异 = ${expect}"; 显著性水平 (α) 为 ${alpha}.

结果如表 1 所示.

> 表 1 - Welch's T Test 结果

| 均值差异 | 自由度 | t | p | ${(100 - alpha * 100).toFixed(3)}%置信区间 | 效应量 (Cohen's d) | 测定系数 (R<sup>2</sup>) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ${m.meanDiff.toFixed(3)} | ${m.df.toFixed(3)} | ${markS(m.t, m.p)} | ${markP(m.p)} | [${m.ci[0].toFixed(3)}, ${m.ci[1].toFixed(3)}) | ${m.cohenD.toFixed(3)} | ${m.r2.toFixed(3)} |

## 2 描述统计

对被试间变量"${dataVar}" (分组变量: "${groupVar}") 进行描述统计.

结果如表 2 所示.

> 表 2 - 描述统计结果

| 组别 | 均值 | 标准差 | 样本量 | 自由度 |
| :---: | :---: | :---: | :---: | :---: |
| ${groups[0]} | ${m.meanA.toFixed(3)} | ${m.stdA.toFixed(3)} | ${m.dfA + 1} | ${m.dfA} |
| ${groups[1]} | ${m.meanB.toFixed(3)} | ${m.stdB.toFixed(3)} | ${m.dfB + 1} | ${m.dfB} |
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
						label='选择数据变量'
						name='dataVar'
						rules={[
							{ required: true, message: '请选择数据变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (value === getFieldValue('groupVar')) {
										return Promise.reject('请选择不同的变量')
									}
									return Promise.resolve()
								},
							}),
						]}
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
						label='选择分组变量'
						name='groupVar'
						rules={[
							{ required: true, message: '请选择分组变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (value === getFieldValue('dataVar')) {
										return Promise.reject('请选择不同的变量')
									}
									return Promise.resolve()
								},
							}),
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择分组变量'
							options={dataCols
								.filter((col) => col.unique === 2)
								.map((col) => ({
									label: `${col.name} (水平数: 2)`,
									value: col.name,
								}))}
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
					<p className='w-full text-center text-xs text-gray-400 mt-5'>
						Welch's T 不要求两组数据方差齐性 (但仍需满足正态性)
					</p>
					<p className='w-full text-center text-xs text-gray-400 mt-1'>
						且相比 Student's T 更加稳健
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
