import { read, utils } from 'xlsx'
import { useZustand } from '../lib/useZustand'
import { Upload, Button, Tag, Table, Popconfirm } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import * as ss from 'simple-statistics'
import { parse, set_utils } from 'dta'

export function DataView() {

  const { data, setData, dataCols, dataRows, ACCEPT_FILE_TYPES, setDataCols, messageApi } = useZustand()
  const handleCalculate = () => { // 和 VariableView.tsx 中的 handleCalculate 函数相同
    try {
      messageApi?.loading('正在处理数据...')
      const cols = dataCols.map((col) => {
        // 原始数据
        const data = dataRows.map((row) => row[col.name])
        const numData: number[] = data
          .filter((v) => typeof +v === 'number' && !isNaN(+v))
          .map((v) => +v)
        // 基础统计量
        const count = data.length
        const missing = data.filter((v) => v === undefined).length
        const valid = count - missing
        const unique = new Set(data).size
        // 判断数据类型, 并计算描述统计量
        let type: '称名或等级数据' | '等距或等比数据' = '称名或等级数据'
        if (
          numData.length > 0
          // 不是等差数列
          && !numData.every((v, i, arr) => i === 0 || v - arr[i - 1] === arr[1] - arr[0])
        ) {
          type = '等距或等比数据'
          const min = +Math.min(...numData).toFixed(4)
          const max = +Math.max(...numData).toFixed(4)
          const mean = +ss.mean(numData).toFixed(4)
          const mode = +ss.mode(numData).toFixed(4)
          const q1 = +ss.quantile(numData, 0.25).toFixed(4)
          const q2 = +ss.quantile(numData, 0.5).toFixed(4)
          const q3 = +ss.quantile(numData, 0.75).toFixed(4)
          const std = +ss.standardDeviation(numData).toFixed(4)
          return { ...col, count, missing, valid, unique, min, max, mean, mode, q1, q2, q3, std, type }
        } else {
          return { ...col, count, missing, valid, unique, type }
        }
      })
      setDataCols(cols)
      messageApi?.destroy()
      messageApi?.open({
        type: 'success',
        content: '数据处理完成',
        duration: 0.5,
      })
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  useEffect(() => {
    if (data && !dataCols[0].type) {
      handleCalculate()
    }
  }, [data])
  // 上传状态
  const [uploading, setUploading] = useState<boolean>(false)
  
  return (
    <div className='w-full h-full overflow-hidden'>
      {data ? (
        // 有数据时的操作界面
        <div className='flex flex-col justify-start items-center w-full h-full p-4'>
          {/* 上方工具栏 */}
          <div className='w-full flex justify-start items-center gap-3 mb-4'>
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
            columns={dataCols.map((col, index) => ({
              title: col.name,
              dataIndex: col.name,
              key: col.name + index,
              width: `max(5rem, ${col.name.length}rem)`,
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
              try {
                setUploading(true)
                const reader = new FileReader()
                const ext = file.name.split('.').pop()?.toLowerCase()
                reader.onload = (e) => {
                  try {
                    if (!e.target?.result) {
                      messageApi?.error('文件读取失败, 请检查文件是否损坏')
                    } else if (ext === 'dta') {
                      set_utils(utils)
                      setData(parse(new Uint8Array(e.target.result as ArrayBuffer)))
                    } else {
                      setData(read(e.target.result))
                    }
                  } catch (error) {
                    messageApi?.error(`文件读取失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
                  } finally {
                    setUploading(false)
                  }
                }
                reader.readAsArrayBuffer(file)
              } catch (error) {
                messageApi?.error(`文件读取失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
                setUploading(false)
              }
              return false
            }}
            fileList={[]}
            maxCount={0}
          >
            <Button 
              icon={<SlidersOutlined />} 
              loading={uploading}
              disabled={uploading}
            >
              点击导入数据
            </Button>
          </Upload>
        </div>
      )}
    </div>
  )
}