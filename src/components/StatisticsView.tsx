import { Cascader } from 'antd'
import {
	type STATISTICS_SUB_PAGES_LABELS,
	STATISTICS_SUB_PAGES_MAP,
	useNav,
} from '../lib/hooks/useNav'

export function StatisticsView() {
	const activeStatisticsViewSubPage = useNav(
		(state) => state.activeStatisticsViewSubPage,
	)
	const setStatisticsViewSubPage = useNav(
		(state) => state.setStatisticsViewSubPage,
	)
	const statisticsViewSubPage = useNav((state) => state.statisticsViewSubPage)

	return (
		<div className='w-full h-full overflow-hidden'>
			<div className='flex flex-col justify-start items-center w-full h-full p-4'>
				{/* 上方工具栏 */}
				<div className='w-full flex justify-start items-center gap-3 mb-4'>
					<Cascader
						placeholder='请选择统计方法'
						defaultValue={[
							// biome-ignore lint/style/noNonNullAssertion: 一定存在
							Object.entries(STATISTICS_SUB_PAGES_MAP).find(([, value]) =>
								value.includes(activeStatisticsViewSubPage),
							)![0],
							activeStatisticsViewSubPage,
						]}
						options={Object.entries(STATISTICS_SUB_PAGES_MAP).map(
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
							if (activeStatisticsViewSubPage === value[1]) return
							setStatisticsViewSubPage(value[1] as STATISTICS_SUB_PAGES_LABELS)
						}}
						expandTrigger='hover'
						allowClear={false}
						className='min-w-max'
					/>
				</div>
				{/* 统计界面 */}
				<div className='w-full h-full overflow-auto border rounded-md dark:bg-gray-900 dark:border-black'>
					{statisticsViewSubPage}
				</div>
			</div>
		</div>
	)
}
