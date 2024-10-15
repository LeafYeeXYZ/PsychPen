import { useEffect, useState } from 'react'
import { Button, ConfigProvider, ThemeConfig, message } from 'antd'
import { LinkOutlined, BarChartOutlined } from '@ant-design/icons'
import { DataView } from './components/DataView'
import { PaintView } from './components/PaintView'
import { StatisticsView } from './components/StatisticsView'
import { VariableView } from './components/VariableView'
import { ToolView } from './components/ToolView'
import { useZustand } from './lib/useZustand'
import { flushSync } from 'react-dom'

const ANTD_THEME: ThemeConfig = {
  token: {
    colorPrimary: '#ff8080',
    colorText: '#4c0519',
  },
}

export function App() {

  const { data, setMessageApi, isLargeData, disabled, setDisabled } = useZustand()
  // 加载完成后切换页面标题
  useEffect(() => {
    document.title = 'PsychPen'
  }, [])
  // 页面切换 (仅 data 页面在数据变量较多时会有明显加载时间)
  const [page, setPage] = useState<React.ReactElement>(<DataView />)
  const [activePage, setActivePage] = useState<string>('data')
  // 消息实例
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => {
    setMessageApi(messageApi)
  }, [messageApi, setMessageApi])

  return (
    <ConfigProvider theme={ANTD_THEME}>
      <main className='grid grid-rows-[auto,1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white'>
        <header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md'>
          <nav className='space-x-4'>
            <Button
              type={activePage === 'data' ? 'primary' : 'text'}
              onClick={async () => {
                if (activePage === 'data') return
                isLargeData && messageApi.open({
                  type: 'loading',
                  content: '正在处理数据...',
                  duration: 0,
                })
                isLargeData && flushSync(() => setDisabled(true))
                isLargeData && await new Promise((resolve) => setTimeout(resolve, 500))
                flushSync(() => {
                  setPage(<DataView />)
                  setActivePage('data')
                })
                messageApi.destroy()
                setDisabled(false)
              }}
              autoInsertSpace={false}
              disabled={disabled}
            >
              数据
            </Button>
            <Button
              type={activePage === 'variable' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'variable') return
                setPage(<VariableView />)
                setActivePage('variable')
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              变量
            </Button>
            <Button
              type={activePage === 'paint' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'paint') return
                setPage(<PaintView />)
                setActivePage('paint')
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              绘图
            </Button>
            <Button
              type={activePage === 'statistics' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'statistics') return
                setPage(<StatisticsView />)
                setActivePage('statistics')
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              统计
            </Button>
            <Button
              type={activePage === 'tool' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'tool') return
                setPage(<ToolView />)
                setActivePage('tool')
              }}
              autoInsertSpace={false}
              disabled={disabled}
            >
              工具
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