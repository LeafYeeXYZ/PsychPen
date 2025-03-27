import { KurtosisTest, SkewnessTest } from '@psych/lib'
import { Button, Form, Radio, Select } from 'antd'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { markP, markS, renderStatResult, sleep } from '../../lib/utils'

type Option = {
	/** 类型 */
	type: 'independent' | 'paired'
	/** 被试内变量名 */
	variables?: string[]
	/** 被试间变量名 */
	variable?: string
	/** 分组 */
	group?: string
}

export function KurtosisSkewness() {
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
			const { variables, variable, group, type } = values
			if (type === 'paired') {
				if (!variables?.length) {
					throw new Error('请选择变量')
				}
				const data: number[][] = variables.map((variable) =>
					dataRows
						.map((row) => row[variable])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v)),
				)
				const k = data.map((arr) => new KurtosisTest(arr))
				const s = data.map((arr) => new SkewnessTest(arr))
				setStatResult(`
## 1 峰度和偏度检验

对被试内变量${variables.map((v) => `"${v}"`).join(', ')}进行峰度和偏度检验. 原假设 (H<sub>0</sub>) 为"峰度/偏度等于零"; 显著性水平 (α) 为 0.05.

结果如表 1 所示.

> 表 1 - 峰度和偏度检验结果

| 变量 | 样本量 | 峰度 | z | p | 偏度 | z | p |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${k
	.map(
		(k, i) =>
			`| ${variables[i]} | ${data[i].length} | ${k.kurtosis.toFixed(3)} | ${markS(k.z, k.p)} | ${markP(k.p)} | ${s[i].skewness.toFixed(3)} | ${markS(s[i].z, s[i].p)} | ${markP(s[i].p)} |`,
	)
	.join('\n')}
        `)
			} else {
				if (!variable || !group) {
					throw new Error('请选择数据变量和分组变量')
				}
				const groups = Array.from(
					new Set(dataRows.map((row) => row[group])),
				).map(String)
				const data: number[][] = groups.map((g) =>
					dataRows
						.filter((row) => row[group] === g)
						.map((row) => row[variable])
						.filter((v) => typeof v !== 'undefined' && !Number.isNaN(Number(v)))
						.map((v) => Number(v)),
				)
				const k = data.map((arr) => new KurtosisTest(arr))
				const s = data.map((arr) => new SkewnessTest(arr))
				setStatResult(`
## 1 峰度和偏度检验

对被试间变量"${variable}" (分组变量: "${group}") 进行峰度和偏度检验. 原假设 (H<sub>0</sub>) 为"峰度/偏度等于零"; 显著性水平 (α) 为 0.05.

结果如表 1 所示.

> 表 1 - 峰度和偏度检验结果

| 组别 | 样本量 | 峰度 | z | p | 偏度 | z | p |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${k
	.map(
		(k, i) =>
			`| ${groups[i]} | ${data[i].length} | ${k.kurtosis.toFixed(3)} | ${markS(k.z, k.p)} | ${markP(k.p)} | ${s[i].skewness.toFixed(3)} | ${markS(s[i].z, s[i].p)} | ${markP(s[i].p)} |`,
	)
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
	const [type, setType] = useState<'independent' | 'paired'>('paired')

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
						type: 'paired',
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
							onChange={(e) => setType(e.target.value)}
							optionType='button'
							buttonStyle='solid'
						>
							<Radio value='paired'>被试内变量</Radio>
							<Radio value='independent'>被试间变量</Radio>
						</Radio.Group>
					</Form.Item>
					{type === 'paired' ? (
						<Form.Item
							label='变量(可多选)'
							name='variables'
							rules={[{ required: true, message: '请选择变量' }]}
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
								label='数据变量'
								name='variable'
								rules={[{ required: true, message: '请选择数据变量' }]}
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
