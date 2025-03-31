import { ExportOutlined } from '@ant-design/icons'
import { PearsonCorrTest } from '@psych/lib'
import { Button, Form, InputNumber, Popover, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

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
			setStatResult(`
## 1 Pearson 相关系数检验

对变量${variable.map((v) => `"${v}"`).join(', ')}进行 Pearson 相关系数检验. 原假设 (H<sub>0</sub>) 为"两个变量的相关系数等于零"; 显著性水平 (α) 为 ${alpha}.

结果如表 1 所示.

> 表 1 - Pearson 相关系数检验结果

| 变量A | 变量B | 相关系数(r) | 测定系数(r²) | ${(100 - alpha * 100).toFixed(3)}%置信区间 | t | p | 自由度 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${results
	.map(
		(row) =>
			`| ${row.peer[0]} | ${row.peer[1]} | ${row.r} | ${row.r2} | ${row.ci} | ${row.t} | ${row.p} | ${row.df} |`,
	)
	.join('\n')}

## 2 相关系数矩阵

绘制变量${variable.map((v) => `"${v}"`).join(', ')}的相关系数矩阵.

结果如表 2 所示.

> 表 2 - 相关系数矩阵

|  | ${variable.join(' | ')} |
| :---: | ${variable.map(() => ' :---: ').join(' | ')} |
${variable
	.map(
		(variableA, indexA) =>
			`| ${variableA} | ${variable
				.map((variableB, indexB) =>
					indexA === indexB
						? '-'
						: results.find(
								(row) =>
									row.peer.includes(variableA) && row.peer.includes(variableB),
							)?.r,
				)
				.join(' | ')} |`,
	)
	.join('\n')}
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
