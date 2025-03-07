import { useNav, TOOLS_VIEW_SUB_PAGES_LABELS } from '../lib/hooks/useNav'
import { Cascader } from 'antd'

export function ToolsView() {
  const { setToolsViewSubPage, toolsViewSubPage, activeToolsViewSubPage } =
    useNav()

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Cascader
            placeholder='请选择工具'
            defaultValue={[activeToolsViewSubPage]}
            options={Object.values(TOOLS_VIEW_SUB_PAGES_LABELS).map(
              (label) => ({ label, value: label }),
            )}
            onChange={(value) => {
              if (value[0] === activeToolsViewSubPage) return
              setToolsViewSubPage(value[0])
            }}
            expandTrigger='hover'
            allowClear={false}
          />
        </div>
        {/* 工具界面 */}
        <div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
          {toolsViewSubPage}
        </div>
      </div>
    </div>
  )
}
