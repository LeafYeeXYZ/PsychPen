import { useAssistant } from '../lib/useAssistant'
import { useZustand } from '../lib/useZustand'
import { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Space, Typography } from 'antd'
import { Bubble, Sender } from '@ant-design/x'
import { UserOutlined, BarChartOutlined } from '@ant-design/icons'
import parseThink from '@leaf/parse-think'
// @ts-expect-error markdown-it does not have types
import markdownit from 'markdown-it'
import { 
  ChatCompletionAssistantMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionToolMessageParam,
} from 'openai/resources/index.mjs'

const md = markdownit({ html: true, breaks: true })
type Message = ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam | ChatCompletionToolMessageParam

// TODO: 暂未处理 Function Calling
// TODO: 全部写好之后更新一下使用文档的 data-8.png
// TODO: 可以在第一条消息里说明可以使用的功能

export function AI() {

  const { ai, model } = useAssistant()

  if (ai === null) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        AI助手不可用, 请检查设置
      </div>
    )
  }

  const { messageApi, disabled, dataCols } = useZustand()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <div className='w-full h-full flex flex-col justify-between items-center'>
      <Messages messages={messages} loading={loading} />
      <Sender
        onSubmit={async () => {
          const snapshot = input
          try {
            const user: ChatCompletionUserMessageParam = { role: 'user', content: snapshot }
            flushSync(() => {
              setLoading(true)
              setMessages((prev) => [...prev, user])
              setInput('')
            })
            const res = await ai.chat.completions.create({
              model: model,
              messages: [
                { role: 'system', content: `你是在线统计分析和数据可视化软件"PsychPen"中的AI助手. 你将收到用户的提问和当前用户导入到软件中的数据集中的变量的信息; 你需要根据当前上下文的信息, 为用户提供帮助.\n\n# 变量信息\n\n${dataCols.map((col) => `- ${col.name}: ${col.type}, 有 ${col.valid} 个有效值、${col.missing} 个缺失值、${col.unique} 个唯一值.${col.type === '等距或等比数据' ? ` 均值为 ${col.mean}, 标准差为 ${col.std}, 中位数为 ${col.q2}, 最小值为 ${col.min}, 最大值为 ${col.max}.` : ''}`).join('\n') }` },
                ...messages,
              ],
              stream: false,
            })
            const { content } = parseThink(res.choices[0].message)
            const assistant: ChatCompletionAssistantMessageParam = { role: 'assistant', content }
            setMessages((prev) => [...prev, assistant])
          } catch (e) {
            messageApi!.error(e instanceof Error ? e.message : String(e))
            setInput(snapshot)
          } finally {
            setLoading(false)
          }
        }}
        disabled={disabled}
        loading={loading}
        value={input}
        onChange={setInput}
        submitType='shiftEnter'
        placeholder='按 Shift + Enter 发送消息'
        actions={(_, info) => {
          const { SendButton, LoadingButton, ClearButton } = info.components
          return (
            <Space size='small'>
              <ClearButton 
                disabled={loading || disabled}
                onClick={() => {
                  setInput('')
                  setMessages([])
                }}
              />
              {loading ? <LoadingButton /> : <SendButton />}
            </Space>
          )
        }}
      />
    </div>
  )
}

function Messages({ messages, loading }: { messages: Message[], loading: boolean }) {
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
        { role: 'assistant', content: '你好, 有什么可以帮你的?' }, 
        ...messages,
        ...(loading ? [{ role: 'assistant', content: '__loading__' }] : [])
      ]
      .filter((message) => message.role === 'assistant' || message.role === 'user')
      .map((message, index) => {
        return (
          <Bubble
            key={index}
            className='w-full'
            placement={message.role === 'user' ? 'end' : 'start'}
            content={message.content}
            loading={message.content === '__loading__'}
            header={message.role === 'user' ? 'User' : 'PsychPen'}
            messageRender={(content) => <Typography>
              <div className='-mb-4' dangerouslySetInnerHTML={{ __html: md.render(content.trim()) }} />
            </Typography>}
            avatar={{ 
              icon: message.role === 'user' ? <UserOutlined /> : <BarChartOutlined />,
              style: { 
                backgroundColor: message.role === 'user' ? '#f0f0ff' : '#fff0f0',
                color: message.role === 'user' ? '#597ef7' : '#f75959',
              }
            }}
          />
        )
      })}
    </div>
  )
}
