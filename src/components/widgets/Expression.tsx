import { Tag } from 'antd'

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
        .map((part) => part.split(computeReg))
        .flat()
        .map((part, index) => {
          if (nameReg.test(part)) {
            return (
              <Tag key={index} color='green' style={{ margin: 0 }}>
                {part.slice(3, -3)}
              </Tag>
            )
          } else if (part.match(computeReg)) {
            return (
              <Tag key={index} color='blue' style={{ margin: 0 }}>
                {part}
              </Tag>
            )
          } else {
            return <span key={index}>{part}</span>
          }
        })}
    </>
  )
}
