import { ExportOutlined } from '@ant-design/icons'
import { CorrRealiability } from '@psych/lib'
import { Button, Form, Popover, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { sleep } from '../../lib/utils'
import { Result } from '../widgets/Result'

type Option = {
	/** 变量名 */
	variables: [string, string]
	/** 分组变量 */
	group?: string
}

export function CorrReliability() {
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
			const filteredRows = dataRows.filter((row) =>
				values.variables.every(
					(variable) =>
						typeof row[variable] !== 'undefined' &&
						!Number.isNaN(Number(row[variable])),
				),
			)
			const x1 = filteredRows.map((row) => Number(row[values.variables[0]]))
			const x2 = filteredRows.map((row) => Number(row[values.variables[1]]))
			const g = values.group
			const group = g ? filteredRows.map((row) => String(row[g])) : undefined
			const m = new CorrRealiability(x1, x2, group)
			setStatResult(`
## 1 重测信度/复本信度分析

对前后测变量"${values.variables[0]}"和"${values.variables[1]}"进行重测信度/复本信度分析 (即皮尔逊相关系数)${group ? `, 分组变量为"${g}"` : ''}.

结果如表 1 所示.

> 表 1 - 重测信度/复本信度分析结果

| 分组 | 相关系数(r<sub>xx</sub>) | 测定系数(r<sub>xx</sub><sup>2</sup>) |
| :---: | :---: | :---: |
${m.r.map((_, i) => `| ${m.group[i]} | ${m.r[i].toFixed(3)} | ${m.r2[i].toFixed(3)} |`).join('\n')}
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
						label='待检验变量(两个)'
						name='variables'
						rules={[
							{ required: true, message: '请选择变量' },
							{ type: 'array', min: 2, max: 2, message: '请选择两个变量' },
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
