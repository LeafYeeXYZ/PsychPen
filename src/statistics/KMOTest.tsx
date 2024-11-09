import { useZustand } from '../lib/useZustand'
import { Select, Button, Form } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { KMOTest as T } from '@psych/lib'

type Option = {
  /** 变量名 */
  variables: string[]
}
type Result = {
  m: T
} & Option

export function KMOTest() {

  const { dataCols, dataRows, messageApi } = useZustand()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...')
      const timestamp = Date.now()
      const { variables } = values
      const filteredRows = dataRows.filter((row) => variables.every((variable) => typeof row[variable] !== 'undefined' && !isNaN(Number(row[variable]))))
      const data = variables.map((variable) => filteredRows.map((row) => Number(row[variable])))
      setResult({ ...values, m: new T(...data) })      
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(`数据处理失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  return (
    <div className='component-main'>

      <div className='component-form'>

        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={(values) => {
            flushSync(() => setDisabled(true))
            handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
        >
          <Form.Item
            label='所有变量'
            name='variables'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, message: '至少选择两个变量' },
            ]}
          >
            <Select
              className='w-full'
              placeholder='请选择变量'
              mode='multiple'
              options={dataCols.filter((col) => col.type === '等距或等比数据').map((col) => ({ label: col.name, value: col.name }))}
            />
          </Form.Item>
          <Form.Item>
            <Button
              className='w-full mt-4'
              type='default'
              htmlType='submit'
            >
              计算
            </Button>
          </Form.Item>
        </Form>

      </div>

      <div className='component-result'>

        {result ? (
          <div className='w-full h-full overflow-auto'>

            <p className='text-lg mb-2 text-center w-full'>KMO 检验 (Kaiser-Meyer-Olkin Measure)</p>
            <p className='text-xs mb-3 text-center w-full'>KMO 值用于评估这些变量是否适合进行因子分析, 通常要求 KMO 值大于 0.7</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>变量数</td>
                  <td>KMO</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.variables.length}</td>
                  <td>{result.m.kmo.toFixed(3)}</td>
                </tr>
              </tbody>
            </table>

            <p className='text-lg mb-2 mt-8 text-center w-full'>偏相关系数矩阵</p>
            <p className='text-xs mb-3 text-center w-full'>偏相关系数指控制其他变量后两个变量之间的相关性</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td key={Math.random()}></td>
                  {result.variables.map((variable) => (
                    <td key={Math.random()}>{variable}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.variables.map((variableA, indexA) => (
                  <tr key={Math.random()}>
                    <td>{variableA}</td>
                    {result.variables.map((_, indexB) => (
                      <td key={Math.random()}>
                        {result.m.partialCorrMatrix[indexA][indexB].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className='text-lg mb-2 mt-8 text-center w-full'>相关系数矩阵</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td key={Math.random()}></td>
                  {result.variables.map((variable) => (
                    <td key={Math.random()}>{variable}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.variables.map((variableA, indexA) => (
                  <tr key={Math.random()}>
                    <td>{variableA}</td>
                    {result.variables.map((_, indexB) => (
                      <td key={Math.random()}>
                        {result.m.corrMatrix[indexA][indexB].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <span>请填写参数并点击计算</span>
          </div>
        )}
        
      </div>

    </div>
  )
}