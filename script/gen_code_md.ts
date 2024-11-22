/**
 * 把项目 src 目录下的所有 .ts/.tsx 文件的代码  
 * 集中到一个 markdown 文件中  
 * 以供软件制作权申请材料使用  
 */

import fs from 'node:fs/promises'
import { resolve } from 'node:path'

const FILE_TYPES = ['.ts', '.tsx', '.css']
const CODE_PATH = resolve(import.meta.dirname, '../src')
const OUTPUT_PATH = resolve(import.meta.dirname, 'code.md')

console.time('Generate code markdown file done')

const files = await fs.readdir(CODE_PATH, { recursive: true })
const tsFiles = files.filter(file => FILE_TYPES.some(type => file.endsWith(type)))

const code = await Promise.all(tsFiles.map(async file => {
  const content = await fs.readFile(resolve(CODE_PATH, file), 'utf-8')
  return `// 代码路径: ${file}\n${content}`
}))
await fs.writeFile(OUTPUT_PATH, `\`\`\`\n${code.join('\n\n')}\n\`\`\``)

console.timeEnd('Generate code markdown file done')
