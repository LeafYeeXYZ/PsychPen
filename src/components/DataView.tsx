import { read, utils, writeFile } from 'xlsx'
import { useZustand } from '../lib/useZustand'
import { Upload, Button, Tag, Popconfirm, Modal, Input, Select } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined, FilterOutlined } from '@ant-design/icons'
import { parse, set_utils } from 'dta'
import { flushSync } from 'react-dom'
import { useRef } from 'react'
import XLSX_ZAHL_PAYLOAD from 'xlsx/dist/xlsx.zahl.mjs'
import { SavParser, Feeder } from '@leaf/sav-reader'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'

/** 可导入的文件类型 */
const ACCEPT_FILE_TYPES = ['.xls', '.xlsx', '.csv', '.txt', '.json', '.numbers', '.dta', '.sav']
/** 可导出的文件类型 */
const EXPORT_FILE_TYPES = ['.xlsx', '.csv', '.numbers']
/** 数据量较大的阈值 */
const LARGE_DATA_SIZE = 512 * 1024

export function DataView() {

  const { data, _DataView_setData, dataCols, dataRows, messageApi, _DataView_setIsLargeData, disabled, setDisabled } = useZustand()
  const [modalApi, contextHolder] = Modal.useModal()
  // 导出数据相关
  const handleExport = async (filename: string, type: string) => {
    const worksheet = utils.json_to_sheet(dataRows)
    const workbook = utils.book_new(worksheet, 'psychpen')
    writeFile(workbook, filename + type, {
      compression: true,
      numbers: XLSX_ZAHL_PAYLOAD,
    })
  }
  const handleExportParams = useRef<{ filename?: string; type?: string }>({})
  
  return (
    <div className='w-full h-full overflow-hidden'>
      {data ? (
        // 有数据时的操作界面
        <div className='flex flex-col justify-start items-center w-full h-full p-4'>
          {/* 上方工具栏 */}
          <div className='w-full flex justify-start items-center gap-3 mb-4'>
            <Popconfirm
              title={<span>是否确认清除数据<br />本地数据不受影响</span>}
              onConfirm={() => _DataView_setData(null)}
              okText='确定'
              cancelText='取消'
            >
              <Button 
                icon={<DeleteOutlined />}
                disabled={disabled}
              >
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
                        onChange={(e) => handleExportParams.current.filename = e.target.value}
                      />
                      <Select
                        placeholder='请选择导出格式'
                        defaultValue={handleExportParams.current.type?.length ? handleExportParams.current.type : EXPORT_FILE_TYPES[0]}
                        onChange={(value) => handleExportParams.current.type = value}
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
                    await handleExport(
                      handleExportParams.current.filename?.length ? handleExportParams.current.filename : 'psychpen',
                      handleExportParams.current.type?.length ? handleExportParams.current.type : EXPORT_FILE_TYPES[0],
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
            <Button
              icon={<FilterOutlined />}
              disabled={true}
            >
              数据过滤
            </Button>
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
              valueFormatter: (params) => col.type === '等距或等比数据' ? params.value : String(params.value),
            }))}
          />
        </div>
      ) : (
        // 无数据时的操作界面
        <div className='flex flex-col justify-center items-center w-full h-full relative'>
          <p className='text-xl'>
            请先导入数据文件
          </p>
          <p className='text-sm p-4'>
            支持 {ACCEPT_FILE_TYPES.map((type) => <Tag key={type} color='pink'>{type}</Tag>)} 格式
          </p>
          <Upload
            accept={ACCEPT_FILE_TYPES.join(',')}
            beforeUpload={async (file) => {
              try {
                messageApi?.open({
                  type: 'loading',
                  key: 'uploading',
                  content: '正在导入数据...',
                  duration: 0,
                })
                flushSync(() => setDisabled(true))
                // 如果文件比较大, 延迟等待通知加载
                if (file.size > LARGE_DATA_SIZE) {
                  await new Promise((resolve) => setTimeout(resolve, 500))
                  _DataView_setIsLargeData(true)
                }
                const reader = new FileReader()
                const ext = file.name.split('.').pop()?.toLowerCase()
                reader.onload = async (e) => {
                  try {
                    if (!e.target?.result) {
                      messageApi?.destroy('uploading')
                      messageApi?.error('文件读取失败, 请检查文件是否损坏')
                    } else if (ext === 'dta') {
                      set_utils(utils)
                      _DataView_setData(parse(new Uint8Array(e.target.result as ArrayBuffer)))
                    } else if (ext === 'sav') {
                      const parser = new SavParser()
                      const feeder = new Feeder(e.target.result as ArrayBuffer)
                      const data = (await parser.all(feeder)).rows.map((map: Map<string, unknown>) => Object.fromEntries(map))
                      _DataView_setData(utils.book_new(utils.json_to_sheet(data), 'psychpen'))
                    } else if (ext === 'txt') {
                      // SheetJS 默认对 TXT 的编码是 UTF-16, 这里让它用 UTF-8 解析
                      const text = new TextDecoder('utf-8').decode(e.target.result as ArrayBuffer)
                      _DataView_setData(read(text, { type: 'string' }))
                    } else {
                      _DataView_setData(read(e.target.result))
                    }
                    messageApi?.destroy('uploading')
                    messageApi?.success('数据导入完成', 0.5)
                  } catch (error) {
                    messageApi?.destroy('uploading')
                    messageApi?.error(`文件读取失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
                  } finally {
                    setDisabled(false)
                  }
                }
                reader.readAsArrayBuffer(file)
              } catch (error) {
                messageApi?.destroy()
                messageApi?.error(`文件读取失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
                setDisabled(false)
              }
              return false
            }}
            fileList={[]}
            maxCount={0}
          >
            <Button 
              icon={<SlidersOutlined />} 
              loading={disabled}
              disabled={disabled}
            >
              点击导入数据
            </Button>
          </Upload>
          <p className='text-sm p-4 absolute top-1 w-full text-center opacity-70'>
            如只须使用小工具, 点击上方的工具按钮即可
          </p>
        </div>
      )}
      {contextHolder}
    </div>
  )
}