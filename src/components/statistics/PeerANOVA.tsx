import { ExportOutlined } from '@ant-design/icons'
import { PeerAnova, std } from '@psych/lib'
import { Button, Form, Popover, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { markBonferroniP, markP, markS, sleep } from '../../lib/utils.ts'
import { Result } from '../widgets/Result.tsx'

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
			const { value, method } = values
			const filteredRows = dataRows.filter((row) =>
				value.every((v) => typeof row[v] === 'number'),
			)
			const valueData = value.map((v) =>
				filteredRows.map((row) => row[v] as number),
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
| ${m.dfT + 1} | ${m.dfB + 1} | ${m.dfB} / ${m.dfError} | ${markS(m.f, m.p)} | ${markP(m.p)} | ${markS(m.r2)} | ${markS(m.r2adj)} | ${markS(m.cohenF)} |

> 表 2 - 分析细节

| 误差项 | 自由度 (df) | 平方和 (SS) | 均方 (MS) |
| :---: | :---: | :---: | :---: |
| 总和 (T) | ${m.dfT} | ${markS(m.SSt)} | ${markS(m.MSt)} |
| 组间 (B) | ${m.dfB} | ${markS(m.SSb)} | ${markS(m.MSb)} |
| 组内 (W) | ${m.dfW} | ${markS(m.SSw)} | ${markS(m.MSw)} |
| 被试间 (Subj) | ${m.dfSubj} | ${markS(m.SSsubj)} | ${markS(m.MSsubj)} |
| 误差 (Error) | ${m.dfError} | ${markS(m.SSerror)} | ${markS(m.MSerror)} |

## 2 描述统计

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行描述统计.

结果如表 3 所示.

> 表 3 - 分组描述统计

| 组别 | 计数 | 均值 | 标准差 | 总和 |
| :---: | :---: | :---: | :---: | :---: |
${m.groups.map((group, index) => `| ${group} | ${m.n} | ${markS(m.groupsMean[index])} | ${markS(std(m.values[index], true, m.groupsMean[index]))} | ${markS(m.groupsSum[index])} |`).join('\n')}

## 3 组间差异

对配对变量${value.map((v) => `"${v}"`).join(', ')}进行组间差异分析${
				scheffe ? '; 进行 Scheffe 事后检验' : ''
			}${
				bonferroni
					? `; 进行 Bonferroni 事后检验. 使用 MS<sub>within</sub> 代替 S<sub>p</sub><sup>2</sup> (检验更严格). 临界显著性水平应为 ${bonferroni[0].sig.toFixed(4).slice(1)} (即 0.05 除以成对比较次数)`
					: ''
			}${
				tukey
					? `; 进行 Tukey's HSD 事后检验, 均值差异显著的临界值 HSD = ${markS(tukey[0].HSD)}`
					: ''
			}.

结果如表 4 所示.

> 表 4 - 组间差异

| 组A | 组B | 均值差异 | Cohen's d |${
				scheffe ? ' Scheffe F | Scheffe p |' : ''
			}${bonferroni ? ' Bonferroni t | Bonferroni p |' : ''}${
				tukey ? ' Tukey q | Tukey p |' : ''
			}
| :---: | :---: | :---: | :---: |${scheffe ? ' :---: | :---: |' : ''}${
				bonferroni ? ' :---: | :---: |' : ''
			}${tukey ? ' :---: | :---: |' : ''}
${m.cohenD
	.map(
		(row) =>
			`| ${row.groupA} | ${row.groupB} | ${markS(row.diff)} | ${markS(row.d)} |${
				scheffe
					? ` ${markS(scheffe.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.f, scheffe.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.p)} | ${markP(scheffe.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.p)} |`
					: ''
			}${
				bonferroni
					? ` ${markS(bonferroni.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.t)} | ${markBonferroniP(bonferroni.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.p, bonferroni[0].sig)} |`
					: ''
			}${
				tukey
					? ` ${markS(tukey.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.q, tukey.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.p)} | ${markP(tukey.find((v) => v.groupA === row.groupA && v.groupB === row.groupB)?.p)} |`
					: ''
			}`,
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
