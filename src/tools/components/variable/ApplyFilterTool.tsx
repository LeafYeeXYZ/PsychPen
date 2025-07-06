import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { Expression } from '../../../components/widgets/Expression.tsx'
import { useData } from '../../../hooks/useData.ts'
import { useStates } from '../../../hooks/useStates.ts'
import { sleep } from '../../../lib/utils.ts'
import { funcsLabel } from '../../../tools/tools.ts'
import { Funcs } from '../../enum.ts'

export function ApplyFilterTool({
	done,
	setDone,
	id,
	filter_expression,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	filter_expression: string
}) {
	const setFilterExpression = useData((state) => state.setFilterExpression)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{funcsLabel.get(Funcs.APPLY_FILTER)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}设置数据筛选规则, 表达式如下:
			</div>
			<div className='bg-white dark:bg-gray-800 rounded-md p-3 border dark:border-black'>
				<Expression value={filter_expression} />
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
							await setFilterExpression(filter_expression)
							setDone?.(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功设置数据筛选规则, 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已设置筛选规则' : '确认设置筛选规则'}
				</Button>
			</div>
		</>
	)
}
