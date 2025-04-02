import { Tag } from 'antd'

export function NavToPageTool({
	mainPageName,
	subPageName,
}: {
	mainPageName: string
	subPageName?: string
}) {
	return (
		<div>
			跳转到{' '}
			<Tag color='blue' style={{ margin: 0 }}>
				{mainPageName}
			</Tag>
			{subPageName && (
				<>
					{' '}
					下的{' '}
					<Tag color='blue' style={{ margin: 0 }}>
						{subPageName}
					</Tag>{' '}
					页面
				</>
			)}
		</div>
	)
}
