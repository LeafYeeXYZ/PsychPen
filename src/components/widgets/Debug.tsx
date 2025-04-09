import { CodeOutlined } from '@ant-design/icons'
import { Button, Popover } from 'antd'
import { useState } from 'react'
import { useStates } from '../../hooks/useStates'
import { shortId } from '../../lib/utils'

export function Debug() {
	return (
		<div
			className='absolute bottom-3 left-3 flex items-center justify-center p-1 rounded-md shadow-2xl border bg-white dark:bg-gray-800 dark:border-gray-700'
			id='debug-component'
		>
			<Popover content={<_Debug />}>
				<Button type='text' icon={<CodeOutlined />} />
			</Popover>
		</div>
	)
}

function _Debug() {
	const messageApi = useStates((state) => state.messageApi)
	const [bug, setBug] = useState<{ test: string } | undefined>({ test: 'bug' })
	return (
		<div className='flex flex-col items-center gap-2'>
			<Button
				block
				onClick={() => {
					const ele = document.getElementById('debug-component')
					if (ele) {
						ele.style.display = 'none'
						setTimeout(() => {
							ele.style.display = 'flex'
						}, 5_000)
					}
				}}
			>
				隐藏本组件5秒
			</Button>
			<Button
				block
				onClick={() => {
					const results: string[] = []
					for (let i = 0; i < 100000; i++) {
						results.push(shortId())
					}
					const set = new Set(results)
					if (results.length !== set.size) {
						messageApi?.error(`短id冲突 (${results.length - set.size})`)
					} else {
						messageApi?.success(`短id无冲突 (${results.length})`)
					}
				}}
			>
				测试短id冲突
			</Button>
			<Button
				block
				onClick={() => {
					setBug(undefined)
				}}
			>
				{/* @ts-ignore */}
				抛出错误 {bug.test}
			</Button>
		</div>
	)
}
