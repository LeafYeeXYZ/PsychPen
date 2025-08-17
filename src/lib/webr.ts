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
		return webr?.evalRVoid(
			`${PRE_INSTALLED_PACKAGES.map((pkg) => `library(${pkg})`).join('\n')}`,
		)
	})
	.then(() => {
		console.log('WebR Initialized Successfully')
		return
	})
	.catch((error) => {
		console.error('WebR Init Error:', error)
		return Promise.reject(new Error('R语言模块加载失败, 请刷新网页重试'))
	})

export async function getR(): Promise<WebR> {
	await ready
	if (!webr) {
		throw new Error('R语言模块加载失败, 请刷新网页重试')
	}
	return webr
}
