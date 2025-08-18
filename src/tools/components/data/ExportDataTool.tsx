import { downloadSheet, ExportTypes } from '@psych/sheet'
import { Button, Tag } from 'antd'
import { useData } from '../../../hooks/useData.ts'
import { useStates } from '../../../hooks/useStates.ts'
import { funcsLabel } from '../../../tools/tools.ts'
import { Funcs } from '../../enum.ts'

export function ExportDataTool({
	done,
	setDone,
	id,
	file_name,
	file_type,
}: {
	done: boolean
	setDone?: (done: boolean) => void
	id: string
	file_name: string
	file_type: string
}) {
	const dataRows = useData((state) => state.dataRows)
	const messageApi = useStates((state) => state.messageApi)
	const disabled = useStates((state) => state.disabled)
	return (
		<>
			<div>
				执行函数{' '}
				<Tag color='blue' className='!m-0'>
					{funcsLabel.get(Funcs.EXPORT_DATA)}
				</Tag>
				{done ? ', 已' : ', 是否确认'}导出数据到文件{' '}
				<Tag className='!m-0' color='blue'>
					{file_name || 'data'}.{file_type || 'xlsx'}
				</Tag>
			</div>
			<div>
				<Button
					block
					disabled={done || disabled}
					onClick={() => {
						downloadSheet(
							dataRows,
							Object.values(ExportTypes).includes(file_type as ExportTypes)
								? (file_type as ExportTypes)
								: ExportTypes.XLSX,
							file_name || undefined,
						)
						setDone?.(true)
						sessionStorage.setItem(id, 'done')
						messageApi?.success(
							`已成功导出数据到文件"${file_name || 'data'}.${file_type || 'xlsx'}"`,
						)
					}}
				>
					{done ? '已导出数据' : '确认导出数据'}
				</Button>
			</div>
		</>
	)
}
