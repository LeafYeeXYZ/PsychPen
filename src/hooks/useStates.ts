import type { MessageInstance } from 'antd/es/message/interface'
import { create } from 'zustand'

type GlobalState = {
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

export const useStates = create<GlobalState>()((setState) => {
	return {
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
