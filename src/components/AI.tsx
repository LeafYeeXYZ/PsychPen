// 记得在 GREETTING 消息里说明可以使用的功能
// TODO: 写好之后更新一下使用文档的 2.5
import { type AIFunction, ALLOWED_DISCRETE_METHODS } from '../types'
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
import { Space, Typography, Tag, Button } from 'antd'
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
import { create_new_var } from '../lib/assistant/create_new_var'
import { create_sub_var, clear_sub_var } from '../lib/assistant/create_sub_var'

const md = markdownit({ html: true, breaks: true })
const funcs: AIFunction[] = [
  export_data,
  nav_to_data_view,
  nav_to_variable_view,
  nav_to_plots_view,
  nav_to_statistics_view,
  nav_to_tools_view,
  create_new_var,
  create_sub_var,
  clear_sub_var,
]
const GREETTING =
  '你好, 我是 PsychPen 的 AI 助手, 可以帮你讲解 PsychPen 的使用方法、探索你的数据集、导出数据、跳转页面、生成/清除子变量 (标准化/中心化/离散化)、生成新变量等. 请问有什么可以帮你的?'

export function AI() {
  const { ai, model } = useAssistant()

  if (ai === null) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        AI助手不可用, 请检查设置
      </div>
    )
  }

  const { messageApi, disabled, dataCols, data } = useZustand()
  const nav = useNav()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])

  // 数据被清除时重置对话
  useEffect(() => {
    if (!data) {
      setInput('')
      setMessages([])
    }
  }, [data])

  const onSubmit = async () => {
    const old = JSON.parse(JSON.stringify(messages))
    const snapshot = input
    try {
      const user: ChatCompletionUserMessageParam = {
        role: 'user',
        content: snapshot,
      }
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
        messages: [{ role: 'system', content: system }, ...old, user],
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
            toolCall.function.arguments +=
              delta.tool_calls[0].function!.arguments || ''
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
            setMessages([
              ...old,
              user,
              { role: 'assistant', content: rawResponse },
            ])
          })
        }
      }

      if (toolCall) {
        const newMessages: ChatCompletionMessageParam[] = [
          { role: 'assistant', content: '', tool_calls: [toolCall] },
          { role: 'tool', content: '', tool_call_id: toolCall.id },
        ]

        flushSync(() => {
          setShowLoading(true)
          setMessages([...old, user, newMessages[0]])
        })

        try {
          switch (toolCall.function.name) {
            case 'clear_sub_var': {
              const { variable_names } = JSON.parse(toolCall.function.arguments)
              if (
                !Array.isArray(variable_names) ||
                !variable_names.every((name) =>  (typeof name === 'string') && dataCols.some((col) => col.name === name))
              ) {
                throw new Error('变量名参数错误')
              }
              newMessages[1].content = `已请求清除变量 ${(variable_names as string[]).map((name) => `"${name}"`).join('、')} 的所有子变量, 等待用户手动确认`
              break
            }
            case 'create_sub_var': {
              const { variable_names, standardize, centralize, discretize } =
                JSON.parse(toolCall.function.arguments)
              if (
                !Array.isArray(variable_names) ||
                !variable_names.every((name) =>  (typeof name === 'string') && dataCols.some((col) => col.name === name))
              ) {
                throw new Error('变量名参数错误')
              }
              newMessages[1].content = `已请求生成变量 ${(variable_names as string[]).map((name) => `"${name}"`).join('、')} 的${[
                standardize ? '标准化' : '',
                centralize ? '中心化' : '',
                discretize ? '离散化' : '',
              ]
                .filter((part) => part)
                .join('、')}子变量, 等待用户手动确认`
              break
            }
            case 'create_new_var': {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { variable_name, calc_expression: _ } = JSON.parse(
                toolCall.function.arguments,
              ) // 尝试解析参数, 但暂不执行逻辑
              newMessages[1].content = `已请求生成新变量"${variable_name}", 等待用户手动确认`
              break
            }
            case 'export_data': {
              const { file_name, file_type } = JSON.parse(
                toolCall.function.arguments,
              ) // 尝试解析参数, 但暂不执行逻辑
              newMessages[1].content = `已请求导出数据到文件"${file_name || 'data'}.${file_type || 'xlsx'}", 等待用户手动确认`
              break
            }
            case 'nav_to_data_view': {
              nav.setMainPage(MAIN_PAGES_LABELS.DATA)
              newMessages[1].content = '已成功跳转到数据视图'
              break
            }
            case 'nav_to_variable_view': {
              const { page } = JSON.parse(toolCall.function.arguments)
              if (
                !page ||
                !Object.values(VARIABLE_SUB_PAGES_LABELS).includes(page)
              ) {
                throw new Error(`未知的子页面 (${page})`)
              }
              nav.setMainPage(MAIN_PAGES_LABELS.VARIABLE)
              nav.setVariableViewSubPage(page)
              newMessages[1].content = `已成功跳转到变量视图的${page}页面`
              break
            }
            case 'nav_to_plots_view': {
              const { page } = JSON.parse(toolCall.function.arguments)
              if (
                !page ||
                !Object.values(PLOTS_SUB_PAGES_LABELS).includes(page)
              ) {
                throw new Error(`未知的子页面 (${page})`)
              }
              nav.setMainPage(MAIN_PAGES_LABELS.PLOTS)
              nav.setPlotsViewSubPage(page)
              newMessages[1].content = `已成功跳转到绘图视图的${page}页面`
              break
            }
            case 'nav_to_statistics_view': {
              const { page } = JSON.parse(toolCall.function.arguments)
              if (
                !page ||
                !Object.values(STATISTICS_SUB_PAGES_LABELS).includes(page)
              ) {
                throw new Error(`未知的子页面 (${page})`)
              }
              nav.setMainPage(MAIN_PAGES_LABELS.STATISTICS)
              nav.setStatisticsViewSubPage(page)
              newMessages[1].content = `已成功跳转到统计视图的${page}页面`
              break
            }
            case 'nav_to_tools_view': {
              const { page } = JSON.parse(toolCall.function.arguments)
              if (
                !page ||
                !Object.values(TOOLS_VIEW_SUB_PAGES_LABELS).includes(page)
              ) {
                throw new Error(`未知的子页面 (${page})`)
              }
              nav.setMainPage(MAIN_PAGES_LABELS.TOOLS)
              nav.setToolsViewSubPage(page)
              newMessages[1].content = `已成功跳转到工具视图的${page}页面`
              break
            }
            default: {
              throw new Error(`未知函数 (${toolCall.function.name})`)
            }
          }
          newMessages[1].content = newMessages[1].content || '执行成功'
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          messageApi?.error(
            `执行AI命令"${
              funcs.find(
                (func) => func.tool.function.name === toolCall.function.name,
              )?.label || `未知函数 (${toolCall.function.name})`
            }"时出错: ${msg}`,
          )
          newMessages[1].content = `执行函数失败, 请用户手动操作. 错误信息: ${msg}`
        }

        flushSync(() => {
          setShowLoading(true)
          setMessages([...old, user, ...newMessages])
        })

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
              setMessages([
                ...old,
                user,
                ...newMessages,
                { role: 'assistant', content: rawNewResponse },
              ])
            })
          }
        }
        const { content } = parseThink(rawNewResponse)
        setMessages([
          ...old,
          user,
          ...newMessages,
          { role: 'assistant', content },
        ])
      } else {
        const { content } = parseThink(rawResponse)
        setMessages([...old, user, { role: 'assistant', content }])
      }
    } catch (error) {
      messageApi?.error(error instanceof Error ? error.message : String(error))
      setMessages(old)
      setInput(snapshot)
    } finally {
      setShowLoading(false)
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-full flex flex-col justify-between items-center'>
      <Messages messages={messages} showLoading={showLoading} />
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

function Messages({
  messages,
  showLoading,
}: {
  messages: ChatCompletionMessageParam[]
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
        { role: 'assistant', content: GREETTING },
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

function ToolCall({ toolCall }: { toolCall: ChatCompletionMessageToolCall }) {
  const id = toolCall.id
  const name = toolCall.function.name
  const args = toolCall.function.arguments
  const { dataRows, _VariableView_addNewVar, messageApi, dataCols, _VariableView_updateData } = useZustand()
  const [done, setDone] = useState(false)
  const formerDone = sessionStorage.getItem(id) === 'done'
  let element: React.ReactElement | null = null
  let initDone = true
  switch (name) {
    case 'clear_sub_var': {
      const { variable_names } = JSON.parse(args) as { variable_names: string[] }
      if (!formerDone) {
        initDone = false
      }
      element = (
        <>
          <div>
            执行函数{' '}
            <Tag color='blue' style={{ margin: 0 }}>
              {funcs.find(
                (func) => func.tool.function.name === toolCall.function.name,
              )?.label || `未知函数 (${toolCall.function.name})`}
            </Tag>
            {done ? ', 已' : ', 是否确认'}清除变量
            {variable_names.map((name) => (
              <Tag key={name} style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
                {name}
              </Tag>
            ))}{' '}
            的所有子变量
          </div>
          <div>
            <Button
              block
              disabled={done}
              onClick={() => {
                _VariableView_updateData(
                  dataCols.map((col) => {
                    if (variable_names.includes(col.name)) {
                      return {
                        ...col,
                        subVars: undefined,
                      }
                    }
                    return col
                  }).filter((col) => col.derived !== true),
                )
                setDone(true)
                sessionStorage.setItem(id, 'done')
                messageApi?.success(`已成功清除变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的所有子变量`)
              }}
            >
              {done ? '已清除子变量' : '确认清除子变量'}
            </Button>
          </div>
        </>
      )
      break
    }
    case 'create_sub_var': {
      const { variable_names, standardize, centralize, discretize } = JSON.parse(args) as {
        variable_names: string[]
        standardize: boolean | undefined
        centralize: boolean | undefined
        discretize: {
          method: ALLOWED_DISCRETE_METHODS
          groups: number
        } | undefined
      }
      if (!formerDone) {
        initDone = false
      }
      const ALLOWED_METHOD = Object.values(ALLOWED_DISCRETE_METHODS)
      const shouldDiscritize = Boolean(
        typeof discretize === 'object' && 
        discretize.method && 
        discretize.groups && 
        ALLOWED_METHOD.includes(discretize.method)
      )
      element = (
        <>
          <div>
            执行函数{' '}
            <Tag color='blue' style={{ margin: 0 }}>
              {funcs.find(
                (func) => func.tool.function.name === toolCall.function.name,
              )?.label || `未知函数 (${toolCall.function.name})`}
            </Tag>
            {done ? ', 已' : ', 是否确认'}生成变量
            {variable_names.map((name) => (
              <Tag key={name} style={{ margin: 0, marginLeft: '0.3rem' }} color='blue'>
                {name}
              </Tag>
            ))}{' '}
            的
            {[
              standardize ? '标准化' : '',
              centralize ? '中心化' : '',
              shouldDiscritize ? `离散化 (${discretize!.method}, ${discretize!.groups} 组) ` : '',
            ]
              .filter((part) => part)
              .join('、')}
            子变量
          </div>
          <div>
            <Button
              block
              disabled={done}
              onClick={() => {
                _VariableView_updateData(
                  dataCols.map((col) => {
                    if (variable_names.includes(col.name)) {
                      return {
                        ...col,
                        subVars: {
                          standard: Boolean(standardize) || col.subVars?.standard,
                          center: Boolean(centralize) || col.subVars?.center,
                          discrete: shouldDiscritize
                            ? {
                                method: discretize!.method,
                                groups: discretize!.groups,
                              }
                            : col.subVars?.discrete,
                        },
                      }
                    }
                    return col
                  }).filter((col) => col.derived !== true),
                )
                setDone(true)
                sessionStorage.setItem(id, 'done')
                messageApi?.success(`已成功生成变量 ${variable_names.map((name) => `"${name}"`).join('、')} 的${[
                  standardize ? '标准化' : '',
                  centralize ? '中心化' : '',
                  shouldDiscritize ? '离散化' : '',
                ]
                  .filter((part) => part)
                  .join('、')}子变量`)
              }}
            >
              {done ? '已生成子变量' : '确认生成子变量'}
            </Button>
          </div>
        </>
      )
      break
    }
    case 'create_new_var': {
      const { variable_name, calc_expression } = JSON.parse(args)
      if (!formerDone) {
        initDone = false
      }
      element = (
        <>
          <div>
            执行函数{' '}
            <Tag color='blue' style={{ margin: 0 }}>
              {funcs.find(
                (func) => func.tool.function.name === toolCall.function.name,
              )?.label || `未知函数 (${toolCall.function.name})`}
            </Tag>
            {done ? ', 已' : ', 是否确认'}生成新变量{' '}
            <Tag style={{ margin: 0 }} color='blue'>
              {variable_name}
            </Tag>
            , 计算表达式为如下:
          </div>
          <div className='bg-white dark:bg-gray-800 rounded-md p-3 border'>
            {(calc_expression as string)
              .split(/(:::.+?:::)/g)
              .map((part, index) => {
                if (part.match(/:::.+?:::/)) {
                  return (
                    <Tag key={index} style={{ margin: 0 }}>
                      {part.slice(3, -3)}
                    </Tag>
                  )
                }
                return <span key={index}>{part}</span>
              })}
          </div>
          <div>
            <Button
              block
              disabled={done}
              onClick={() => {
                _VariableView_addNewVar(variable_name, calc_expression)
                setDone(true)
                sessionStorage.setItem(id, 'done')
                messageApi?.success(`已成功生成新变量"${variable_name}"`)
              }}
            >
              {done ? '已生成新变量' : '确认生成新变量'}
            </Button>
          </div>
        </>
      )
      break
    }
    case 'export_data': {
      const { file_name, file_type } = JSON.parse(args)
      if (!formerDone) {
        initDone = false
      }
      element = (
        <>
          <div>
            执行函数{' '}
            <Tag color='blue' style={{ margin: 0 }}>
              {funcs.find(
                (func) => func.tool.function.name === toolCall.function.name,
              )?.label || `未知函数 (${toolCall.function.name})`}
            </Tag>
            {done ? ', 已' : ', 是否确认'}导出数据到文件{' '}
            <Tag style={{ margin: 0 }} color='blue'>
              {file_name || 'data'}.{file_type || 'xlsx'}
            </Tag>
          </div>
          <div>
            <Button
              block
              disabled={done}
              onClick={() => {
                downloadSheet(
                  dataRows,
                  file_type || 'xlsx',
                  file_name || undefined,
                )
                setDone(true)
                sessionStorage.setItem(id, 'done')
                messageApi?.success(
                  `已成功导出数据到文件"${file_name || 'data'}.${file_type || 'xlsx'}"`,
                )
              }}
            >
              {done ? '已导出数据' : '确认导出数据'}
            </Button>
          </div>
        </>
      )
      break
    }
    default: {
      element = (
        <div>
          执行函数{' '}
          <Tag color='blue' style={{ margin: 0 }}>
            {funcs.find(
              (func) => func.tool.function.name === toolCall.function.name,
            )?.label || `未知函数 (${toolCall.function.name})`}
          </Tag>
        </div>
      )
    }
  }
  useEffect(() => {
    if (initDone) {
      setDone(true)
    }
  }, [])
  return <div className='flex flex-col gap-3'>{element}</div>
}
