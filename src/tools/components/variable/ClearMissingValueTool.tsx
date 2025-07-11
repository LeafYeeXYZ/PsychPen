import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData.ts'
import { useStates } from '../../../hooks/useStates.ts'
import { sleep } from '../../../lib/utils.ts'
import { funcsLabel } from '../../../tools/tools.ts'
import { ALL_VARS_IDENTIFIER } from '../../../types.ts'
import { Funcs } from '../../enum.ts'

export function ClearMissingValueTool({
	done,
	setDone,
	id,
	variable_names,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	variable_names: string[]
}) {
	const dataCols = useData((state) => state.dataCols)
	const updateData = useData((state) => state.updateData)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{funcsLabel.get(Funcs.CLEAR_MISSING_VALUE)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}清除变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					variable_names.map((name) => (
						<Tag
							key={name}
							style={{ margin: 0, marginLeft: '0.3rem' }}
							color='blue'
						>
							{name}
						</Tag>
					))
				)}{' '}
				的缺失值定义
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
							if (variable_names.includes(ALL_VARS_IDENTIFIER)) {
								updateData(
									dataCols.map((col) => ({
										...col,
										missingValues: undefined,
									})),
								)
								setDone?.(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除所有变量的缺失值定义, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingValues: undefined,
											}
										}
										return col
									}),
								)
								setDone?.(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功清除变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的缺失值定义, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							}
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
					{done ? '已清除缺失值定义' : '确认清除缺失值定义'}
				</Button>
			</div>
		</>
	)
}
