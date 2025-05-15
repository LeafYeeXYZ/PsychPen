import { InfoCircleOutlined } from '@ant-design/icons'
import { Button, Input, Popover, Segmented, Tag } from 'antd'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useAssistant } from '../../hooks/useAssistant'
import { useStates } from '../../hooks/useStates'

export function ConfigAI() {
	const _DataView_setModel = useAssistant((state) => state._DataView_setModel)
	const _DataView_setOpenaiEndpoint = useAssistant(
		(state) => state._DataView_setOpenaiEndpoint,
	)
	const _DataView_setOpenaiApiKey = useAssistant(
		(state) => state._DataView_setOpenaiApiKey,
	)
	const _DataView_setOpenaiEnable = useAssistant(
		(state) => state._DataView_setOpenaiEnable,
	)
	const model = useAssistant((state) => state.model)
	const openaiEndpoint = useAssistant((state) => state.openaiEndpoint)
	const openaiApiKey = useAssistant((state) => state.openaiApiKey)
	const openaiEnable = useAssistant((state) => state.openaiEnable)
	const _DataView_validate = useAssistant((state) => state._DataView_validate)
	const messageApi = useStates((state) => state.messageApi)
	const [disabled, setDisabled] = useState<boolean>(false)
	enum Open {
		TRUE = '开启AI辅助分析',
		FALSE = '关闭AI辅助分析',
	}
	return (
		<div className='flex flex-col w-96 gap-2'>
			<div className='mb-2'>
				<Segmented
					block
					className='border dark:border-[#424242]'
					defaultValue={openaiEnable ? Open.TRUE : Open.FALSE}
					options={[Open.TRUE, Open.FALSE]}
					onChange={(value) => {
						_DataView_setOpenaiEnable(value === Open.TRUE)
					}}
				/>
			</div>
			<p className='w-full text-left pl-1'>
				AI 服务提供商 API 地址
				<Popover
					trigger={['click', 'hover']}
					content={
						<div className='flex flex-col gap-1'>
							<div>
								对于 <Tag style={{ margin: 0 }}>DeepSeek开放平台</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() =>
										_DataView_setOpenaiEndpoint('https://api.deepseek.com/v1')
									}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										https://api.deepseek.com/v1
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>硅基流动</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() =>
										_DataView_setOpenaiEndpoint('https://api.siliconflow.cn/v1')
									}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										https://api.siliconflow.cn/v1
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>阿里云百炼</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() =>
										_DataView_setOpenaiEndpoint(
											'https://dashscope.aliyuncs.com/compatible-mode/v1',
										)
									}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										https://dashscope.aliyuncs.com/compatible-mode/v1
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>OpenAI</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() =>
										_DataView_setOpenaiEndpoint('https://api.openai.com/v1')
									}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										https://api.openai.com/v1
									</Tag>
								</Button>
								(点击填入)
							</div>
						</div>
					}
				>
					<Tag style={{ marginLeft: '0.3rem' }} className='cursor-pointer'>
						<InfoCircleOutlined /> 常见提供商地址
					</Tag>
				</Popover>
			</p>
			<div className='mb-2'>
				<Input
					placeholder='请输入OpenAI兼容API端点 (baseUrl)'
					value={openaiEndpoint}
					disabled={!openaiEnable}
					onChange={(e) => {
						_DataView_setOpenaiEndpoint(e.target.value ?? '')
					}}
				/>
			</div>
			<p className='w-full text-left pl-1'>
				AI 服务提供商 API 密钥
				<Popover
					trigger={['click', 'hover']}
					content={
						<div className='flex flex-col gap-1'>
							<div>
								对于 <Tag style={{ margin: 0 }}>DeepSeek开放平台</Tag> 是{' '}
								<a
									href='https://platform.deepseek.com/api_keys'
									target='_blank'
									rel='noreferrer'
								>
									<Button type='text' size='small'>
										<Tag style={{ margin: 0 }} color='blue'>
											https://platform.deepseek.com/api_keys
										</Tag>
									</Button>
								</a>
								(点击跳转)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>硅基流动</Tag> 是{' '}
								<a
									href='https://cloud.siliconflow.cn/account/ak'
									target='_blank'
									rel='noreferrer'
								>
									<Button type='text' size='small'>
										<Tag style={{ margin: 0 }} color='blue'>
											https://cloud.siliconflow.cn/account/ak
										</Tag>
									</Button>
								</a>
								(点击跳转)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>阿里云百炼</Tag> 是{' '}
								<a
									href='https://bailian.console.aliyun.com/?apiKey=1#/api-key'
									target='_blank'
									rel='noreferrer'
								>
									<Button type='text' size='small'>
										<Tag style={{ margin: 0 }} color='blue'>
											https://bailian.console.aliyun.com/?apiKey=1#/api-key
										</Tag>
									</Button>
								</a>
								(点击跳转)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>OpenAI</Tag> 是{' '}
								<a
									href='https://platform.openai.com/api-keys'
									target='_blank'
									rel='noreferrer'
								>
									<Button type='text' size='small'>
										<Tag style={{ margin: 0 }} color='blue'>
											https://platform.openai.com/api-keys
										</Tag>
									</Button>
								</a>
								(点击跳转)
							</div>
						</div>
					}
				>
					<Tag style={{ marginLeft: '0.3rem' }} className='cursor-pointer'>
						<InfoCircleOutlined /> 常见密钥获取地址
					</Tag>
				</Popover>
			</p>
			<div className='mb-2'>
				<Input.Password
					placeholder='请输入OpenAI兼容API密钥 (apiKey)'
					value={openaiApiKey}
					disabled={!openaiEnable}
					onChange={(e) => {
						_DataView_setOpenaiApiKey(e.target.value ?? '')
					}}
				/>
			</div>
			<p className='w-full text-left pl-1'>
				AI 模型名称
				<Popover
					content={
						<div className='flex flex-col gap-1'>
							<div>
								对于 <Tag style={{ margin: 0 }}>DeepSeek开放平台</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() => _DataView_setModel('deepseek-chat')}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										deepseek-chat
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>硅基流动</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() =>
										_DataView_setModel('Pro/deepseek-ai/DeepSeek-V3')
									}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										Pro/deepseek-ai/DeepSeek-V3
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>阿里云百炼</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() => _DataView_setModel('qwen-max')}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										qwen-max
									</Tag>
								</Button>
								(点击填入)
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>OpenAI</Tag> 是{' '}
								<Button
									type='text'
									size='small'
									onClick={() => _DataView_setModel('gpt-4.1')}
								>
									<Tag style={{ margin: 0 }} color='blue'>
										gpt-4.1
									</Tag>
								</Button>
								(点击填入)
							</div>
						</div>
					}
				>
					<Tag style={{ marginLeft: '0.3rem' }} className='cursor-pointer'>
						<InfoCircleOutlined /> 推荐模型名称
					</Tag>
				</Popover>
			</p>
			<div className='mb-2'>
				<Input
					placeholder='请输入AI模型名称 (modelId)'
					value={model}
					disabled={!openaiEnable}
					onChange={(e) => {
						_DataView_setModel(e.target.value ?? '')
					}}
				/>
			</div>
			<div className='mb-2'>
				<Button
					block
					loading={disabled}
					disabled={!openaiEnable || !openaiEndpoint || !openaiApiKey || !model}
					onClick={async () => {
						try {
							flushSync(() => setDisabled(true))
							await _DataView_validate()
							messageApi?.success('AI辅助分析开启成功')
						} catch (e) {
							messageApi?.error(
								`AI辅助分析开启失败: ${e instanceof Error ? e.message : e}`,
							)
						} finally {
							setDisabled(false)
						}
					}}
				>
					确认
				</Button>
			</div>
			<div className='flex flex-col gap-1'>
				<p className='w-full text-sm font-black text-center px-2'>
          PsychPen 本身不提供任何AI算力服务, 也不含任何付费功能
				</p>
				<p className='w-full text-xs text-center px-2'>
          你可以选择使用任何第三方AI服务提供商, 如阿里云百炼、OpenAI等
				</p>
				<p className='w-full text-xs text-center px-2'>
          这些服务提供商可能会对API请求进行收费
				</p>
				<p className='w-full text-xs text-center px-2'>
          这些服务提供商还可能会收集你的数据信息, 请自行保证数据安全
				</p>
			</div>
		</div>
	)
}
