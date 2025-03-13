import { Tag } from 'antd'
import { md5 } from '../../lib/utils'

const nameReg = /(:::.+?:::)/g
const computeReg = /(===|!==|==|!=|>=|<=|\+|-|\/|\*\*|>|<|\*)/g

export function Expression({ value }: { value: string }) {
	if (!value) {
		return <span className='text-gray-400'>无</span>
	}
	return (
		<>
			{value
				.split(nameReg)
				.flatMap((part) => part.split(computeReg))
				.map((part) => {
					const key = md5(part)
					if (nameReg.test(part)) {
						return (
							<Tag key={key} color='green' style={{ margin: 0 }}>
								{part.slice(3, -3)}
							</Tag>
						)
					}
					if (part.match(computeReg)) {
						return (
							<Tag key={key} color='blue' style={{ margin: 0 }}>
								{part}
							</Tag>
						)
					}
					return <span key={key}>{part}</span>
				})}
		</>
	)
}
