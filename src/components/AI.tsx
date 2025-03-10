// 记得在 GREETTING 消息里说明可以使用的功能
// TODO: 写好之后更新一下使用文档的 2.5
import { type Variable } from '../types'
import { useAssistant } from '../lib/hooks/useAssistant'
import { useData } from '../lib/hooks/useData'
import { useStates } from '../lib/hooks/useStates'
import { useState, useEffect } from 'react'
import {
  useNav,
  MAIN_PAGES_LABELS,
  VARIABLE_SUB_PAGES_LABELS,
  PLOTS_SUB_PAGES_LABELS,
  STATISTICS_SUB_PAGES_LABELS,
  TOOLS_VIEW_SUB_PAGES_LABELS,
} from '../lib/hooks/useNav'
import { flushSync } from 'react-dom'
import { Messages } from './assistant/Messages'
import { Space } from 'antd'
import { Sender } from '@ant-design/x'
import parseThink from '@leaf/parse-think'
import type {
  ChatCompletionUserMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'
import readme from '../../README.md?raw'
import { funcs } from './assistant/funcs'
import { ExportTypes } from '@psych/sheet'

const GREETTING =
  '你好, 我是 PsychPen 的 AI 助手, 可以帮你讲解 PsychPen 的使用方法、探索你的数据集、导出数据、跳转页面、生成/清除子变量 (标准化/中心化/离散化)、生成新变量、筛选数据等. 请问有什么可以帮你的?'
const INSTRUCTION =
  '你是在线统计分析和数据可视化软件"PsychPen"中的AI助手. 你将收到用户的提问、当前用户导入到软件中的数据集中的变量的信息、PsychPen的使用和开发文档、可以供你调用的工具信息; 你的任务是按照用户的要求, 为用户提供帮助.'
function GET_PROMPT(vars: Variable[]): string {
  const varsInfo = vars.map((col) => {
    if (col.type === '称名或等级数据') {
      return `| ${col.name} | ${col.type} | ${col.valid} | ${col.missing} | ${col.unique} | - | - | - | - | - | - |`
    } else {
      const subVarInfo = col.subVars
        ? `已定义${[
            col.subVars.standard ? '标准化' : '',
            col.subVars.center ? '中心化' : '',
            col.subVars.discrete
              ? `离散化 (${col.subVars.discrete.method}, ${col.subVars.discrete.groups} 组) `
              : '',
          ]
            .filter((part) => part)
            .join('、')}子变量`
        : '未定义任何子变量'
      return `| ${col.name} | ${col.type} | ${col.valid} | ${col.missing} | ${col.unique} | ${col.mean?.toFixed(4) || '-'} | ${col.std?.toFixed(4) || '-'} | ${col.q2?.toFixed(4) || '-'} | ${col.min?.toFixed(4) || '-'} | ${col.max?.toFixed(4) || '-'} | ${subVarInfo} |`
    }
  })
  const varsText = `\n\n# 变量信息\n\n| 变量名 | 变量类型 | 有效值数量 | 缺失值数量 | 唯一值数量 | 均值 | 标准差 | 中位数 | 最小值 | 最大值 | 子变量信息 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${varsInfo.join('\n')}`
  const docsText = `\n\n# 使用文档\n\n\`\`\`markdown\n${readme}\n\`\`\``
  return INSTRUCTION + varsText + docsText
}

export function AI() {
  const { ai, model } = useAssistant()

  if (ai === null) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        AI助手不可用, 请检查设置
      </div>
    )
  }

  const { data, dataCols } = useData()
  const { messageApi, disabled } = useStates()
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
      const system = GET_PROMPT(dataCols)

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

        try {
          switch (toolCall.function.name) {
            case 'apply_filter': {
              const { filter_expression } = JSON.parse(
                toolCall.function.arguments,
              )
              if (typeof filter_expression !== 'string') {
                throw new Error('筛选表达式参数错误')
              }
              newMessages[1].content =
                '已请求设置数据筛选规则, 等待用户手动确认'
              break
            }
            case 'clear_sub_var': {
              const { variable_names } = JSON.parse(toolCall.function.arguments)
              if (
                !Array.isArray(variable_names) ||
                !variable_names.every(
                  (name) =>
                    typeof name === 'string' &&
                    dataCols.some((col) => col.name === name),
                )
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
                !variable_names.every(
                  (name) =>
                    typeof name === 'string' &&
                    dataCols.some((col) => col.name === name),
                )
              ) {
                throw new Error('变量名参数错误')
              }
              if (
                discretize &&
                (typeof discretize !== 'object' ||
                  !discretize.method ||
                  !discretize.groups ||
                  typeof discretize.method !== 'string' ||
                  typeof discretize.groups !== 'number')
              ) {
                throw new Error('离散化参数错误')
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
              const { variable_name, calc_expression } = JSON.parse(
                toolCall.function.arguments,
              )
              if (
                typeof variable_name !== 'string' ||
                typeof calc_expression !== 'string'
              ) {
                throw new Error('变量名或计算表达式参数错误')
              }
              newMessages[1].content = `已请求生成新变量"${variable_name}", 等待用户手动确认`
              break
            }
            case 'export_data': {
              const { file_name, file_type } = JSON.parse(
                toolCall.function.arguments,
              )
              if (
                typeof file_name !== 'string' ||
                typeof file_type !== 'string' ||
                !Object.values(ExportTypes).includes(file_type as ExportTypes)
              ) {
                throw new Error('文件名或文件类型参数错误')
              }
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
        } catch (e) {
          throw new Error(
            `AI函数调用错误: ${e instanceof Error ? e.message : String(e)}`,
          )
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
      <Messages
        messages={messages}
        showLoading={showLoading}
        greeting={GREETTING}
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
