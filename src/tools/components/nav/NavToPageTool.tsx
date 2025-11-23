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
			<Tag color='blue' variant='outlined'>
				{mainPageName}
			</Tag>
			{subPageName && (
				<>
					{' '}
					下的{' '}
					<Tag color='blue' variant='outlined'>
						{subPageName}
					</Tag>{' '}
					页面
				</>
			)}
		</div>
	)
}
