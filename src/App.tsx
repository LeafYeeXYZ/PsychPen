import { BarChartOutlined, CommentOutlined } from '@ant-design/icons'
import {
	Button,
	ConfigProvider,
	Drawer,
	type ThemeConfig,
	message,
	theme,
} from 'antd'
import Bowser from 'bowser'
import { useEffect, useState } from 'react'
import { version } from '../package.json'
import { AI } from './components/AI'
import { Debug } from './components/widgets/Debug'
import { useAssistant } from './lib/hooks/useAssistant'
import { useData } from './lib/hooks/useData'
import { MAIN_PAGES_LABELS, useNav } from './lib/hooks/useNav'
import { useStates } from './lib/hooks/useStates'

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
	const data = useData((state) => state.data)
	const disabled = useStates((state) => state.disabled)
	const isDarkMode = useStates((state) => state.isDarkMode)
	const setIsDarkMode = useStates((state) => state.setIsDarkMode)
	const setMessageApi = useStates((state) => state.setMessageApi)
	// 页面切换
	const { activeMainPage, mainPage, setMainPage } = useNav()
	// 消息实例
	const [messageApi, contextHolder] = message.useMessage()
	// 检查浏览器版本
	useEffect(() => {
		setMessageApi(messageApi)
		const browser = Bowser.getParser(navigator.userAgent)
		const valid = browser.satisfies({
			chrome: '>=110',
			firefox: '>=115',
			safari: '>=16',
			edge: '>=110',
		})
		valid ||
			messageApi.warning(
				'当前浏览器版本较低, 可能会导致部分功能无法正常使用, 请使用最新版本的 Chrome, Firefox, Safari 或 Edge 浏览器',
				8,
			)
	}, [messageApi, setMessageApi])
	// 动态设置主题
	useEffect(() => {
		const getIsDarkMode = () =>
			matchMedia('(prefers-color-scheme: dark)').matches
		const subIsDarkMode = () => setIsDarkMode(getIsDarkMode())
		matchMedia('(prefers-color-scheme: dark)').addEventListener(
			'change',
			subIsDarkMode,
		)
		return () =>
			matchMedia('(prefers-color-scheme: dark)').removeEventListener(
				'change',
				subIsDarkMode,
			)
	}, [setIsDarkMode])
	// AI助手
	const ai = useAssistant((state) => state.ai)
	const [showAI, setShowAI] = useState<boolean>(false)

	return (
		<ConfigProvider theme={isDarkMode ? ANTD_THEME_DARK : ANTD_THEME_LIGHT}>
			<main className='grid grid-rows-[auto_1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white dark:bg-gray-950 dark:text-white'>
				<header className='flex justify-center items-center relative py-3 px-4 bg-gray-100 shadow-md dark:bg-gray-900'>
					<nav className='space-x-4'>
						<Button
							type={
								activeMainPage === MAIN_PAGES_LABELS.DATA ? 'primary' : 'text'
							}
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
							type={
								activeMainPage === MAIN_PAGES_LABELS.VARIABLE
									? 'primary'
									: 'text'
							}
							onClick={() => {
								if (activeMainPage === MAIN_PAGES_LABELS.VARIABLE) return
								setMainPage(MAIN_PAGES_LABELS.VARIABLE)
							}}
							autoInsertSpace={false}
							disabled={data === null || disabled}
						>
							变量
						</Button>
						<Button
							type={
								activeMainPage === MAIN_PAGES_LABELS.PLOTS ? 'primary' : 'text'
							}
							onClick={() => {
								if (activeMainPage === MAIN_PAGES_LABELS.PLOTS) return
								setMainPage(MAIN_PAGES_LABELS.PLOTS)
							}}
							autoInsertSpace={false}
							disabled={data === null || disabled}
						>
							绘图
						</Button>
						<Button
							type={
								activeMainPage === MAIN_PAGES_LABELS.STATISTICS
									? 'primary'
									: 'text'
							}
							onClick={() => {
								if (activeMainPage === MAIN_PAGES_LABELS.STATISTICS) return
								setMainPage(MAIN_PAGES_LABELS.STATISTICS)
							}}
							autoInsertSpace={false}
							disabled={data === null || disabled}
						>
							统计
						</Button>
						<Button
							type={
								activeMainPage === MAIN_PAGES_LABELS.TOOLS ? 'primary' : 'text'
							}
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
						<a
							href='https://github.com/LeafYeeXYZ/PsychPen'
							target='_blank'
							rel='noreferrer'
							className='hover:underline'
						>
							<BarChartOutlined /> PsychPen v{version}
						</a>
					</p>
					<p className='absolute right-2 text-sm'>
						<Button
							type='text'
							icon={<CommentOutlined />}
							disabled={data === null || disabled || ai === null}
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
			{import.meta.env.DEV && <Debug />}
		</ConfigProvider>
	)
}
