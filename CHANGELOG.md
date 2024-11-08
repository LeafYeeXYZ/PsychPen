# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.6.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.5.0...v1.6.0) (2024-11-08)


### Features

* 添加 Welch T 检验 ([1ca0ec9](https://github.com/LeafYeeXYZ/PsychPen/commit/1ca0ec92ff82a90186a5410f9052d3edcbe97492))
* 新增单因素方差分析及其事后检验 ([f233ac8](https://github.com/LeafYeeXYZ/PsychPen/commit/f233ac8870b488fbde3b65285f5c51cd5c6db5e8))
* 新增卡方分布统计量和P值互转 ([aa57067](https://github.com/LeafYeeXYZ/PsychPen/commit/aa570679ac71a48b8f48c2fe5f397b8289be7dcc))


### Bug Fixes

* 更新PsychWasm, 修复F检验单双尾设置错误 ([525b844](https://github.com/LeafYeeXYZ/PsychPen/commit/525b8445378dd111460442c0f64cfa9cd0901ba0))
* 将所有WASM模块排除出VITE的依赖优化 ([0cc0a77](https://github.com/LeafYeeXYZ/PsychPen/commit/0cc0a77bce3d689e0aa62d8bf44bd9086addbeb5))
* 数值排序错误 ([03e6a62](https://github.com/LeafYeeXYZ/PsychPen/commit/03e6a6238feb264cdd3386d74e15b83d3b497710))
* 修复大数据量时中介检验卡顿 ([d08a6f7](https://github.com/LeafYeeXYZ/PsychPen/commit/d08a6f7c33fcd94fdfed810dd2c9f32915238240))
* 修复样式错误 ([f517792](https://github.com/LeafYeeXYZ/PsychPen/commit/f517792926025f6d25fafdd0f6f0b41afd0b95e8))
* 移除所有显著性输入框 ([0731111](https://github.com/LeafYeeXYZ/PsychPen/commit/0731111431e9180ed60f9890feb76966d1b68b5e))


### Refactoring

* 换用 psych-lib 进行 Levene 检验 ([1aebaa7](https://github.com/LeafYeeXYZ/PsychPen/commit/1aebaa7af436f4f0a940988fed33695f7fbaa70e))
* 换用 psych-lib 进行单样本 KS 检验 ([6ed7342](https://github.com/LeafYeeXYZ/PsychPen/commit/6ed73423b4570ee5a49381093c52db90b92e74b9))
* 换用 psych-lib 进行皮尔逊相关检验 ([4fd755b](https://github.com/LeafYeeXYZ/PsychPen/commit/4fd755b196d7bcc1ea5373566dd23f8f53315f04))
* 换用 psych-lib 进行正态分布生成 ([5ce04ec](https://github.com/LeafYeeXYZ/PsychPen/commit/5ce04ec0717979895e82bd11ff0221516c34b500))
* 换用 psych-lib 进行T检验 ([e4529b3](https://github.com/LeafYeeXYZ/PsychPen/commit/e4529b3463c61361d78b9fb882db4cf4c8f915b8))
* 换用 psych-sheet 进行数据导入导出 ([6309004](https://github.com/LeafYeeXYZ/PsychPen/commit/63090047d61583e9efff4beb135a61e7cf133be9))
* 删除 jstat 和 mathjs 依赖 ([54863a8](https://github.com/LeafYeeXYZ/PsychPen/commit/54863a816c35eebf191edc845ab35203ffc06394))


### Performance

* 大幅优化Bootstrap检验运算速度 ([55f53f4](https://github.com/LeafYeeXYZ/PsychPen/commit/55f53f49144bc1333d6c5e55dae58ff911e15cd0))
* 全面换用Web Assembly进行数学计算 ([d3c1a38](https://github.com/LeafYeeXYZ/PsychPen/commit/d3c1a3891c20afba8bf0bff06265ac53a1e2cc28))

## [1.5.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.4.0...v1.5.0) (2024-10-29)


### Features

* 词云图允许手动选择是否进行分词 ([4066888](https://github.com/LeafYeeXYZ/PsychPen/commit/4066888f0dd24a92534d0205601664897c892072))
* 二元线性回归增加更多文字解释 ([fbbba2c](https://github.com/LeafYeeXYZ/PsychPen/commit/fbbba2c8293649774258c98ef70d8b43f043ef73))
* 简单中介效应分析功能完成 ([7ba5da6](https://github.com/LeafYeeXYZ/PsychPen/commit/7ba5da652249ae7ebffe7907374d1b593d229c86))
* 新增峰度和偏度检验 ([ced1a88](https://github.com/LeafYeeXYZ/PsychPen/commit/ced1a882365eb11b6249ac34e93d3a10d19a8d53))
* 信度检验支持根据变量分组 ([eb7e3cb](https://github.com/LeafYeeXYZ/PsychPen/commit/eb7e3cbd76f431cbda065a2c0f2476b133b16773))
* 序列二元线性回归 ([3247ea6](https://github.com/LeafYeeXYZ/PsychPen/commit/3247ea6b8d06da9878f916d96561a53adae4b583))
* 支持导入 .parquet 文件 ([bda80c7](https://github.com/LeafYeeXYZ/PsychPen/commit/bda80c7e53f1692b9ff95657ae1b64709f182169))
* **preview:** 简单中介效应分析 ([0bfca2e](https://github.com/LeafYeeXYZ/PsychPen/commit/0bfca2eb71f9826c53cec701cfaa21a930e44999))


### Bug Fixes

* 耗时计算错误 ([18543c4](https://github.com/LeafYeeXYZ/PsychPen/commit/18543c42ae33dc1363a74a8df43e276d6ccad141))


### Refactoring

* 将计算众数的功能转移到 PsychLib ([7146202](https://github.com/LeafYeeXYZ/PsychPen/commit/71462024da9b659d6e3a521945e9908ec525b7ab))
* 重构变量处理模块, 采用模块化设计而为计算变量等未来功能提供支持 ([4b62023](https://github.com/LeafYeeXYZ/PsychPen/commit/4b62023d16864e49fc2d84292558f8dc2e41bf6e))

## [1.4.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.3.0...v1.4.0) (2024-10-26)


### Features

* 变量离散化 ([4fbc87e](https://github.com/LeafYeeXYZ/PsychPen/commit/4fbc87ee70776afdd692a1a6ac951f63e2b3a9f2))
* 二元线性回归 ([6324c1a](https://github.com/LeafYeeXYZ/PsychPen/commit/6324c1a2d36d02acc7a56fb948738e5e40394ec6))
* 基础饼图 ([a169011](https://github.com/LeafYeeXYZ/PsychPen/commit/a169011cad4b9cc134aefe7c26de260d6f348bf5))
* 基础柱状图/直方图 (带误差棒) ([394f4f4](https://github.com/LeafYeeXYZ/PsychPen/commit/394f4f4720c377c03fad7e4484c17f0933cdea40))
* 一元线性回归 ([363bc33](https://github.com/LeafYeeXYZ/PsychPen/commit/363bc334ee257ca0bb990f181ec97a3080a465d6))
* CART决策树绘图 ([352bf9a](https://github.com/LeafYeeXYZ/PsychPen/commit/352bf9a6e542e3fae83911b250738095bc7a3a0d))


### Bug Fixes

* 滚动相关样式错误 ([ea822c4](https://github.com/LeafYeeXYZ/PsychPen/commit/ea822c4da86b2ab27c1a09870235068cd91a9f44))
* 减小大数据量定义 ([ae144c6](https://github.com/LeafYeeXYZ/PsychPen/commit/ae144c6f7a484473d80f0babc42e09885860d7f1))
* 去除错误描述 ([cae1a19](https://github.com/LeafYeeXYZ/PsychPen/commit/cae1a19e9e3144739565bee1b884f7dfcf50cde0))

## [1.3.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.2.0...v1.3.0) (2024-10-24)


### Features

* 基础箱线图支持被试内变量绘图 ([7395692](https://github.com/LeafYeeXYZ/PsychPen/commit/7395692694fd22913416952eb04ad9acc2ccec33))
* 基础折线图支持被试内变量绘图 ([38878ca](https://github.com/LeafYeeXYZ/PsychPen/commit/38878caf1e163b8a30e0fca77f8f78ad56628087))
* 新增单独的描述统计页面 ([a6630ae](https://github.com/LeafYeeXYZ/PsychPen/commit/a6630aea075b4c4ea84780ed047759ba6d1c6af0))
* 新增平行折线图 ([fa20a24](https://github.com/LeafYeeXYZ/PsychPen/commit/fa20a24ab507952619029269a75a4ef2b4dd9eb6))
* 新增统计量和P值转换工具 ([d702b97](https://github.com/LeafYeeXYZ/PsychPen/commit/d702b97feb6b5d4226e7171b1318430985bf764a))
* 重测信度/复本信度/分半信度/同质性信度 ([1dd709e](https://github.com/LeafYeeXYZ/PsychPen/commit/1dd709e1fa265baf73a1e1a06315107f93a0f581))
* **preview:** 多元线性回归 ([13b2a68](https://github.com/LeafYeeXYZ/PsychPen/commit/13b2a680bf61f7a7342bbcdd6b53f585b7349399))
* **preview:** 多元线性回归支持选择优化器 ([a691284](https://github.com/LeafYeeXYZ/PsychPen/commit/a69128404296f6198444e908ca8f90c6d3cbc0b8))


### Bug Fixes

* AgGrid自动推断的数据格式错误 ([7f87009](https://github.com/LeafYeeXYZ/PsychPen/commit/7f87009714bcda6b07ce6bde0f308ca7470b7ac7))
* Levene检验被试内被试间不再使用同一个表单项 ([29a76fb](https://github.com/LeafYeeXYZ/PsychPen/commit/29a76fb28c0646f968c7b6d0cc3b99e9c6db2a52))


### Refactoring

* 提高编译版本, 新增浏览器过老提示 ([568b721](https://github.com/LeafYeeXYZ/PsychPen/commit/568b721fa367642c89dffd8b45500966793551bf))
* 重构全局状态结构, 简化项目结构, 为后期拓展做准备 ([834ea0c](https://github.com/LeafYeeXYZ/PsychPen/commit/834ea0c658f59ba0ea0349e9aecd3ce57cf65cd8))
* 重构样式架构, 新增黑暗模式 ([d019602](https://github.com/LeafYeeXYZ/PsychPen/commit/d019602fda2d289b902dea1a69eaf240129ff8e2))

## [1.2.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.1.0...v1.2.0) (2024-10-19)


### Features

* 为每个变量处理功能增加说明 ([b910e92](https://github.com/LeafYeeXYZ/PsychPen/commit/b910e92c4e1dd2f5e2d914ee62b4e583793cf20d))

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
