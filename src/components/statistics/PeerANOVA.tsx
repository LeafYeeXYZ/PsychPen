import { PeerAnova, std } from '@psych/lib'
import { Button, Form, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 变量 */
	value: string[]
	/** 事后检验方法 */
	method: ('Scheffe' | 'Bonferroni' | 'Tukey')[]
}
const METHODS = {
	Scheffe: 'Scheffe 事后检验',
	Bonferroni: 'Bonferroni 事后检验',
	Tukey: "Tukey's HSD 事后检验",
}

export function PeerANOVA() {
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
			const { value, method } = values
			const filteredRows = dataRows.filter((row) =>
				value.every(
					(v) => typeof row[v] !== 'undefined' && !Number.isNaN(Number(row[v])),
				),
			)
			const valueData = value.map((v) =>
				filteredRows.map((row) => Number(row[v])),
			)
			const m = new PeerAnova(valueData, value)
			const scheffe = method?.includes('Scheffe') ? m.scheffe() : undefined
			const bonferroni = method?.includes('Bonferroni')
				? m.bonferroni()
				: undefined
			const tukey = method?.includes('Tukey') ? m.tukey() : undefined
			setStatResult(`
## 1 重复测量方差分析

进行重复测量方差分析, 配对变量包括${value.map((v) => `"${v}"`).join(', ')}. 原假设 (H<sub>0</sub>) 为"各组均值相等"; 显著性水平 (α) 为 0.05.

结果如表 1 和表 2 所示.

> 表 1 - 重复测量方差分析结果

| 样本量 | 水平数 | 自由度 (组间/误差) | F | p | η² | η²<sub>p</sub> | Conhen's f |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ${m.dfT + 1} | ${m.dfB + 1} | ${m.dfB} / ${m.dfError} | ${markS(m.f, m.p)} | ${markP(m.p)} | ${m.r2.toFixed(3)} | ${m.r2adj.toFixed(3)} | ${m.cohenF.toFixed(3)} |

> 表 2 - 分析细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${m.dfT} | ${m.SSt.toFixed(3)} | ${m.MSt.toFixed(3)} |
| 组间 (B) | ${m.dfB} | ${m.SSb.toFixed(3)} | ${m.MSb.toFixed(3)} |
| 组内 (W) | ${m.dfW} | ${m.SSw.toFixed(3)} | ${m.MSw.toFixed(3)} |
| 被试间 (Subj) | ${m.dfSubj} | ${m.SSsubj.toFixed(3)} | ${m.MSsubj.toFixed(3)} |
| 误差 (Error) | ${m.dfError} | ${m.SSerror.toFixed(3)} | ${m.MSerror.toFixed(3)} |

## 2 描述统计

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行描述统计.

结果如表 3 所示.

> 表 3 - 分组描述统计

| 组别 | 计数 | 均值 | 标准差 | 总和 |
| :---: | :---: | :---: | :---: | :---: |
${m.groups.map((group, index) => `| ${group} | ${m.n} | ${m.groupsMean[index].toFixed(3)} | ${std(m.values[index], true, m.groupsMean[index]).toFixed(3)} | ${m.groupsSum[index].toFixed(3)} |`).join('\n')}

## 3 组间差异

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行组间差异检验.

结果如表 4 所示.

> 表 4 - 组间差异

| 组A | 组B | 均值差异 | Cohen's d |
| :---: | :---: | :---: | :---: |
${m.cohenD.map((row) => `| ${row.groupA} | ${row.groupB} | ${row.diff.toFixed(3)} | ${row.d.toFixed(3)} |`).join('\n')}

${
	scheffe
		? `
## 4 Scheffe 事后检验

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行 Scheffe 事后检验.

结果如表 5 所示.

> 表 5 - Scheffe 事后检验

| 组A | 组B | 均值差异 | F | p |
| :---: | :---: | :---: | :---: | :---: |
${scheffe.map((row) => `| ${row.groupA} | ${row.groupB} | ${row.diff.toFixed(3)} | ${row.f.toFixed(3)} | ${markP(row.p)} |`).join('\n')}
`
		: ''
}

${
	bonferroni
		? `
## ${scheffe ? '5' : '4'} Bonferroni 事后检验

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行 Bonferroni 事后检验. 使用 MS<sub>within</sub> 代替 S<sub>p</sub><sup>2</sup> (检验更严格). 临界显著性水平应为 ${bonferroni[0].sig.toFixed(4)} (即 0.05 除以成对比较次数).

结果如表 ${scheffe ? '6' : '5'} 所示.

> 表 ${scheffe ? '6' : '5'} - Bonferroni 事后检验

| 组A | 组B | 均值差异 | t | p |
| :---: | :---: | :---: | :---: | :---: |
${bonferroni
	.map(
		(row) =>
			`| ${row.groupA} | ${row.groupB} | ${row.diff.toFixed(3)} | ${row.t.toFixed(3)} | ${
				row.p < row.sig ? '<span style="color: red;">' : ''
			}${row.p.toFixed(4)}${row.p < row.sig ? '</span>' : ''} |`,
	)
	.join('\n')}
`
		: ''
}

${
	tukey
		? `
## ${scheffe && bonferroni ? '6' : (scheffe || bonferroni) ? '5' : '4'} Tukey's HSD 事后检验

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行 Tukey's HSD 事后检验. 均值差异显著的临界值 HSD = ${tukey[0].HSD.toFixed(3)}.

结果如表 ${scheffe && bonferroni ? '7' : (scheffe || bonferroni) ? '6' : '5'} 所示.

> 表 ${scheffe && bonferroni ? '7' : (scheffe || bonferroni) ? '6' : '5'} - Tukey's HSD 事后检验

| 组A | 组B | 均值差异 | q | p |
| :---: | :---: | :---: | :---: | :---: |
${tukey
	.map(
		(row) =>
			`| ${row.groupA} | ${row.groupB} | ${row.diff.toFixed(3)} | ${markS(row.q, row.p)} | ${markP(
				row.p,
			)} |`,
	)
	.join('\n')}
`
		: ''
}
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
						label='配对变量'
						name='value'
						rules={[
							{ required: true, message: '请选择配对变量' },
							{ type: 'array', min: 2, message: '请选择至少两个配对变量' },
						]}
					>
						<Select
							className='w-full'
							placeholder='请选择因变量'
							mode='multiple'
							options={dataCols
								.filter((col) => col.type === '等距或等比数据')
								.map((col) => ({ value: col.name, label: col.name }))}
						/>
					</Form.Item>
					<Form.Item label='事后检验方法(可多选/留空)' name='method'>
						<Select
							className='w-full'
							placeholder='请选择事后检验方法'
							mode='multiple'
							options={Object.entries(METHODS).map(([value, label]) => ({
								value,
								label,
							}))}
						/>
					</Form.Item>
					<Form.Item>
						<Button className='w-full mt-4' type='default' htmlType='submit'>
							计算
						</Button>
					</Form.Item>
					<p className='w-full text-center text-xs text-gray-400 mt-5'>
						注: Cohen's d 和事后检验均使用 MS<sub>error</sub> 代替 MS
						<sub>within</sub>
					</p>
					<p className='w-full text-center text-xs text-gray-400 mt-1'>
						对于重复测量方差分析, 事后检验推荐使用 Bonferroni 方法
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
