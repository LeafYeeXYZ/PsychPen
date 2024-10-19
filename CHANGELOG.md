# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.1.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.0.0...v1.1.0) (2024-10-19)


### Features

* 词云图(支持中文分词) ([1f3e711](https://github.com/LeafYeeXYZ/PsychPen/commit/1f3e711355204e8dac27d464edc5f42cc6a0c7d5))
* 词云支持过滤标点、数字、英文 ([1a76afb](https://github.com/LeafYeeXYZ/PsychPen/commit/1a76afbc79c56a0a78629ba2324be859ff6c7815))
* 皮尔逊相关报告更多统计量 ([7d14ea4](https://github.com/LeafYeeXYZ/PsychPen/commit/7d14ea4e7e198702444e830ebc57c70c3b2df6b3))
* 皮尔逊相关检验 ([cb44874](https://github.com/LeafYeeXYZ/PsychPen/commit/cb448749466d40f7810168d841271628778d67a0))
* 三维柱状图 ([27f738c](https://github.com/LeafYeeXYZ/PsychPen/commit/27f738ce683a9c6b2bc57a20e2b9ddd6bd14b085))
* 散点图新增回归功能 ([d39c55c](https://github.com/LeafYeeXYZ/PsychPen/commit/d39c55cad3a3aa274a60a08a35af7d8fc7510d8c))
* 生成标准化和中心化的子变量 ([6c0dbe9](https://github.com/LeafYeeXYZ/PsychPen/commit/6c0dbe9dc6354830084456eed4cabbf6b6ef6ee9))
* 使用AG-Grid替代Antd的Table组件, 大幅提高渲染性能 ([d5320d8](https://github.com/LeafYeeXYZ/PsychPen/commit/d5320d8f7c3bff1c0f7e78c864b8fa3d87ecf95e))
* 允许选择词云图文字方向 ([157820e](https://github.com/LeafYeeXYZ/PsychPen/commit/157820ea5988f44d5ad240f75cc522922d76d979))
* TXT文件支持UTF-8编码(而非默认的UTF-16) ([37726ba](https://github.com/LeafYeeXYZ/PsychPen/commit/37726baab517b90b96a4a0c7a58a9037b2c9b104))


### Bug Fixes

* 词云图表单样式错误 ([a1d1415](https://github.com/LeafYeeXYZ/PsychPen/commit/a1d14156d06d82bd5b050468c01dd3f1e1c8f97d))
* 词云图水平单词排布未生效 ([471828a](https://github.com/LeafYeeXYZ/PsychPen/commit/471828a61ce6b79a3918fcbf8682be14d0102c3a))
* 拼写错误 ([12f2727](https://github.com/LeafYeeXYZ/PsychPen/commit/12f2727e5005bffd5dd752bedfb666a16a1e3b55))
* 子变量描述统计量错误 ([cd38b5e](https://github.com/LeafYeeXYZ/PsychPen/commit/cd38b5ed519873ef1bb97c3b9d7fb1f99dfba9cb))

## 1.0.0 (2024-10-17)


### Features

* 3D散点图和自定义点大小 ([e8d8a15](https://github.com/LeafYeeXYZ/PsychPen/commit/e8d8a153e3fe947f0cadd6ef81a6a913b1190b35))
* 报告效应量并优化统计表 ([dba770a](https://github.com/LeafYeeXYZ/PsychPen/commit/dba770ae9b1abc0fa9738e3ab23f1d086df79929))
* 变量视图和描述统计 ([315ffab](https://github.com/LeafYeeXYZ/PsychPen/commit/315ffabe246b7c54c54f97fdf20c2fd058b61f6a))
* 表头始终显示 ([3adf224](https://github.com/LeafYeeXYZ/PsychPen/commit/3adf2248fa75bca7d39ff71941d0a815f5bf419b))
* 单样本T检验和配对样本T检验 ([75e048e](https://github.com/LeafYeeXYZ/PsychPen/commit/75e048e98da0b0a8adb681fbe7cb7e8a85db6f2b))
* 动态演示正态分布 ([6b41a45](https://github.com/LeafYeeXYZ/PsychPen/commit/6b41a456ff8b73893a37fac8baaf5cf3bc921d1c))
* 独立样本T检验 ([7e7b7b5](https://github.com/LeafYeeXYZ/PsychPen/commit/7e7b7b55e7acca7719402f9949580db92450d808))
* 基础散点图 ([7d96b21](https://github.com/LeafYeeXYZ/PsychPen/commit/7d96b218c56a85217ca5dfcd95e24364a6ec3d09))
* 基础箱线图 ([441de06](https://github.com/LeafYeeXYZ/PsychPen/commit/441de060c844ed55d1baa4f979032b5fd67d0f53))
* 基础折线图 ([b0b3143](https://github.com/LeafYeeXYZ/PsychPen/commit/b0b31437fc937197bf031964a86e6ec625d288d9))
* 计算耗时记录 ([4a5cfc8](https://github.com/LeafYeeXYZ/PsychPen/commit/4a5cfc8ab37c6db295972ca8d51746f93d66fb9c))
* 计算失败时发出通知 ([edd5fff](https://github.com/LeafYeeXYZ/PsychPen/commit/edd5fffc36e75248660c31a8d0a4c412db28c782))
* 计算时禁用表单 ([be75423](https://github.com/LeafYeeXYZ/PsychPen/commit/be75423eb8c17b6291d0bb02fcb58f4a2fd45bf1))
* 两种非参数检验 ([4378dac](https://github.com/LeafYeeXYZ/PsychPen/commit/4378dacb6d33e938f11bd1e5246f96d84ee7a520))
* 其余界面框架 ([fbcd85d](https://github.com/LeafYeeXYZ/PsychPen/commit/fbcd85de1966c5767e5f9f08cece55e997428a17))
* 数据处理完成通知 ([b38be82](https://github.com/LeafYeeXYZ/PsychPen/commit/b38be829b3b66e31fc3d8e6d6c293e915aec00f5))
* 数据导入 ([4cfff1e](https://github.com/LeafYeeXYZ/PsychPen/commit/4cfff1eb3f16fbbe851aa204060620c8b73eaca5))
* 以多种格式导出数据文件 ([23b5030](https://github.com/LeafYeeXYZ/PsychPen/commit/23b503042eb6942d6c51da29bfee08efd0a795f2))
* 预增加检验选项 ([11b0dd9](https://github.com/LeafYeeXYZ/PsychPen/commit/11b0dd97fdeabe9f07877b6089e93e04859750fb))
* 正态分布演示新增曲线 ([45c8aa7](https://github.com/LeafYeeXYZ/PsychPen/commit/45c8aa75338d3c52762814b2f2388f6fb62927eb))
* 正态分布演示支持自定义速度 ([30de0ef](https://github.com/LeafYeeXYZ/PsychPen/commit/30de0effafb0d8cec516fc7e29fe376ad408767f))
* 支持导入 .dta 文件 ([1cefa8a](https://github.com/LeafYeeXYZ/PsychPen/commit/1cefa8a8798883d1643449ec7ffa252dc47031b8))
* 支持导入 sav 文件 ([c0d64f7](https://github.com/LeafYeeXYZ/PsychPen/commit/c0d64f750a8b5cb95bf81b61cd7651610bebd563))
* 支持四种缺失值插值算法 ([ef9f555](https://github.com/LeafYeeXYZ/PsychPen/commit/ef9f5556ef53e3699b9c700abeadd824483fc145))
* 支持图像导出 ([bcd10af](https://github.com/LeafYeeXYZ/PsychPen/commit/bcd10afdacb72560e358ee450b224d4e2e122970))
* 支持自定义缺失值 ([9ffbdfa](https://github.com/LeafYeeXYZ/PsychPen/commit/9ffbdfa8fe55bd06164e27076627f3da64d4cd33))
* Levene检验支持被试内和被试间变量 ([efb9c04](https://github.com/LeafYeeXYZ/PsychPen/commit/efb9c04dc25acf0cfc4478c3f48b9ff4f5c7c76e))
* SEO优化 ([382c9da](https://github.com/LeafYeeXYZ/PsychPen/commit/382c9dab04b6d5997ac1b9915b5775c7e9fa22b8))


### Bug Fixes

* 变量类型判断 ([6e0e69a](https://github.com/LeafYeeXYZ/PsychPen/commit/6e0e69a6bfc864b1cecfa39f5e7bb391f5007ed6))
* 变量类型判断和数据过滤 ([eaeaf9b](https://github.com/LeafYeeXYZ/PsychPen/commit/eaeaf9b7835bef6a5299681b28b02755d473914d))
* 错误地弹出文件列表 ([9e52918](https://github.com/LeafYeeXYZ/PsychPen/commit/9e52918d0810af1e32227f9ea15f9437e684f593))
* 计时器重复设置 ([9a1b276](https://github.com/LeafYeeXYZ/PsychPen/commit/9a1b276ae4404f3e771301e5dfea7158655cb024))
* 类型错误 ([38d5a2f](https://github.com/LeafYeeXYZ/PsychPen/commit/38d5a2fc5c4f052b099f31e582c8aef2032a7be5))
* 描述不一致 ([e128a6a](https://github.com/LeafYeeXYZ/PsychPen/commit/e128a6a375960a52801694f89edbc38348b61ac0))
* 配对样本T检验缺失值处理 ([334faf0](https://github.com/LeafYeeXYZ/PsychPen/commit/334faf02272051546be9ff6fc47023b1ae73b5d8))
* 潜在的引用错误 ([bbc8584](https://github.com/LeafYeeXYZ/PsychPen/commit/bbc8584ea11d56d2f0b3e5cd9e12bfa58f06634b))
* 缺失值处理 ([e54b0ce](https://github.com/LeafYeeXYZ/PsychPen/commit/e54b0ce34a36b6b2ba0dcf5ec9a2ddd9da5d3437))
* 散点图分类变量选择方式 ([5d2ccca](https://github.com/LeafYeeXYZ/PsychPen/commit/5d2cccae065ec8bbb9b8b9970258594fb08141be))
* 数据点不足时, 拉格朗日插值返回 undefined ([d953cac](https://github.com/LeafYeeXYZ/PsychPen/commit/d953cac08e91a2792ed983063f447fdce9edcddd))
* 图像分组变量缺失值处理 ([26a5c82](https://github.com/LeafYeeXYZ/PsychPen/commit/26a5c820316ff6eb868ab284aa7ec4ba886cc4b1))
* 图像数据处理计时错误 ([2642eb7](https://github.com/LeafYeeXYZ/PsychPen/commit/2642eb726b88e3b3a60b6e2b105bd893d339eda2))
* 小屏设备布局错误 ([148542d](https://github.com/LeafYeeXYZ/PsychPen/commit/148542dbf901ed2f382b4287e4dc3802fb988bdc))
* 作用域错误 ([7ed3d70](https://github.com/LeafYeeXYZ/PsychPen/commit/7ed3d708ab24ee2ac725845c42fdca69882bf5ab))
