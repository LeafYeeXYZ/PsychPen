import { useZustand } from '../../lib/useZustand'
import { useRemoteR } from '../../lib/useRemoteR'
import { useAssistant } from '../../lib/useAssistant'
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
  LoadingOutlined,
} from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'

/** 可导出的文件类型 */
const EXPORT_FILE_TYPES = Object.values(ExportTypes)

export function PreviewData() {
  const { _DataView_setData, dataCols, dataRows, disabled, setDisabled } =
    useZustand()
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
          onConfirm={() => _DataView_setData(null)}
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
              onOk: () => {
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
              },
              okText: '确定',
              cancelText: '取消',
            })
            flushSync(() => setDisabled(false))
          }}
        >
          导出数据
        </Button>
        <div className='absolute right-0 flex justify-end items-center gap-3'>
          <Popover
            title={
              <span>
                AI辅助分析设置 {'['}当前状态: {ai ? '可用' : '不可用'}
                <LoadingOutlined className='mx-[0.15rem] scale-75' />
                {']'}
              </span>
            }
            trigger={['click', 'hover']}
            content={<ConfigAI />}
          >
            <Button icon={<CommentOutlined />}>AI辅助分析设置</Button>
          </Popover>
          <Popover
            title='R语言服务器设置'
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
    <div className='flex flex-col w-96'>
      <div className='mb-4'>
        <Segmented
          block
          className='border dark:border-[#424242]'
          defaultValue={openaiEnable ? Open.TRUE : Open.FALSE}
          options={[Open.TRUE, Open.FALSE]}
          onChange={(value) => _DataView_setOpenaiEnable(value === Open.TRUE)}
        />
      </div>
      <div className='mb-4'>
        <Input
          placeholder='请输入OpenAI兼容API端点 (baseUrl)'
          defaultValue={openaiEndpoint}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setOpenaiEndpoint(e.target.value ?? '')}
        />
      </div>
      <div className='mb-4'>
        <Input.Password
          placeholder='请输入OpenAI兼容API密钥 (apiKey)'
          defaultValue={openaiApiKey}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setOpenaiApiKey(e.target.value ?? '')}
        />
      </div>
      <div className='mb-4'>
        <Input
          placeholder='请输入AI模型名称 (modelId)'
          defaultValue={model}
          disabled={!openaiEnable}
          onChange={(e) => _DataView_setModel(e.target.value ?? '')}
        />
      </div>
      <p className='w-full text-xs text-center px-2 mb-1'>
        如果启用AI辅助分析功能, 则在与AI交互时
      </p>
      <p className='w-full text-xs text-center px-2 mb-1'>
        部分数据信息将上传至上面指定的AI服务
      </p>
      <p className='w-full text-xs text-center px-2 mb-1'>
        如果使用的不是自部署AI服务, 请注意数据安全
      </p>
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
    <div className='flex flex-col w-96'>
      <div className='mb-4'>
        <Segmented
          block
          className='border dark:border-[#424242]'
          defaultValue={Renable ? Open.TRUE : Open.FALSE}
          options={[Open.TRUE, Open.FALSE]}
          onChange={(value) => _DataView_setRenable(value === Open.TRUE)}
        />
      </div>
      <div className='mb-4'>
        <Input
          placeholder='请输入服务器地址'
          defaultValue={Rurl}
          disabled={!Renable}
          onChange={(e) => _DataView_setRurl(e.target.value ?? '')}
        />
      </div>
      <div className='mb-4'>
        <Input.Password
          placeholder='请输入服务器密码'
          defaultValue={Rpassword}
          disabled={!Renable}
          onChange={(e) => _DataView_setRpassword(e.target.value ?? '')}
        />
      </div>
      <p className='w-full text-xs text-center px-2 mb-1'>
        如果启用R语言服务器功能, 则在执行部分统计功能时
      </p>
      <p className='w-full text-xs text-center px-2 mb-1'>
        数据将上传至上面填写的R语言服务器进行处理
      </p>
      <p className='w-full text-xs text-center px-2 mb-1'>
        如果使用的不是官方或自部署服务器, 请注意数据安全
      </p>
    </div>
  )
}
