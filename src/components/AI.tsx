import { useAssistant } from '../lib/useAssistant'

// TODO: 写好之后更新一下使用文档的 2.4

export function AI() {

  const { ai } = useAssistant()

  if (ai === null) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        AI助手不可用, 请检查设置
      </div>
    )
  }

  return (
    <div className='w-full h-full flex items-center justify-center'>
      AI辅助分析功能正在开发中, 敬请期待
    </div>
  )
}