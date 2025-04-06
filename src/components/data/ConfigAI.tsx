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
				API 地址 <Tag>baseUrl</Tag>
				<Popover
					content={
						<div className='flex flex-col gap-1'>
							<div>请填写各大模型提供商的 OpenAI 兼容 API 地址</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>DeepSeek</Tag> 是{' '}
								<Tag style={{ margin: 0 }}>https://api.deepseek.com/v1</Tag>
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>Qwen</Tag> 是{' '}
								<Tag style={{ margin: 0 }}>
									https://dashscope.aliyuncs.com/compatible-mode/v1
								</Tag>
							</div>
							<div>
								对于 <Tag style={{ margin: 0 }}>OpenAI</Tag> 是{' '}
								<Tag style={{ margin: 0 }}>https://api.openai.com/v1</Tag>
							</div>
						</div>
					}
				>
					<InfoCircleOutlined />
				</Popover>
			</p>
			<div className='mb-2'>
				<Input
					placeholder='请输入OpenAI兼容API端点 (baseUrl)'
					defaultValue={openaiEndpoint}
					disabled={!openaiEnable}
					onChange={(e) => {
						_DataView_setOpenaiEndpoint(e.target.value ?? '')
					}}
				/>
			</div>
			<p className='w-full text-left pl-1'>
				API 密钥 <Tag>apiKey</Tag>
			</p>
			<div className='mb-2'>
				<Input.Password
					placeholder='请输入OpenAI兼容API密钥 (apiKey)'
					defaultValue={openaiApiKey}
					disabled={!openaiEnable}
					onChange={(e) => {
						_DataView_setOpenaiApiKey(e.target.value ?? '')
					}}
				/>
			</div>
			<p className='w-full text-left pl-1'>
				AI 模型名称 <Tag>modelId</Tag>
				<Popover
					content={
						<div className='flex flex-col gap-1'>
							<div>
								请填写您所使用的 AI 模型的 ID (模型必须支持{' '}
								<Tag style={{ margin: 0 }}>Function Calling</Tag> 功能)
							</div>
							<div>
								如 <Tag style={{ margin: 0 }}>DeepSeek-V3</Tag> (ID 为{' '}
								<Tag style={{ margin: 0 }}>deepseek-chat</Tag>),{' '}
								<Tag style={{ margin: 0 }}>Qwen</Tag> (ID 为{' '}
								<Tag style={{ margin: 0 }}>qwen-max</Tag>),{' '}
								<Tag style={{ margin: 0 }}>GPT-4o</Tag> (ID 为{' '}
								<Tag style={{ margin: 0 }}>gpt-4o</Tag>) 等
							</div>
							<div>
								不建议使用 <Tag style={{ margin: 0 }}>DeepSeek-R1</Tag>,{' '}
								<Tag style={{ margin: 0 }}>QwQ</Tag>,{' '}
								<Tag style={{ margin: 0 }}>o3-mini</Tag> 等推理模型
							</div>
						</div>
					}
				>
					<InfoCircleOutlined />
				</Popover>
			</p>
			<div className='mb-2'>
				<Input
					placeholder='请输入AI模型名称 (modelId)'
					defaultValue={model}
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
					确认并检查AI服务是否可用
				</Button>
			</div>
			<div className='flex flex-col gap-1'>
				<p className='w-full text-xs text-center px-2'>
					如果启用AI辅助分析功能, 则在与AI交互时
				</p>
				<p className='w-full text-xs text-center px-2'>
					部分数据信息将上传至上面指定的AI服务
				</p>
				<p className='w-full text-xs text-center px-2'>
					如果使用的不是自部署AI服务, 请注意数据安全
				</p>
			</div>
		</div>
	)
}
