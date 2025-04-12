import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { Expression } from '../../../components/widgets/Expression'
import { useData } from '../../../hooks/useData'
import { useStates } from '../../../hooks/useStates'
import { sleep } from '../../../lib/utils'
import { funcsLabel } from '../../../tools/tools'
import { Funcs } from '../../enum'

export function CreateNewVarTool({
	done,
	setDone,
	id,
	variable_name,
	calc_expression,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	variable_name: string
	calc_expression: string
}) {
	const addNewVar = useData((state) => state.addNewVar)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{funcsLabel.get(Funcs.CREATE_NEW_VAR)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}生成新变量{' '}
				<Tag style={{ margin: 0 }} color='blue'>
					{variable_name}
				</Tag>
				, 计算表达式为如下:
			</div>
			<div className='bg-white dark:bg-gray-800 rounded-md p-3 border dark:border-black'>
				<Expression value={calc_expression} />
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
							await addNewVar(variable_name, calc_expression)
							setDone?.(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功生成新变量"${variable_name}", 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已生成新变量' : '确认生成新变量'}
				</Button>
			</div>
		</>
	)
}
