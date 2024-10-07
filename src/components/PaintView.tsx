import { BoxPlot } from '../plots/BoxPlot'

export function PaintView() {
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex justify-center items-center w-full h-full'>
        <BoxPlot />
      </div>
    </div>
  )
}