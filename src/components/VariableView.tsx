import { useStates } from '../lib/hooks/useStates'
import { Button } from 'antd'
import { useNav, VARIABLE_SUB_PAGES_LABELS } from '../lib/hooks/useNav'
import {
  CalculatorOutlined,
  ZoomOutOutlined,
  BoxPlotOutlined,
  TableOutlined,
  FilterOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons'

const ICONS: Record<VARIABLE_SUB_PAGES_LABELS, React.ReactElement> = {
  变量表格: <TableOutlined />,
  定义缺失值: <ZoomOutOutlined />,
  缺失值插值: <CalculatorOutlined />,
  '中心化/标准化/离散化': <BoxPlotOutlined />,
  数据筛选: <FilterOutlined />,
  生成新变量: <AppstoreAddOutlined />,
}

export function VariableView() {
  const {
    activeVariableViewSubPage,
    variableViewSubPage,
    setVariableViewSubPage,
  } = useNav()
  const { disabled } = useStates()

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='flex flex-col justify-start items-center w-full h-full p-4'>
        {/* 上方工具栏 */}
        <div className='w-full flex justify-start items-center gap-3 mb-4 flex-wrap'>
          {Object.values(VARIABLE_SUB_PAGES_LABELS).map((label, index) => (
            <Button
              key={index}
              icon={ICONS[label]}
              disabled={disabled}
              onClick={() => {
                if (activeVariableViewSubPage === label) return
                setVariableViewSubPage(label)
              }}
              type={activeVariableViewSubPage === label ? 'primary' : 'default'}
              autoInsertSpace={false}
            >
              {label}
            </Button>
          ))}
        </div>
        {/* 页面内容 */}
        {variableViewSubPage}
      </div>
    </div>
  )
}
