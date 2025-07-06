import { useRef } from 'react'
import { renderStatResult } from '../../lib/utils.ts'

export function Result({
	result,
	fitHeight,
}: {
	result: string
	fitHeight?: boolean
}) {
	const iframeRef = useRef<HTMLIFrameElement>(null)
	return (
		<iframe
			ref={iframeRef}
			srcDoc={renderStatResult(result)}
			className='w-full h-full'
			title='statResult'
			onLoad={() => {
				if (
					fitHeight &&
					iframeRef.current &&
					iframeRef.current.parentElement instanceof HTMLElement
				) {
					iframeRef.current.parentElement.style.height = `calc(${iframeRef.current.contentWindow?.document.body.scrollHeight}px + 2rem)`
					iframeRef.current.parentElement.style.overflow = 'hidden'
				}
			}}
		/>
	)
}
