import {
  useNav,
  PLOTS_SUB_PAGES_MAP,
  type PLOTS_SUB_PAGES_LABELS,
} from '../lib/hooks/useNav'
import { Cascader } from 'antd'

export function PlotsView() {
  const { activePlotsViewSubPage, setPlotsViewSubPage, plotsViewSubPage } =
    useNav()

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4'>
          <Cascader
            placeholder='请选择绘图类型'
            defaultValue={[
              Object.entries(PLOTS_SUB_PAGES_MAP).find(([, value]) =>
                value.includes(activePlotsViewSubPage),
              )![0],
              activePlotsViewSubPage,
            ]}
            options={Object.entries(PLOTS_SUB_PAGES_MAP).map(
              ([key, value]) => ({
                value: key,
                label: key,
                children: value.map((subPage) => ({
                  value: subPage,
                  label: subPage,
                })),
              }),
            )}
            onChange={(value) => {
              if (activePlotsViewSubPage === value[1]) return
              setPlotsViewSubPage(value[1] as PLOTS_SUB_PAGES_LABELS)
            }}
            expandTrigger='hover'
            allowClear={false}
            className='min-w-max'
          />
        </div>
        {/* 画图界面 */}
        <div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
          {plotsViewSubPage}
        </div>
      </div>
    </div>
  )
}
