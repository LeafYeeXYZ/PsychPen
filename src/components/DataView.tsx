import { read, utils, writeFile } from 'xlsx'
import { useZustand } from '../lib/useZustand'
import { Upload, Button, Tag, Table, Popconfirm, Modal, Input, Select } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined, FilterOutlined } from '@ant-design/icons'
import { parse, set_utils } from 'dta'
import { flushSync } from 'react-dom'
import { useRef } from 'react'
import XLSX_ZAHL_PAYLOAD from 'xlsx/dist/xlsx.zahl.mjs'

export function DataView() {

  const { data, setData, dataCols, dataRows, ACCEPT_FILE_TYPES, messageApi, setIsLargeData, LARGE_DATA_SIZE, disabled, setDisabled, EXPORT_FILE_TYPES } = useZustand()
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
              onConfirm={() => setData(null)}
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
          <Table
            className='w-full overflow-auto text-nowrap'
            bordered
            dataSource={dataRows.map((row, index) => ({ 
              key: index,
              ...row, // 如果 row 中有 key 字段, 会覆盖 key: index
            }))}
            columns={dataCols.map((col, index) => ({
              title: col.name,
              dataIndex: col.name,
              key: `${col.name}-${index}`,
              width: `max(5rem, ${col.name.length}rem)`,
            }))}
            pagination={{
              hideOnSinglePage: false,
              position: ['bottomLeft'],
              defaultPageSize: 25,
              showSizeChanger: true,
              pageSizeOptions: [25, 50, 100],
            }}
            scroll={{ 
              y: 'max(calc(100dvh - 16rem), calc(480px - 16rem))',
              x: 'max-content',
            }}
          />
        </div>
      ) : (
        // 无数据时的操作界面
        <div className='flex flex-col justify-center items-center w-full h-full'>
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
                  setIsLargeData(true)
                }
                const reader = new FileReader()
                const ext = file.name.split('.').pop()?.toLowerCase()
                reader.onload = (e) => {
                  try {
                    if (!e.target?.result) {
                      messageApi?.destroy('uploading')
                      messageApi?.error('文件读取失败, 请检查文件是否损坏')
                    } else if (ext === 'dta') {
                      set_utils(utils)
                      setData(parse(new Uint8Array(e.target.result as ArrayBuffer)))
                    } else {
                      setData(read(e.target.result))
                    }
                    messageApi?.destroy('uploading')
                    messageApi?.open({
                      type: 'success',
                      content: '数据导入完成',
                      duration: 0.5,
                    })
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
        </div>
      )}
      {contextHolder}
    </div>
  )
}