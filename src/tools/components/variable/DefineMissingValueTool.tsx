import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData'
import { useStates } from '../../../hooks/useStates'
import { sleep } from '../../../lib/utils'
import { funcsLabel } from '../../../tools/tools'
import { ALL_VARS_IDENTIFIER } from '../../../types'
import { Funcs } from '../../enum'

export function DefineMissingValueTool({
	done,
	setDone,
	id,
	variable_names,
	missing_values,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	variable_names: string[]
	missing_values: unknown[]
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
					{funcsLabel.get(Funcs.DEFINE_MISSING_VALUE)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}定义变量
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
				的缺失值为:
				{missing_values.map((value) => (
					<Tag
						key={String(value)}
						style={{ margin: 0, marginLeft: '0.3rem' }}
						color='yellow'
					>
						{String(value)}
					</Tag>
				))}
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
										missingValues: missing_values,
									})),
								)
								setDone?.(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为所有变量定义缺失值, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingValues: missing_values,
											}
										}
										return col
									}),
								)
								setDone?.(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为变量 ${variable_names
										.map((name) => `"${name}"`)
										.join(
											'、',
										)} 定义缺失值, 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已定义缺失值' : '确认定义缺失值'}
				</Button>
			</div>
		</>
	)
}
