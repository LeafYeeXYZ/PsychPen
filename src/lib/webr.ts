import type { WebR } from 'webr'

const PRE_INSTALLED_PACKAGES: string[] = ['jsonlite', 'psych']

let webr: WebR | null = null
let ready = false

import('webr')
	.then((module) => {
		webr = new module.WebR()
		return webr.init()
	})
	.then(() => {
		return webr?.installPackages(PRE_INSTALLED_PACKAGES)
	})
	.then(() => {
		ready = true
	})

export async function executeRCode(
	codeWithOutPackages: string,
	packages: string[],
): Promise<unknown> {
	if (!webr || !ready) {
		throw new Error('R语言模块正在加载中, 请稍后再试')
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
