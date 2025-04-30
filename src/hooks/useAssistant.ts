import OpenAI from 'openai'
import { create } from 'zustand'

type AssistantState = {
	ai: OpenAI | null
	model: string
	openaiEndpoint: string
	openaiApiKey: string
	openaiEnable: boolean
	_DataView_setModel: (modelName: string) => void
	_DataView_setOpenaiEndpoint: (endpoint: string) => void
	_DataView_setOpenaiApiKey: (apiKey: string) => void
	_DataView_setOpenaiEnable: (enable: boolean) => void
	_DataView_validate: () => Promise<void>
}

const openaiEndpoint = localStorage.getItem('openaiEndpoint') ?? ''
const openaiApiKey = localStorage.getItem('openaiApiKey') ?? ''
const openaiModelName = localStorage.getItem('openaiModelName') ?? ''
const openaiEnable = localStorage.getItem('openaiEnable') === 'true'
const ai: OpenAI | null =
	openaiEnable && openaiApiKey && openaiEndpoint && openaiModelName
		? new OpenAI({
				baseURL: openaiEndpoint,
				apiKey: openaiApiKey,
				dangerouslyAllowBrowser: true,
			})
		: null

export const useAssistant = create<AssistantState>()((set, get) => {
	return {
		_DataView_validate: async () => {
			const { openaiEnable, openaiEndpoint, openaiApiKey, model } = get()
			if (!openaiEnable) {
				throw new Error('请先开启AI辅助分析')
			}
			if (!openaiEndpoint) {
				throw new Error('请填写要使用的AI服务的API地址')
			}
			if (!openaiApiKey) {
				throw new Error('请填写要使用的AI服务的API密钥')
			}
			if (!model) {
				throw new Error('请填写要使用的AI模型名称ID')
			}
			set({
				ai: new OpenAI({
					baseURL: openaiEndpoint,
					apiKey: openaiApiKey,
					dangerouslyAllowBrowser: true,
				}),
			})
		},
		openaiEndpoint,
		openaiApiKey,
		openaiEnable,
		model: openaiModelName,
		ai,
		_DataView_setOpenaiEndpoint: (endpoint) => {
			localStorage.setItem('openaiEndpoint', endpoint)
			set({ openaiEndpoint: endpoint, ai: null })
		},
		_DataView_setOpenaiApiKey: (apiKey) => {
			localStorage.setItem('openaiApiKey', apiKey)
			set({ openaiApiKey: apiKey, ai: null })
		},
		_DataView_setModel: (modelName) => {
			localStorage.setItem('openaiModelName', modelName)
			set({ model: modelName, ai: null })
		},
		_DataView_setOpenaiEnable: (enable) => {
			localStorage.setItem('openaiEnable', enable ? 'true' : 'false')
			set({ openaiEnable: enable, ai: null })
		},
	}
})
