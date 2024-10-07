import { read } from 'xlsx'
import { useZustand } from '../lib/useZustand'
import { Upload, Button, Tag, Table, Popconfirm } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'

export function DataView() {

  const { data, setData, dataCols, dataRows, ACCEPT_FILE_TYPES } = useZustand()
  
  return (
    <div className='w-full h-full overflow-hidden'>
      {data ? (
        // 有数据时的操作界面
        <div className='flex flex-col justify-start items-center w-full h-full p-4'>
          {/* 上方工具栏 */}
          <div className='w-full flex justify-start items-center gap-3 mb-4'>
            <Upload
              accept={ACCEPT_FILE_TYPES.join(',')}
              beforeUpload={(file) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                  e.target?.result && setData(read(e.target.result))
                }
                reader.readAsArrayBuffer(file)
                return false
              }}
              fileList={[]}
              maxCount={0}
            >
              <Button
                icon={<SlidersOutlined />}
              >
                导入数据
              </Button>
            </Upload>
            <Popconfirm
              title={<span>确定清除数据吗？<br />本地数据不受影响</span>}
              onConfirm={() => setData(null)}
              okText='确定'
              cancelText='取消'
            >
              <Button icon={<DeleteOutlined />}>
                清除数据
              </Button>
            </Popconfirm>
            <Button
              icon={<SaveOutlined />}
              disabled={true}
            >
              导出数据
            </Button>
          </div>
          {/* 数据表格 */}
          <Table
            className='w-full overflow-auto text-nowrap'
            bordered
            dataSource={dataRows}
            columns={dataCols.map((col) => ({
              title: col.name,
              dataIndex: col.name,
              key: col.name,
              width: col.name.length * 12,
            }))}
            pagination={{
              hideOnSinglePage: false,
              position: ['bottomLeft'],
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
            beforeUpload={(file) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                e.target?.result && setData(read(e.target.result))
              }
              reader.readAsArrayBuffer(file)
              return false
            }}
            fileList={[]}
            maxCount={0}
          >
            <Button
              icon={<SlidersOutlined />}
            >
              点击导入数据
            </Button>
          </Upload>
        </div>
      )}
    </div>
  )
}