import {
	CloudServerOutlined,
	CommentOutlined,
	DeleteOutlined,
	FilterOutlined,
	InfoCircleOutlined,
	SaveOutlined,
} from '@ant-design/icons'
import { ExportTypes, downloadSheet } from '@psych/sheet'
import { AgGridReact } from 'ag-grid-react'
import { Button, Input, Modal, Popconfirm, Popover, Select, Tag } from 'antd'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useAssistant } from '../../hooks/useAssistant'
import { useData } from '../../hooks/useData'
import { useStates } from '../../hooks/useStates'
import { Expression } from '../widgets/Expression'
import { ConfigAI } from './ConfigAI'
import { ConfigR } from './ConfigR'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { sleep } from '../../lib/utils'

/** 可导出的文件类型 */
const EXPORT_FILE_TYPES = Object.values(ExportTypes)

export function PreviewData() {
	const dataCols = useData((state) => state.dataCols)
	const dataRows = useData((state) => state.dataRows)
	const filterExpression = useData((state) => state.filterExpression)
	const data = useData((state) => state.data)
	const isLargeData = useData((state) => state.isLargeData)
	const setData = useData((state) => state.setData)
	const disabled = useStates((state) => state.disabled)
	const setDisabled = useStates((state) => state.setDisabled)
	const messageApi = useStates((state) => state.messageApi)
	const [modalApi, contextHolder] = Modal.useModal()
	// 导出数据相关
	const handleExport = (filename: string, type: string) => {
		downloadSheet(dataRows, type as ExportTypes, filename)
	}
	const handleExportParams = useRef<{ filename?: string; type?: string }>({})
	// 标注AI状态
	const ai = useAssistant((state) => state.ai)

	return (
		<div className='flex flex-col justify-start items-center w-full h-full p-4'>
			{/* 上方工具栏 */}
			<div className='w-full flex justify-start items-center gap-3 mb-4 relative'>
				<Popconfirm
					title={
						<span>
							是否确认清除数据
							<br />
							本地数据不受影响
						</span>
					}
					onConfirm={async () => {
						await setData(null)
						messageApi?.success('数据已清除', 0.5)
					}}
					okText='确定'
					cancelText='取消'
				>
					<Button icon={<DeleteOutlined />} disabled={disabled}>
						清除数据
					</Button>
				</Popconfirm>
				<Button
					icon={<SaveOutlined />}
					disabled={disabled}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							await modalApi.confirm({
								title: '导出数据',
								content: (
									<div className='flex flex-col gap-4 my-4'>
										<Input
											placeholder='请输入文件名 (可留空)'
											onChange={(e) => {
												handleExportParams.current.filename = e.target.value
											}}
										/>
										<Select
											placeholder='请选择导出格式'
											defaultValue={
												handleExportParams.current.type?.length
													? handleExportParams.current.type
													: EXPORT_FILE_TYPES[0]
											}
											onChange={(value) => {
												handleExportParams.current.type = value
											}}
											options={EXPORT_FILE_TYPES.map((type) => ({
												value: type,
												label: (
													<span>
														导出为 <Tag color='pink'>{type}</Tag>文件
													</span>
												),
											}))}
										/>
									</div>
								),
								onOk: async () => {
									messageApi?.loading('正在导出数据...', 0)
									isLargeData && (await sleep())
									handleExport(
										handleExportParams.current.filename?.length
											? handleExportParams.current.filename
											: 'psychpen',
										handleExportParams.current.type?.length
											? handleExportParams.current.type
											: EXPORT_FILE_TYPES[0],
									)
									handleExportParams.current.filename = undefined
									handleExportParams.current.type = undefined
									messageApi?.destroy()
									messageApi?.success('数据导出成功', 1)
								},
								okText: '确定',
								cancelText: '取消',
							})
						} finally {
							setDisabled(false)
						}
					}}
				>
					导出数据
				</Button>
				<Popover
					title={
						<span>
							当前过滤表达式{' '}
							<Tag color='blue'>
								已排除{(data?.length ?? Number.NaN) - dataRows.length}条数据
							</Tag>
						</span>
					}
					content={
						<span>
							<Expression value={filterExpression} />
						</span>
					}
					trigger={['click', 'hover']}
				>
					<Button icon={<FilterOutlined />} />
				</Popover>
				<div className='absolute right-0 flex justify-end items-center gap-3'>
					<Popover
						title={
							<span>
								AI辅助分析设置 {'|'} 当前状态:{' '}
								{ai ? (
									<Tag color='green'>可用</Tag>
								) : (
									<Tag color='red'>不可用</Tag>
								)}
								<Popover
									content={
										<div className='flex flex-col gap-1'>
											<div>
												在输入全部信息后, 请点击确认,
												系统将自动检查AI服务是否可用
											</div>
										</div>
									}
								>
									<InfoCircleOutlined />
								</Popover>
							</span>
						}
						trigger={['click', 'hover']}
						content={<ConfigAI />}
					>
						<Button icon={<CommentOutlined />}>AI辅助分析设置</Button>
					</Popover>
					<Popover
						title={
							<span>
								R语言服务器设置{' '}
								<Popover content='详见使用文档或询问 AI 助手'>
									<InfoCircleOutlined />
								</Popover>
							</span>
						}
						trigger={['click', 'hover']}
						content={<ConfigR />}
					>
						<Button icon={<CloudServerOutlined />}>R语言服务器设置</Button>
					</Popover>
				</div>
			</div>
			{/* 数据表格 */}
			<AgGridReact
				className='ag-theme-quartz-auto-dark w-full h-full overflow-auto'
				// @ts-expect-error 使用 valueFormatter 之后类型报错
				rowData={dataRows}
				// @ts-expect-error 使用 valueFormatter 之后类型报错
				columnDefs={dataCols.map((col) => ({
					field: col.name,
					headerName: col.name,
					valueFormatter: (params) =>
						col.type === '等距或等比数据' ? params.value : String(params.value),
				}))}
			/>
			{contextHolder}
		</div>
	)
}
