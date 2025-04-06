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

async function getAI(
	enable: boolean,
	endpoint: string,
	apiKey: string,
	model: string,
): Promise<OpenAI> {
	if (!enable) {
		throw new Error('请先开启AI辅助分析')
	}
	if (!endpoint) {
		throw new Error('请填写AI服务地址')
	}
	if (!apiKey) {
		throw new Error('请填写AI服务密钥')
	}
	if (!model) {
		throw new Error('请填写AI模型ID')
	}
	const ai = new OpenAI({
		baseURL: endpoint,
		apiKey,
		dangerouslyAllowBrowser: true,
	})
	const models = await ai.models.list()
	if (!models.data.some((m) => m.id === model)) {
		throw new Error('AI模型ID不正确')
	}
	return ai
}

let ai: OpenAI | null = null
try {
	ai = await getAI(openaiEnable, openaiEndpoint, openaiApiKey, openaiModelName)
} catch {
	ai = null
}

export const useAssistant = create<AssistantState>()((set, get) => {
	return {
		_DataView_validate: async () => {
			const { openaiEnable, openaiEndpoint, openaiApiKey, model } = get()
			const ai = await getAI(openaiEnable, openaiEndpoint, openaiApiKey, model)
			set({ ai })
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
