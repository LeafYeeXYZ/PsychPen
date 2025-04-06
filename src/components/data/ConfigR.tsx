import { Input, Segmented } from 'antd'
import { useRemoteR } from '../../hooks/useRemoteR'

export function ConfigR() {
	const _DataView_setRurl = useRemoteR((state) => state._DataView_setRurl)
	const _DataView_setRpassword = useRemoteR(
		(state) => state._DataView_setRpassword,
	)
	const _DataView_setRenable = useRemoteR((state) => state._DataView_setRenable)
	const Rurl = useRemoteR((state) => state.Rurl)
	const Rpassword = useRemoteR((state) => state.Rpassword)
	const Renable = useRemoteR((state) => state.Renable)
	enum Open {
		TRUE = '开启R语言服务器',
		FALSE = '关闭R语言服务器',
	}
	return (
		<div className='flex flex-col w-96 gap-2'>
			<div className='mb-2'>
				<Segmented
					block
					className='border dark:border-[#424242]'
					defaultValue={Renable ? Open.TRUE : Open.FALSE}
					options={[Open.TRUE, Open.FALSE]}
					onChange={(value) => _DataView_setRenable(value === Open.TRUE)}
				/>
			</div>
			<p className='w-full text-left pl-1'>服务器地址</p>
			<div className='mb-2'>
				<Input
					placeholder='请输入服务器地址'
					defaultValue={Rurl}
					disabled={!Renable}
					onChange={(e) => _DataView_setRurl(e.target.value ?? '')}
				/>
			</div>
			<p className='w-full text-left pl-1'>服务器密码</p>
			<div className='mb-2'>
				<Input.Password
					placeholder='请输入服务器密码'
					defaultValue={Rpassword}
					disabled={!Renable}
					onChange={(e) => _DataView_setRpassword(e.target.value ?? '')}
				/>
			</div>
			<div className='flex flex-col gap-1'>
				<p className='w-full text-xs text-center px-2'>
					如果启用R语言服务器功能, 则在执行部分统计功能时
				</p>
				<p className='w-full text-xs text-center px-2'>
					数据将上传至上面填写的R语言服务器进行处理
				</p>
				<p className='w-full text-xs text-center px-2'>
					如果使用的不是官方或自部署服务器, 请注意数据安全
				</p>
			</div>
		</div>
	)
}
