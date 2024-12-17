import { useZustand } from '../lib/useZustand'
import { useRemoteR } from '../lib/useRemoteR'
import { Upload, Button, Tag, Popconfirm, Modal, Input, Select, Popover, Segmented } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import { useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.min.css'
import { importSheet, downloadSheet, type ImportTypes, type ExportTypes } from '@psych/sheet'
import ImportDataWorker from '../lib/workers/importData?worker'

/** 可导入的文件类型 */
const ACCEPT_FILE_TYPES: ImportTypes[] = ['xls', 'xlsx', 'csv', 'txt', 'json', 'numbers', 'dta', 'sav', 'parquet']
/** 可导出的文件类型 */
const EXPORT_FILE_TYPES: ExportTypes[] = ['xlsx', 'csv', 'numbers', 'json']
/** 数据量较大的阈值 */
const LARGE_DATA_SIZE = 1024 * 1024 // 1 MB

export function DataView() {

  const { data, _DataView_setData, dataCols, dataRows, messageApi, _DataView_setIsLargeData, disabled, setDisabled } = useZustand()
  const { Rurl, Rpassword, _DataView_setRurl, _DataView_setRpassword, Renable, _DataView_setRenable } = useRemoteR()
  const [modalApi, contextHolder] = Modal.useModal()
  // 导出数据相关
  const handleExport = (filename: string, type: string) => { downloadSheet(dataRows, type as ExportTypes, filename) }
  const handleExportParams = useRef<{ filename?: string; type?: string }>({})
  // 设置 R 服务相关
  const updateRenable = (enable: boolean) => { localStorage.setItem('Renable', enable ? 'true' : 'false'); _DataView_setRenable(enable) }
  const updateRurl = (url: string) => { localStorage.setItem('Rurl', url); _DataView_setRurl(url) }
  const updateRpassword = (password: string) => { localStorage.setItem('Rpassword', password); _DataView_setRpassword(password) }
  useEffect(() => {
    const Renable = localStorage.getItem('Renable') === 'true'
    const Rurl = localStorage.getItem('Rurl') ?? ''
    const Rpassword = localStorage.getItem('Rpassword') ?? ''
    _DataView_setRenable(Renable)
    _DataView_setRurl(Rurl)
    _DataView_setRpassword(Rpassword)
  }, [_DataView_setRenable, _DataView_setRurl, _DataView_setRpassword])

  return (
    <div className='w-full h-full overflow-hidden'>
      {data ? (
        // 有数据时的操作界面
        <div className='flex flex-col justify-start items-center w-full h-full p-4'>
          {/* 上方工具栏 */}
          <div className='w-full flex justify-start items-center gap-3 mb-4 relative'>
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
                  onOk: () => {
                    handleExport(
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
            <Popover
              title='高级设置'
              trigger={['click', 'hover']}
              content={(
                <div className='flex flex-col'>
                  <p className='w-full text-sm font-bold text-center px-2 mb-4'>
                    联网功能设置
                  </p>
                  <Segmented
                    block
                    className='mb-3 border dark:border-[#424242]'
                    defaultValue={Renable ? '启动联网功能' : '关闭联网功能'}
                    options={['启动联网功能', '关闭联网功能']}
                    onChange={(value) => updateRenable(value === '启动联网功能')}
                  />
                  <Input
                    className='mb-4'
                    placeholder='请输入服务器地址'
                    defaultValue={Rurl}
                    disabled={!Renable}
                    onChange={(e) => updateRurl(e.target.value ?? '')}
                  />
                  <Input
                    className='mb-4'
                    placeholder='请输入服务器密码'
                    defaultValue={Rpassword}
                    disabled={!Renable}
                    onChange={(e) => updateRpassword(e.target.value ?? '')}
                  />
                  <p className='w-full text-xs text-center px-2 mb-1'>如果启用联网功能, 则代表您同意在执行部分统计功能时</p>
                  <p className='w-full text-xs text-center px-2 mb-1'>将数据上传至上面填写的服务器进行处理</p>
                  <p className='w-full text-xs text-center px-2 mb-1'>如果使用的不是官方或自部署服务器, 请注意信息安全</p>
                </div>
              )}
            >
              <Button 
                className='absolute right-0'
                icon={<SettingOutlined />}
              >
                高级设置
              </Button>
            </Popover>
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
            支持 {ACCEPT_FILE_TYPES.map((type) => <Tag key={type} color='pink'>.{type}</Tag>)} 格式
          </p>
          <Upload
            accept={ACCEPT_FILE_TYPES.map((type) => `.${type}`).join(',')}
            beforeUpload={async (file) => {
              try {
                messageApi?.open({
                  type: 'loading',
                  key: 'uploading',
                  content: '正在导入数据...',
                  duration: 0,
                })
                flushSync(() => setDisabled(true))
                const isLargeData = file.size > LARGE_DATA_SIZE
                // 如果文件比较大, 延迟等待通知加载
                if (isLargeData) {
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
                    } else if (ACCEPT_FILE_TYPES.indexOf(ext as ImportTypes) === -1) {
                      messageApi?.destroy('uploading')
                      messageApi?.error('文件读取失败, 不支持该文件格式')
                    } else if (isLargeData) {
                      const worker = new ImportDataWorker()
                      worker.postMessage({ file: e.target.result, ext: ext as ImportTypes })
                      const data = await new Promise((resolve, reject) => {
                        worker.onmessage = (event) => {
                          if (event.data.success) {
                            resolve(event.data.data)
                          } else {
                            reject(event.data.error)
                          }
                        }
                      })
                      _DataView_setData(data as Record<string, unknown>[])
                      worker.terminate()
                    } else {
                      const data = await importSheet(e.target.result as ArrayBuffer, ext as ImportTypes)
                      _DataView_setData(data)
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