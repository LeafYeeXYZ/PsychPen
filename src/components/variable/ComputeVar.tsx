import { Button, Form, Input, Popconfirm, Select, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { sleep } from '../../lib/utils'
import { Expression } from '../widgets/Expression'

type Option = {
	/** 新变量名 */
	variable: string
	/**
	 * 计算表达式
	 * 输入的表达式在将变量为替换为数字后, 必须能够被按照 JS 语法计算
	 */
	expression: string
	/** 变量列表 */
	_variable?: string
}

export function ComputeVar() {
	const dataCols = useData((state) => state.dataCols)
	const isLargeData = useData((state) => state.isLargeData)
	const addNewVar = useData((state) => state.addNewVar)
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
			await addNewVar(values.variable, values.expression)
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
						label='新变量名'
						name='variable'
						rules={[
							{ required: true, message: '请输入新变量名' },
							() => ({
								validator(_, value) {
									if (typeof value !== 'string') return Promise.resolve()
									if (dataCols.find(({ name }) => name === value))
										return Promise.reject('变量名已存在')
									return Promise.resolve()
								},
							}),
						]}
					>
						<Input placeholder='请输入新变量名' />
					</Form.Item>
					<Form.Item
						label='计算表达式'
						name='expression'
						required
						rules={[
							() => ({
								validator(_, value) {
									if (typeof value !== 'string') return Promise.resolve()
									if (value.replace(/\s/g, '') === '')
										return Promise.reject('请输入计算表达式')
									const vars = value.match(/:::.+?:::/g)
									if (!vars) return Promise.resolve()
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
							placeholder='请输入计算表达式'
							autoSize
							onChange={(e) => {
								const value = e.target.value
								setExpression(typeof value === 'string' ? value : '')
							}}
						/>
					</Form.Item>
					<Form.Item>
						<Popconfirm
							title='确定要生成新变量吗'
							onConfirm={form.submit}
							okText='确定'
							cancelText='取消'
						>
							<Button
								className='mt-4'
								htmlType='button'
								disabled={disabled}
								block
							>
								生成
							</Button>
						</Popconfirm>
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
								if (!value) return
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
				<p className='intro-text'>将原始数据中的多个变量计算为一个新变量</p>
				<p className='intro-text'>
					计算表达式中变量应当通过 <Tag color='blue'>:::name:::</Tag>语法引用
				</p>
				<p className='intro-text'>
					例如 <Tag color='blue'>( :::a::: + :::b::: ) * 2</Tag>表示将 a 和 b
					的和乘以 2
				</p>
				<p className='intro-text'>
					如果引用的任意变量有缺失值, 则计算后的变量的对应行也将是缺失值
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
