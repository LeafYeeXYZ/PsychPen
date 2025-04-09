import { Tag } from 'antd'
import { shortId } from '../../lib/utils'

const nameReg = /^:::.+?:::$/
const functionReg =
	/(min\(:::.+?:::\)|max\(:::.+?:::\)|mean\(:::.+?:::\)|mode\(:::.+?:::\)|q1\(:::.+?:::\)|q2\(:::.+?:::\)|q3\(:::.+?:::\)|std\(:::.+?:::\)|:::.+?:::)/g
const computeReg = /(===|!==|==|!=|>=|<=|\+|-|\/|\*\*|>|<|\*|&&|\|\|)/g
const bracketReg = /(\(|\))/g

function findUnmatchedBrackets(parts: string[]): Set<number> {
	const unmatchedIndices = new Set<number>()
	const stack: number[] = []
	parts.forEach((part, index) => {
		if (part === '(') {
			stack.push(index)
		} else if (part === ')') {
			if (stack.length === 0) {
				// 没有匹配的左括号
				unmatchedIndices.add(index)
			} else {
				stack.pop()
			}
		}
	})
	for (const index of stack) {
		unmatchedIndices.add(index)
	}
	return unmatchedIndices
}

export function Expression({ value }: { value: string }) {
	if (!value) {
		return <span className='text-gray-400'>无</span>
	}
	const parts = value
		.split(functionReg)
		.flatMap((part) => part.split(computeReg))
		.flatMap((part) => {
			return functionReg.test(part) ? [part] : part.split(bracketReg)
		})
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
	const unmatchedBrackets = findUnmatchedBrackets(parts)
	return (
		<>
			{parts.map((part, index) => {
				const key = shortId()
				if (part.match(nameReg)) {
					return (
						<Tag key={key} color='blue' style={{ margin: 0 }}>
							{part.slice(3, -3)}
						</Tag>
					)
				}
				if (part.match(functionReg)) {
					const parts = part.split(':::')
					const functionName = parts[0].slice(0, -1)
					const variableName = parts[1]
					return (
						<Tag key={key} color='purple' style={{ margin: 0 }}>
							{functionName}
							<Tag color='blue' style={{ margin: '0 0 0 4px' }}>
								{variableName}
							</Tag>
						</Tag>
					)
				}
				if (part.match(computeReg)) {
					return (
						<Tag key={key} color='orange' style={{ margin: 0 }}>
							{part}
						</Tag>
					)
				}
				if (part === '(' || part === ')') {
					const color = unmatchedBrackets.has(index) ? '#ff0000' : 'green'
					return (
						<Tag key={key} color={color} style={{ margin: 0 }}>
							{part}
						</Tag>
					)
				}
				return (
					<Tag key={key} color='default' style={{ margin: 0 }}>
						{part}
					</Tag>
				)
			})}
		</>
	)
}
