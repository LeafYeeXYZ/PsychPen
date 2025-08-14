# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.9.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.8.0...v2.9.0) (2025-08-14)


### Features

* 改变词云图分词方式，支持更大的文本量 ([5133733](https://github.com/LeafYeeXYZ/PsychPen/commit/51337336e3c0d773826fb5dba01b3045079b25bf))
* 计算Omega系数现在可以在本地进行 ([a18b42b](https://github.com/LeafYeeXYZ/PsychPen/commit/a18b42bb3b41056a2060e05199b1ad6c731c475c))
* 新增堆叠折线图 ([2ac7f29](https://github.com/LeafYeeXYZ/PsychPen/commit/2ac7f2987c28c88c5c0e1ca0c94e8a01cc68fea1))
* 优化方差分析事后检验的显示方式 ([3d0ba72](https://github.com/LeafYeeXYZ/PsychPen/commit/3d0ba72af42fe7dc51b7d142540e780835a7e1f3))
* 允许设置折线图的Y轴范围 ([907351c](https://github.com/LeafYeeXYZ/PsychPen/commit/907351c83204eee90da349a63ca616d40febf23c))


### Bug Fixes

* 修复复杂表达式在执行过程中的潜在问题 ([28e7698](https://github.com/LeafYeeXYZ/PsychPen/commit/28e7698edd19a1e77743c67a63719f93cfeb5cf2))
* 修改特定数值的P值可能显示异常的问题 ([7dec2a7](https://github.com/LeafYeeXYZ/PsychPen/commit/7dec2a7fff2430b8553a246a89738568ec764d3d))


### Improvements

* 引导AI助手优先使用单样本KS检验进行正态分布检验 ([17fa8b7](https://github.com/LeafYeeXYZ/PsychPen/commit/17fa8b75d38764bd65d03adfc8c0f48f67190f91))
* 优化数据界面显示 ([82f0e1b](https://github.com/LeafYeeXYZ/PsychPen/commit/82f0e1b5f02fe4562b5c677e9200b01e5d8b0ca0))
* 优化值嵌入逻辑 ([877fa22](https://github.com/LeafYeeXYZ/PsychPen/commit/877fa2270ff81654ef211260d924e00d0b0cb597))
* 优化Bonferroni事后检验的P值显示 ([d13e00e](https://github.com/LeafYeeXYZ/PsychPen/commit/d13e00e3f9eb1387dec77700b1c7342eb042d4c6))

## [2.8.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.7.0...v2.8.0) (2025-07-06)


### Features

* 不再将统计结果直接包含在AI助手上下文, 而是由AI主动调取 ([f98eb35](https://github.com/LeafYeeXYZ/PsychPen/commit/f98eb354bddf9d334416ca77e7cba7955656c982))
* 过滤器会同时显示可用和排除数据条数 ([85e3cb3](https://github.com/LeafYeeXYZ/PsychPen/commit/85e3cb370d867da9a68e769924dbcf25de24b677))
* 将具体页面的操作方法在跳转后再给到AI助手, 降低Token消耗 ([2ade96c](https://github.com/LeafYeeXYZ/PsychPen/commit/2ade96cc4d3cb5a41546545c52ec9bc453cc36c7))
* 修改默认推荐AI模型 ([e18e063](https://github.com/LeafYeeXYZ/PsychPen/commit/e18e063774deac5c1d5ea4664e8b3f4e84bcd1ab))
* 自定义导出支持Markdown格式 ([0aab910](https://github.com/LeafYeeXYZ/PsychPen/commit/0aab910abdf1cbcba874a5ef5eae03a9ed3e1161))
* AI助手现在可以直接操作三种正态分布和方差齐性检验 ([a12006f](https://github.com/LeafYeeXYZ/PsychPen/commit/a12006f117e8e29a169f0198d640ae43adfda4bd))


### Bug Fixes

* 新增多条Biome规则，修复循环引用等问题 ([388909e](https://github.com/LeafYeeXYZ/PsychPen/commit/388909ec52de6e669d48e1a14b8d824ad0351e68))
* 修复多元线性回归t值显示异常的问题 ([d8ac989](https://github.com/LeafYeeXYZ/PsychPen/commit/d8ac989ecec78fa29bd9d6749cb596eff3140fde))
* 修复计算变量结果无法为缺失值的问题 ([6bd6be7](https://github.com/LeafYeeXYZ/PsychPen/commit/6bd6be7967dbf4566eddd66c2740901733cdab04))
* 修复夜间模式下加载界面的样式异常 ([1943952](https://github.com/LeafYeeXYZ/PsychPen/commit/1943952216511059474d57312f9c254d40f4dca9))
* 修复夜间模式下加载界面的样式异常 ([078a35d](https://github.com/LeafYeeXYZ/PsychPen/commit/078a35d262995fc1414fc98c0cd5eb778a44499b))
* 修复一处推荐模型与描述不一致的问题 ([89ea54a](https://github.com/LeafYeeXYZ/PsychPen/commit/89ea54a96e935f0a13a2bb4e3f1176681482b1dc))
* 修复KS检验和峰度偏度检验混淆的问题 ([43ffd8f](https://github.com/LeafYeeXYZ/PsychPen/commit/43ffd8fb01879d40267194eadf19c036e9ed7206))


### Improvements

* 词云图现在无需开启分词也可以使用过滤器 ([87a0ade](https://github.com/LeafYeeXYZ/PsychPen/commit/87a0adef5e8ddd2a2b4a9bb002c9112e9083c088))
* 精简输入给AI助手的文档, 降低推理成本 ([388d33a](https://github.com/LeafYeeXYZ/PsychPen/commit/388d33af8eb1b530d0185afb03e7695caeda34fc))
* 优化加载动画 ([09c355b](https://github.com/LeafYeeXYZ/PsychPen/commit/09c355be8a85cf06a174f0b603956b99cc6ac7c5))
* 优化提示词 ([ec6b3bc](https://github.com/LeafYeeXYZ/PsychPen/commit/ec6b3bc0a24ce4f297d7fbbd1579a2d7b61232d6))
* 优化AI设置界面的描述 ([4e4f71a](https://github.com/LeafYeeXYZ/PsychPen/commit/4e4f71a24b0d529854fe4830be2cb0bc8f9822bf))
* 优化AI助手输出公式效果 ([ae5396b](https://github.com/LeafYeeXYZ/PsychPen/commit/ae5396b6e46c69f95a53a9ad41e373e8784db861))
* 优化AI助手输出公式效果 ([e5f6933](https://github.com/LeafYeeXYZ/PsychPen/commit/e5f69331ba8fd86b356138bb439f157b6918f7af))
* 优化AI助手输出公式效果 ([70300da](https://github.com/LeafYeeXYZ/PsychPen/commit/70300da807a523b4664c0b600769dfbff120a385))
* 优化AI助手输出公式效果 (真) ([2fb3b5f](https://github.com/LeafYeeXYZ/PsychPen/commit/2fb3b5f134e2a3687fa1562af6d92be9b6c382bd))
* 优化AI助手行内公式显示 ([d691c2b](https://github.com/LeafYeeXYZ/PsychPen/commit/d691c2b318482a213be25b55072406efb74bddc2))
* 优化T分布动态分布的用户体验 ([4df4f2e](https://github.com/LeafYeeXYZ/PsychPen/commit/4df4f2e131efc6c72febd080d9b47ffd5e5964c2))
* SEO优化 ([d64712e](https://github.com/LeafYeeXYZ/PsychPen/commit/d64712ecddba5177f43b4883d57082ce66a036a2))
* SEO优化 ([21843a6](https://github.com/LeafYeeXYZ/PsychPen/commit/21843a6d2e943fb2a940e3148a730f7f62a790c0))

## [2.7.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.6.0...v2.7.0) (2025-05-05)


### Features

* 改用zod进行运行时类型检查 ([7f7e7bf](https://github.com/LeafYeeXYZ/PsychPen/commit/7f7e7bf118a267228e69ebf0969081af225b2f5a))
* 适配推理模型 ([5679f3a](https://github.com/LeafYeeXYZ/PsychPen/commit/5679f3ade73e2751cb9bc87df33789fbdd9afc35))
* 新增主流平台的AI辅助设置一键填写 ([c50ce9d](https://github.com/LeafYeeXYZ/PsychPen/commit/c50ce9d3502ca27cca63e665f979924a236ff45a))
* AI助手支持使用自定义代码生成自定义数据并导出 ([7ae6204](https://github.com/LeafYeeXYZ/PsychPen/commit/7ae6204d562afbe1b005a0bc1ad76c0cf714ccc4))


### Bug Fixes

* 修复自定义导出组建的一处描述错误 ([2d13e94](https://github.com/LeafYeeXYZ/PsychPen/commit/2d13e9485af24f41c197895a40663a41e5da7b06))


### Improvements

* 抽象函数调用参数检查, 提供更详细的错误信息 ([77c54da](https://github.com/LeafYeeXYZ/PsychPen/commit/77c54da196b8984e23fd527e75e7c67989aa29a9))
* 精简输入给AI助手的文档, 降低推理成本 ([1acf944](https://github.com/LeafYeeXYZ/PsychPen/commit/1acf944547026398b3410587caa24f5534d698c9))
* 使用 new Function 代替 eval 以提升性能和安全性 ([dfcb34d](https://github.com/LeafYeeXYZ/PsychPen/commit/dfcb34d35045b810ae7c2e432f24ec964d8afcd6))
* 优化统计结果的显示格式 ([40d2df8](https://github.com/LeafYeeXYZ/PsychPen/commit/40d2df86a5d84aa1b2de632c97324b44784d2288))

## [2.6.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.5.0...v2.6.0) (2025-04-26)


### Features

* 提供更详细的AI助手设置指引 ([6f5effa](https://github.com/LeafYeeXYZ/PsychPen/commit/6f5effa2eaaa9358d2f07f9195d0731e0224b069))
* 优化表达式显示, 并将检查小括号匹配情况 ([755abf1](https://github.com/LeafYeeXYZ/PsychPen/commit/755abf19a5c147a07873bc9aa403283302c1d53e))
* AI助手现在可以获取到过滤器信息 ([932690e](https://github.com/LeafYeeXYZ/PsychPen/commit/932690e39f42bead1a39211664b9295ee5fee75c))
* AI助手现在可以直接操作简单中介效应分析, 并在聊天界面显示结果 ([95d70c0](https://github.com/LeafYeeXYZ/PsychPen/commit/95d70c08521302f6a039ffa2a8d2db63c50ce05c))
* AI助手现在可以直接操作四种T检验 ([638e959](https://github.com/LeafYeeXYZ/PsychPen/commit/638e95983be125d60aa8c7172854d5ef37061625))


### Bug Fixes

* 修复部分图表的点大小设置宽度问题 ([03964e4](https://github.com/LeafYeeXYZ/PsychPen/commit/03964e49fc7d493c0e969340d76237dfac98d28d))


### Improvements

* 更新表格组件, 降低打包体积 ([0829dac](https://github.com/LeafYeeXYZ/PsychPen/commit/0829dace765d632548d81e1661d3c00368529836))
* 减少函数调用组件的Effect ([5e963e1](https://github.com/LeafYeeXYZ/PsychPen/commit/5e963e1a8ca0514895e75b2d1d50923f314ee195))
* 使用Ant Design兼容包恢复按钮波纹效果 ([56d69e6](https://github.com/LeafYeeXYZ/PsychPen/commit/56d69e6bdb628a2c8fcb5d3fc8af0ad81f2edd90))
* 提升设置组件的稳定性 ([110a267](https://github.com/LeafYeeXYZ/PsychPen/commit/110a267bdc9487c45e9f00d536eedd56ea809813))
* 优化输入给AI助手的文档, 降低推理成本 ([922ca98](https://github.com/LeafYeeXYZ/PsychPen/commit/922ca98aae592e40cb5d8534dac72aaeb904b54e))

## [2.5.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.4.0...v2.5.0) (2025-04-06)


### Features

* 统计参数添加斜体效果 ([1c3f68a](https://github.com/LeafYeeXYZ/PsychPen/commit/1c3f68a20fd86b7fa160832274ea16917d6ef4aa))
* 现在可以在AI助手回答完成前取消本次请求 ([4c181ba](https://github.com/LeafYeeXYZ/PsychPen/commit/4c181ba06bd0556f9df49451ffccb0f5d456a067))
* 现在统计结果的数字默认显示为APA格式 ([7f88f88](https://github.com/LeafYeeXYZ/PsychPen/commit/7f88f881eeaf5de3cd3e4f672a68061960d2fc50))
* 允许删除和复制AI助手的消息 ([2519a42](https://github.com/LeafYeeXYZ/PsychPen/commit/2519a4251aae721cfa43cdb9937737a0bc3546e3))
* AI助手在没有消息时新增示例提示词 ([7d0fc77](https://github.com/LeafYeeXYZ/PsychPen/commit/7d0fc77a42ff852feb67a22aa111f55b90e10e8a))


### Bug Fixes

* 修复未将数据格式升级同步到本地存储的问题 ([4d8bfd3](https://github.com/LeafYeeXYZ/PsychPen/commit/4d8bfd38a8704c4b3b37bb18f9eef30ead8cb307))
* 修复在有变量被过滤时计算变量失败的问题 ([8637103](https://github.com/LeafYeeXYZ/PsychPen/commit/8637103af7366f64d4ac2d233f585758bd2c9ec3))


### Refactoring

* 重构数据管理类型判断系统, 提升类型安全性 ([2c66606](https://github.com/LeafYeeXYZ/PsychPen/commit/2c6660653359b72275f473e723a4849e10282232))


### Improvements

* 移除不必要的类型转换, 提高计算性能 ([d5885a2](https://github.com/LeafYeeXYZ/PsychPen/commit/d5885a276674ddb61fa5be59af8317083533c600))
* 优化数据类型转换和判断逻辑 ([62a87ee](https://github.com/LeafYeeXYZ/PsychPen/commit/62a87ee66155455db412ad312fe98e3854b88ad3))

## [2.4.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.3.0...v2.4.0) (2025-04-02)


### Features

* 导入数据界面新增使用手册链接 ([8b5327e](https://github.com/LeafYeeXYZ/PsychPen/commit/8b5327e0a8f09e806de0de0a0facf28af905a4ec))
* 统计分析界面新增导出结果按钮 ([6a96822](https://github.com/LeafYeeXYZ/PsychPen/commit/6a968222229ef81e29261aaa948a1fc59a15f036))
* AI助手现在可以看到变量的q1和q3 ([6b2f059](https://github.com/LeafYeeXYZ/PsychPen/commit/6b2f059e3ace8df403ee3f8bcc90865e07f4fd51))


### Bug Fixes

* 现在过滤表达式错误后将直接抛出错误而不是过滤掉数据 ([cf16648](https://github.com/LeafYeeXYZ/PsychPen/commit/cf16648e672fd7f7bdb0691fe1a24e2b43b9ca96))
* 现在过滤表达式中的变量值可以为缺失值 ([4a3fb74](https://github.com/LeafYeeXYZ/PsychPen/commit/4a3fb74b1203203b67bdbfcfdde2704fead2e7ea))
* 修复暗色模式下部分颜色错误 ([99406a6](https://github.com/LeafYeeXYZ/PsychPen/commit/99406a60fadf58912ec161247fbca71c6f8ea79b))
* 修复AI助手应用过滤变量之后加载提示未消除的问题 ([3f87490](https://github.com/LeafYeeXYZ/PsychPen/commit/3f8749018d353490988c9917c23e1d99e65d6627))


### Refactoring

* 重构项目文件结构, 为加入更多AI功能做准备 ([68aa1c6](https://github.com/LeafYeeXYZ/PsychPen/commit/68aa1c6e3e6f51fdb1efb9a6f53e04bf9f81edb1))

## [2.3.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.2.0...v2.3.0) (2025-03-30)


### Features

* 新增全局错误捕获机制 ([6191b63](https://github.com/LeafYeeXYZ/PsychPen/commit/6191b63d9989a2fa861a2b829f07e514a9d1e89f))
* 新增示例数据, 可直接点击导入 ([9756da2](https://github.com/LeafYeeXYZ/PsychPen/commit/9756da22833dd01af9a0d06e0680ee79deca5fb1))
* AI助手现在可以操作缺失值定义和插值 ([734e29a](https://github.com/LeafYeeXYZ/PsychPen/commit/734e29a9284081f5281dca68341f031192bbdd00))
* AI助手现在可以进行连续函数调用 ([95f324b](https://github.com/LeafYeeXYZ/PsychPen/commit/95f324b9765289355a3a2f6c36f476f46d8aabbf))


### Bug Fixes

* 修复离开页面后未正确清理统计结果的问题 ([d25d432](https://github.com/LeafYeeXYZ/PsychPen/commit/d25d432fc0ffa898e981cd09a083d87a5eddc340))
* 修改AI助手验证方法, 减少和明确错误 ([18057e0](https://github.com/LeafYeeXYZ/PsychPen/commit/18057e0721eba8455507ef5552238b6bf46bca9b))

## [2.2.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.1.0...v2.2.0) (2025-03-25)


### Features

* 简单中介效应分析新增每一个参数的置信区间 ([95911ea](https://github.com/LeafYeeXYZ/PsychPen/commit/95911eaf0e26f0be51b474d79400f5fc99293caf))
* 描述统计新增统计量“总和” ([3e74c41](https://github.com/LeafYeeXYZ/PsychPen/commit/3e74c413f03785bdfa4b228fcf4cc0aeb596a761))
* 使用 biome 代替 prettier 和 eslint 并新增数项运行时类型检查 ([7f581e5](https://github.com/LeafYeeXYZ/PsychPen/commit/7f581e556f64152c42d79e4f5982544bac491992))
* 新增开发调试组件 ([81e70c6](https://github.com/LeafYeeXYZ/PsychPen/commit/81e70c6b47c49ef4ecc92f9961c457e418e4f5e3))
* 新增序列多元线性回归 ([08d9364](https://github.com/LeafYeeXYZ/PsychPen/commit/08d93649dff75ce8416d951adf225b3aaef54fa2))
* 新增逐步多元线性回归 ([f8add9c](https://github.com/LeafYeeXYZ/PsychPen/commit/f8add9c17aa8ee0f1eae88953080a355abcefbb1))
* 支持渲染AI助手输出的 TeX 公式 ([cb35355](https://github.com/LeafYeeXYZ/PsychPen/commit/cb353553a2ea03d2e04ac5b35cb7b83196a20b37))
* 重构统计结果渲染方式, AI助手现在可以获取当前统计结果 ([4c546e5](https://github.com/LeafYeeXYZ/PsychPen/commit/4c546e51d5de6dc65acb78df5ec70b3bc6b26a2d))
* AI助手现在可以知道用户当前所在页面 ([2c267b5](https://github.com/LeafYeeXYZ/PsychPen/commit/2c267b5e726c2c98e8f3f7fa9143cf604e01ac11))


### Bug Fixes

* 修复 JSON Schema 错误 ([502c2d3](https://github.com/LeafYeeXYZ/PsychPen/commit/502c2d384212f43ee47d8b297b098ff730ba9083))
* 修复保存图表时 oklch 颜色格式不支持的问题 ([5e36cac](https://github.com/LeafYeeXYZ/PsychPen/commit/5e36cac8fc4fa98d021016572244c2204b3ee322))
* 修复出错后系统未正常解除禁用状态的问题 ([39856b4](https://github.com/LeafYeeXYZ/PsychPen/commit/39856b40e6b6a6886b5eafd978fa89d46c166c98))
* 修复词云图无法关闭切分的问题 ([7a62ab7](https://github.com/LeafYeeXYZ/PsychPen/commit/7a62ab7cb143371e6678223bb91e8b31b46f0ada))
* 修复函数调用时的错误未捕获问题 ([084c7e9](https://github.com/LeafYeeXYZ/PsychPen/commit/084c7e933bc9676cecb59a84a9147d1e8aace123))
* 修复计算变量函数返回值错误的问题 ([f11349e](https://github.com/LeafYeeXYZ/PsychPen/commit/f11349e58fdc56262ed15faf2cf82ca5d48362b0))
* 修复子变量重复生成的问题 ([dec7f71](https://github.com/LeafYeeXYZ/PsychPen/commit/dec7f71f7b2545e6a358d5c341dad1205eb70e05))
* 移除废弃的接口调用 ([1283a91](https://github.com/LeafYeeXYZ/PsychPen/commit/1283a91a6df9ce06d2050efb0c37e05350163b3c))


### Improvements

* 修改默认 Bootstrap 抽样次数为 5000 ([64a7500](https://github.com/LeafYeeXYZ/PsychPen/commit/64a750043bf2e1c970f690f288313eafac75251e))
* 优化 AI 助手工作流程 ([c0305ed](https://github.com/LeafYeeXYZ/PsychPen/commit/c0305ed6042c5ec9dfc6aee0793b1e0c08aad4b7))
* 优化函数调用参数验证和错误处理 ([1fa38ee](https://github.com/LeafYeeXYZ/PsychPen/commit/1fa38ee903f84532f0f936bd5fa33362f0d6947e))
* 优化全局状态使用, 减少重新渲染 ([37cf99f](https://github.com/LeafYeeXYZ/PsychPen/commit/37cf99febe756599ea5153bfcbf98edbe9992be1))
* 优化小规模模型函数调用的稳定性 ([27108d1](https://github.com/LeafYeeXYZ/PsychPen/commit/27108d1517213fc4ca333b050888381c649075dd))

## [2.1.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v2.0.0...v2.1.0) (2025-03-08)

### Features

- 计算变量支持使用等距或等比变量的统计量 ([021592e](https://github.com/LeafYeeXYZ/PsychPen/commit/021592e732166b98e5d57769f967a8774b551db4))
- 将子变量信息添加到 AI 助手上下文中 ([42c4618](https://github.com/LeafYeeXYZ/PsychPen/commit/42c4618a767f3819bc02250a851b9fdf023e5a80))
- 为 AI 助手和 R 语言服务器设置提供更多引导 ([2ebbb23](https://github.com/LeafYeeXYZ/PsychPen/commit/2ebbb23c0213316a0209085d84f27ccee85864f9))
- 新增标准多元线性回归 ([0892f9c](https://github.com/LeafYeeXYZ/PsychPen/commit/0892f9ccde9758d371cdce403abbdcf9938f437e))
- 新增刷新后重新恢复上次导入的数据 ([f059bc5](https://github.com/LeafYeeXYZ/PsychPen/commit/f059bc5948d8ee1a3722a1bf31fcac3cab2a7a95))
- AI助手的部分操作现在需要用户手动确认 ([b4b233e](https://github.com/LeafYeeXYZ/PsychPen/commit/b4b233ee3e14075e99affabd740745164d18fc56))
- AI助手现在可以操作数据筛选 ([0a8f7e1](https://github.com/LeafYeeXYZ/PsychPen/commit/0a8f7e1ab0e19ebfe11255db4fc5d532186d1c1e))
- AI助手现在可以直接操作生成/清除中心化/标准化/离散化子变量 ([99b0f06](https://github.com/LeafYeeXYZ/PsychPen/commit/99b0f066e90e260c640077066cd8aba3ccb51c4a))
- AI助手现在可以直接操作生成新变量 ([09f62a9](https://github.com/LeafYeeXYZ/PsychPen/commit/09f62a9b051363cdf309afb6d635386554d38cf1))

### Bug Fixes

- 现在在数据被清除后将重制AI对话 ([7db07d0](https://github.com/LeafYeeXYZ/PsychPen/commit/7db07d05f4b1895a0a44cc827419c37666879df4))
- 修改子变量重复定义的问题 ([dcc4a80](https://github.com/LeafYeeXYZ/PsychPen/commit/dcc4a80eb5d35eb5cff3a9d7dde48e2235516bde))

### Refactoring

- 拆分数据相关 Hook 和 UI 相关 Hook ([7e72720](https://github.com/LeafYeeXYZ/PsychPen/commit/7e7272078a4180613686687084d618de89abaee9))
- 将部分类型重构为 enum 以便添加 AI 助手功能 ([9bd7e8b](https://github.com/LeafYeeXYZ/PsychPen/commit/9bd7e8b0006382724c5cfb0330ba99858d08d3ad))
- 重构数据筛选逻辑, 使用和计算变量相同的表达式 ([afb8e41](https://github.com/LeafYeeXYZ/PsychPen/commit/afb8e4199a531468d805139679b56679e8992b83))

### Improvements

- 提高数据安全性 ([8ceadb2](https://github.com/LeafYeeXYZ/PsychPen/commit/8ceadb28761a1aa4b0d86d1385803d2cb67c1d26))
- 优化消息通知效果 ([4f84568](https://github.com/LeafYeeXYZ/PsychPen/commit/4f845687714ed1f13116a703a77bef3f19f04d0c))
- 优化AI执行命令时的成功和错误提示 ([8f0dc06](https://github.com/LeafYeeXYZ/PsychPen/commit/8f0dc06523df7ba78555e1399d2254980dd43e49))

## [2.0.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.9.0...v2.0.0) (2025-02-22)

### Features

- 将使用文档加入到AI助手的上下文中 ([ad4b286](https://github.com/LeafYeeXYZ/PsychPen/commit/ad4b2865270fcde6962f6bde12a9f0d201207363))
- 新增AI辅助分析功能 ([0772209](https://github.com/LeafYeeXYZ/PsychPen/commit/077220938fdefd7c2628c7faaf99279c0ba3e7c0))
- AI助手的回复现在将流式传输 ([5cb6b86](https://github.com/LeafYeeXYZ/PsychPen/commit/5cb6b8693fee927c9d9473eb8ecdf8c4371e4ce4))
- AI助手现在可以获取变量信息并提供建议 ([5b36e42](https://github.com/LeafYeeXYZ/PsychPen/commit/5b36e42de11e2b0f047206b959bea06caa32c1c2))
- AI助手现在可以直接操作导出数据 ([1543282](https://github.com/LeafYeeXYZ/PsychPen/commit/1543282f82742a505e677fc7655be83cf9813941))
- AI助手现在可以主动控制页面跳转 ([f5861a4](https://github.com/LeafYeeXYZ/PsychPen/commit/f5861a4f9b0807f3d3623a2ce3ae5d8f009e3c70))

### Bug Fixes

- 修复 Vite 生产和预览环境不一致带来的错误 ([b9a5821](https://github.com/LeafYeeXYZ/PsychPen/commit/b9a5821e11ff5bc5267afaf197a8800eed866010))

### Refactoring

- 优化组件结构, 准备加入AI辅助分析功能 ([8d59e2c](https://github.com/LeafYeeXYZ/PsychPen/commit/8d59e2cea8f56311e4e9fe795e081448383169e3))
- 重构导航方式, 保留组件历史选择 ([944adde](https://github.com/LeafYeeXYZ/PsychPen/commit/944adde9722c07cb07c5dbe2083f64df66e8951e))

## [1.9.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.8.0...v1.9.0) (2025-02-20)

### Features

- 新增Q-Q图绘制功能 ([d2a1291](https://github.com/LeafYeeXYZ/PsychPen/commit/d2a12911878829a6e48c71f01648ec0d87ddc26a))
- 新增T分布动态演示 ([9792be5](https://github.com/LeafYeeXYZ/PsychPen/commit/9792be551d50d643aef8e67df5c247fbc721f0b4))
- 重复测量方差分析 ([8bef209](https://github.com/LeafYeeXYZ/PsychPen/commit/8bef209ea5aef817ea4ab18836e8752dedadb331))

### Bug Fixes

- 修复正态分布演示的样式错误 ([c2d296a](https://github.com/LeafYeeXYZ/PsychPen/commit/c2d296a9144c07a45bf45402c90cc9286a48a71f))

### Improvements

- 提高T分布演示抽样计算速度 ([a10582f](https://github.com/LeafYeeXYZ/PsychPen/commit/a10582f2c5544d24fffdbedbaa4357c693266a94))

## [1.8.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.7.0...v1.8.0) (2024-12-23)

### Features

- 使用 Web Worker 导入较大的数据文件 ([16c4889](https://github.com/LeafYeeXYZ/PsychPen/commit/16c4889cd72022decba99a943797a10b677d44d5))
- 提高计算变量执行用户表达式的安全性 ([7e2a0a5](https://github.com/LeafYeeXYZ/PsychPen/commit/7e2a0a5addf71a2228bb393793e0596f37036c36))
- 新增加载界面, 大幅减少白屏时间 ([8f732e0](https://github.com/LeafYeeXYZ/PsychPen/commit/8f732e0daa957f567668dfdf2559ddd52ed1c71f))
- 支持计算变量 ([8a4a689](https://github.com/LeafYeeXYZ/PsychPen/commit/8a4a6894c833249b4199e73257e0a83e7e4faa9b))
- 支持为所有变量统一定义缺失值 ([b56b8fe](https://github.com/LeafYeeXYZ/PsychPen/commit/b56b8fe30841d02ce95a5886c8b09494359d97a0))
- 支持一键清除所有过滤规则 ([393883c](https://github.com/LeafYeeXYZ/PsychPen/commit/393883cb44cd93f2b3bd7e6af4ad6127a72fd17a))
- 直方图的误差棒支持1.96和2.58倍标准差 ([1b07b8f](https://github.com/LeafYeeXYZ/PsychPen/commit/1b07b8fa4edf39c1182b89c44f214b2947b9578c))
- **server:** 信度计算支持Omega系数 ([5d8c067](https://github.com/LeafYeeXYZ/PsychPen/commit/5d8c067e558899593306d6fe3b864f1e3518cc9a))
- **server:** 支持通过环境变量设置密码 ([f54db6a](https://github.com/LeafYeeXYZ/PsychPen/commit/f54db6a1e757c601c7a1212e23d0e67eb539a00e))
- **server:** introduce server ([f602932](https://github.com/LeafYeeXYZ/PsychPen/commit/f602932defa1bf9d6abaf1b0d184c68fd0e84f75))
- **server:** omega系数支持手动指定因子数 ([df92c32](https://github.com/LeafYeeXYZ/PsychPen/commit/df92c32539de1955137ea75549544a5ca5274f6b))

### Bug Fixes

- 修复计算变量时缺失值未正常处理的问题 ([f4365e7](https://github.com/LeafYeeXYZ/PsychPen/commit/f4365e76e4f8d0798ed5082ac89aca8955f3690b))
- wrong imports ([346310e](https://github.com/LeafYeeXYZ/PsychPen/commit/346310ef16d5aea447ed03e533ecb94813596e57))

### Refactoring

- 把远程R函数的逻辑独立 ([4b4b904](https://github.com/LeafYeeXYZ/PsychPen/commit/4b4b904046d30366a6ec099e6cbe6d20de4ec9ab))
- 将信度处理逻辑抽象到 PsychLib ([6f39d04](https://github.com/LeafYeeXYZ/PsychPen/commit/6f39d04c7c3476c1be0839568e5432b330ec2c9b))

### Improvements

- 减少变量视图通知的显示时间 ([df0f849](https://github.com/LeafYeeXYZ/PsychPen/commit/df0f8497dc68dee846f0ea5212176d9b2fd7a515))
- 提高描述统计计算速度 ([d264137](https://github.com/LeafYeeXYZ/PsychPen/commit/d264137ba441bf0b5c3d016c202fd1d5881b718c))
- 提高描述统计运算速度 ([0c843ec](https://github.com/LeafYeeXYZ/PsychPen/commit/0c843ecd2302c5b07793d8c6d791da27776b247f))
- 优化变量值排序的实现 ([0954394](https://github.com/LeafYeeXYZ/PsychPen/commit/09543942f8fb9e58b87f4f92d03c7077f35b3ac1))
- 优化调用 R 时的错误报告 ([0f19cc3](https://github.com/LeafYeeXYZ/PsychPen/commit/0f19cc39a0dd1d58923b8984a611471c07eeb74a))

## [1.7.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.6.0...v1.7.0) (2024-11-25)

### Features

- 单因素方差分析新增Tukey'HSD事后检验 ([d6d5ba1](https://github.com/LeafYeeXYZ/PsychPen/commit/d6d5ba1226820eeb99f08a8557c177dbb0b78bc3))
- 定义缺失值插值时支持多选 ([418e94f](https://github.com/LeafYeeXYZ/PsychPen/commit/418e94fadc918a7ddff5f44f5fb3b179f18e6ac7))
- 分组直方图 ([60885c1](https://github.com/LeafYeeXYZ/PsychPen/commit/60885c168b81f1b511fcef56bac0ca4f70732c00))
- 分组直方图可以绘制误差线 ([75bcd9d](https://github.com/LeafYeeXYZ/PsychPen/commit/75bcd9dca4d66a06b3062c0f8234bc09863bb026))
- 描述统计增加更多统计量 ([814b97e](https://github.com/LeafYeeXYZ/PsychPen/commit/814b97e1e7b619c296fce74ab1e57315df524fa9))
- 球形度和KMO检验 ([a75d7a1](https://github.com/LeafYeeXYZ/PsychPen/commit/a75d7a1691ed6e1cd8b18b8673a5c0939148acfe))
- 数据筛选/过滤 ([4c99d3a](https://github.com/LeafYeeXYZ/PsychPen/commit/4c99d3acf810f43e49e27b773c214ced58beedc2))
- 新增数个词云图过滤规则并支持用户输入 ([7da7ebf](https://github.com/LeafYeeXYZ/PsychPen/commit/7da7ebffe8225b9e977dfa94417a092e7cefa956))
- 主题现在可动态变化 ([b3e21f8](https://github.com/LeafYeeXYZ/PsychPen/commit/b3e21f86c3a041d6d69fbb32423df7d877c09eaf))

### Bug Fixes

- 避免唯一值占比过小时显示零 ([f43ca61](https://github.com/LeafYeeXYZ/PsychPen/commit/f43ca6124d6d3564074fd52025d79f9342d080dc))
- 修复黑暗模式下滚动条颜色异常 ([13ccfa0](https://github.com/LeafYeeXYZ/PsychPen/commit/13ccfa0934a5b5de3fb2a09953e6bfa4e070a8d3))
- 修复基础柱状图未正确过滤缺失值的问题 ([ad53044](https://github.com/LeafYeeXYZ/PsychPen/commit/ad5304437b2866730582d510d5bf5fc6cc33d8b7))
- 修复误差棒偏移 ([1dd644d](https://github.com/LeafYeeXYZ/PsychPen/commit/1dd644d8e7adc43adfc894aedc28b7fc654f1669))
- 修复中介检验的标准化ab计算错误 ([f4f0e1b](https://github.com/LeafYeeXYZ/PsychPen/commit/f4f0e1bbb4d47d5bbf77d7b682f86c6698fc526c))
- bootstrap 置信区间计算错误 ([2f4e694](https://github.com/LeafYeeXYZ/PsychPen/commit/2f4e6947b52ea1f0e8e3f6449f33f6c2f10e7ae6))

### Improvements

- 优化词云图分词和标点过滤 ([eb45063](https://github.com/LeafYeeXYZ/PsychPen/commit/eb450637c1bf0ce16d005bc633220e163c9fd4d6))
- 优化样式 ([bbb1e49](https://github.com/LeafYeeXYZ/PsychPen/commit/bbb1e49a4dae9661002f0fd6bff2bbba89b335ae))
- Levene检验增加文字描述以避免误解 ([0c90543](https://github.com/LeafYeeXYZ/PsychPen/commit/0c9054360a464e30ed2ce24cc71f7af5326b4a5c))

## [1.6.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.5.0...v1.6.0) (2024-11-08)

### Features

- 添加 Welch T 检验 ([1ca0ec9](https://github.com/LeafYeeXYZ/PsychPen/commit/1ca0ec92ff82a90186a5410f9052d3edcbe97492))
- 新增单因素方差分析及其事后检验 ([f233ac8](https://github.com/LeafYeeXYZ/PsychPen/commit/f233ac8870b488fbde3b65285f5c51cd5c6db5e8))
- 新增卡方分布统计量和P值互转 ([aa57067](https://github.com/LeafYeeXYZ/PsychPen/commit/aa570679ac71a48b8f48c2fe5f397b8289be7dcc))

### Bug Fixes

- 更新PsychWasm, 修复F检验单双尾设置错误 ([525b844](https://github.com/LeafYeeXYZ/PsychPen/commit/525b8445378dd111460442c0f64cfa9cd0901ba0))
- 将所有WASM模块排除出VITE的依赖优化 ([0cc0a77](https://github.com/LeafYeeXYZ/PsychPen/commit/0cc0a77bce3d689e0aa62d8bf44bd9086addbeb5))
- 数值排序错误 ([03e6a62](https://github.com/LeafYeeXYZ/PsychPen/commit/03e6a6238feb264cdd3386d74e15b83d3b497710))
- 修复大数据量时中介检验卡顿 ([d08a6f7](https://github.com/LeafYeeXYZ/PsychPen/commit/d08a6f7c33fcd94fdfed810dd2c9f32915238240))
- 修复样式错误 ([f517792](https://github.com/LeafYeeXYZ/PsychPen/commit/f517792926025f6d25fafdd0f6f0b41afd0b95e8))
- 移除所有显著性输入框 ([0731111](https://github.com/LeafYeeXYZ/PsychPen/commit/0731111431e9180ed60f9890feb76966d1b68b5e))

### Refactoring

- 换用 psych-lib 进行 Levene 检验 ([1aebaa7](https://github.com/LeafYeeXYZ/PsychPen/commit/1aebaa7af436f4f0a940988fed33695f7fbaa70e))
- 换用 psych-lib 进行单样本 KS 检验 ([6ed7342](https://github.com/LeafYeeXYZ/PsychPen/commit/6ed73423b4570ee5a49381093c52db90b92e74b9))
- 换用 psych-lib 进行皮尔逊相关检验 ([4fd755b](https://github.com/LeafYeeXYZ/PsychPen/commit/4fd755b196d7bcc1ea5373566dd23f8f53315f04))
- 换用 psych-lib 进行正态分布生成 ([5ce04ec](https://github.com/LeafYeeXYZ/PsychPen/commit/5ce04ec0717979895e82bd11ff0221516c34b500))
- 换用 psych-lib 进行T检验 ([e4529b3](https://github.com/LeafYeeXYZ/PsychPen/commit/e4529b3463c61361d78b9fb882db4cf4c8f915b8))
- 换用 psych-sheet 进行数据导入导出 ([6309004](https://github.com/LeafYeeXYZ/PsychPen/commit/63090047d61583e9efff4beb135a61e7cf133be9))
- 删除 jstat 和 mathjs 依赖 ([54863a8](https://github.com/LeafYeeXYZ/PsychPen/commit/54863a816c35eebf191edc845ab35203ffc06394))

### Performance

- 大幅优化Bootstrap检验运算速度 ([55f53f4](https://github.com/LeafYeeXYZ/PsychPen/commit/55f53f49144bc1333d6c5e55dae58ff911e15cd0))
- 全面换用Web Assembly进行数学计算 ([d3c1a38](https://github.com/LeafYeeXYZ/PsychPen/commit/d3c1a3891c20afba8bf0bff06265ac53a1e2cc28))

## [1.5.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.4.0...v1.5.0) (2024-10-29)

### Features

- 词云图允许手动选择是否进行分词 ([4066888](https://github.com/LeafYeeXYZ/PsychPen/commit/4066888f0dd24a92534d0205601664897c892072))
- 二元线性回归增加更多文字解释 ([fbbba2c](https://github.com/LeafYeeXYZ/PsychPen/commit/fbbba2c8293649774258c98ef70d8b43f043ef73))
- 简单中介效应分析功能完成 ([7ba5da6](https://github.com/LeafYeeXYZ/PsychPen/commit/7ba5da652249ae7ebffe7907374d1b593d229c86))
- 新增峰度和偏度检验 ([ced1a88](https://github.com/LeafYeeXYZ/PsychPen/commit/ced1a882365eb11b6249ac34e93d3a10d19a8d53))
- 信度检验支持根据变量分组 ([eb7e3cb](https://github.com/LeafYeeXYZ/PsychPen/commit/eb7e3cbd76f431cbda065a2c0f2476b133b16773))
- 序列二元线性回归 ([3247ea6](https://github.com/LeafYeeXYZ/PsychPen/commit/3247ea6b8d06da9878f916d96561a53adae4b583))
- 支持导入 .parquet 文件 ([bda80c7](https://github.com/LeafYeeXYZ/PsychPen/commit/bda80c7e53f1692b9ff95657ae1b64709f182169))
- **preview:** 简单中介效应分析 ([0bfca2e](https://github.com/LeafYeeXYZ/PsychPen/commit/0bfca2eb71f9826c53cec701cfaa21a930e44999))

### Bug Fixes

- 耗时计算错误 ([18543c4](https://github.com/LeafYeeXYZ/PsychPen/commit/18543c42ae33dc1363a74a8df43e276d6ccad141))

### Refactoring

- 将计算众数的功能转移到 PsychLib ([7146202](https://github.com/LeafYeeXYZ/PsychPen/commit/71462024da9b659d6e3a521945e9908ec525b7ab))
- 重构变量处理模块, 采用模块化设计而为计算变量等未来功能提供支持 ([4b62023](https://github.com/LeafYeeXYZ/PsychPen/commit/4b62023d16864e49fc2d84292558f8dc2e41bf6e))

## [1.4.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.3.0...v1.4.0) (2024-10-26)

### Features

- 变量离散化 ([4fbc87e](https://github.com/LeafYeeXYZ/PsychPen/commit/4fbc87ee70776afdd692a1a6ac951f63e2b3a9f2))
- 二元线性回归 ([6324c1a](https://github.com/LeafYeeXYZ/PsychPen/commit/6324c1a2d36d02acc7a56fb948738e5e40394ec6))
- 基础饼图 ([a169011](https://github.com/LeafYeeXYZ/PsychPen/commit/a169011cad4b9cc134aefe7c26de260d6f348bf5))
- 基础柱状图/直方图 (带误差棒) ([394f4f4](https://github.com/LeafYeeXYZ/PsychPen/commit/394f4f4720c377c03fad7e4484c17f0933cdea40))
- 一元线性回归 ([363bc33](https://github.com/LeafYeeXYZ/PsychPen/commit/363bc334ee257ca0bb990f181ec97a3080a465d6))
- CART决策树绘图 ([352bf9a](https://github.com/LeafYeeXYZ/PsychPen/commit/352bf9a6e542e3fae83911b250738095bc7a3a0d))

### Bug Fixes

- 滚动相关样式错误 ([ea822c4](https://github.com/LeafYeeXYZ/PsychPen/commit/ea822c4da86b2ab27c1a09870235068cd91a9f44))
- 减小大数据量定义 ([ae144c6](https://github.com/LeafYeeXYZ/PsychPen/commit/ae144c6f7a484473d80f0babc42e09885860d7f1))
- 去除错误描述 ([cae1a19](https://github.com/LeafYeeXYZ/PsychPen/commit/cae1a19e9e3144739565bee1b884f7dfcf50cde0))

## [1.3.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.2.0...v1.3.0) (2024-10-24)

### Features

- 基础箱线图支持被试内变量绘图 ([7395692](https://github.com/LeafYeeXYZ/PsychPen/commit/7395692694fd22913416952eb04ad9acc2ccec33))
- 基础折线图支持被试内变量绘图 ([38878ca](https://github.com/LeafYeeXYZ/PsychPen/commit/38878caf1e163b8a30e0fca77f8f78ad56628087))
- 新增单独的描述统计页面 ([a6630ae](https://github.com/LeafYeeXYZ/PsychPen/commit/a6630aea075b4c4ea84780ed047759ba6d1c6af0))
- 新增平行折线图 ([fa20a24](https://github.com/LeafYeeXYZ/PsychPen/commit/fa20a24ab507952619029269a75a4ef2b4dd9eb6))
- 新增统计量和P值转换工具 ([d702b97](https://github.com/LeafYeeXYZ/PsychPen/commit/d702b97feb6b5d4226e7171b1318430985bf764a))
- 重测信度/复本信度/分半信度/同质性信度 ([1dd709e](https://github.com/LeafYeeXYZ/PsychPen/commit/1dd709e1fa265baf73a1e1a06315107f93a0f581))
- **preview:** 多元线性回归 ([13b2a68](https://github.com/LeafYeeXYZ/PsychPen/commit/13b2a680bf61f7a7342bbcdd6b53f585b7349399))
- **preview:** 多元线性回归支持选择优化器 ([a691284](https://github.com/LeafYeeXYZ/PsychPen/commit/a69128404296f6198444e908ca8f90c6d3cbc0b8))

### Bug Fixes

- AgGrid自动推断的数据格式错误 ([7f87009](https://github.com/LeafYeeXYZ/PsychPen/commit/7f87009714bcda6b07ce6bde0f308ca7470b7ac7))
- Levene检验被试内被试间不再使用同一个表单项 ([29a76fb](https://github.com/LeafYeeXYZ/PsychPen/commit/29a76fb28c0646f968c7b6d0cc3b99e9c6db2a52))

### Refactoring

- 提高编译版本, 新增浏览器过老提示 ([568b721](https://github.com/LeafYeeXYZ/PsychPen/commit/568b721fa367642c89dffd8b45500966793551bf))
- 重构全局状态结构, 简化项目结构, 为后期拓展做准备 ([834ea0c](https://github.com/LeafYeeXYZ/PsychPen/commit/834ea0c658f59ba0ea0349e9aecd3ce57cf65cd8))
- 重构样式架构, 新增黑暗模式 ([d019602](https://github.com/LeafYeeXYZ/PsychPen/commit/d019602fda2d289b902dea1a69eaf240129ff8e2))

## [1.2.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.1.0...v1.2.0) (2024-10-19)

### Features

- 为每个变量处理功能增加说明 ([b910e92](https://github.com/LeafYeeXYZ/PsychPen/commit/b910e92c4e1dd2f5e2d914ee62b4e583793cf20d))

## [1.1.0](https://github.com/LeafYeeXYZ/PsychPen/compare/v1.0.0...v1.1.0) (2024-10-19)

### Features

- 词云图(支持中文分词) ([1f3e711](https://github.com/LeafYeeXYZ/PsychPen/commit/1f3e711355204e8dac27d464edc5f42cc6a0c7d5))
- 词云支持过滤标点、数字、英文 ([1a76afb](https://github.com/LeafYeeXYZ/PsychPen/commit/1a76afbc79c56a0a78629ba2324be859ff6c7815))
- 皮尔逊相关报告更多统计量 ([7d14ea4](https://github.com/LeafYeeXYZ/PsychPen/commit/7d14ea4e7e198702444e830ebc57c70c3b2df6b3))
- 皮尔逊相关检验 ([cb44874](https://github.com/LeafYeeXYZ/PsychPen/commit/cb448749466d40f7810168d841271628778d67a0))
- 三维柱状图 ([27f738c](https://github.com/LeafYeeXYZ/PsychPen/commit/27f738ce683a9c6b2bc57a20e2b9ddd6bd14b085))
- 散点图新增回归功能 ([d39c55c](https://github.com/LeafYeeXYZ/PsychPen/commit/d39c55cad3a3aa274a60a08a35af7d8fc7510d8c))
- 生成标准化和中心化的子变量 ([6c0dbe9](https://github.com/LeafYeeXYZ/PsychPen/commit/6c0dbe9dc6354830084456eed4cabbf6b6ef6ee9))
- 使用AG-Grid替代Antd的Table组件, 大幅提高渲染性能 ([d5320d8](https://github.com/LeafYeeXYZ/PsychPen/commit/d5320d8f7c3bff1c0f7e78c864b8fa3d87ecf95e))
- 允许选择词云图文字方向 ([157820e](https://github.com/LeafYeeXYZ/PsychPen/commit/157820ea5988f44d5ad240f75cc522922d76d979))
- TXT文件支持UTF-8编码(而非默认的UTF-16) ([37726ba](https://github.com/LeafYeeXYZ/PsychPen/commit/37726baab517b90b96a4a0c7a58a9037b2c9b104))

### Bug Fixes

- 词云图表单样式错误 ([a1d1415](https://github.com/LeafYeeXYZ/PsychPen/commit/a1d14156d06d82bd5b050468c01dd3f1e1c8f97d))
- 词云图水平单词排布未生效 ([471828a](https://github.com/LeafYeeXYZ/PsychPen/commit/471828a61ce6b79a3918fcbf8682be14d0102c3a))
- 拼写错误 ([12f2727](https://github.com/LeafYeeXYZ/PsychPen/commit/12f2727e5005bffd5dd752bedfb666a16a1e3b55))
- 子变量描述统计量错误 ([cd38b5e](https://github.com/LeafYeeXYZ/PsychPen/commit/cd38b5ed519873ef1bb97c3b9d7fb1f99dfba9cb))

## 1.0.0 (2024-10-17)

### Features

- 3D散点图和自定义点大小 ([e8d8a15](https://github.com/LeafYeeXYZ/PsychPen/commit/e8d8a153e3fe947f0cadd6ef81a6a913b1190b35))
- 报告效应量并优化统计表 ([dba770a](https://github.com/LeafYeeXYZ/PsychPen/commit/dba770ae9b1abc0fa9738e3ab23f1d086df79929))
- 变量视图和描述统计 ([315ffab](https://github.com/LeafYeeXYZ/PsychPen/commit/315ffabe246b7c54c54f97fdf20c2fd058b61f6a))
- 表头始终显示 ([3adf224](https://github.com/LeafYeeXYZ/PsychPen/commit/3adf2248fa75bca7d39ff71941d0a815f5bf419b))
- 单样本T检验和配对样本T检验 ([75e048e](https://github.com/LeafYeeXYZ/PsychPen/commit/75e048e98da0b0a8adb681fbe7cb7e8a85db6f2b))
- 动态演示正态分布 ([6b41a45](https://github.com/LeafYeeXYZ/PsychPen/commit/6b41a456ff8b73893a37fac8baaf5cf3bc921d1c))
- 独立样本T检验 ([7e7b7b5](https://github.com/LeafYeeXYZ/PsychPen/commit/7e7b7b55e7acca7719402f9949580db92450d808))
- 基础散点图 ([7d96b21](https://github.com/LeafYeeXYZ/PsychPen/commit/7d96b218c56a85217ca5dfcd95e24364a6ec3d09))
- 基础箱线图 ([441de06](https://github.com/LeafYeeXYZ/PsychPen/commit/441de060c844ed55d1baa4f979032b5fd67d0f53))
- 基础折线图 ([b0b3143](https://github.com/LeafYeeXYZ/PsychPen/commit/b0b31437fc937197bf031964a86e6ec625d288d9))
- 计算耗时记录 ([4a5cfc8](https://github.com/LeafYeeXYZ/PsychPen/commit/4a5cfc8ab37c6db295972ca8d51746f93d66fb9c))
- 计算失败时发出通知 ([edd5fff](https://github.com/LeafYeeXYZ/PsychPen/commit/edd5fffc36e75248660c31a8d0a4c412db28c782))
- 计算时禁用表单 ([be75423](https://github.com/LeafYeeXYZ/PsychPen/commit/be75423eb8c17b6291d0bb02fcb58f4a2fd45bf1))
- 两种非参数检验 ([4378dac](https://github.com/LeafYeeXYZ/PsychPen/commit/4378dacb6d33e938f11bd1e5246f96d84ee7a520))
- 其余界面框架 ([fbcd85d](https://github.com/LeafYeeXYZ/PsychPen/commit/fbcd85de1966c5767e5f9f08cece55e997428a17))
- 数据处理完成通知 ([b38be82](https://github.com/LeafYeeXYZ/PsychPen/commit/b38be829b3b66e31fc3d8e6d6c293e915aec00f5))
- 数据导入 ([4cfff1e](https://github.com/LeafYeeXYZ/PsychPen/commit/4cfff1eb3f16fbbe851aa204060620c8b73eaca5))
- 以多种格式导出数据文件 ([23b5030](https://github.com/LeafYeeXYZ/PsychPen/commit/23b503042eb6942d6c51da29bfee08efd0a795f2))
- 预增加检验选项 ([11b0dd9](https://github.com/LeafYeeXYZ/PsychPen/commit/11b0dd97fdeabe9f07877b6089e93e04859750fb))
- 正态分布演示新增曲线 ([45c8aa7](https://github.com/LeafYeeXYZ/PsychPen/commit/45c8aa75338d3c52762814b2f2388f6fb62927eb))
- 正态分布演示支持自定义速度 ([30de0ef](https://github.com/LeafYeeXYZ/PsychPen/commit/30de0effafb0d8cec516fc7e29fe376ad408767f))
- 支持导入 .dta 文件 ([1cefa8a](https://github.com/LeafYeeXYZ/PsychPen/commit/1cefa8a8798883d1643449ec7ffa252dc47031b8))
- 支持导入 sav 文件 ([c0d64f7](https://github.com/LeafYeeXYZ/PsychPen/commit/c0d64f750a8b5cb95bf81b61cd7651610bebd563))
- 支持四种缺失值插值算法 ([ef9f555](https://github.com/LeafYeeXYZ/PsychPen/commit/ef9f5556ef53e3699b9c700abeadd824483fc145))
- 支持图像导出 ([bcd10af](https://github.com/LeafYeeXYZ/PsychPen/commit/bcd10afdacb72560e358ee450b224d4e2e122970))
- 支持自定义缺失值 ([9ffbdfa](https://github.com/LeafYeeXYZ/PsychPen/commit/9ffbdfa8fe55bd06164e27076627f3da64d4cd33))
- Levene检验支持被试内和被试间变量 ([efb9c04](https://github.com/LeafYeeXYZ/PsychPen/commit/efb9c04dc25acf0cfc4478c3f48b9ff4f5c7c76e))
- SEO优化 ([382c9da](https://github.com/LeafYeeXYZ/PsychPen/commit/382c9dab04b6d5997ac1b9915b5775c7e9fa22b8))

### Bug Fixes

- 变量类型判断 ([6e0e69a](https://github.com/LeafYeeXYZ/PsychPen/commit/6e0e69a6bfc864b1cecfa39f5e7bb391f5007ed6))
- 变量类型判断和数据过滤 ([eaeaf9b](https://github.com/LeafYeeXYZ/PsychPen/commit/eaeaf9b7835bef6a5299681b28b02755d473914d))
- 错误地弹出文件列表 ([9e52918](https://github.com/LeafYeeXYZ/PsychPen/commit/9e52918d0810af1e32227f9ea15f9437e684f593))
- 计时器重复设置 ([9a1b276](https://github.com/LeafYeeXYZ/PsychPen/commit/9a1b276ae4404f3e771301e5dfea7158655cb024))
- 类型错误 ([38d5a2f](https://github.com/LeafYeeXYZ/PsychPen/commit/38d5a2fc5c4f052b099f31e582c8aef2032a7be5))
- 描述不一致 ([e128a6a](https://github.com/LeafYeeXYZ/PsychPen/commit/e128a6a375960a52801694f89edbc38348b61ac0))
- 配对样本T检验缺失值处理 ([334faf0](https://github.com/LeafYeeXYZ/PsychPen/commit/334faf02272051546be9ff6fc47023b1ae73b5d8))
- 潜在的引用错误 ([bbc8584](https://github.com/LeafYeeXYZ/PsychPen/commit/bbc8584ea11d56d2f0b3e5cd9e12bfa58f06634b))
- 缺失值处理 ([e54b0ce](https://github.com/LeafYeeXYZ/PsychPen/commit/e54b0ce34a36b6b2ba0dcf5ec9a2ddd9da5d3437))
- 散点图分类变量选择方式 ([5d2ccca](https://github.com/LeafYeeXYZ/PsychPen/commit/5d2cccae065ec8bbb9b8b9970258594fb08141be))
- 数据点不足时, 拉格朗日插值返回 undefined ([d953cac](https://github.com/LeafYeeXYZ/PsychPen/commit/d953cac08e91a2792ed983063f447fdce9edcddd))
- 图像分组变量缺失值处理 ([26a5c82](https://github.com/LeafYeeXYZ/PsychPen/commit/26a5c820316ff6eb868ab284aa7ec4ba886cc4b1))
- 图像数据处理计时错误 ([2642eb7](https://github.com/LeafYeeXYZ/PsychPen/commit/2642eb726b88e3b3a60b6e2b105bd893d339eda2))
- 小屏设备布局错误 ([148542d](https://github.com/LeafYeeXYZ/PsychPen/commit/148542dbf901ed2f382b4287e4dc3802fb988bdc))
- 作用域错误 ([7ed3d70](https://github.com/LeafYeeXYZ/PsychPen/commit/7ed3d708ab24ee2ac725845c42fdca69882bf5ab))
