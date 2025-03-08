import { useData } from '../../lib/hooks/useData'
import { useStates } from '../../lib/hooks/useStates'
import { useRemoteR } from '../../lib/hooks/useRemoteR'
import { Select, Button, Form, Radio, InputNumber } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { AlphaRealiability } from '@psych/lib'
import { jsArrayToRMatrix, sleep } from '../../lib/utils'

type Option = {
  /** 变量名 */
  variables: string[]
  /** 分组变量 */
  group?: string
  /** 是否计算 Omega 系数 */
  calculateOmega?: boolean
  /** Omega 系数的因子数 */
  manualNFactors?: number
}
type Result = {
  m: AlphaRealiability
  omega?: number[]
} & Option

export function HomoReliability() {
  const { dataCols, dataRows, isLargeData } = useData()
  const { messageApi } = useStates()
  const { Renable, executeRCode } = useRemoteR()
  const [result, setResult] = useState<Result | null>(null)
  const [disabled, setDisabled] = useState<boolean>(false)
  const handleCalculate = async (values: Option) => {
    try {
      messageApi?.loading('正在处理数据...', 0)
      isLargeData && (await sleep())
      const timestamp = Date.now()
      const { variables, group, calculateOmega, manualNFactors } = values
      const filteredRows = dataRows
        .filter((row) =>
          variables.every(
            (variable) =>
              typeof row[variable] !== 'undefined' &&
              !isNaN(Number(row[variable])),
          ),
        )
        .filter((row) => !group || typeof row[group] !== 'undefined')
      const items = variables.map((variable) =>
        filteredRows.map((row) => Number(row[variable])),
      )
      const m = new AlphaRealiability(
        items,
        typeof group === 'string'
          ? filteredRows.map((row) => String(row[group]))
          : undefined,
      )
      if (calculateOmega) {
        const code = (data: number[][]) => `
          data <- ${jsArrayToRMatrix(data, true)}
          omega_result <- omega(data${manualNFactors ? `, nfactors = ${manualNFactors}` : ''})
          json_result <- toJSON(omega_result$omega.tot)
          json_result
        `
        if (m.group.length > 1) {
          const omega: number[] = []
          for (const g of m.group) {
            const rows = filteredRows.filter((row) => row[group!] === g)
            const items = variables.map((variable) =>
              rows.map((row) => Number(row[variable])),
            )
            const result = (await executeRCode(code(items), [
              'psych',
              'jsonlite',
              'GPArotation',
            ])) as number[]
            omega.push(result[0])
          }
          setResult({ m, omega, ...values })
        } else {
          const omega = (await executeRCode(code(items), [
            'psych',
            'jsonlite',
            'GPArotation',
          ])) as number[]
          setResult({ m, omega, ...values })
        }
      } else {
        setResult({ m, ...values })
      }
      messageApi?.destroy()
      messageApi?.success(`数据处理完成, 用时 ${Date.now() - timestamp} 毫秒`)
    } catch (error) {
      messageApi?.destroy()
      messageApi?.error(
        `数据处理失败: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    <div className='component-main'>
      <div className='component-form'>
        <Form<Option>
          className='w-full py-4 overflow-auto'
          layout='vertical'
          onFinish={async (values) => {
            flushSync(() => setDisabled(true))
            await handleCalculate(values)
            flushSync(() => setDisabled(false))
          }}
          autoComplete='off'
          disabled={disabled}
          initialValues={{ calculateOmega: false }}
        >
          <Form.Item
            label='量表的所有变量'
            name='variables'
            rules={[
              { required: true, message: '请选择变量' },
              { type: 'array', min: 2, message: '至少选择两个变量' },
            ]}
          >
            <Select className='w-full' placeholder='请选择变量' mode='multiple'>
              {dataCols.map(
                (col) =>
                  col.type === '等距或等比数据' && (
                    <Select.Option key={col.name} value={col.name}>
                      {col.name}
                    </Select.Option>
                  ),
              )}
            </Select>
          </Form.Item>
          <Form.Item label='分组变量(可选)' name='group'>
            <Select
              className='w-full'
              placeholder='请选择变量'
              options={dataCols.map((col) => ({
                label: `${col.name} (水平数: ${col.unique})`,
                value: col.name,
              }))}
              allowClear
            />
          </Form.Item>
          <Form.Item
            label='Omega 系数'
            name='calculateOmega'
            rules={[{ required: true, message: '请选择是否计算 Omega 系数' }]}
          >
            <Radio.Group block disabled={!Renable} buttonStyle='solid'>
              <Radio.Button value={true}>计算</Radio.Button>
              <Radio.Button value={false}>不计算</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='手动指定 Omega 系数的因子数' name='manualNFactors'>
            <InputNumber
              addonBefore='提取'
              addonAfter='个因子'
              placeholder='留空则自动计算'
              className='w-full'
              min={1}
              step={1}
              disabled={!Renable}
            />
          </Form.Item>
          <Form.Item>
            <Button className='w-full mt-4' type='default' htmlType='submit'>
              计算
            </Button>
          </Form.Item>
          <p className='w-full text-center text-xs text-gray-400 mt-5'>
            如果除了 Alpha 系数外, 还想计算 Omega 系数
          </p>
          <p className='w-full text-center text-xs text-gray-400 mt-1'>
            请在数据视图右上角的设置中启用联网功能
          </p>
        </Form>
      </div>

      <div className='component-result'>
        {result ? (
          <div className='w-full h-full overflow-auto'>
            <p className='text-lg mb-2 text-center w-full'>同质性信度分析</p>
            <table className='three-line-table'>
              <thead>
                <tr>
                  <td>分组</td>
                  <td>量表题目数</td>
                  <td>alpha 系数</td>
                  {result.omega && <td>omega 系数</td>}
                </tr>
              </thead>
              <tbody>
                {result.m.alpha.map((a, i) => (
                  <tr key={i}>
                    <td>{result.m.group[i]}</td>
                    <td>{result.variables.length}</td>
                    <td>{a.toFixed(3)}</td>
                    {result.omega && <td>{result.omega[i].toFixed(3)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='text-xs mt-3 text-center w-full'>
              应用中, alpha 的值至少要大于 0.5, 最好能大于 0.7
            </p>
            <p className='text-xs mt-2 text-center w-full'>
              量表题目: {result.variables.join(', ')}
            </p>
            {result.group && (
              <p className='text-xs mt-2 text-center w-full'>
                分组变量: {result.group}
              </p>
            )}
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
