import { Scatter, type ScatterConfig } from '@ant-design/plots'

export function PaintView() {

  const config: ScatterConfig = {
    paddingLeft: 60,
    data: {
      type: 'fetch',
      value: 'https://render.alipay.com/p/yuyan/180020010001215413/antd-charts/scatter-point-sequential.json',
    },
    // @ts-expect-error
    xField: (d) => new Date(d.date),
    yField: 'value',
    colorField: 'value',
    shapeField: 'point',
    style: {
      stroke: '#000',
      strokeOpacity: 0.2,
    },
    scale: {
      color: {
        palette: 'rdBu',
        // @ts-expect-error
        offset: (t) => 1 - t,
      },
    },
    tooltip: [{ channel: 'x', name: 'year', valueFormatter: (d) => d.getFullYear() }, { channel: 'y' }],
    annotations: [{ type: 'lineY', data: [0], style: { stroke: '#000', strokeOpacity: 0.2 } }],
  }
  
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex justify-center items-center w-full h-full'>
        <Scatter {...config} />
      </div>
    </div>
  )
}