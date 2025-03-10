import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useRemoteR } from '../../lib/hooks/useRemoteR'
import { useAssistant } from '../../lib/hooks/useAssistant'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { downloadSheet, ExportTypes } from '@psych/sheet'
import {
  Button,
  Tag,
  Popconfirm,
  Modal,
  Input,
  Select,
  Popover,
  Segmented,
} from 'antd'
import {
  DeleteOutlined,
  SaveOutlined,
  CloudServerOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { Expression } from '../widgets/Expression'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { sleep } from '../../lib/utils'

/** 可导出的文件类型 */
const EXPORT_FILE_TYPES = Object.values(ExportTypes)

export function PreviewData() {
  const { setData, dataCols, dataRows, filterExpression, data, isLargeData } =
    useData()
  const { disabled, setDisabled, messageApi } = useStates()
  const [modalApi, contextHolder] = Modal.useModal()
  // 导出数据相关
  const handleExport = (filename: string, type: string) => {
    downloadSheet(dataRows, type as ExportTypes, filename)
  }
  const handleExportParams = useRef<{ filename?: string; type?: string }>({})
  // 标注AI状态
  const { ai } = useAssistant()

  return (
    <div className='flex flex-col justify-start items-center w-full h-full p-4'>
      {/* 上方工具栏 */}
      <div className='w-full flex justify-start items-center gap-3 mb-4 relative'>
        <Popconfirm
          title={
            <span>
              是否确认清除数据
              <br />
              本地数据不受影响
            </span>
          }
          onConfirm={async () => {
            await setData(null)
            messageApi?.success('数据已清除', 0.5)
          }}
          okText='确定'
          cancelText='取消'
        >
          <Button icon={<DeleteOutlined />} disabled={disabled}>
            清除数据
          </Button>
        </Popconfirm>
        <Button
          icon={<SaveOutlined />}
          disabled={disabled}
          onClick={async () => {
            try {
              flushSync(() => setDisabled(true))
              await modalApi.confirm({
                title: '导出数据',
                content: (
                  <div className='flex flex-col gap-4 my-4'>
                    <Input
                      placeholder='请输入文件名 (可留空)'
                      onChange={(e) =>
                        (handleExportParams.current.filename = e.target.value)
                      }
                    />
                    <Select
                      placeholder='请选择导出格式'
                      defaultValue={
                        handleExportParams.current.type?.length
                          ? handleExportParams.current.type
                          : EXPORT_FILE_TYPES[0]
                      }
                      onChange={(value) =>
                        (handleExportParams.current.type = value)
                      }
                    >
                      {EXPORT_FILE_TYPES.map((type) => (
                        <Select.Option key={type} value={type}>
                          导出为 <Tag color='pink'>{type}</Tag>文件
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                ),
                onOk: async () => {
                  messageApi?.loading('正在导出数据...', 0)
                  isLargeData && (await sleep())
                  handleExport(
                    handleExportParams.current.filename?.length
                      ? handleExportParams.current.filename
                      : 'psychpen',
                    handleExportParams.current.type?.length
                      ? handleExportParams.current.type
                      : EXPORT_FILE_TYPES[0],
                  )
                  handleExportParams.current.filename = undefined
                  handleExportParams.current.type = undefined
                  messageApi?.destroy()
                  messageApi?.success('数据导出成功', 1)
                },
                okText: '确定',
                cancelText: '取消',
              })
            } finally {
              setDisabled(false)
            }
          }}
        >
          导出数据
        </Button>
        <Popover
          title={
            <span>
              当前过滤表达式{' '}
              <Tag color='blue'>
                已排除{data!.length - dataRows.length}条数据
              </Tag>
            </span>
          }
          content={
            <span>
              <Expression value={filterExpression} />
            </span>
          }
          trigger={['click', 'hover']}
        >
          <Button icon={<FilterOutlined />} />
        </Popover>
        <div className='absolute right-0 flex justify-end items-center gap-3'>
          <Popover
            title={
              <span>
                AI辅助分析设置 {'|'} 当前状态:{' '}
                {ai ? (
                  <Tag color='green'>可用</Tag>
                ) : (
                  <Tag color='red'>不可用</Tag>
                )}
                <Popover
                  content={
                    <div className='flex flex-col gap-1'>
                      <div>
                        在输入全部信息后, PsychPen 会自动验证 AI 服务是否可用
                      </div>
                      <div>
                        如果数秒后仍未显示可用, 请检查网络连接和信息是否填写正确
                      </div>
                    </div>
                  }
                >
                  <InfoCircleOutlined />
                </Popover>
              </span>
            }
            trigger={['click', 'hover']}
            content={<ConfigAI />}
          >
            <Button icon={<CommentOutlined />}>AI辅助分析设置</Button>
          </Popover>
          <Popover
            title={
              <span>
                R语言服务器设置{' '}
                <Popover content='详见使用文档或询问 AI 助手'>
                  <InfoCircleOutlined />
                </Popover>
              </span>
            }
            trigger={['click', 'hover']}
            content={<ConfigR />}
          >
            <Button icon={<CloudServerOutlined />}>R语言服务器设置</Button>
          </Popover>
        </div>
      </div>
      {/* 数据表格 */}
      <AgGridReact
        className='ag-theme-quartz-auto-dark w-full h-full overflow-auto'
        // @ts-expect-error 使用 valueFormatter 之后类型报错
        rowData={dataRows}
        // @ts-expect-error 使用 valueFormatter 之后类型报错
        columnDefs={dataCols.map((col) => ({
          field: col.name,
          headerName: col.name,
          valueFormatter: (params) =>
            col.type === '等距或等比数据' ? params.value : String(params.value),
        }))}
      />
      {contextHolder}
    </div>
  )
}

function ConfigAI() {
  const {
    _DataView_setOpenaiEndpoint,
    _DataView_setOpenaiApiKey,
    _DataView_setModel,
    _DataView_setOpenaiEnable,
    openaiEndpoint,
    openaiApiKey,
    model,
    openaiEnable,
  } = useAssistant()
  const enum Open {
    TRUE = '开启AI辅助分析',
    FALSE = '关闭AI辅助分析',
  }
  return (
    <div className='flex flex-col w-96 gap-2'>
      <div className='mb-2'>
        <Segmented
          block
          className='border dark:border-[#424242]'
          defaultValue={openaiEnable ? Open.TRUE : Open.FALSE}
          options={[Open.TRUE, Open.FALSE]}
          onChange={(value) => _DataView_setOpenaiEnable(value === Open.TRUE)}
        />
      </div>
      <p className='w-full text-left pl-1'>
        API 地址 <Tag>baseUrl</Tag>
        <Popover
          content={
            <div className='flex flex-col gap-1'>
              <div>请填写各大模型提供商的 OpenAI 兼容 API 地址</div>
              <div>
                对于 <Tag style={{ margin: 0 }}>DeepSeek</Tag> 是{' '}
                <Tag style={{ margin: 0 }}>https://api.deepseek.com/v1</Tag>
              </div>
              <div>
                对于 <Tag style={{ margin: 0 }}>Qwen</Tag> 是{' '}
                <Tag style={{ margin: 0 }}>
                  https://dashscope.aliyuncs.com/compatible-mode/v1
                </Tag>
              </div>
              <div>
                对于 <Tag style={{ margin: 0 }}>OpenAI</Tag> 是{' '}
                <Tag style={{ margin: 0 }}>https://api.openai.com/v1</Tag>
              </div>
            </div>
          }
        >
          <InfoCircleOutlined />
        </Popover>
      </p>
      <div className='mb-2'>
        <Input
          placeholder='请输入OpenAI兼容API端点 (baseUrl)'
          defaultValue={openaiEndpoint}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setOpenaiEndpoint(e.target.value ?? '')}
        />
      </div>
      <p className='w-full text-left pl-1'>
        API 密钥 <Tag>apiKey</Tag>
      </p>
      <div className='mb-2'>
        <Input.Password
          placeholder='请输入OpenAI兼容API密钥 (apiKey)'
          defaultValue={openaiApiKey}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setOpenaiApiKey(e.target.value ?? '')}
        />
      </div>
      <p className='w-full text-left pl-1'>
        AI 模型名称 <Tag>modelId</Tag>
        <Popover
          content={
            <div className='flex flex-col gap-1'>
              <div>
                请填写您所使用的 AI 模型的 ID (模型必须支持{' '}
                <Tag style={{ margin: 0 }}>Function Calling</Tag> 功能)
              </div>
              <div>
                如 <Tag style={{ margin: 0 }}>DeepSeek-V3</Tag> (ID 为{' '}
                <Tag style={{ margin: 0 }}>deepseek-chat</Tag>),{' '}
                <Tag style={{ margin: 0 }}>Qwen</Tag> (ID 为{' '}
                <Tag style={{ margin: 0 }}>qwen-max</Tag>),{' '}
                <Tag style={{ margin: 0 }}>GPT-4o</Tag> (ID 为{' '}
                <Tag style={{ margin: 0 }}>gpt-4o</Tag>) 等
              </div>
              <div>
                不建议使用 <Tag style={{ margin: 0 }}>DeepSeek-R1</Tag>,{' '}
                <Tag style={{ margin: 0 }}>QwQ</Tag>,{' '}
                <Tag style={{ margin: 0 }}>o3-mini</Tag> 等推理模型
              </div>
            </div>
          }
        >
          <InfoCircleOutlined />
        </Popover>
      </p>
      <div className='mb-2'>
        <Input
          placeholder='请输入AI模型名称 (modelId)'
          defaultValue={model}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setModel(e.target.value ?? '')}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <p className='w-full text-xs text-center px-2'>
          如果启用AI辅助分析功能, 则在与AI交互时
        </p>
        <p className='w-full text-xs text-center px-2'>
          部分数据信息将上传至上面指定的AI服务
        </p>
        <p className='w-full text-xs text-center px-2'>
          如果使用的不是自部署AI服务, 请注意数据安全
        </p>
      </div>
    </div>
  )
}

function ConfigR() {
  const {
    _DataView_setRurl,
    _DataView_setRpassword,
    _DataView_setRenable,
    Rurl,
    Rpassword,
    Renable,
  } = useRemoteR()
  const enum Open {
    TRUE = '开启R语言服务器',
    FALSE = '关闭R语言服务器',
  }
  return (
    <div className='flex flex-col w-96 gap-2'>
      <div className='mb-2'>
        <Segmented
          block
          className='border dark:border-[#424242]'
          defaultValue={Renable ? Open.TRUE : Open.FALSE}
          options={[Open.TRUE, Open.FALSE]}
          onChange={(value) => _DataView_setRenable(value === Open.TRUE)}
        />
      </div>
      <p className='w-full text-left pl-1'>服务器地址</p>
      <div className='mb-2'>
        <Input
          placeholder='请输入服务器地址'
          defaultValue={Rurl}
          disabled={!Renable}
          onChange={(e) => _DataView_setRurl(e.target.value ?? '')}
        />
      </div>
      <p className='w-full text-left pl-1'>服务器密码</p>
      <div className='mb-2'>
        <Input.Password
          placeholder='请输入服务器密码'
          defaultValue={Rpassword}
          disabled={!Renable}
          onChange={(e) => _DataView_setRpassword(e.target.value ?? '')}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <p className='w-full text-xs text-center px-2'>
          如果启用R语言服务器功能, 则在执行部分统计功能时
        </p>
        <p className='w-full text-xs text-center px-2'>
          数据将上传至上面填写的R语言服务器进行处理
        </p>
        <p className='w-full text-xs text-center px-2'>
          如果使用的不是官方或自部署服务器, 请注意数据安全
        </p>
      </div>
    </div>
  )
}
