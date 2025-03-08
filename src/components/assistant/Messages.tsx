import { useRef, useEffect } from 'react'
import { Typography } from 'antd'
import { Bubble } from '@ant-design/x'
import { UserOutlined, BarChartOutlined } from '@ant-design/icons'
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
// @ts-expect-error markdown-it does not have types
import markdownit from 'markdown-it'
import { ToolCall } from './ToolCall'

const md = markdownit({ html: true, breaks: true })

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
        ...messages,
        ...(showLoading ? [{ role: 'assistant', content: '__loading__' }] : []),
      ].map((message, index) => {
        const tool_calls = (message as ChatCompletionAssistantMessageParam)
          .tool_calls
        return (
          <Bubble
            key={index}
            className='w-full'
            placement={message.role === 'user' ? 'end' : 'start'}
            content={
              tool_calls?.length ? (
                <ToolCall toolCall={tool_calls[0]} />
              ) : (
                <Typography>
                  <div
                    className='-mb-[0.8rem]'
                    dangerouslySetInnerHTML={{
                      __html: md.render((message.content as string).trim()),
                    }}
                  />
                </Typography>
              )
            }
            loading={message.content === '__loading__'}
            header={
              message.role === 'user'
                ? 'User'
                : message.role === 'assistant'
                  ? 'PsychPen'
                  : 'PsychPen [系统]'
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
