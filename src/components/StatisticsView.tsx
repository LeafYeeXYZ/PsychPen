import { TTest } from '../Statistics/TTest'
import { Select } from 'antd'
import { useState } from 'react'

export function StatisticsView() {
  
  // 加入新统计: 1. 导入 2. 修改 onChange 3. 加入 select.option
  const [page, setPage] = useState<React.ReactElement>(<TTest />)
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Select
            placeholder='请选择绘图类型'
            defaultValue='TTest'
            className='w-48'
            onChange={(value) => {
              switch (value) {
                case 'TTest':
                  setPage(<TTest />)
                  break
                default:
                  break
              }
            }}
          >
            <Select.Option value='TTest'>T检验</Select.Option>
          </Select>
        </div>
        {/* 画图界面 */}
        <div className='w-full h-full overflow-auto border rounded-md'>
          {page}
        </div>
      </div>
    </div>
  )
}