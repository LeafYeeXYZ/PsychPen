import { Box } from '@ant-design/plots'

export type BoxPlotProps = {
  /** 数据 */
  data: any[]
  /** 类型 */
  boxType: 'boxplot'
  /** X 轴字段 */
  xField: string
  /** Y 轴字段 */
  yField: string
}

export function BoxPlot() {
  const config = {
    data: {
      type: 'fetch',
      value: 'https://assets.antv.antgroup.com/g2/morley.json',
    },
    boxType: 'boxplot',
    xField: 'Expt',
    yField: 'Speed',
  };
  return <Box {...config} />
}