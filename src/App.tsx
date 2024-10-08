import { useEffect, useState } from 'react'
import { Button, ConfigProvider, ThemeConfig, message } from 'antd'
import { LinkOutlined, BarChartOutlined } from '@ant-design/icons'
import { DataView } from './components/DataView'
import { PaintView } from './components/PaintView'
import { StatisticsView } from './components/StatisticsView'
import { VariableView } from './components/VariableView'
import { useZustand } from './lib/useZustand'

const ANTD_THEME: ThemeConfig = {
  token: {
    colorPrimary: '#ff8080',
    colorText: '#4c0519',
  },
}

export function App() {

  // 加载完成后切换页面标题
  useEffect(() => {
    document.title = 'PsychPen'
  }, [])
  // 页面切换
  const [page, setPage] = useState<React.ReactElement>(<DataView />)
  const { activePage, setActivePage, data, setMessageApi } = useZustand()
  // 消息实例
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => {
    setMessageApi(messageApi)
  }, [messageApi])

  return (
    <ConfigProvider theme={ANTD_THEME}>
      <main className='grid grid-rows-[auto,1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white'>
        <header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md'>
          <nav className='space-x-4'>
            <Button
              type={activePage === 'data' ? 'primary' : 'text'}
              onClick={() => {
                setActivePage('data')
                setPage(<DataView />)
              }}
              autoInsertSpace={false}
            >
              数据
            </Button>
            <Button
              type={activePage === 'variable' ? 'primary' : 'text'}
              onClick={() => {
                setActivePage('variable')
                setPage(<VariableView />)
              }}
              autoInsertSpace={false}
              disabled={data === null}
            >
              变量
            </Button>
            <Button
              type={activePage === 'paint' ? 'primary' : 'text'}
              onClick={() => {
                setActivePage('paint')
                setPage(<PaintView />)
              }}
              autoInsertSpace={false}
              disabled={data === null}
            >
              绘图
            </Button>
            <Button
              type={activePage === 'statistics' ? 'primary' : 'text'}
              onClick={() => {
                setActivePage('statistics')
                setPage(<StatisticsView />)
              }}
              autoInsertSpace={false}
              disabled={data === null}
            >
              统计
            </Button>
          </nav>
          <a 
            href='https://github.com/LeafYeeXYZ/PsychPen' 
            target='_blank' 
            className='absolute right-4 text-sm hover:underline'
          >
            <LinkOutlined /> GitHub
          </a>
          <p className='absolute left-4 text-sm'>
            <BarChartOutlined /> PsychPen
          </p>
        </header>
        {page}
      </main>
      {contextHolder}
    </ConfigProvider>
  )
}