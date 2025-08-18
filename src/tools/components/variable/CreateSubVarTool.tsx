import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData.ts'
import { useStates } from '../../../hooks/useStates.ts'
import { sleep } from '../../../lib/utils.ts'
import { funcsLabel } from '../../../tools/tools.ts'
import { ALLOWED_DISCRETE_METHODS } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export function CreateSubVarTool({
	done,
	setDone,
	id,
	variable_names,
	standardize,
	centralize,
	discretize,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	variable_names: string[]
	standardize: boolean | undefined
	centralize: boolean | undefined
	discretize:
		| {
				method: ALLOWED_DISCRETE_METHODS
				groups: number
		  }
		| undefined
}) {
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	const ALLOWED_METHOD = Object.values(ALLOWED_DISCRETE_METHODS)
	const shouldDiscritize = Boolean(
		typeof discretize === 'object' &&
			discretize.method &&
			discretize.groups &&
			ALLOWED_METHOD.includes(discretize.method),
	)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' className='!m-0'>
					{funcsLabel.get(Funcs.CREATE_SUB_VAR)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}生成变量
				{variable_names.map((name) => (
					<Tag key={name} className='!m-0 !ml-[0.3rem]' color='blue'>
						{name}
					</Tag>
				))}{' '}
				的
				{[
					standardize ? '标准化' : '',
					centralize ? '中心化' : '',
					shouldDiscritize
						? `离散化 (${discretize?.method}, ${discretize?.groups} 组) `
						: '',
				]
					.filter((part) => part)
					.join('、')}
				子变量
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							messageApi?.loading('正在处理数据...', 0)
							isLargeData && (await sleep())
							const timestamp = Date.now()
							updateData(
								dataCols.map((col) => {
									if (variable_names.includes(col.name)) {
										return {
											...col,
											subVars: {
												standard: Boolean(standardize) || col.subVars?.standard,
												center: Boolean(centralize) || col.subVars?.center,
												discrete: shouldDiscritize
													? {
															// biome-ignore lint/style/noNonNullAssertion: 如果 shouldDiscritize 为真, 则 discretize 一定存在
															method: discretize!.method,
															// biome-ignore lint/style/noNonNullAssertion: 如果 shouldDiscritize 为真, 则 discretize 一定存在
															groups: discretize!.groups,
														}
													: col.subVars?.discrete,
											},
										}
									}
									return col
								}),
							)
							setDone?.(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功生成变量 ${variable_names
									.map((name) => `"${name}"`)
									.join('、')} 的${[
									standardize ? '标准化' : '',
									centralize ? '中心化' : '',
									shouldDiscritize ? '离散化' : '',
								]
									.filter((part) => part)
									.join('、')}子变量, 用时 ${Date.now() - timestamp} 毫秒`,
							)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					{done ? '已生成子变量' : '确认生成子变量'}
				</Button>
			</div>
		</>
	)
}
