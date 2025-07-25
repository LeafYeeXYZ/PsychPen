import { Button, Form, Input, Select, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { sleep } from '../../lib/utils.ts'
import { Expression } from '../widgets/Expression.tsx'

type Option = {
	/**
	 * 过滤表达式
	 * 输入的表达式在将变量为替换为数字后, 必须能够被按照 JS 语法计算
	 */
	expression: string
	/** 变量列表 */
	_variable?: string
}

export function DataFilter() {
	const dataCols = useData((state) => state.dataCols)
	const isLargeData = useData((state) => state.isLargeData)
	const setFilterExpression = useData((state) => state.setFilterExpression)
	const filterExpression = useData((state) => state.filterExpression)
	const data = useData((state) => state.data)
	const dataRows = useData((state) => state.dataRows)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	const [expression, setExpression] = useState<string>('')
	const [form] = Form.useForm<Option>()
	const handleFinish = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			await setFilterExpression(values.expression || '')
			messageApi?.destroy()
			messageApi?.success(
				`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`,
				1,
			)
		} catch (error) {
			messageApi?.destroy()
			messageApi?.error(
				`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	return (
		<div className='component-main variable-view'>
			<div className='component-form'>
				<Form
					form={form}
					className='w-full py-4 overflow-auto'
					layout='vertical'
					onFinish={async (values) => {
						try {
							flushSync(() => setDisabled(true))
							await handleFinish(values)
						} finally {
							setDisabled(false)
						}
					}}
					autoComplete='off'
					disabled={disabled}
				>
					<Form.Item
						label={
							<span>
								当前过滤表达式{' '}
								<Tag color='blue'>
									共{dataRows.length}条数据通过过滤器 (
									{(data?.length ?? Number.NaN) - dataRows.length}条已被排除)
								</Tag>
							</span>
						}
					>
						<Expression value={filterExpression} />
					</Form.Item>
					<Form.Item
						label='过滤表达式'
						name='expression'
						rules={[
							() => ({
								validator(_, value) {
									if (typeof value !== 'string') {
										return Promise.resolve()
									}
									const vars = value.match(/:::.+?:::/g)
									if (!vars) {
										return Promise.resolve()
									}
									const invalid = vars.some(
										(v) =>
											!dataCols.find(({ name }) => name === v.slice(3, -3)),
									)
									return invalid
										? Promise.reject('表达式中存在未定义的变量')
										: Promise.resolve()
								},
							}),
						]}
					>
						<Input.TextArea
							placeholder='请输入过滤表达式(留空则不过滤)'
							autoSize
							onChange={(e) => {
								const value = e.target.value
								setExpression(typeof value === 'string' ? value : '')
							}}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							className='mt-4'
							htmlType='submit'
							disabled={
								disabled ||
								expression === filterExpression ||
								!(expression || filterExpression)
							}
							block
						>
							确定
						</Button>
					</Form.Item>
					<Form.Item label='表达式预览'>
						<Expression value={expression} />
					</Form.Item>
					<Form.Item label='变量列表(点击复制)' name='_variable'>
						<Select
							placeholder='变量列表'
							allowClear
							showSearch
							options={dataCols.map(({ name, type }) => ({
								label: `${name} (${type})`,
								value: name,
							}))}
							onChange={async (value) => {
								if (!value) {
									return
								}
								const expression = `:::${value}:::`
								try {
									await navigator.clipboard.writeText(expression)
									form.resetFields(['_variable'])
									messageApi?.success(`已复制 ${expression}`)
								} catch (error) {
									messageApi?.error(
										`复制失败: ${error instanceof Error ? error.message : String(error)}`,
									)
								}
							}}
						/>
					</Form.Item>
				</Form>
			</div>

			<div className='component-result variable-view'>
				<p className='intro-text'>定义变量筛选条件, 满足条件的数据将被保留</p>
				<p className='intro-text'>
					计算表达式中变量应当通过 <Tag color='blue'>:::name:::</Tag>语法引用
				</p>
				<p className='intro-text'>
					例如 <Tag color='blue'>:::a::: {'>'} :::b:::</Tag>表示筛选出变量 a
					大于变量 b 的数据
				</p>
				<p className='intro-text'>
					如果引用的任意变量有缺失值, 则该行数据将被排除
				</p>
				<p className='intro-text'>
					支持的比较运算符包括: <Tag color='blue'>{'>'}</Tag>
					<Tag color='blue'>{'<'}</Tag>
					<Tag color='blue'>{'>='}</Tag>
					<Tag color='blue'>{'<='}</Tag>
					<Tag color='blue'>{'=='}</Tag>(等于) <Tag color='blue'>{'!='}</Tag>
					(不等于) 等
				</p>
				<p className='intro-text'>
					支持的算数运算符包括: <Tag color='blue'>+</Tag>
					<Tag color='blue'>-</Tag>
					<Tag color='blue'>*</Tag>
					<Tag color='blue'>/</Tag>
					<Tag color='blue'>%</Tag>(取余) <Tag color='blue'>**</Tag>(幂运算) 等
				</p>
				<p className='intro-text'>
					为避免歧义, 请使用小括号 <Tag color='blue'>( )</Tag>明确运算顺序
				</p>
				<p className='intro-text'>
					对于等距或等比数据, 可以使用 <Tag color='blue'>mean(:::name:::)</Tag>
					表示变量的均值 (注意括号和冒号间没有空格)
				</p>
				<p className='intro-text'>
					除均值外, 还可以使用 <Tag color='blue'>min</Tag>
					<Tag color='blue'>max</Tag>
					<Tag color='blue'>std</Tag>
					<Tag color='blue'>mode</Tag>
					<Tag color='blue'>q1</Tag>
					<Tag color='blue'>q2</Tag>
					<Tag color='blue'>q3</Tag>统计量
				</p>
				<p className='intro-text'>
					对数等高级运算请使用 <Tag color='green'>JavaScript</Tag>的{' '}
					<Tag color='blue'>Math</Tag>对象
				</p>
				<p className='intro-text'>
					输入的表达式将在替换变量为数值后, 按照{' '}
					<Tag color='green'>JavaScript</Tag>语法计算
				</p>
			</div>
		</div>
	)
}
