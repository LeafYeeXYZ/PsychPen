import { renderStatResult } from '../../lib/utils'

export function Result({ result }: { result: string }) {
	return (
		<iframe
			srcDoc={renderStatResult(result)}
			className='w-full h-full'
			title='statResult'
		/>
	)
}
