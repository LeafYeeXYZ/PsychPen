import {
	BarChartOutlined,
	CopyOutlined,
	DeleteOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { Button, Typography } from 'antd'
import { marked } from 'marked'
import type {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
import { useEffect, useRef } from 'react'
import { useStates } from '../../hooks/useStates'
import { shortId } from '../../lib/utils'
import { ToolCall } from './ToolCall'

export function Messages({
	messages,
	greeting,
	showLoading,
	setInput,
	setMessages,
	loading,
}: {
	messages: ChatCompletionMessageParam[]
	greeting: string
	showLoading: boolean
	setInput: React.Dispatch<React.SetStateAction<string>>
	setMessages: React.Dispatch<
		React.SetStateAction<ChatCompletionMessageParam[]>
	>
	loading: boolean
}) {
	const messageApi = useStates((state) => state.messageApi)

	const ref = useRef<HTMLDivElement>(null)
	// biome-ignore lint/correctness/useExhaustiveDependencies: 用于滚动到底部
	useEffect(() => {
		ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
	}, [messages])

	const messagesToShow = [
		{ role: 'assistant', content: greeting },
		...messages.filter((message) => message.role !== 'tool'),
		...(showLoading ? [{ role: 'assistant', content: '__loading__' }] : []),
	]

	return (
		<div
			className='w-full h-full flex flex-col items-center justify-start gap-4 overflow-auto pt-4 pb-8 no-scrollbar'
			ref={ref}
		>
			{messagesToShow.map((message, index) => {
				const tool_calls = (message as ChatCompletionAssistantMessageParam)
					.tool_calls
				return (
					<Bubble
						key={shortId()}
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
						footer={
							index !== 0 &&
							message.role === 'assistant' &&
							message.content &&
							message.content !== '__loading__' ? (
								<div className='flex gap-1'>
									<Button
										type='text'
										icon={<CopyOutlined />}
										size='small'
										disabled={loading && index === messagesToShow.length - 1}
										onClick={() => {
											navigator.clipboard
												.writeText(message.content as string)
												.then(() => {
													messageApi?.success('已复制到剪贴板')
												})
												.catch((e) => {
													messageApi?.error(
														`复制失败: ${e instanceof Error ? e.message : String(e)}`,
													)
												})
										}}
									/>
									<Button
										type='text'
										icon={<DeleteOutlined />}
										size='small'
										disabled={loading || index !== messagesToShow.length - 1}
										onClick={() => {
											// 获取最后一条用户消息、设置为输入框内容、删除这条及以后的消息
											const lastUserMessage = messages.findLast(
												(message) => message.role === 'user',
											)
											const lastUserMessageIndex = messages.findLastIndex(
												(message) => message.role === 'user',
											)
											if (lastUserMessageIndex === -1 || !lastUserMessage) {
												messageApi?.error('没有找到消息')
												return
											}
											setInput(lastUserMessage.content as string)
											setMessages(messages.slice(0, lastUserMessageIndex))
											messageApi?.success('已删除指定消息')
										}}
									/>
								</div>
							) : undefined
						}
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
