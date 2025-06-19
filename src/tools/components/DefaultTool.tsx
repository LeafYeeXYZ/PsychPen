import { Tag } from 'antd'

export function DefaultTool({ label }: { label: string }) {
	return (
		<div>
			执行函数{' '}
			<Tag color='blue' style={{ margin: 0 }}>
				{label}
			</Tag>
		</div>
	)
}
