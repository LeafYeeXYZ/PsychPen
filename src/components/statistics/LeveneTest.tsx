import { LeveneTest as T } from '@psych/lib'
import { Button, Form, Radio, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 类别 */
	type: 'peer' | 'independent'
	/** 被试间变量名 */
	variable?: string
	/** 被试内变量名 */
	variables?: string[]
	/** 分组变量 */
	group?: string
	/** 中心化方法 */
	center: 'mean' | 'median'
}

export function LeveneTest() {
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
			const { type, variable, variables, group: groups, center } = values
			let group: string[]
			let value: number[]
			// 处理被试间变量
			if (type === 'independent') {
				if (!variable || !groups) {
					throw new Error('请选择数据变量和分组变量')
				}
				const filteredRows = dataRows.filter(
					(row) =>
						row[variable] !== undefined &&
						!Number.isNaN(Number(row[variable])) &&
						row[groups] !== undefined,
				)
				group = filteredRows.map((row) => String(row[groups]))
				value = filteredRows.map((row) => Number(row[variable]))
			} else {
				if (!variables?.length) {
					throw new Error('请选择变量')
				}
				group = []
				value = []
				for (const variable of variables) {
					const filteredRows = dataRows.filter(
						(row) =>
							row[variable] !== undefined &&
							!Number.isNaN(Number(row[variable])),
					)
					for (const row of filteredRows) {
						group.push(String(variable))
						value.push(Number(row[variable]))
					}
				}
			}
			const m = new T(value, group, center)
			setStatResult(`
## 1 Levene 检验

对被试${type === 'independent' ? '间' : '内'}变量${type === 'independent' ? `"${variable}" (分组变量: "${groups}")` : variables?.map((v) => `"${v}"`).join(', ')}进行 Levene's Test (方差齐性检验). 原假设 (H<sub>0</sub>) 为"各${type === 'independent' ? '组' : '变量'}满足方差齐性".

结果如表 1 所示.

> 表 1 - Levene's Test 结果

| 自由度 | F (w) | p |
| :---: | :---: | :---: |
| ${m.dfB}, ${m.dfW} | ${markS(m.w, m.p)} | ${markP(m.p)} |

## 2 描述统计

对被试${type === 'independent' ? '间' : '内'}变量${type === 'independent' ? `"${variable}" (分组变量: "${groups}")` : variables?.map((v) => `"${v}"`).join(', ')}进行描述统计. 中心化方法为基于${center === 'mean' ? '均值' : '中位数'} (注: 此处中心化指离中心的"距离" (即差异的绝对值)).

结果如表 2 所示.

> 表 2 - 描述统计结果

| ${type === 'independent' ? '组别' : '变量'} | 样本量 | 原始均值 | 原始中位数 | 中心化均值 | 中心化中位数 |
| :---: | :---: | :---: | :---: | :---: | :---: |
${m.groups
	.map(
		(group, index) =>
			`| ${group} | ${m.groupsCount[index]} | ${m.groupsMeanR[index].toFixed(3)} | ${m.groupsMedianR[index].toFixed(3)} | ${m.groupsMeanC[index].toFixed(3)} | ${m.groupsMedianC[index].toFixed(3)} |`,
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
						center: 'mean',
						type: 'peer',
					}}
					disabled={disabled}
				>
					<Form.Item
						name='type'
						label='待检验变量类型'
						rules={[{ required: true, message: '请选择待检验变量类型' }]}
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
							label='选择变量(至少两个)'
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
					) : (
						<>
							<Form.Item
								label='选择数据变量'
								name='variable'
								rules={[
									{ required: true, message: '请选择数据变量' },
									{ type: 'string', message: '只能选择一个数据变量' },
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
								label='分组变量'
								name='group'
								rules={[{ required: true, message: '请选择分组变量' }]}
							>
								<Select
									className='w-full'
									placeholder='请选择分组变量'
									options={dataCols.map((col) => ({
										label: `${col.name} (水平数: ${col.unique})`,
										value: col.name,
									}))}
								/>
							</Form.Item>
						</>
					)}
					<Form.Item
						name='center'
						label='中心化方法'
						rules={[{ required: true, message: '请选择中心化方法' }]}
					>
						<Radio.Group
							className='w-full'
							block
							optionType='button'
							buttonStyle='solid'
						>
							<Radio value='mean'>均值</Radio>
							<Radio value='median'>中位数</Radio>
						</Radio.Group>
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
