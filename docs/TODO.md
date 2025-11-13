# TODO

## 发现
1. 考虑加大移动端 主内容区/侧栏/搜索渲染 的字体大小与间隔大小
2. 面包屑导航第一个面包屑的聚焦样式左侧色彩被淡化

## 建议
1. 搜索结果筛选：文件夹名/书签名/URL
2. 考虑是否重新使用oobe这样的加载库
3. 多根目录时考虑展开得到一级文件夹

## 架构与耦合优化（待处理）

1. render/search 与分页模块 API 不一致
   - [x] 补全 SearchResultsManager.updatePaginationPosition 或移除 render/search.js 对外暴露的 updatePaginationPosition，避免无效导出和隐式调用。
   - 相关文件：[`assets/js/modules/render/search.js`](assets/js/modules/render/search.js:489)

2. 元素工厂解耦
   - [x] 将 createElement 从 sidebar 模块抽离到独立元素工厂（render/elements.js），并通过 sidebar.js 提供兼容包装，供 sidebar/content/search 共用，避免 sidebar.js 作为全局元素工厂唯一来源。
   - 相关文件：[`assets/js/modules/render/elements.js`](assets/js/modules/render/elements.js:1), [`assets/js/modules/render/sidebar.js`](assets/js/modules/render/sidebar.js:40), [`assets/js/modules/render/content.js`](assets/js/modules/render/content.js:146), [`assets/js/modules/render/search.js`](assets/js/modules/render/search.js:151)

3. 消息展示统一管理
   - [x] 抽取 Message/Overlay 管理模块（Home / Loading / Error / NoResults），统一负责 .home-message / .no-results / .error-message 的创建与销毁，减少 loader/home/search 对全局 DOM 的重复操作。
   - 相关文件：[`assets/js/modules/render/home.js`](assets/js/modules/render/home.js:157), [`assets/js/modules/loader/index.js`](assets/js/modules/loader/index.js:11), [`assets/js/modules/render/search.js`](assets/js/modules/render/search.js:428)

4. 事件监听聚合模块瘦身
   - [ ] 将与设备适配、标题彩蛋等非核心逻辑从 listener/index.js 拆分为独立监听模块，initEventListeners 仅做聚合注册，降低对 render/device、render/home 等模块的强耦合。
   - 相关文件：[`assets/js/modules/listener/index.js`](assets/js/modules/listener/index.js:166)

5. Web Worker 创建统一化
   - [ ] 创建 Worker 管理模块统一实例化 search-worker 与 data-worker，避免在 loader/index.js 与 search/index.js 中重复 new Worker 和硬编码路径。
   - 相关文件：[`assets/js/modules/loader/index.js`](assets/js/modules/loader/index.js:119), [`assets/js/modules/search/index.js`](assets/js/modules/search/index.js:52,73)

6. 废弃/未使用逻辑清理
   - [ ] 核查并处理 device.js 中 updatePaginationPositionIfExists 等未导出/未调用的遗留函数，确认是否接入当前分页响应式方案或删除，避免误导后续维护。
   - 相关文件：[`assets/js/modules/render/device.js`](assets/js/modules/render/device.js:66)
