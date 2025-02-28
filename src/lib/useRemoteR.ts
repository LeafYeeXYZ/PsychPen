import { create } from 'zustand'

type RemoteRState = {
  /** 执行 R 代码 */
  executeRCode: (
    codeWithOutPackages: string,
    packages: string[],
  ) => Promise<unknown>
  /** R 服务地址 */
  Rurl: string
  /** R 服务密码 */
  Rpassword: string
  /** 是否启用 R 服务 */
  Renable: boolean
  /** 设置是否启用 R 服务 */
  _DataView_setRenable: (enable: boolean) => void
  /** 设置 R 服务地址 */
  _DataView_setRurl: (url: string) => void
  /** 设置 R 服务密码 */
  _DataView_setRpassword: (password: string) => void
}

export const useRemoteR = create<RemoteRState>()((set, get) => ({
  Renable: localStorage.getItem('Renable') === 'true',
  Rurl: localStorage.getItem('Rurl') ?? '',
  Rpassword: localStorage.getItem('Rpassword') ?? '',
  _DataView_setRenable: (enable) => {
    localStorage.setItem('Renable', enable ? 'true' : 'false')
    set({ Renable: enable })
  },
  _DataView_setRurl: (url) => {
    localStorage.setItem('Rurl', url)
    set({ Rurl: url })
  },
  _DataView_setRpassword: (password) => {
    localStorage.setItem('Rpassword', password)
    set({ Rpassword: password })
  },
  executeRCode: async (codeWithOutPackages, packages) => {
    const { Rurl, Rpassword, Renable } = get()
    if (!Renable) {
      throw new Error('未启用R语言服务器')
    }
    if (!Rurl) {
      throw new Error('未设置R语言服务器地址')
    }
    if (!Rpassword) {
      throw new Error('未设置R语言服务器密码')
    }
    const code = `${packages.map((p) => `\nif (!requireNamespace("${p}", quietly = TRUE)) {\n  install.packages("${p}")\n}\nlibrary(${p})\n`).join('')}\n${codeWithOutPackages}`
    const res = await fetch(Rurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: Rpassword, code }),
    })
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      if (json.status === 'error') {
        throw new Error(json.message)
      } else {
        try {
          return JSON.parse(json.result)
        } catch {
          return json.result
        }
      }
    } catch (e) {
      throw e instanceof Error ? e : new Error(text)
    }
  },
}))
