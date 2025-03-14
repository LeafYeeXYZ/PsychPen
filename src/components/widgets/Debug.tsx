import { CodeOutlined } from '@ant-design/icons'
import { Button, Popover } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useStates } from '../../lib/hooks/useStates'

export function Debug() {
	return (
		<div className='absolute bottom-3 left-3 flex items-center justify-center p-1 rounded-md shadow-2xl border bg-white '>
			<Popover content={<_Debug />}>
				<Button type='text' icon={<CodeOutlined />} />
			</Popover>
		</div>
	)
}

function _Debug() {
	const [disabled, setDisabled] = useState<boolean>(false)
	const { messageApi } = useStates()
	return (
		<div className='flex flex-col items-center gap-2'>
			<Button
				block
				disabled={disabled}
				onClick={async () => {
					try {
						flushSync(() => setDisabled(true))
						messageApi?.info('点击')
					} catch (e) {
						messageApi?.error(e instanceof Error ? e.message : String(e))
					} finally {
						setDisabled(false)
					}
				}}
			>
				调试组件
			</Button>
		</div>
	)
}
