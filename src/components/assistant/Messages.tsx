import { BarChartOutlined, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { Typography } from 'antd'
import { marked } from 'marked'
import type {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
import { useEffect, useRef } from 'react'
import { md5 } from '../../lib/utils'
import { ToolCall } from './ToolCall'
import '../../styles/markdown.css'
import katex from 'marked-katex-extension'
import 'katex/dist/katex.min.css'

marked.use(katex({ throwOnError: false }))

export function Messages({
	messages,
	greeting,
	showLoading,
}: {
	messages: ChatCompletionMessageParam[]
	greeting: string
	showLoading: boolean
}) {
	const ref = useRef<HTMLDivElement>(null)
	// biome-ignore lint/correctness/useExhaustiveDependencies: 用于滚动到底部
	useEffect(() => {
		ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
	}, [messages])
	return (
		<div
			className='w-full h-full flex flex-col items-center justify-start gap-4 overflow-auto pt-4 pb-8 no-scrollbar'
			ref={ref}
		>
			{[
				{ role: 'assistant', content: greeting },
				...messages.filter((message) => message.role !== 'tool'),
				...(showLoading ? [{ role: 'assistant', content: '__loading__' }] : []),
			].map((message) => {
				const tool_calls = (message as ChatCompletionAssistantMessageParam)
					.tool_calls
				return (
					<Bubble
						key={md5(JSON.stringify(message))}
						className='w-full'
						placement={message.role === 'user' ? 'end' : 'start'}
						content={
							tool_calls?.length ? (
								<ToolCall toolCall={tool_calls[0]} />
							) : (
								<Typography>
									<div
										className='markdown -mb-[0.8rem]'
										dangerouslySetInnerHTML={{
											__html: marked
												.parse((message.content as string).trim(), {
													async: false,
												})
												.replace(
													/<table>/g,
													'<div class="table-container"><table>',
												)
												.replace(/<\/table>/g, '</table></div>'),
										}}
									/>
								</Typography>
							)
						}
						loading={message.content === '__loading__'}
						header={message.role === 'user' ? 'User' : 'PsychPen'}
						avatar={{
							icon:
								message.role === 'user' ? (
									<UserOutlined />
								) : (
									<BarChartOutlined />
								),
							style: {
								backgroundColor:
									message.role === 'user' ? '#f0f0ff' : '#fff0f0',
								color: message.role === 'user' ? '#597ef7' : '#f75959',
							},
						}}
					/>
				)
			})}
		</div>
	)
}
