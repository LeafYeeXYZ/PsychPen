import { 
  loadRPackage,
  jsArrayToRMatrix,
} from '../src/lib/utils.ts'
async function executeRCode(code: string, url: string, password: string): Promise<string> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, code }) })
  return await res.text()
}
const URL = 'http://localhost:8000/execute'
const PASSWORD = '123456'
const PACKAGES = ['psych', 'GPArotation', 'jsonlite']
const DATA = new Array(10).fill(0).map(() => new Array(50).fill(0).map(() => Math.random()))
// 使用 R 的 psych 库计算探索性因素分析
const CODE = `
# 加载所需的 R 包、数据
${loadRPackage(PACKAGES)}
data <- ${jsArrayToRMatrix(DATA)}
# 计算 Omega 系数
omega_result <- omega(data)
# 返回结果 (total omega)
json_result <- toJSON(omega_result$omega.tot)
json_result
`
const data = await executeRCode(CODE, URL, PASSWORD)
try {
  console.log(JSON.parse(JSON.parse(data).result))
} catch {
  console.log(data)
}
