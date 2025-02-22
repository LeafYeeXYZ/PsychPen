// 记得在 GREETTING 消息里说明可以使用的功能
// TODO: 全部写好之后更新一下使用文档的 2.5
import { useAssistant } from '../lib/useAssistant'
import { useZustand } from '../lib/useZustand'
import { useState, useRef, useEffect } from 'react'
import { 
  useNav,
  MAIN_PAGES_LABELS,
  VARIABLE_SUB_PAGES_LABELS,
  PLOTS_SUB_PAGES_LABELS,
  STATISTICS_SUB_PAGES_LABELS,
  TOOLS_VIEW_SUB_PAGES_LABELS,
} from '../lib/useNav'
import { flushSync } from 'react-dom'
import { Space, Typography } from 'antd'
import { Bubble, Sender } from '@ant-design/x'
import { UserOutlined, BarChartOutlined } from '@ant-design/icons'
import parseThink from '@leaf/parse-think'
import { downloadSheet } from '@psych/sheet'
import type { 
  ChatCompletionAssistantMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
import readme from '../../README.md?raw'
// @ts-expect-error markdown-it does not have types
import markdownit from 'markdown-it'
import { export_data } from '../lib/assistant/export_data'
import { nav_to_data_view } from '../lib/assistant/nav_to_data_view'
import { nav_to_variable_view } from '../lib/assistant/nav_to_variable_view'
import { nav_to_plots_view } from '../lib/assistant/nav_to_plots_view'
import { nav_to_statistics_view } from '../lib/assistant/nav_to_statistics_view'
import { nav_to_tools_view } from '../lib/assistant/nav_to_tools_view'

const md = markdownit({ html: true, breaks: true })
const funcs: AIFunction[] = [
  export_data,
  nav_to_data_view,
  nav_to_variable_view,
  nav_to_plots_view,
  nav_to_statistics_view,
  nav_to_tools_view,
]
const GREETTING = '你好, 我是 PsychPen 的 AI 助手, 可以帮你讲解 PsychPen 的使用方法、探索你的数据集、导出数据、跳转页面等. 请问有什么可以帮你的?'


export function AI() {

  const { ai, model } = useAssistant()

  if (ai === null) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        AI助手不可用, 请检查设置
      </div>
    )
  }

  const { messageApi, disabled, dataCols, dataRows } = useZustand()
  const nav = useNav()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])

  const onSubmit = async () => {
    const old = JSON.parse(JSON.stringify(messages))
    const snapshot = input
    try {
      const user: ChatCompletionUserMessageParam = { role: 'user', content: snapshot }
      flushSync(() => {
        setLoading(true)
        setShowLoading(true)
        setMessages([...old, user])
        setInput('')
      })

      const system = 
        '你是在线统计分析和数据可视化软件"PsychPen"中的AI助手. 你将收到用户的提问、当前用户导入到软件中的数据集中的变量的信息、PsychPen的使用和开发文档、可以供你调用的工具信息; 你的任务是按照用户的要求, 为用户提供帮助.' + 
        `\n\n# 变量信息\n\n${dataCols.map((col) => `- ${col.name}: ${col.type}, 有 ${col.valid} 个有效值、${col.missing} 个缺失值、${col.unique} 个唯一值.${col.type === '等距或等比数据' ? ` 均值为 ${col.mean}, 标准差为 ${col.std}, 中位数为 ${col.q2}, 最小值为 ${col.min}, 最大值为 ${col.max}.` : ''}`).join('\n')}` +
        `\n\n# 使用文档\n\n\`\`\`markdown\n${readme}\n\`\`\``

      const stream = await ai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: system },
          ...old,
          user,
        ],
        stream: true,
        tools: funcs.map((func) => func.tool),
        tool_choice: 'auto',
      })

      let rawResponse: string = ''
      let toolCall: ChatCompletionMessageToolCall | null = null

      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta
        if (delta.tool_calls?.length) {
          if (toolCall) {
            toolCall.function.arguments += delta.tool_calls[0].function!.arguments || ''
          } else {
            toolCall = {
              id: delta.tool_calls[0].id!,
              type: 'function',
              function: {
                name: delta.tool_calls[0].function!.name!,
                arguments: delta.tool_calls[0].function!.arguments || '',
              },
            }
          }
        } else if (!toolCall) {
          rawResponse += delta.content || ''
          flushSync(() => {
            setShowLoading(false)
            setMessages([...old, user, { role: 'assistant', content: rawResponse }])
          })
        }
      }

      if (toolCall) {
        const newMessages: ChatCompletionMessageParam[] = [
          { role: 'assistant', content: '', tool_calls: [toolCall] },
          { role: 'tool', content: 'done', tool_call_id: toolCall.id },
        ]
        flushSync(() => setMessages([...old, user, ...newMessages]))

        switch (toolCall.function.name) {
          case 'export_data': {
            const { file_name, file_type } = JSON.parse(toolCall.function.arguments)
            downloadSheet(dataRows, file_type || 'xlsx', file_name || undefined)
            break
          }
          case 'nav_to_data_view': {
            nav.setMainPage(MAIN_PAGES_LABELS.DATA)
            break
          }
          case 'nav_to_variable_view': {
            const { page } = JSON.parse(toolCall.function.arguments)
            if (!page || !Object.values(VARIABLE_SUB_PAGES_LABELS).includes(page)) {
              throw new Error(`AI函数调用参数错误 (nav_to_variable_view): 未知的子页面 ${page}`)
            }
            nav.setMainPage(MAIN_PAGES_LABELS.VARIABLE)
            nav.setVariableViewSubPage(page)
            break
          }
          case 'nav_to_plots_view': {
            const { page } = JSON.parse(toolCall.function.arguments)
            if (!page || !Object.values(PLOTS_SUB_PAGES_LABELS).includes(page)) {
              throw new Error(`AI函数调用参数错误 (nav_to_plots_view): 未知的子页面 ${page}`)
            }
            nav.setMainPage(MAIN_PAGES_LABELS.PLOTS)
            nav.setPlotsViewSubPage(page)
            break
          }
          case 'nav_to_statistics_view': {
            const { page } = JSON.parse(toolCall.function.arguments)
            if (!page || !Object.values(STATISTICS_SUB_PAGES_LABELS).includes(page)) {
              throw new Error(`AI函数调用参数错误 (nav_to_statistics_view): 未知的子页面 ${page}`)
            }
            nav.setMainPage(MAIN_PAGES_LABELS.STATISTICS)
            nav.setStatisticsViewSubPage(page)
            break
          }
          case 'nav_to_tools_view': {
            const { page } = JSON.parse(toolCall.function.arguments)
            if (!page || !Object.values(TOOLS_VIEW_SUB_PAGES_LABELS).includes(page)) {
              throw new Error(`AI函数调用参数错误 (nav_to_tools_view): 未知的子页面 ${page}`)
            }
            nav.setMainPage(MAIN_PAGES_LABELS.TOOLS)
            nav.setToolsViewSubPage(page)
            break
          }
          default: {
            throw new Error(`未知的AI函数调用 (${toolCall.function.name})`)
          }
        }

        const newResponse = await ai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: system },
            ...old,
            user,
            ...newMessages,
          ],
          stream: true,
          tools: funcs.map((func) => func.tool),
          tool_choice: 'none',
        })

        let rawNewResponse: string = ''
        for await (const chunk of newResponse) {
          const delta = chunk.choices[0].delta
          rawNewResponse += delta.content || ''
          if (rawNewResponse) {
            flushSync(() => {
              setShowLoading(false)
              setMessages([...old, user, ...newMessages, { role: 'assistant', content: rawNewResponse }])
            })
          }
        }
        const { content } = parseThink(rawNewResponse)
        setMessages([...old, user, ...newMessages, { role: 'assistant', content }])
      } else {
        const { content } = parseThink(rawResponse)
        setMessages([...old, user, { role: 'assistant', content }])
      }
    } catch (e) {
      messageApi?.error(e instanceof Error ? e.message : String(e))
      setMessages(old)
      setInput(snapshot)
    } finally {
      setShowLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-full flex flex-col justify-between items-center'>
      <Messages 
        messages={messages} 
        showLoading={showLoading} 
      />
      <Sender
        onSubmit={onSubmit}
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
                disabled={loading || disabled || !messages.length}
                onClick={() => {
                  setInput('')
                  setMessages([])
                  messageApi?.success('已清空历史对话')
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

function Messages({ messages, showLoading }: { messages: ChatCompletionMessageParam[], showLoading: boolean }) {
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
        { role: 'assistant', content: GREETTING },
        ...messages,
        ...(showLoading ? [{ role: 'assistant', content: '__loading__' }] : [])
      ]
      .filter((message) => message.role === 'assistant' || message.role === 'user')
      .map((message, index) => {
        const tool_calls = (message as ChatCompletionAssistantMessageParam).tool_calls
        return (
          <Bubble
            key={index}
            className='w-full'
            placement={message.role === 'user' ? 'end' : 'start'}
            content={tool_calls?.length ? 
              <span className='text-gray-700 dark:text-gray-300'>
                {funcs.find((func) => func.tool.function.name === tool_calls[0].function.name)!.label}
              </span> : 
              <Typography>
                <div className='-mb-4' dangerouslySetInnerHTML={{ __html: md.render((message.content as string).trim()) }} />
              </Typography>
            }
            loading={message.content === '__loading__'}
            header={message.role === 'user' ? 'User' : 'PsychPen'}
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
