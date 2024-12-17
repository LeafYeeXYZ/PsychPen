import { importSheet, type ImportTypes } from '@psych/sheet'

declare const self: Worker

self.addEventListener('message', async (event) => {
  const { file, ext } = event.data as { file: ArrayBuffer, ext: ImportTypes }
  try {
    const data = await importSheet(file, ext)
    self.postMessage({ success: true, data })
  } catch (error) {
    self.postMessage({ success: false, error })
  }
})
