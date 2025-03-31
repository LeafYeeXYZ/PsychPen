import { ExportOutlined } from '@ant-design/icons'
import { HalfRealiability } from '@psych/lib'
import { Button, Form, Popover, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 前一半变量名 */
	variablesA: string[]
	/** 后一半变量名 */
	variablesB: string[]
	/** 分组变量 */
	group?: string
}

export function HalfReliability() {
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
			const { variablesA, variablesB, group } = values
			const filteredRows = dataRows.filter((row) =>
				variablesA
					.concat(variablesB)
					.every(
						(variable) =>
							typeof row[variable] !== 'undefined' &&
							!Number.isNaN(Number(row[variable])),
					),
			)
			const firstHalf = variablesA.map((variable) =>
				filteredRows.map((row) => Number(row[variable])),
			)
			const lastHalf = variablesB.map((variable) =>
				filteredRows.map((row) => Number(row[variable])),
			)
			const m = new HalfRealiability(
				firstHalf,
				lastHalf,
				typeof group === 'string'
					? filteredRows.map((row) => String(row[group]))
					: undefined,
			)
			setStatResult(`
## 1 分半信度分析

进行分半信度分析, 前半部分题目包括${variablesA.map((v) => `"${v}"`).join('、')}, 后半部分题目包括${variablesB.map((v) => `"${v}"`).join('、')}. ${
				group ? `分组变量为"${group}".` : ''
			}

结果如表 1 所示.

> 表 1 - 分半信度分析结果

| 分组 | 前半部分题目数 | 后半部分题目数 | 修正后相关系数(r<sub>xx</sub>) |
| :---: | :---: | :---: | :---: |
${m.r
	.map((r, i) => {
		return `| ${m.group[i]} | ${variablesA.length} | ${variablesB.length} | ${r.toFixed(3)} |`
	})
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
					disabled={disabled}
				>
					<Form.Item
						label='前一半变量'
						name='variablesA'
						rules={[
							{ required: true, message: '请选择变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (
										value?.some((variable: string) =>
											getFieldValue('variablesB')?.includes(variable),
										)
									) {
										return Promise.reject('前后两半变量不能重复')
									}
									return Promise.resolve()
								},
							}),
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
						label='后一半变量'
						name='variablesB'
						rules={[
							{ required: true, message: '请选择变量' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (
										value?.some((variable: string) =>
											getFieldValue('variablesA')?.includes(variable),
										)
									) {
										return Promise.reject('前后两半变量不能重复')
									}
									return Promise.resolve()
								},
							}),
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
