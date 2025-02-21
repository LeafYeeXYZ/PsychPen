import { useZustand } from '../../lib/useZustand'
import { Upload, Button, Tag } from 'antd'
import { SlidersOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import { importSheet, ImportTypes } from '@psych/sheet'

/** 数据量较大的阈值 */
const LARGE_DATA_SIZE = 1024 * 1024 // 1 MB
/** 支持的文件类型 */
const ACCEPT_FILE_TYPES = Object.values(ImportTypes)

export function ImportData() {

  const { _DataView_setData, messageApi, _DataView_setIsLargeData, disabled, setDisabled } = useZustand()

  return (
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
                } else if (ACCEPT_FILE_TYPES.indexOf(ext as ImportTypes) === -1) {
                  messageApi?.destroy('uploading')
                  messageApi?.error('文件读取失败, 不支持该文件格式')
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
  )
}
