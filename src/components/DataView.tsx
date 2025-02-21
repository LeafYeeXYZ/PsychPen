import { useZustand } from '../lib/useZustand'
import { ImportData } from './data/ImportData'
import { PreviewData } from './data/PreviewData'

export function DataView() {

  const { data } = useZustand()

  return (
    <div className='w-full h-full overflow-hidden'>
      {data ? <PreviewData /> : <ImportData />}
    </div>
  )
}
