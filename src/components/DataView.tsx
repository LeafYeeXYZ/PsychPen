import { read } from 'xlsx'
import { useZustand } from '../lib/useZustand'
import { Upload, Button, Tag, Table, Popconfirm } from 'antd'
import { SlidersOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import * as ss from 'simple-statistics'

export function DataView() {

  const { data, setData, dataCols, dataRows, ACCEPT_FILE_TYPES, setDataCols, messageApi } = useZustand()
  const handleCalculate = () => { // 和 VariableView.tsx 中的 handleCalculate 函数相同
    try {
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
    } catch (error) {
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  useEffect(() => {
    data && handleCalculate()
  }, [data])
  
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