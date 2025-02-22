import { useEffect, useState } from 'react'
import { useZustand } from './lib/useZustand'
import { useNav, MAIN_PAGES_LABELS } from './lib/useNav'
import { Button, ConfigProvider, type ThemeConfig, message, theme, Drawer } from 'antd'
import { BarChartOutlined, CommentOutlined } from '@ant-design/icons'
import Bowser from 'bowser'
import { version } from '../package.json'
import { useAssistant } from './lib/useAssistant'
import { AI } from './components/AI'

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
  // 页面切换
  const { activeMainPage, mainPage, setMainPage } = useNav()
  // 消息实例
  const [messageApi, contextHolder] = message.useMessage()
  // 检查浏览器版本
  useEffect(() => {
    _App_setMessageApi(messageApi)
    const browser = Bowser.getParser(navigator.userAgent)
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
    const getIsDarkMode = () => matchMedia('(prefers-color-scheme: dark)').matches
    const subIsDarkMode = () => _App_setIsDarkMode(getIsDarkMode())
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', subIsDarkMode)
    return () => matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', subIsDarkMode)
  }, [_App_setIsDarkMode])
  // AI助手
  const { ai } = useAssistant()
  const [showAI, setShowAI] = useState<boolean>(false)

  return (
    <ConfigProvider theme={isDarkMode ? ANTD_THEME_DARK : ANTD_THEME_LIGHT}>
      <main className='grid grid-rows-[auto_1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white dark:bg-gray-950 dark:text-white'>
        <header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md dark:bg-gray-900'>
          <nav className='space-x-4'>
            <Button
              type={activeMainPage === MAIN_PAGES_LABELS.DATA ? 'primary' : 'text'}
              onClick={() => {
                if (activeMainPage === MAIN_PAGES_LABELS.DATA) return
                setMainPage(MAIN_PAGES_LABELS.DATA)
              }}
              autoInsertSpace={false}
              disabled={disabled}
            >
              数据
            </Button>
            <Button
              type={activeMainPage === MAIN_PAGES_LABELS.VARIABLE ? 'primary' : 'text'}
              onClick={() => {
                if (activeMainPage === MAIN_PAGES_LABELS.VARIABLE) return
                setMainPage(MAIN_PAGES_LABELS.VARIABLE)
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              变量
            </Button>
            <Button
              type={activeMainPage === MAIN_PAGES_LABELS.PLOTS ? 'primary' : 'text'}
              onClick={() => {
                if (activeMainPage === MAIN_PAGES_LABELS.PLOTS) return
                setMainPage(MAIN_PAGES_LABELS.PLOTS)
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              绘图
            </Button>
            <Button
              type={activeMainPage === MAIN_PAGES_LABELS.STATISTICS ? 'primary' : 'text'}
              onClick={() => {
                if (activeMainPage === MAIN_PAGES_LABELS.STATISTICS) return
                setMainPage(MAIN_PAGES_LABELS.STATISTICS)
              }}
              autoInsertSpace={false}
              disabled={(data === null) || disabled}
            >
              统计
            </Button>
            <Button
              type={activeMainPage === MAIN_PAGES_LABELS.TOOLS ? 'primary' : 'text'}
              onClick={() => {
                if (activeMainPage === MAIN_PAGES_LABELS.TOOLS) return
                setMainPage(MAIN_PAGES_LABELS.TOOLS)
              }}
              autoInsertSpace={false}
              disabled={disabled}
            >
              工具
            </Button>
          </nav>
          <p className='absolute left-4 text-sm text-rose-950 dark:text-white'>
            <a href='https://github.com/LeafYeeXYZ/PsychPen' target='_blank' rel='noreferrer' className='hover:underline'>
              <BarChartOutlined /> PsychPen v{version}
            </a>
          </p>
          <p className='absolute right-2 text-sm'>
            <Button
              type='text'
              icon={<CommentOutlined />}
              disabled={(data === null) || disabled || (ai === null)}
              onClick={() => setShowAI(true)}
            >
              Ask AI
            </Button>
          </p>
        </header>
        {mainPage}
      </main>
      <Drawer
        placement='right'
        open={showAI}
        onClose={() => setShowAI(false)}
        closable={false}
        width={Math.min(window.innerWidth - 200, 720)}
      >
        <AI />
      </Drawer>
      {contextHolder}
    </ConfigProvider>
  )
}