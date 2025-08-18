import type { MessageInstance } from 'antd/es/message/interface'
import type { WebR } from 'webr'
import { create } from 'zustand'

type GlobalState = {
	getR: () => Promise<WebR>
	/**
	 * 顶栏显示的内容
	 */
	titleContent: string
	/**
	 * 统计结果
	 */
	statResult: string
	/**
	 * 设置统计结果
	 * @param statResult
	 */
	setStatResult: (statResult: string) => void
	/**
	 * 消息提示 API
	 */
	messageApi: MessageInstance | null
	/**
	 * 设置消息提示 API
	 * @param api 消息提示 API
	 */
	setMessageApi: (api: MessageInstance) => void
	/**
	 * 是否是黑暗模式
	 */
	isDarkMode: boolean
	/**
	 * 设置是否是黑暗模式
	 * @param isDarkMode 是否是黑暗模式
	 */
	setIsDarkMode: (isDarkMode: boolean) => void
	/**
	 * 是否禁用各种按钮等
	 */
	disabled: boolean
	/**
	 * 设置是否禁用各种按钮等
	 * @param disabled 是否禁用
	 */
	setDisabled: (disabled: boolean) => void
}

const PRE_INSTALLED_R_PACKAGES: string[] = ['jsonlite', 'psych']
const DEFAULT_TITLE_CONTENT = '安装R语言模块'
const R_ERROR_MESSAGE = 'R语言模块加载失败, 请刷新网页重试'

export const useStates = create<GlobalState>()((setState) => {
	let webr: WebR | null = null
	const rReady = import('webr')
		.then((module) => {
			setState({ titleContent: '初始化R语言模块' })
			webr = new module.WebR()
			return webr.init()
		})
		.then(() => {
			setState({ titleContent: '下载R语言依赖包' })
			return webr?.installPackages(PRE_INSTALLED_R_PACKAGES)
		})
		.then(() => {
			setState({ titleContent: '安装R语言依赖包' })
			return webr?.evalRVoid(
				`${PRE_INSTALLED_R_PACKAGES.map((pkg) => `library(${pkg})`).join('\n')}`,
			)
		})
		.then(() => {
			console.log('WebR Initialized Successfully')
			return
		})
		.catch((error) => {
			console.error('WebR Init Error:', error)
			return Promise.reject(new Error(R_ERROR_MESSAGE))
		})
		.finally(() => {
			setState({ titleContent: '' })
		})

	return {
		getR: async () => {
			await rReady
			if (!webr) {
				throw new Error(R_ERROR_MESSAGE)
			}
			return webr
		},
		titleContent: DEFAULT_TITLE_CONTENT,
		statResult: '',
		setStatResult: (statResult) => setState({ statResult }),
		messageApi: null,
		setMessageApi: (api) => setState({ messageApi: api }),
		disabled: false,
		setDisabled: (disabled) => setState({ disabled }),
		isDarkMode: matchMedia('(prefers-color-scheme: dark)').matches,
		setIsDarkMode: (isDarkMode) => setState({ isDarkMode }),
	}
})
