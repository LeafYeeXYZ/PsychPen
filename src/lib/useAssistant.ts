import { create } from 'zustand'
import OpenAI from 'openai'

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
}

let timer: number | null = null
const delay = 1000

const openaiEndpoint = localStorage.getItem('openaiEndpoint') ?? ''
const openaiApiKey = localStorage.getItem('openaiApiKey') ?? ''
const openaiModelName = localStorage.getItem('openaiModelName') ?? ''
const openaiEnable = localStorage.getItem('openaiEnable') === 'true'

async function getAI(enable: boolean, endpoint: string, apiKey: string, model: string): Promise<OpenAI | null> {
  try {
    if (!enable || !endpoint || !apiKey || !model) {
      return null
    }
    const ai = new OpenAI({
      baseURL: endpoint,
      apiKey,
      dangerouslyAllowBrowser: true,
    })
    const models = (await ai.models.list()).data
    if (!models.some((m) => m.id === model)) {
      return null
    }
    return ai
  } catch {
    return null
  }
}

export const useAssistant = create<AssistantState>()((set, get) => {
  getAI(openaiEnable, openaiEndpoint, openaiApiKey, openaiModelName).then((ai) => {
    set({ ai })
  }).catch(() => {})
  return {
    openaiEndpoint,
    openaiApiKey,
    openaiEnable,
    model: openaiModelName,
    ai: null,
    _DataView_setOpenaiEndpoint: (endpoint) => {
      localStorage.setItem('openaiEndpoint', endpoint)
      set({ openaiEndpoint: endpoint })
      if (timer) {
        clearTimeout(timer)
      }
      const { openaiEnable, openaiApiKey, model } = get()
      timer = setTimeout(async () => {
        const ai = await getAI(openaiEnable, endpoint, openaiApiKey, model)
        set({ ai })
      }, delay)
    },
    _DataView_setOpenaiApiKey: (apiKey) => {
      localStorage.setItem('openaiApiKey', apiKey)
      set({ openaiApiKey: apiKey })
      if (timer) {
        clearTimeout(timer)
      }
      const { openaiEnable, openaiEndpoint, model } = get()
      timer = setTimeout(async () => {
        const ai = await getAI(openaiEnable, openaiEndpoint, apiKey, model)
        set({ ai })
      }, delay)
    },
    _DataView_setOpenaiEnable: (enable) => {
      localStorage.setItem('openaiEnable', enable ? 'true' : 'false')
      set({ openaiEnable: enable })
      if (timer) {
        clearTimeout(timer)
      }
      const { openaiEndpoint, openaiApiKey, model } = get()
      timer = setTimeout(async () => {
        const ai = await getAI(enable, openaiEndpoint, openaiApiKey, model)
        set({ ai })
      }, delay)
    },
    _DataView_setModel: (modelName) => {
      localStorage.setItem('openaiModelName', modelName)
      set({ model: modelName })
      if (timer) {
        clearTimeout(timer)
      }
      const { openaiEnable, openaiEndpoint, openaiApiKey } = get()
      timer = setTimeout(async () => {
        const ai = await getAI(openaiEnable, openaiEndpoint, openaiApiKey, modelName)
        set({ ai })
      }, delay)
    },
  }
})
