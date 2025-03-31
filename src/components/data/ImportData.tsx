import {
	BookOutlined,
	ExportOutlined,
	LinkOutlined,
	SlidersOutlined,
} from '@ant-design/icons'
import { ImportTypes, importSheet } from '@psych/sheet'
import { Button, Popover, Tag, Upload } from 'antd'
import { flushSync } from 'react-dom'
import { version } from '../../../package.json'
import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { sleep } from '../../lib/utils'

/** 数据量较大的阈值 */
const LARGE_DATA_SIZE = 1024 * 1024 // 1 MB
/** 支持的文件类型 */
const ACCEPT_FILE_TYPES = Object.values(ImportTypes)

export function ImportData() {
	const setData = useData((state) => state.setData)
	const messageApi = useStates((state) => state.messageApi)
	const setDisabled = useStates((state) => state.setDisabled)
	const disabled = useStates((state) => state.disabled)

	return (
		<div className='flex flex-col justify-center items-center w-full h-full relative text-rose-950 dark:text-white'>
			<p className='text-2xl mb-20'>PsychPen: 在线统计分析和数据可视化工具</p>
			<p className='text-sm mb-4'>
				支持{' '}
				{ACCEPT_FILE_TYPES.map((type) => (
					<Tag key={type} color='pink'>
						.{type}
					</Tag>
				))}
				格式
			</p>
			<div className='flex gap-4 mt-2'>
				<Button
					icon={<ExportOutlined />}
					onClick={() => {
						window.open(
							'https://github.com/LeafYeeXYZ/PsychPen?tab=readme-ov-file#psychpen',
							'_blank',
						)
					}}
				>
					查看使用手册
				</Button>
				<Upload
					accept={ACCEPT_FILE_TYPES.map((type) => `.${type}`).join(',')}
					beforeUpload={async (file) => {
						try {
							messageApi?.loading('正在导入数据...', 0)
							flushSync(() => setDisabled(true))
							// 如果文件比较大, 延迟等待通知加载
							const isLargeData = file.size > LARGE_DATA_SIZE
							isLargeData && (await sleep())
							const reader = new FileReader()
							const ext = file.name.split('.').pop()?.toLowerCase()
							reader.onload = async (e) => {
								try {
									if (!e.target?.result) {
										messageApi?.destroy()
										messageApi?.error('文件读取失败, 请检查文件是否损坏')
									} else if (
										ACCEPT_FILE_TYPES.indexOf(ext as ImportTypes) === -1
									) {
										messageApi?.destroy()
										messageApi?.error('文件读取失败, 不支持该文件格式')
									} else {
										const data = await importSheet(
											e.target.result as ArrayBuffer,
											ext as ImportTypes,
										)
										await setData(data, isLargeData)
									}
									messageApi?.destroy()
									messageApi?.success('数据导入完成', 0.5)
								} catch (error) {
									messageApi?.destroy()
									messageApi?.error(
										`文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
									)
								} finally {
									setDisabled(false)
								}
							}
							reader.readAsArrayBuffer(file)
						} catch (error) {
							messageApi?.destroy()
							messageApi?.error(
								`文件读取失败: ${error instanceof Error ? error.message : String(error)}`,
							)
							setDisabled(false)
						}
						return false
					}}
					fileList={[]}
					maxCount={0}
				>
					<Button
						icon={<SlidersOutlined />}
						loading={disabled}
						disabled={disabled}
					>
						点击导入数据
					</Button>
				</Upload>
				<Popover
					content={
						<div>
							数据来自作者的一项课程论文
							<Button
								className='ml-1'
								size='small'
								onClick={() => {
									window.open(
										'https://blog.leafyee.xyz/2024/05/22/FaceIdentify/',
										'_blank',
									)
								}}
							>
								点击查看
							</Button>
						</div>
					}
					trigger={['hover', 'click']}
				>
					<Button
						icon={<BookOutlined />}
						disabled={disabled}
						loading={disabled}
						onClick={async () => {
							try {
								messageApi?.loading('正在加载示例数据...', 0)
								flushSync(() => setDisabled(true))
								const res = await fetch('/demo.csv')
								if (!res.ok) {
									throw new Error('示例数据下载失败')
								}
								const blob = await res.blob()
								const buffer = await blob.arrayBuffer()
								const data = await importSheet(buffer, ImportTypes.CSV)
								await setData(data, false)
								messageApi?.destroy()
								messageApi?.success('示例数据加载完成', 0.5)
							} catch (error) {
								messageApi?.destroy()
								messageApi?.error(
									`示例数据加载失败: ${error instanceof Error ? error.message : String(error)}`,
								)
							} finally {
								setDisabled(false)
							}
						}}
					>
						打开示例数据
					</Button>
				</Popover>
			</div>
			<p className='text-sm p-4 absolute top-1 w-full text-center opacity-70'>
				如只须使用小工具, 点击上方的工具按钮即可
			</p>
			<p className='text-sm p-4 absolute bottom-0 w-full text-center opacity-70 flex items-center justify-center gap-2'>
				<span>PsychPen v{version}</span>
				<span>|</span>
				<span>GPL-3.0 License</span>
				<span>|</span>
				<span>
					<a
						href='https://github.com/LeafYeeXYZ/PsychPen'
						target='_blank'
						rel='noreferrer'
						className='hover:underline'
					>
						GitHub <LinkOutlined />
					</a>
				</span>
			</p>
		</div>
	)
}
