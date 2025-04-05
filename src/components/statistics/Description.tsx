import { ExportOutlined } from '@ant-design/icons'
import {
	vari as _vari,
	max,
	mean,
	median,
	min,
	mode,
	quantile,
	range,
	std,
	sum,
} from '@psych/lib'
import { Button, Form, Popover, Radio, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { markS, sleep } from '../../lib/utils'
import { Result } from '../widgets/Result'

type AvialableStat =
	| 'total'
	| 'min'
	| 'max'
	| 'mean'
	| 'mode'
	| 'q1'
	| 'q2'
	| 'q3'
	| 'std'
	| 'count'
	| 'unique'
	| 'median'
	| 'range'
	| 'variance'

const STAT_OPTIONS: { value: AvialableStat; label: string }[] = [
	{ value: 'count', label: '有效值数' },
	{ value: 'unique', label: '唯一值数' },
	{ value: 'total', label: '总和' },
	{ value: 'mean', label: '均值' },
	{ value: 'median', label: '中位数' },
	{ value: 'std', label: '标准差' },
	{ value: 'variance', label: '方差' },
	{ value: 'q1', label: 'Q1(25%分位数)' },
	{ value: 'q2', label: 'Q2(50%分位数)' },
	{ value: 'q3', label: 'Q3(75%分位数)' },
	{ value: 'mode', label: '众数' },
	{ value: 'min', label: '最小值' },
	{ value: 'max', label: '最大值' },
	{ value: 'range', label: '极差' },
]

type Option = {
	/** 类别 */
	type: 'peer' | 'independent'
	/** 被试间变量名 */
	variable?: string
	/** 分组变量 */
	group?: string
	/** 被试内变量名 */
	variables?: string[]
	/** 统计量 */
	statistic: AvialableStat[]
}

export function Description() {
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
			const { type, variable, group, variables, statistic } = values
			if (type === 'peer') {
				if (!variables?.length) {
					throw new Error('请选择变量')
				}
				const data = variables.map((vari) => {
					const rows = dataRows
						.map((row) => row[vari])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v))
					const data = statistic.map((stat) => {
						switch (stat) {
							case 'total':
								return { value: markS(sum(rows)), label: '总和' }
							case 'min':
								return { value: markS(min(rows)), label: '最小值' }
							case 'max':
								return { value: markS(max(rows)), label: '最大值' }
							case 'mean':
								return { value: markS(mean(rows)), label: '均值' }
							case 'mode':
								return { value: markS(mode(rows)), label: '众数' }
							case 'q1':
								return {
									value: markS(quantile(rows, 0.25)),
									label: 'Q1(25%分位数)',
								}
							case 'q2':
								return {
									value: markS(quantile(rows, 0.5)),
									label: 'Q2(50%分位数)',
								}
							case 'q3':
								return {
									value: markS(quantile(rows, 0.75)),
									label: 'Q3(75%分位数)',
								}
							case 'std':
								return { value: markS(std(rows)), label: '标准差' }
							case 'count':
								return { value: rows.length.toString(), label: '有效值数' }
							case 'unique':
								return {
									value: new Set(rows).size.toString(),
									label: '唯一值数',
								}
							case 'median':
								return { value: markS(median(rows)), label: '中位数' }
							case 'range':
								return { value: markS(range(rows)), label: '极差' }
							case 'variance':
								return { value: markS(_vari(rows)), label: '方差' }
						}
					})
					return { var: vari, data }
				})
				setStatResult(`
## 1 描述统计

对被试内变量${variables.map((v) => `"${v}"`).join(', ')}进行描述统计.

结果如表 1 所示.

> 表 1 - 描述统计结果

| 变量 | ${statistic.map((s) => STAT_OPTIONS.find((o) => o.value === s)?.label).join(' | ')} |
| :---: | ${statistic.map(() => ' :---: ').join(' | ')} |
${data
	.map((d) => `| ${d.var} | ${d.data.map((v) => v.value).join(' | ')} |`)
	.join('\n')}
				`)
			} else {
				if (!variable || !group) {
					throw new Error('请选择数据变量和分组变量')
				}
				const groups = Array.from(new Set(dataRows.map((row) => row[group])))
				const data = groups.map((g) => {
					const rows = dataRows
						.filter((row) => row[group] === g)
						.map((row) => row[variable])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v))
					const data = statistic.map((stat) => {
						switch (stat) {
							case 'total':
								return { value: markS(sum(rows)), label: '总和' }
							case 'min':
								return { value: markS(min(rows)), label: '最小值' }
							case 'max':
								return { value: markS(max(rows)), label: '最大值' }
							case 'mean':
								return { value: markS(mean(rows)), label: '均值' }
							case 'mode':
								return { value: markS(mode(rows)), label: '众数' }
							case 'q1':
								return {
									value: markS(quantile(rows, 0.25)),
									label: 'Q1(25%分位数)',
								}
							case 'q2':
								return {
									value: markS(quantile(rows, 0.5)),
									label: 'Q2(50%分位数)',
								}
							case 'q3':
								return {
									value: markS(quantile(rows, 0.75)),
									label: 'Q3(75%分位数)',
								}
							case 'std':
								return { value: markS(std(rows)), label: '标准差' }
							case 'count':
								return { value: rows.length.toString(), label: '有效值数' }
							case 'unique':
								return {
									value: new Set(rows).size.toString(),
									label: '唯一值数',
								}
							case 'median':
								return { value: markS(median(rows)), label: '中位数' }
							case 'range':
								return { value: markS(range(rows)), label: '极差' }
							case 'variance':
								return { value: markS(_vari(rows)), label: '方差' }
						}
					})
					return { var: String(g), data }
				})
				setStatResult(`
## 1 描述统计

对被试间变量"${variable}"进行描述统计, 分组变量为"${group}".

结果如表 1 所示.

> 表 1 - 描述统计结果

| 组别 | ${statistic.map((s) => STAT_OPTIONS.find((o) => o.value === s)?.label).join(' | ')} |
| :---: | ${statistic.map(() => ' :---: ').join(' | ')} |
${data
	.sort((a, b) => Number(a.var) - Number(b.var))
	.map((d) => `| ${d.var} | ${d.data.map((v) => v.value).join(' | ')} |`)
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
	const [formType, setFormType] = useState<'peer' | 'independent'>('peer')

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
						type: 'peer',
					}}
					disabled={disabled}
				>
					<Form.Item
						name='type'
						label='待描述统计的变量类型'
						rules={[{ required: true, message: '请选择待描述统计的变量类型' }]}
					>
						<Radio.Group
							className='w-full'
							block
							onChange={(e) => setFormType(e.target.value)}
							optionType='button'
							buttonStyle='solid'
						>
							<Radio value='peer'>被试内变量</Radio>
							<Radio value='independent'>被试间变量</Radio>
						</Radio.Group>
					</Form.Item>
					{formType === 'peer' ? (
						<Form.Item
							label='选择变量(可多选)'
							name='variables'
							rules={[{ required: true, message: '请选择变量' }]}
						>
							<Select
								className='w-full'
								placeholder='请选择变量'
								mode='multiple'
								options={dataCols
									.filter((col) => col.type === '等距或等比数据')
									.map((col) => ({ value: col.name, label: col.name }))}
							/>
						</Form.Item>
					) : (
						<>
							<Form.Item
								label='选择数据变量'
								name='variable'
								rules={[{ required: true, message: '请选择数据变量' }]}
							>
								<Select
									className='w-full'
									placeholder='请选择数据变量'
									options={dataCols
										.filter((col) => col.type === '等距或等比数据')
										.map((col) => ({ value: col.name, label: col.name }))}
								/>
							</Form.Item>
							<Form.Item
								label='分组变量'
								name='group'
								rules={[{ required: true, message: '请选择分组变量' }]}
							>
								<Select
									className='w-full'
									placeholder='请选择分组变量'
									options={dataCols.map((col) => ({
										value: col.name,
										label: `${col.name} (水平数: ${col.unique})`,
									}))}
								/>
							</Form.Item>
						</>
					)}
					<Form.Item
						label='描述统计量(可多选)'
						name='statistic'
						rules={[{ required: true, message: '请选择描述统计量' }]}
					>
						<Select
							className='w-full'
							placeholder='请选择描述统计量'
							mode='multiple'
							options={STAT_OPTIONS}
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
