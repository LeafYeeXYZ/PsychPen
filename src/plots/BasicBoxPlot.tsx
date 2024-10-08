import { Box } from '@ant-design/plots'
import { Select, Button, Form } from 'antd'
import { useZustand } from '../lib/useZustand'
import { useState } from 'react'

type Option = {
  /** 分组变量 */
  groupVar: string
  /** 数据变量 */
  dataVar: string
  /** 是否显示异常点 */
  showOutliers: boolean
}

type Config = {
  data: { [key: string]: any }[]
  boxType: 'boxplot'
  xField: string
  yField: string
  style: {
    point: boolean
  }
}

export function BasicBoxPlot() {

  const { dataCols, dataRows } = useZustand()
  const [config, setConfig] = useState<Config | null>(null)
  const handleFinish = (values: Option) => {
    try {
      const data = dataRows
        .map((row) => ({ [values.groupVar]: row[values.groupVar], [values.dataVar]: +row[values.dataVar] }))
        .sort((a, b) => a[values.groupVar] - b[values.groupVar])
      setConfig({ 
        data,
        boxType: 'boxplot',
        xField: values.groupVar,
        yField: values.dataVar,
        style: {
          point: values.showOutliers,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='w-full h-full overflow-hidden flex justify-start items-center gap-4 p-4'>

      <div className='w-1/2 h-full max-w-sm min-w-80 flex flex-col justify-center items-center rounded-md border bg-gray-50 px-4'>

        <Form<Option>
          className='w-full'
          layout='vertical'
          onFinish={handleFinish}
          autoComplete='off'
          initialValues={{
            showOutliers: true,
          }}
        >
          <Form.Item
            label='选择分组变量'
            name='groupVar'
            rules={[{ required: true, message: '请选择分组变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择分组变量'
            >
              {dataCols.map((col) => (
                <Select.Option key={col.name} value={col.name}>
                  {col.name} (水平数: {col.unique})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='选择数据变量'
            name='dataVar'
            rules={[{ required: true, message: '请选择数据变量' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择数据变量'
            >
              {dataCols.map((col) => col.type === '等距或等比数据' && (
                <Select.Option key={col.name} value={col.name}>
                  {col.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='是否显示异常点'
            name='showOutliers'
            rules={[{ required: true, message: '请选择是否显示异常点' }]}
          >
            <Select
              className='w-full'
              placeholder='请选择是否显示异常点'
            >
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
          <div
            className='flex flex-row flex-nowrap justify-center items-center gap-4'
          >
            <Button
              className='w-full mt-4'
              type='default'
              htmlType='submit'
              autoInsertSpace={false}
            >
              生成
            </Button>
            <Button
              className='w-full mt-4'
              type='default'
              autoInsertSpace={false}
              // disabled={!config}
              disabled={true}
            >
              保存图片
            </Button>
          </div>
        </Form>

      </div>

      <div className='w-full h-full flex flex-col justify-start items-center gap-4 rounded-md border bg-white overflow-auto p-4'>

        {config ? (
          <div className='w-full flex flex-col justify-center items-center relative'>
            <p className='absolute top-[50%] left-0 -rotate-90 transform -translate-x-1/2 -translate-y-1/2'>
              {/* 纵向文字 */}
              {config.yField}
            </p>
            <Box {...config} />
            <p className='text-center w-full'>
              {config.xField}
            </p>
          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <span>请选择参数并点击生成</span>
          </div>
        )}

      </div>

    </div>
  )
}