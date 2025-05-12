import {
	BarChartOutlined,
	CommentOutlined,
	FrownOutlined,
	MailOutlined,
	RedoOutlined,
} from '@ant-design/icons'
import {
	Button,
	ConfigProvider,
	Drawer,
	type ThemeConfig,
	message,
	theme,
} from 'antd'
import { useEffect, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { version } from '../package.json'
import { AI } from './components/assistant/AI'
import { Debug } from './components/widgets/Debug'
import { TestLoader } from './components/widgets/TestLoader'
import { useData } from './hooks/useData'
import { MAIN_PAGES_LABELS, useNav } from './hooks/useNav'
import { useStates } from './hooks/useStates'

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
	const isDarkMode = useStates((state) => state.isDarkMode)
	const setIsDarkMode = useStates((state) => state.setIsDarkMode)
	const setMessageApi = useStates((state) => state.setMessageApi)
	const mainPage = useNav((state) => state.mainPage)
	// 消息实例
	const [messageApi, contextHolder] = message.useMessage()
	useEffect(() => {
		setMessageApi(messageApi)
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
	const [showAI, setShowAI] = useState<boolean>(false)

	return (
		<ConfigProvider theme={isDarkMode ? ANTD_THEME_DARK : ANTD_THEME_LIGHT}>
			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<main className='grid grid-rows-[auto_1fr] w-dvw h-dvh min-w-[640px] min-h-[480px] overflow-auto bg-white dark:bg-gray-950 dark:text-white'>
					<Nav setShowAI={setShowAI} />
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
				{import.meta.env.DEV && <TestLoader />}
			</ErrorBoundary>
		</ConfigProvider>
	)
}

function ErrorFallback({ error }: FallbackProps) {
	console.trace(error)
	return (
		<div className='w-dvw h-dvh flex flex-col items-center justify-center gap-6 p-6 bg-white dark:bg-gray-950 dark:text-white'>
			<div className='text-2xl'>
				<FrownOutlined style={{ margin: 0, marginRight: '0.3rem' }} />
				发生错误
			</div>
			<div className='max-w-lg border py-3 px-4 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm'>
				{error instanceof Error ? error.message : String(error)}
			</div>
			<div className='flex gap-4'>
				<div>
					<Button
						icon={<RedoOutlined />}
						onClick={() => window.location.reload()}
					>
						刷新页面 (数据不会丢失)
					</Button>
				</div>
				<div>
					<Button
						icon={<MailOutlined />}
						onClick={() => {
							window.open(
								'https://github.com/LeafYeeXYZ/PsychPen/issues',
								'_blank',
							)
						}}
					>
						反馈错误
					</Button>
				</div>
			</div>
		</div>
	)
}

function Nav({ setShowAI }: { setShowAI: (show: boolean) => void }) {
	const data = useData((state) => state.data)
	const disabled = useStates((state) => state.disabled)
	const activeMainPage = useNav((state) => state.activeMainPage)
	const setMainPage = useNav((state) => state.setMainPage)
	return (
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
					type={
						activeMainPage === MAIN_PAGES_LABELS.VARIABLE ? 'primary' : 'text'
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
					type={activeMainPage === MAIN_PAGES_LABELS.PLOTS ? 'primary' : 'text'}
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
						activeMainPage === MAIN_PAGES_LABELS.STATISTICS ? 'primary' : 'text'
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
					disabled={disabled}
					onClick={() => setShowAI(true)}
				>
					AI助手
				</Button>
			</p>
		</header>
	)
}
