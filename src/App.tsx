import { useEffect, useState } from 'react'
import { Button, ConfigProvider, type ThemeConfig, message, theme } from 'antd'
import { LinkOutlined, BarChartOutlined } from '@ant-design/icons'
import { DataView } from './components/DataView'
import { PlotsView } from './components/PlotsView'
import { StatisticsView } from './components/StatisticsView'
import { VariableView } from './components/VariableView'
import { ToolsView } from './components/ToolsView'
import { useZustand } from './lib/useZustand'
import Bowser from 'bowser'

const ANTD_THEME_LIGHT: ThemeConfig = {
  token: {
    colorPrimary: '#ff8080',
    colorText: '#4c0519',
  },
}

const ANTD_THEME_DARK: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#ff8080',
    colorText: '#ffffff',
  },
}

export function App() {

  const { data, _App_setMessageApi, disabled, isDarkMode, _App_setIsDarkMode } = useZustand()
  // 加载完成后切换页面标题
  useEffect(() => {
    document.title = 'PsychPen'
  }, [])
  // 页面切换
  const [page, setPage] = useState<React.ReactElement>(<DataView />)
  const [activePage, setActivePage] = useState<string>('data')
  // 消息实例
  const [messageApi, contextHolder] = message.useMessage()
  // 检查浏览器版本
  useEffect(() => {
    _App_setMessageApi(messageApi)
    const browser = Bowser.getParser(window.navigator.userAgent)
    const valid = browser.satisfies({
      chrome: '>=110',
      firefox: '>=115',
      safari: '>=16',
      edge: '>=110',
    })
    valid || messageApi.warning('当前浏览器版本较低, 可能会导致部分功能无法正常使用, 请使用最新版本的 Chrome, Firefox, Safari 或 Edge 浏览器', 8)
  }, [messageApi, _App_setMessageApi])
  // 动态设置主题
  useEffect(() => {
    const getIsDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches
    const subIsDarkMode = () => _App_setIsDarkMode(getIsDarkMode())
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', subIsDarkMode)
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', subIsDarkMode)
  }, [_App_setIsDarkMode])

  return (
    <ConfigProvider theme={isDarkMode ? ANTD_THEME_DARK : ANTD_THEME_LIGHT}>
      <main className='grid grid-rows-[auto,1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white dark:bg-gray-950 dark:text-white'>
        <header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md dark:bg-gray-900'>
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