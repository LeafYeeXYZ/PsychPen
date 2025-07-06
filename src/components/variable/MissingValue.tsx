import { Button, Form, Select, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../hooks/useData.ts'
import { useStates } from '../../hooks/useStates.ts'
import { sleep } from '../../lib/utils.ts'
import { ALL_VARS_IDENTIFIER } from '../../types.ts'

type Option = {
	/** 变量名 */
	variable: string[]
	/** 缺失值 */
	missing?: unknown[] // 比较时务必用 == 而不是 ===
}

export function MissingValue() {
	const dataCols = useData((state) => state.dataCols)
	const isLargeData = useData((state) => state.isLargeData)
	const updateData = useData((state) => state.updateData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)

	// 处理缺失值
	const handleFinish = async (values: Option) => {
		try {
			messageApi?.loading('正在处理数据...', 0)
			isLargeData && (await sleep())
			const timestamp = Date.now()
			const { variable, missing } = values
			const cols = dataCols
			if (variable.includes(ALL_VARS_IDENTIFIER)) {
				for (const col of cols) {
					col.missingValues = missing
				}
			} else {
				for (const v of variable) {
					const col = cols.findIndex((col) => col.name === v)
					if (col !== -1) {
						cols[col].missingValues = missing
					}
				}
			}
			await updateData(cols)
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
				<Form<Option>
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
						label='变量名(可选择多个变量)'
						name='variable'
						rules={[
							{ required: true, message: '请选择变量' },
							() => ({
								validator(_, value) {
									if (
										value?.includes(ALL_VARS_IDENTIFIER) &&
										value?.length > 1
									) {
										return Promise.reject(
											'已选择全部变量, 请不要再选择其他变量',
										)
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
							options={[
								{
									label: `全部变量 (共${dataCols.filter((col) => col.derived !== true).length}个)`,
									value: ALL_VARS_IDENTIFIER,
								},
								...dataCols
									.filter((col) => col.derived !== true)
									.map((col) => ({ label: col.name, value: col.name })),
							]}
						/>
					</Form.Item>
					<Form.Item label='缺失值(可输入多个值/留空)' name='missing'>
						<Select mode='tags' className='w-full' placeholder='请输入缺失值' />
					</Form.Item>
					<Form.Item>
						<Button
							className='mt-4'
							htmlType='submit'
							disabled={disabled}
							block
						>
							确定
						</Button>
					</Form.Item>
				</Form>
			</div>

			<div className='component-result variable-view'>
				<p className='intro-text'>通常, 在研究数据中不会直接将缺失值留空</p>
				<p className='intro-text'>
					而是将缺失值替换为特定的值, 以便于后续的数据处理
				</p>
				<p className='intro-text'>
					例如用 <Tag>-1</Tag>、<Tag>-99</Tag>、<Tag>99</Tag> 表示缺失值
				</p>
				<p className='intro-text'>
					你可以在此页面定义这些缺失值, 以便将它们删除或插值
				</p>
			</div>
		</div>
	)
}
