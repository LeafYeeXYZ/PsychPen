import { ExportOutlined } from '@ant-design/icons'
import { AlphaRealiability } from '@psych/lib'
import { Button, Form, InputNumber, Popover, Radio, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { jsArrayToRMatrix, markS, sleep } from '../../lib/utils.ts'
import { Result } from '../widgets/Result.tsx'

type Option = {
	/** 变量名 */
	variables: string[]
	/** 分组变量 */
	group?: string
	/** 是否计算 Omega 系数 */
	calculateOmega?: boolean
	/** Omega 系数的因子数 */
	manualNFactors?: number
}

export function HomoReliability() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const statResult = useStates((state) => state.statResult)
	const setStatResult = useStates((state) => state.setStatResult)
	const getR = useStates((state) => state.getR)
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
			const { variables, group, calculateOmega, manualNFactors } = values
			const filteredRows = dataRows
				.filter((row) =>
					variables.every((variable) => typeof row[variable] === 'number'),
				)
				.filter((row) => !group || typeof row[group] !== 'undefined')
			const items = variables.map((variable) =>
				filteredRows.map((row) => row[variable] as number),
			)
			const m = new AlphaRealiability(
				items,
				typeof group === 'string'
					? filteredRows.map((row) => String(row[group]))
					: undefined,
			)
			if (calculateOmega) {
				const r = await getR()
				const code = (data: number[][]) => `
					library(jsonlite)
					library(psych)
          data <- ${jsArrayToRMatrix(data, true)}
          omega_result <- omega(data${manualNFactors ? `, nfactors = ${manualNFactors}` : ''})
          json_result <- toJSON(omega_result$omega.tot)
          json_result
        `
				if (m.group.length > 1 && group) {
					const omega: number[] = []
					const n: number[] = []
					for (const g of m.group) {
						const rows = filteredRows.filter((row) => row[group] === g)
						const items = variables.map((variable) =>
							rows.map((row) => Number(row[variable])),
						)
						const result = JSON.parse(
							await r.evalRString(code(items)),
						) as number[]
						omega.push(result[0])
						n.push(rows.length)
					}
					setStatResult(`
## 1 同质性信度分析

对量表题目${variables.map((v) => `"${v}"`).join(', ')}进行同质性信度分析. 分组变量为"${group}". 应用中, alpha 的值至少要大于 0.5, 最好能大于 0.7. 而 omega 是一种更为准确的信度系数, 详见 Hayes, A. F., & Coutts, J. J. (2020).

结果如表 1 所示.

> 表 1 - 同质性信度分析结果

| 分组 | 量表题目数 | 样本量 | alpha 系数 | omega 系数 |
| :---: | :---: | :---: | :---: | :---: |
${m.group
	.map((g, i) => {
		return `| ${g} | ${variables.length} | ${n[i]} | ${markS(m.alpha[i])} | ${markS(omega[i])} |`
	})
	.join('\n')}

##### 参考文献

> Hayes, A. F., & Coutts, J. J. (2020). Use Omega Rather than Cronbach’s Alpha for Estimating Reliability. But…. Communication Methods and Measures, 14(1), 1–24. https://doi.org/10.1080/19312458.2020.1718629
					`)
				} else {
					const omega = JSON.parse(await r.evalRString(code(items))) as number[]
					setStatResult(`
## 1 同质性信度分析

对量表题目${variables.map((v) => `"${v}"`).join(', ')}进行同质性信度分析. 应用中, alpha 的值至少要大于 0.5, 最好能大于 0.7. 而 omega 是一种更为准确的信度系数, 详见 Hayes, A. F., & Coutts, J. J. (2020).

结果如表 1 所示.

> 表 1 - 同质性信度分析结果

| 量表题目数 | alpha 系数 | omega 系数 |
| :---: | :---: | :---: |
| ${variables.length} | ${markS(m.alpha[0])} | ${markS(omega[0])} |

##### 参考文献

> Hayes, A. F., & Coutts, J. J. (2020). Use Omega Rather than Cronbach’s Alpha for Estimating Reliability. But…. Communication Methods and Measures, 14(1), 1–24. https://doi.org/10.1080/19312458.2020.1718629
					`)
				}
			} else {
				setStatResult(`
## 1 同质性信度分析

对量表题目${variables.map((v) => `"${v}"`).join(', ')}进行同质性信度分析. ${group ? `分组变量为"${group}". ` : ''}应用中, alpha 的值至少要大于 0.5, 最好能大于 0.7.

结果如表 1 所示.

> 表 1 - 同质性信度分析结果

| 分组 | 量表题目数 | alpha 系数 |
| :---: | :---: | :---: |
${m.group
	.map((g, i) => {
		return `| ${g} | ${variables.length} | ${markS(m.alpha[i])} |`
	})
	.join('\n')}
				`)
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
					initialValues={{ calculateOmega: false }}
				>
					<Form.Item
						label='量表的所有变量'
						name='variables'
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
					<Form.Item
						label='Omega 系数'
						name='calculateOmega'
						rules={[{ required: true, message: '请选择是否计算 Omega 系数' }]}
					>
						<Radio.Group block buttonStyle='solid'>
							<Radio.Button value={true}>计算</Radio.Button>
							<Radio.Button value={false}>不计算</Radio.Button>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='手动指定 Omega 系数的因子数' name='manualNFactors'>
						<InputNumber
							addonBefore='提取'
							addonAfter='个因子'
							placeholder='留空则自动计算'
							className='w-full'
							min={1}
							step={1}
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
					<p className='w-full text-center text-xs text-gray-400 mt-5'>
						计算 Omega 系数依赖 R 语言模块及 psych 包
					</p>
					<p className='w-full text-center text-xs text-gray-400 mt-1'>
						首次运行会联网加载相关资源, 请耐心等待
					</p>
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
