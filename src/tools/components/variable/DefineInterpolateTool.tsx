import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData'
import { useStates } from '../../../hooks/useStates'
import { sleep } from '../../../lib/utils'
import { funcsLabel } from '../../../tools/tools'
import {
	type ALLOWED_INTERPOLATION_METHODS,
	ALL_VARS_IDENTIFIER,
} from '../../../types'
import { Funcs } from '../../enum'

export function DefineInterpolateTool({
	done,
	setDone,
	id,
	variable_names,
	method,
	reference_variable,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	variable_names: string[]
	method: ALLOWED_INTERPOLATION_METHODS
	reference_variable?: string
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
					{funcsLabel.get(Funcs.DEFINE_INTERPOLATE)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}设置变量
				{variable_names.includes(ALL_VARS_IDENTIFIER) ? (
					<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
						所有变量
					</Tag>
				) : (
					<>
						{variable_names.map((name) => (
							<Tag
								key={name}
								style={{ margin: 0, marginLeft: '0.3rem' }}
								color='blue'
							>
								{name}
							</Tag>
						))}
					</>
				)}{' '}
				的插值方法为:
				<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='yellow'>
					{method}
				</Tag>
				{reference_variable && (
					<>
						, 插值参考变量为:
						<Tag style={{ margin: 0, marginLeft: '0.3rem' }} color='yellow'>
							{reference_variable}
						</Tag>
					</>
				)}
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
									dataCols.map((col) => {
										if (col.type === '等距或等比数据') {
											return {
												...col,
												missingMethod: method,
												missingRefer: reference_variable,
											}
										}
										return col
									}),
								)
								setDone?.(true)
								sessionStorage.setItem(id, 'done')
								messageApi?.destroy()
								messageApi?.success(
									`已成功为所有变量设置插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
								)
							} else {
								updateData(
									dataCols.map((col) => {
										if (variable_names.includes(col.name)) {
											return {
												...col,
												missingMethod: method,
												missingRefer: reference_variable,
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
										)} 设置插值方法, 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已设置插值方法' : '确认设置插值方法'}
				</Button>
			</div>
		</>
	)
}
