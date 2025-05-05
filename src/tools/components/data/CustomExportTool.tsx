import { Button, Tag } from 'antd'
import { flushSync } from 'react-dom'
import { useData } from '../../../hooks/useData'
import { useStates } from '../../../hooks/useStates'
import { sleep } from '../../../lib/utils'
import { funcsLabel } from '../../../tools/tools'
import { Funcs } from '../../enum'

export function CustomExportTool({
	done,
	setDone,
	id,
	file_name,
	file_type,
	function_code,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	file_name: string
	file_type: 'json' | 'txt' | 'csv'
	function_code: string
}) {
	const dataRows = useData((state) => state.dataRows)
	const dataCols = useData((state) => state.dataCols)
	const isLargeData = useData((state) => state.isLargeData)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' style={{ margin: 0 }}>
					{funcsLabel.get(Funcs.CUSTOM_EXPORT)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}执行以下代码{' '}
				<div className='bg-white dark:bg-gray-800 rounded-md p-3 border dark:border-black my-2'>
					<pre className='overflow-x-auto'>{function_code}</pre>
				</div>
				并将结果下载到文件{' '}
				<Tag style={{ margin: 0 }} color='blue'>
					{file_name || 'data'}.{file_type}
				</Tag>
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
							const result = String(
								new Function('data', 'vars', function_code)(
									JSON.parse(JSON.stringify(dataRows)),
									JSON.parse(JSON.stringify(dataCols)),
								),
							)
							const blob = new Blob([result], { type: 'text/plain' })
							const url = URL.createObjectURL(blob)
							const a = document.createElement('a')
							a.href = url
							a.download = `${file_name || 'data'}.${file_type}`
							a.click()
							setDone?.(true)
							sessionStorage.setItem(id, 'done')
							messageApi?.destroy()
							messageApi?.success(
								`已成功执行代码并导出数据并到文件"${file_name || 'data'}.${file_type}", 用时 ${Date.now() - timestamp} 毫秒`,
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
					{done ? '已执行代码导出数据' : '确认执行代码并导出数据'}
				</Button>
			</div>
		</>
	)
}
