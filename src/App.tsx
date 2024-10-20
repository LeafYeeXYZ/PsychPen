import { useEffect, useState } from 'react'
import { Button, ConfigProvider, ThemeConfig, message } from 'antd'
import { LinkOutlined, BarChartOutlined } from '@ant-design/icons'
import { DataView } from './components/DataView'
import { PlotsView } from './components/PlotsView'
import { StatisticsView } from './components/StatisticsView'
import { VariableView } from './components/VariableView'
import { ToolsView } from './components/ToolsView'
import { useZustand } from './lib/useZustand'

const ANTD_THEME: ThemeConfig = {
  token: {
    colorPrimary: '#ff8080',
    colorText: '#4c0519',
  },
}

export function App() {

  const { data, _App_setMessageApi, disabled } = useZustand()
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
    _App_setMessageApi(messageApi)
  }, [messageApi, _App_setMessageApi])

  return (
    <ConfigProvider theme={ANTD_THEME}>
      <main className='grid grid-rows-[auto,1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white'>
        <header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md'>
          <nav className='space-x-4'>
            <Button
              type={activePage === 'data' ? 'primary' : 'text'}
              onClick={async () => {
                if (activePage === 'data') return
                setPage(<DataView />)
                setActivePage('data')
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
              type={activePage === 'plots' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'plots') return
                setPage(<PlotsView />)
                setActivePage('plots')
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
              type={activePage === 'tools' ? 'primary' : 'text'}
              onClick={() => {
                if (activePage === 'tools') return
                setPage(<ToolsView />)
                setActivePage('tools')
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