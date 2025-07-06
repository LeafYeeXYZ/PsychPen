import { useData } from '../../hooks/useData.ts'
import { ImportData } from '../data/ImportData.tsx'
import { PreviewData } from '../data/PreviewData.tsx'

export function DataViewElement() {
	const data = useData((state) => state.data)

	return (
		<div className='w-full h-full overflow-hidden'>
			{data ? <PreviewData /> : <ImportData />}
		</div>
	)
}
