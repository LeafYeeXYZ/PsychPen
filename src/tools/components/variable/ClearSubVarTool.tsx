import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData'
import { useStates } from '../../../hooks/useStates'
import { sleep } from '../../../lib/utils'
import { funcsLabel } from '../../../tools/tools'
import { Funcs } from '../../enum'

export function ClearSubVarTool({
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
					{funcsLabel.get(Funcs.CLEAR_SUB_VAR)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}清除变量
				{variable_names.map((name) => (
					<Tag
						key={name}
						style={{ margin: 0, marginLeft: '0.3rem' }}
						color='blue'
					>
						{name}
					</Tag>
				))}{' '}
				的所有子变量
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
											subVars: undefined,
										}
									}
									return col
								}),
							)
							setDone?.(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功清除变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的所有子变量, 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已清除子变量' : '确认清除子变量'}
				</Button>
			</div>
		</>
	)
}
