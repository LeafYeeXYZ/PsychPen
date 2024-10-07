# PsychPen

**在线绘制心理学论文所用的统计图表**

## 项目说明

本项目是一个基于 `antv` 的心理学统计图表绘制工具, 旨在为心理学/社会学研究者提供一个简单易用的绘图工具

在开发初期, 本项目将主要着眼于描述统计, 如根据数据绘制直方图、箱线图、散点图等; 后续将逐步引入统计功能 (为提高性能, 将使用 `WebAssembly` 技术), 并绘制中介/调节效应模型图、为上述描述统计图添加显著性信息等

## 路线图

- 数据管理
  - [x] 数据导入 (基于 `sheet.js`)
  - [x] 数据和变量预览 
  - [ ] 在线数据编辑 (暂时放弃此功能, 先专注于数据分析和绘图)
  - [ ] 数据导出 (基于 `sheet.js`, 搁置, 有时间再写)
- 绘图功能 (基于 `ant design charts`)
  - [ ] 箱线图
  - [ ] ...
  - [ ] 图像导出 (基于 `html2canvas`)
- 统计功能 (近期基于 `math.js`, 远期基于 `WebAssembly`)
  - [ ] t 检验
    - [ ] 单样本 t 检验
    - [ ] 独立样本 t 检验
    - [ ] 配对样本 t 检验
  - [ ] 描述统计
  - [ ] 方差分析
  - [ ] 相关分析
  - [ ] 因子分析
  - [ ] 中介/调节效应
  - [ ] ...
  - [ ] 输出统计表和对应 `LaTeX` 代码
