export function jsObjectToRDataFrame(obj: Record<string, number[]>): string {
  return `data.frame(\n${Object.entries(obj).map(([key, value]) => `${key} = c(${value.join(', ')})`).join(',\n')}\n)`
}
export function jsArrayToRDataFrame(arr: number[][]): string {
  return `data.frame(\n${arr.map((value, index) => `var${index + 1} = c(${value.join(', ')})`).join(',\n')}\n)`
}
export function loadRPackage(pkg: string | string[]): string {
  typeof pkg === 'string' && (pkg = [pkg])
  return pkg.map((p) => `\nif (!requireNamespace("${p}", quietly = TRUE)) {\n  install.packages("${p}")\n}\nlibrary(${p})\n`).join('')
}
export async function executeRCode(code: string, url: string, password: string): Promise<string> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, code }) })
  return await res.text()
}
