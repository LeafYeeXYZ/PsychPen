import type { WebR } from 'webr'

const PRE_INSTALLED_PACKAGES: string[] = ['jsonlite', 'psych']

let webr: WebR | null = null

const ready = import('webr')
	.then((module) => {
		webr = new module.WebR()
		return webr.init()
	})
	.then(() => {
		return webr?.installPackages(PRE_INSTALLED_PACKAGES)
	})
	.then(() => {
		return webr?.evalRVoid(`${PRE_INSTALLED_PACKAGES.map(pkg => `library(${pkg})`).join('\n')}`)
	})
	.then(() => {
		return
	})
	.catch((error) => {
		console.error('WebR Init Error:', error)
		return Promise.reject(new Error('R语言模块加载失败, 请刷新网页重试'))
	})

export async function executeRCode(
	codeWithOutPackages: string,
	packages: string[],
): Promise<unknown> {
	await ready
	if (!webr) {
		throw new Error('R语言模块加载失败, 请刷新网页重试')
	}
	if (packages.some((v) => !PRE_INSTALLED_PACKAGES.includes(v))) {
		await webr.installPackages(packages)
	}
	const libraryCode = packages.map((v) => `library(${v})`).join('\n')
	const result = await webr.evalRString(
		`${libraryCode}\n${codeWithOutPackages}`,
	)
	const data = JSON.parse(result)
	return data
}
