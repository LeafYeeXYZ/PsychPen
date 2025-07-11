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
import { useStates } from '../../hooks/useStates.ts'
import { Result } from '../widgets/Result.tsx'
import { ToolCall } from './ToolCall.tsx'

const THINK_IDENTIFIER_REGEX = /^__think__(\s+|)/

export function Messages({
	messages,
	greeting,
	showLoading,
	setInput,
	setMessages,
	loading,
}: {
	messages: (ChatCompletionMessageParam & { id: string })[]
	greeting: string
	showLoading: boolean
	setInput: React.Dispatch<React.SetStateAction<string>>
	setMessages: React.Dispatch<
		React.SetStateAction<(ChatCompletionMessageParam & { id: string })[]>
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
		{ role: 'assistant', content: greeting, id: 'messages_greeting' },
		...messages.filter(
			(message) =>
				message.role !== 'tool' ||
				(typeof message.content === 'string' &&
					message.content.startsWith('##### 统计结果')),
		),
		...(showLoading
			? [{ role: 'assistant', content: '__loading__', id: 'messages_loading' }]
			: []),
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
						key={message.id}
						className='w-full'
						placement={message.role === 'user' ? 'end' : 'start'}
						content={
							tool_calls?.length ? (
								<ToolCall toolCall={tool_calls[0]} />
							) : message.role === 'tool' ? (
								<div className='overflow-hidden'>
									<div className='w-full'>
										<Result result={message.content as string} fitHeight />
									</div>
									<div className='w-full mt-2'>
										<Button
											block
											autoInsertSpace={false}
											onClick={() => {
												navigator.clipboard
													.writeText(message.content as string)
													.then(() => messageApi?.success('已复制结果到剪贴板'))
													.catch((e) =>
														messageApi?.error(
															`复制失败: ${e instanceof Error ? e.message : String(e)}`,
														),
													)
											}}
										>
											复制结果的 Markdown 文本
										</Button>
									</div>
									<hr className='w-dvw opacity-0 h-0 p-0 m-0' />
								</div>
							) : (
								<Typography>
									<div
										className='markdown -mb-[0.8rem]'
										// biome-ignore lint/security/noDangerouslySetInnerHtml: 为了渲染 Markdown, 后期可以改为 iframe (但需要处理样式问题)
										dangerouslySetInnerHTML={{
											__html: marked
												.parse(
													(message.content as string)
														.replace(THINK_IDENTIFIER_REGEX, '')
														.trim(),
													{
														async: false,
													},
												)
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
						header={
							message.role === 'user'
								? 'User'
								: (message.content as string).startsWith('__think__')
									? 'PsychPen [思考中]'
									: 'PsychPen'
						}
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
