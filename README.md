# PsychPen

**在线进行心理学统计分析和绘制统计图表**

| ![](readme/1.png) | ![](readme/2.png) |
| :---: | :---: |
| ![](readme/3.png) | ![](readme/4.png) |

## 项目说明

本项目是一个用于心理学/教育学专业的统计检验分析和图表绘制的在线工具; 相比于传统的心理学统计软件, 本项目具有**无需下载安装**、**跨平台**、**开源免费**、**新手友好**等优势; 同时, 本项目集成了一些实用的统计/演示工具, 可以帮助初学者更好地理解正态分布等概念

如果您对本项目感兴趣, 欢迎 `star`、`fork`、`watch` 或者提出 `issue` 和 `pull request`!

## 开发说明

1. 克隆本项目到本地
  ```bash
  git clone https://github.com/LeafYeeXYZ/PsychPen.git
  cd PsychPen
  ```
2. 安装依赖 (本项目使用 [bun](https://bun.sh) 作为包管理工具)
  ```bash
  bun install
  ```
3. 启动项目
  ```bash
  bun dev
  ```
4. 打包项目
  ```bash
  bun run build
  ```

## 路线图

- **数据管理**
  - [x] 数据导入 (基于 `sheet.js`)
  - [x] 数据和变量预览 
  - [x] 支持导入 `.sav` 文件 (基于 [mhermher/savvy](https://github.com/mhermher/savvy) `但是不知道为什么不能直接安装, 只能手动下载源码`)
  - [x] 数据导出 (基于 `sheet.js`)
  - [x] 基础的缺失值定义 
  - [x] 缺失值插值处理
  - [ ] 数据过滤/筛选
  - [ ] 将某个变量的所有数值一键标准化, 生成新的变量
  - [ ] 将某个变量的所有数值一键中心化, 生成新的变量
- **绘图功能** (基于 `echarts`)
  - 箱线图
    - [x] 基础箱线图
  - 散点图
    - [x] 基础散点图
    - [x] 3D散点图
  - 折线图
    - [x] 基础折线图
    - [ ] 堆叠折线图
  - 直方图
    - [ ] 基础直方图 (可以绘制误差线)
  - [x] 图像导出 (基于 `html2canvas`)
- **统计功能** (近期基于 `@stdlib/stdlib` 库, 远期基于 `WebAssembly` (`pyodide` / `AssemblyScript`) 实现)
  - t 检验
    - [x] 单样本 t 检验
    - [x] 独立样本 t 检验
    - [x] 配对样本 t 检验
  - 非参数检验
    - [x] Kolmogorov-Smirnov 检验
    - [x] Levene 检验
- **其他工具**
  - [x] 正态分布可视化演示工具
