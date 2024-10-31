import { useState } from 'react'
import { InputNumber, Space, Form, Tag } from 'antd'
import { z2p, p2z, t2p, p2t, f2p, p2f } from 'psych-wasm'

const DEFAULT_VALUES = {
  zS: 0,
  zP: 0.5,
  tS: 0,
  tDf: 30,
  tP: 0.05,
  fDf: [1, 30] as [number, number],
  fS: 1,
  fP: 0.05,
}

export function StatisticToPvalue() {

  // z -> p
  const [zS, setZS] = useState<number>(DEFAULT_VALUES.zS)
  // p -> z
  const [zP, setZP] = useState<number>(DEFAULT_VALUES.zP)
  // t -> p (单尾)
  const [tDf1a, setTDf1a] = useState<number>(DEFAULT_VALUES.tDf)
  const [tS1, setTS1] = useState<number>(DEFAULT_VALUES.tS)
  // p -> t (单尾)
  const [tDf1b, setTDf1b] = useState<number>(DEFAULT_VALUES.tDf)
  const [tP1, setTP1] = useState<number>(DEFAULT_VALUES.tP)
  // t -> p (双尾)
  const [tDf2a, setTDf2a] = useState<number>(DEFAULT_VALUES.tDf)
  const [tS2, setTS2] = useState<number>(DEFAULT_VALUES.tS)
  // p -> t (双尾)
  const [tDf2b, setTDf2b] = useState<number>(DEFAULT_VALUES.tDf)
  const [tP2, setTP2] = useState<number>(DEFAULT_VALUES.tP)
  // f -> p (单尾)
  const [fDf1a, setFDf1a] = useState<[number, number]>(DEFAULT_VALUES.fDf)
  const [fS1, setFS1] = useState<number>(DEFAULT_VALUES.fS)
  // p -> f (单尾)
  const [fDf1b, setFDf1b] = useState<[number, number]>(DEFAULT_VALUES.fDf)
  const [fP1, setFP1] = useState<number>(DEFAULT_VALUES.fP)
  // f -> p (双尾)
  const [fDf2a, setFDf2a] = useState<[number, number]>(DEFAULT_VALUES.fDf)
  const [fS2, setFS2] = useState<number>(DEFAULT_VALUES.fS)
  // p -> f (双尾)
  const [fDf2b, setFDf2b] = useState<[number, number]>(DEFAULT_VALUES.fDf)
  const [fP2, setFP2] = useState<number>(DEFAULT_VALUES.fP)

  return (
    <div className='w-full h-full flex flex-col sm:flex-row justify-center items-center gap-4 p-4 text-rose-950 dark:text-white'>
      <div className='w-full sm:w-1/2 h-full flex flex-col justify-start items-center gap-4 p-4 border rounded-md bg-gray-50 relative overflow-auto dark:bg-gray-800 dark:border-black'>
        <p className='text-base pb-2 pt-4'>统计量转P值</p>
        <Form 
          layout='vertical'
          className='w-full max-w-96'
        >
          <Form.Item label={<span>
            标准正态分布 <Tag color='pink'>p = {z2p(zS).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full'
              addonBefore={<span>统计量 <Tag className='mr-0' color='blue'>Z</Tag></span>}
              step={0.01}
              min={-5}
              max={5}
              defaultValue={DEFAULT_VALUES.zS}
              onChange={(value) => {
                typeof value === 'number' && setZS(value)
              }}
            />
          </Form.Item>
          <Form.Item label={<span>
            T分布(单尾) <Tag color='pink'>p = {t2p(tS1, tDf1a, false).toFixed(6)}</Tag>
          </span>}>
            <Space.Compact block>
              <InputNumber
                addonBefore={<span>统计量 <Tag className='mr-0' color='blue'>T</Tag></span>}
                step={0.01}
                min={-5}
                max={5}
                defaultValue={DEFAULT_VALUES.tS}
                onChange={(value) => {
                  typeof value === 'number' && setTS1(value)
                }}
              />
              <InputNumber
                addonBefore={<span>自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
                step={1}
                min={1}
                defaultValue={DEFAULT_VALUES.tDf}
                onChange={(value) => {
                  typeof value === 'number' && setTDf1a(value)
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label={<span>
            T分布(双尾) <Tag color='pink'>p = {t2p(tS2, tDf2a).toFixed(6)}</Tag>
          </span>}>
            <Space.Compact block>
              <InputNumber
                addonBefore={<span>统计量 <Tag className='mr-0' color='blue'>T</Tag></span>}
                step={0.01}
                min={-5}
                max={5}
                defaultValue={DEFAULT_VALUES.tS}
                onChange={(value) => {
                  typeof value === 'number' && setTS2(value)
                }}
              />
              <InputNumber
                addonBefore={<span>自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
                step={1}
                min={1}
                defaultValue={DEFAULT_VALUES.tDf}
                onChange={(value) => {
                  typeof value === 'number' && setTDf2a(value)
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label={<span>
            F分布(单尾) <Tag color='pink'>p = {f2p(fS1, fDf1a[0], fDf1a[1], false).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>统计量 <Tag className='mr-0' color='blue'>F</Tag></span>}
              step={0.01}
              min={0.0001}
              defaultValue={DEFAULT_VALUES.fS}
              onChange={(value) => {
                typeof value === 'number' && setFS1(value)
              }}
            />
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>分子(因素)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[0]}
              onChange={(value) => {
                typeof value === 'number' && setFDf1a([value, fDf1a[1]])
              }}
            />
            <InputNumber
              className='w-full'
              addonBefore={<span>分母(样本)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[1]}
              onChange={(value) => {
                typeof value === 'number' && setFDf1a([fDf1a[0], value])
              }}
            />
          </Form.Item>
          <Form.Item label={<span>
            F分布(双尾) <Tag color='pink'>p = {f2p(fS2, fDf2a[0], fDf2a[1]).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>统计量 <Tag className='mr-0' color='blue'>F</Tag></span>}
              step={0.01}
              min={0.0001}
              defaultValue={DEFAULT_VALUES.fS}
              onChange={(value) => {
                typeof value === 'number' && setFS2(value)
              }}
            />
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>分子(因素)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[0]}
              onChange={(value) => {
                typeof value === 'number' && setFDf2a([value, fDf2a[1]])
              }}
            />
            <InputNumber
              className='w-full'
              addonBefore={<span>分母(样本)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[1]}
              onChange={(value) => {
                typeof value === 'number' && setFDf2a([fDf2a[0], value])
              }}
            />
          </Form.Item>
        </Form>
      </div>
      <div className='w-full sm:w-1/2 h-full flex flex-col justify-start items-center gap-4 p-4 border rounded-md bg-gray-50 relative overflow-auto dark:bg-gray-800 dark:border-black'>
        <p className='text-base pb-2 pt-4'>P值转统计量</p>
        <Form 
          layout='vertical'
          className='w-full max-w-96'
        >
          <Form.Item label={<span>
            标准正态分布 <Tag color='pink'>Z = {zP === 1 ? '+∞' : zP === 0 ? '-∞' : p2z(zP).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full'
              addonBefore={<span>累积概率 <Tag className='mr-0' color='blue'>p</Tag></span>}
              step={0.01}
              min={0}
              max={1}
              defaultValue={DEFAULT_VALUES.zP}
              onChange={(value) => {
                typeof value === 'number' && setZP(value)
              }}
            />
          </Form.Item>
          <Form.Item label={<span>
            T分布(单尾) <Tag color='pink'>T = {tP1 === 1 ? '-∞' : tP1 === 0 ? '+∞' : p2t(tP1, tDf1b, false).toFixed(6)}</Tag>
          </span>}>
            <Space.Compact block>
              <InputNumber
                addonBefore={<span>显著性 <Tag className='mr-0' color='blue'>p</Tag></span>}
                step={0.01}
                min={0}
                max={1}
                defaultValue={DEFAULT_VALUES.tP}
                onChange={(value) => {
                  typeof value === 'number' && setTP1(value)
                }}
              />
              <InputNumber
                addonBefore={<span>自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
                step={1}
                min={1}
                defaultValue={DEFAULT_VALUES.tDf}
                onChange={(value) => {
                  typeof value === 'number' && setTDf1b(value)
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label={<span>
            T分布(双尾) <Tag color='pink'>T = {tP2 === 1 ? '-∞' : tP2 === 0 ? '+∞' : p2t(tP2, tDf2b).toFixed(6)}</Tag>
          </span>}>
            <Space.Compact block>
              <InputNumber
                addonBefore={<span>显著性 <Tag className='mr-0' color='blue'>p</Tag></span>}
                step={0.01}
                min={0}
                max={1}
                defaultValue={DEFAULT_VALUES.tP}
                onChange={(value) => {
                  typeof value === 'number' && setTP2(value)
                }}
              />
              <InputNumber
                addonBefore={<span>自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
                step={1}
                min={1}
                defaultValue={DEFAULT_VALUES.tDf}
                onChange={(value) => {
                  typeof value === 'number' && setTDf2b(value)
                }}
              />
            </Space.Compact>
          </Form.Item>
          <Form.Item label={<span>
            F分布(单尾) <Tag color='pink'>F = {fP1 === 1 ? '0' : fP1 === 0 ? '+∞' : p2f(fP1, fDf1b[0], fDf1b[1], false).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>显著性 <Tag className='mr-0' color='blue'>p</Tag></span>}
              step={0.01}
              min={0}
              max={1}
              defaultValue={DEFAULT_VALUES.fP}
              onChange={(value) => {
                typeof value === 'number' && setFP1(value)
              }}
            />
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>分子(因素)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[0]}
              onChange={(value) => {
                typeof value === 'number' && setFDf1b([value, fDf1b[1]])
              }}
            />
            <InputNumber
              className='w-full'
              addonBefore={<span>分母(样本)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[1]}
              onChange={(value) => {
                typeof value === 'number' && setFDf1b([fDf1b[0], value])
              }}
            />
          </Form.Item>
          <Form.Item label={<span>
            F分布(双尾) <Tag color='pink'>F = {fP2 === 1 ? '0' : fP2 === 0 ? '+∞' : p2f(fP2, fDf2b[0], fDf2b[1]).toFixed(6)}</Tag>
          </span>}>
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>显著性 <Tag className='mr-0' color='blue'>p</Tag></span>}
              step={0.01}
              min={0}
              max={1}
              defaultValue={DEFAULT_VALUES.fP}
              onChange={(value) => {
                typeof value === 'number' && setFP2(value)
              }}
            />
            <InputNumber
              className='w-full mb-2'
              addonBefore={<span>分子(因素)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[0]}
              onChange={(value) => {
                typeof value === 'number' && setFDf2b([value, fDf2b[1]])
              }}
            />
            <InputNumber
              className='w-full'
              addonBefore={<span>分母(样本)自由度 <Tag className='mr-0' color='blue'>df</Tag></span>}
              step={1}
              min={1}
              defaultValue={DEFAULT_VALUES.fDf[1]}
              onChange={(value) => {
                typeof value === 'number' && setFDf2b([fDf2b[0], value])
              }}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}