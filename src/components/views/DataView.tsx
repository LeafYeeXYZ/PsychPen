import { useData } from '../../hooks/useData'
import { ImportData } from '../data/ImportData'
import { PreviewData } from '../data/PreviewData'

export function DataViewElement() {
	const data = useData((state) => state.data)

	return (
		<div className='w-full h-full overflow-hidden'>
			{data ? <PreviewData /> : <ImportData />}
		</div>
	)
}
