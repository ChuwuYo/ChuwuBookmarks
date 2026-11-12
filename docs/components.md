# 组件规范

站点 UI 由原生 Custom Elements 组成，零构建、Light DOM（不使用 Shadow DOM），
全局样式与主题变量直接生效。本文件是组件的唯一规范：先改规范，再改实现。

## 通用约定

### 文件结构

每个组件一个目录，结构、行为、样式分离，可整体复制到其他项目使用：

```
assets/components/<name>/
  <name>.js    # customElements.define，仅依赖浏览器 API、同目录文件与 bm-icon
  <name>.css   # 颜色取自设计令牌（CSS 变量），不在规则里写死
```

组件的全部样式都在自己的 `<name>.css` 里，包括在页面不同位置的变体（如内容区与侧边栏中的
`bm-card`）、窄屏规则与悬停效果；`assets/css/` 下的全局样式表只放令牌、页面布局与不属于任何组件的页面元素。
组件 CSS 在 `index.html` 中排在全局样式表之后。

`<bm-icon>` 是组件间唯一的共享依赖：`bm-card` 与 `bm-breadcrumbs` 通过
`../bm-icon/bm-icon.js` 创建图标，复制这两个组件时需连同 `bm-icon/` 目录与
`assets/images/icons.svg` 一起复制。`bm-sidebar` 依赖
`assets/js/modules/utils/scroll-activity.js`（及其导入的 `motion.js`），复制时一并带上。
其余组件可单独复制。

组件 CSS 由 `index.html` 用 `<link rel="stylesheet">` 统一引入；组件 JS 由 `assets/components/index.js` 统一注册。

### 设计令牌

颜色、阴影、焦点环、圆角、层级、时长等只定义在 `assets/css/base.css` 的 `:root` 中，
规则里不写颜色、`z-index` 或圆角字面量；由令牌推导的 `calc()`（如分页按钮伪元素的
`calc(var(--pagination-border-radius) + 2px)`）不算字面量。颜色字面量的例外只有两处：
遮罩渐变里只取透明度的 `#000`，以及 `theme-toggle.css` 中日月图案的固定配色。
组件只读这些变量，并为自身可调部分暴露
`--bm-<组件>-*` 变量，默认值回落到全局令牌，例如：

```css
bm-icon { width: var(--bm-icon-size, 1em); }
```

- **颜色**：一律用 `light-dark(浅色, 深色)`。`:root` 的 `color-scheme` 由
  `data-theme` 决定（`:root[data-theme="dark"]` 只设置 `color-scheme: dark`），
  `light-dark()` 随之取值，不再按主题重复声明令牌。阴影由颜色令牌拼成
  （`--shadow-color`、`--shadow-color-strong`、`--glow-color`、`--highlight-*` 等）；
  浅色与深色的偏移或模糊不同时，写成两层阴影，各自用 `light-dark(颜色, transparent)`
  只在一个主题下显示。`[data-theme]` 选择器只留给 `light-dark()` 表达不了的情况：
  主题按钮的图标变形与长度值，以及图片。
- **焦点**：`base.css` 的全局 `:focus-visible` 用 `--focus-ring-width`、`--focus-ring-color`、
  `--focus-ring-offset` 画 `outline`，所有可交互元素共用，组件不再写自己的 outline，
  也不在静止状态或触屏下写 `outline: none`。焦点环跟随元素自身的圆角，聚焦时不改形状。
  需要外圈光晕的组件用 `--focus-halo-color` / `--focus-halo-color-strong` 加 `box-shadow`，
  但不能只靠 `box-shadow`。`forced-colors: active` 下不覆盖 outline 颜色。
- **圆角**：`--radius-1`…`--radius-8`（3/4/6/8/10/12/15/18px），圆形 `--radius-round`（50%），
  胶囊 `--radius-full`（999px）。
- **层级**：页面层 `--z-decor`、`--z-content`、`--z-message`、`--z-float`、`--z-sidebar`、
  `--z-sidebar-raised`、`--z-sidebar-toggle`；元素内部的局部叠放用
  `--z-local-below`、`--z-local-1`…`--z-local-3`。
- **断点与输入方式**：布局只按宽度判断，用范围语法写媒体查询：窄屏 `(width < 480px)`、
  平板 `(480px <= width < 1024px)`、桌面 `(width >= 1024px)`（侧边栏常驻），数值记录在
  `assets/css/breakpoints.css`。横屏手机的例外 `(any-pointer: coarse) and (height < 600px)`
  只与窄屏一起组成“手机布局”。悬停效果只写在 `(hover: hover) and (pointer: fine)` 里；
  其余设备（触屏、触控笔、混合设备）统一走它的补集
  `not ((hover: hover) and (pointer: fine))`，触屏专用的样式用 `(any-pointer: coarse)`。
  不用 JS 给 `body` 或容器加设备类。JS 需要的断点与输入判断一律从
  `assets/js/modules/utils/viewport.js` 读取（`isNarrow()`、`isCompact()`、
  `isSidebarOverlay()`、`canHover()`、`hasCoarsePointer()`，以及 `onChange(name, cb)`
  订阅 `MediaQueryList` 的变化），不比较 `window.innerWidth`，不检测 `ontouchstart`
  或 User-Agent（`<bm-search>` 的快捷键标签除外）。

动效令牌同样只在 `base.css` 定义：时长 `--duration-1`…`--duration-5`
（100/150/200/300/400ms）、`--duration-loop`、`--duration-spin`、
`--duration-theme-expand/collapse`、`--stagger-step`、`--scroll-idle`（600ms，滚动停止到滚动条开始淡出），
循环次数 `--loop-count`，缓动
`--ease-out`、`--ease-in-out`、`--ease-standard`、`--ease-linear`、`--ease-spring`、
`--ease-spring-soft`。`transition` 必须逐项写出属性，不写 `all`；被过渡的自定义属性要用
`@property` 注册。入场动画用 `backwards` 填充，结束后不再锁住 `transform`/`opacity`，
悬停等状态样式照常生效。装饰性循环动画的次数写 `var(--loop-count)`，加载指示器固定
`infinite` 并使用 `--duration-spin`。减弱动态效果统一由 `base.css` 的
`prefers-reduced-motion` 块改写这些令牌（缩短时长、取消错峰、装饰循环只播一次、加载
指示器放慢但继续转动），组件不另写。JS 需要的时长、缓动与减弱动态效果判断
一律经 `assets/js/modules/utils/motion.js` 从这些令牌读取，不在 JS 里重复数值。
例外：首页标题动画的编排节拍（`render/home.js` 的 `INTRO`）只属于这一段动画，
留在 home.js 中，减弱动态效果时由 motion.js 统一调整 GSAP 全局时间缩放；
主题切换的兜底超时（`render/theme.js` 的 `SAFETY_MARGIN`）不是动效时长。

入场与依次出现只用 CSS：`animations.css` 的 `@keyframes enter`（淡入并位移
`--enter-offset`，默认 `--motion-distance` 自下而上；面包屑取负值自上而下，侧边栏设为 `0px`
只淡入），依次出现的延迟统一为 `calc(var(--item-index) * var(--stagger-step))`，
`--item-index` 由渲染模块用 `style.setProperty()` 写在每一项上。GSAP 只用于首页标题的编排。
侧边栏展开时 `.sidebar` 带 `data-entering`，其中的文件夹播放入场动画，播完后移除。
搜索翻页时 `#content` 带 `data-page-changing`，播放一次 `@keyframes dim-and-restore`
（先变暗再恢复），`animationend` 时移除并聚焦第一项结果（书签的链接或文件夹卡片，`preventScroll`）。

### 加载与地址栏

- `#content` 与 `#breadcrumbs` 只由 `render/view.js` 写入：`showView({ content, breadcrumbs })`
  开始一个新视图（两者整体替换，缺省为空，同时移除 `data-page-changing`）并返回视图 id；
  `updateView(view, { content?, breadcrumbs? })` 只在该视图仍是当前视图时替换给出的部分；
  `isCurrentView(view)` 供异步续写（懒加载文件夹、搜索结果、首页标题逐字动画）在每个
  `await` 之后核对；`leaveView()` 让当前视图的待完成续写失效（搜索输入变化时调用）。
  首页、文件夹、搜索、空结果与错误都在 `#content` 内渲染，各布局只有这一条路径。
- 首页视图在 `script.js` 启动时直接渲染（只依赖 `site.config.js`）；地址栏带 `q` 时改为显示
  搜索加载提示。书签数据到达后只渲染侧边栏，不重新渲染主视图。
- 加载提示、空结果与错误的节点由 `render/message.js` 构建：`loadingMessage(text)` 返回
  `.loading`（`role="status"`），内含 `.loading-spinner` 与 `.loading-text`，转圈尺寸取令牌
  `--spinner-size` 与 `--spinner-width`；另有 `noResultsMessage()`、`dataErrorMessage(error)`、
  `searchUnavailableMessage()`、`folderErrorMessage(title)`。懒加载文件夹与搜索共用同一加载提示。
- 清空或整体替换容器内容一律用 `replaceChildren()`，不写 `innerHTML = ""`。
- 地址栏中的搜索状态（`q`、`page`）只经 `assets/js/modules/utils/url-state.js` 读写：
  `readSearchState()` 返回 `{ query, page }`，`writeSearchState({ query?, page? })`
  只改动传入的字段，用 `history.replaceState` 写入，失败时只记录错误。

### 滚动条

页面与侧边栏使用同一套原生滚动条，不用 JS 绘制滚动指示器：

- 滚动容器加 `class="autohide-scrollbar"`（目前是 `<html>` 与 `#sidebar-folders`），
  样式集中在 `base.css`：`scrollbar-width: thin`，滑块颜色取已注册的
  `--scrollbar-thumb`（`<color>`，静止时透明，显示时为 `--scrollbar-thumb-color`）。
  Chromium 不会在样式变化时重绘视口上的 `::-webkit-scrollbar`，所以统一用
  `scrollbar-color`；只有不支持 `scrollbar-color` 的浏览器退回 `::-webkit-scrollbar`。
- 只在 `(pointer: fine)` 下隐藏与淡入淡出；触屏保留系统自带的悬浮滚动条。
  `<html>` 设 `scrollbar-gutter: stable`，页面长短切换时内容不左右跳动。
- 容器带 `data-scrolling` 时显示；元素容器（不含 `<html>`）悬停时也显示。显示用
  `--duration-1` `--ease-out` 淡入，隐藏用 `--duration-3` `--ease-linear` 淡出。
  不可滚动时浏览器本身不画滚动条。减弱动态效果时只缩短淡出，仍只改颜色、不移动。
- 不支持滚动驱动动画的浏览器（如 Firefox 默认）看不到侧边栏上下渐隐，
  `#sidebar-folders` 改为常显滑块。
- `data-scrolling` 只由 `assets/js/modules/utils/scroll-activity.js` 的
  `trackScrollActivity(root, { idle })` 设置：滚动时加上，停止 `idle`（默认
  `--scroll-idle`）毫秒后移除；用鼠标或笔按住滚动条拖动期间保留，同一指针松开后重新计时。
  `root` 为 `document.documentElement` 时跟踪页面滚动（由 `script.js` 调用）；
  传其他元素时用捕获监听跟踪它及其后代中的任意滚动容器。返回取消跟踪的函数。
- 面包屑与窄屏分页条等横向滚动条带仍隐藏滚动条（`scrollbar-width: none`）。

### 公开接口

- **Attributes**：字符串/布尔配置，均有默认值；需要响应变化的写进 `observedAttributes`。
- **Properties**：结构化数据（数组、对象）只通过 property 传入，不序列化进 attribute。
- **Events**：`bm-<动作>` 命名的 `CustomEvent`，`bubbles: true`，数据放在 `detail`。
  组件不直接调用应用模块。应用在一处处理所有 `bm-*` 事件：
  `assets/js/modules/listener/component-listener.js` 在 `document` 上委托监听，
  按 `event.target` 的位置区分来源（例如侧边栏 `#sidebar-folders` 中的 `bm-open-folder`）；
  渲染模块只渲染，不给组件挂监听。
- **DOM 契约**：组件渲染出的 class 名与结构写在下面各节，测试与样式只依赖这些契约。

### 状态

组件与页面的状态一律用 attribute 表示，CSS 与测试按 attribute 选择：

- **ARIA**：有语义的状态用 ARIA 或原生属性，并直接作为样式钩子，例如
  `aria-current`、`aria-expanded`、`aria-pressed`、`aria-busy`、原生 `disabled`。
- **`data-*`**：纯视觉或界面状态，例如 `data-state`、`data-scrolling`、`data-loaded`。
- **class**：只表示身份与类型（`.folder`、`.bookmark`、`.breadcrumb-item`），不随状态增删。
- **内联样式**：只用 `style.setProperty()` 写每个实例的数值自定义属性（如 `--item-index`、`--theme-turn`）。

| 状态 | 表示方式 |
| --- | --- |
| 当前项 | `aria-current="page"`（分页）/ `aria-current="location"`（面包屑） |
| 禁用 | 原生 `disabled` |
| 展开/收起 | 切换按钮的 `aria-expanded` + 侧边栏的 `data-state="expanded" / "collapsed"` |
| 滚动中 | 滚动容器上的 `data-scrolling`（见“滚动条”） |
| 图标已加载 | `bm-card` 的 `.bookmark-icon[data-loaded]` |
| 空结果 | 渲染空状态文本节点，不渲染列表 |

页面级的临时状态同样是 `<html>` 或 `#content` 上的 `data-*`：
`data-reveal="loading" / "entering"`（首屏显现）、`data-theme-switching`（切换主题期间暂停过渡）、
`data-theme-transition="circle" / "circle reverse"`（圆形主题过渡）、`#content` 的
`data-page-changing`（搜索翻页反馈）、`.sidebar` 的 `data-entering`（展开时文件夹入场）。

### 可访问性

- 可点击元素使用 `<button>` 或 `<a>`，不在 `div` 上模拟按钮。
- 装饰性图标 `aria-hidden="true"`；纯图标按钮必须有 `aria-label`。
- 键盘可达：Tab 顺序与视觉顺序一致，焦点样式可见。

### 测试

- 纯逻辑（例如分页页码计算）写成独立导出函数，用 `node --test` 单测。
- 组件行为由 `tests/e2e/smoke.spec.js` 覆盖；外观由 `tests/e2e/visual.spec.js` 截图覆盖。

---

## `<bm-icon>`

内联 SVG 图标，引用 `assets/images/icons.svg` 中的 `<symbol>`。

| 接口 | 说明 |
| --- | --- |
| `name` attribute | 图标 id：`folder`、`link`、`search`、`breadcrumb` |
| `label` attribute | 可选；提供时设置 `role="img"` 与 `aria-label`，否则 `aria-hidden="true"` |
| `--bm-icon-size` | 尺寸，默认 `1em` |
| `--bm-icon-align` | `vertical-align`，默认 `-0.125em` |

DOM 契约：`<bm-icon name="folder" aria-hidden="true"><svg><use href="…/icons.svg#folder"></use></svg></bm-icon>`

JS 中用 `createIcon(name, label?)` 创建。新增图标：在 `icons.svg` 中添加
`<symbol id="名称" viewBox="0 0 32 32">`。现有图标来自 Fluent Emoji（Flat，MIT 许可，
© Microsoft），保持同一风格以与整体可爱的视觉一致。

## `<bm-pagination>`

搜索结果分页导航。页码由纯函数 `getPageRange(current, total, windowSize = 3)`
（`page-range.js`）计算：以当前页为中心显示 3 个连续页码，始终显示首末页，缺页处显示省略号。

| 接口 | 说明 |
| --- | --- |
| `total` attribute | 总页数，默认 `1`；不足两页时导航隐藏 |
| `current` attribute | 当前页，从 1 开始，默认 `1`，超出范围时取边界值 |
| `label` attribute | 导航的 `aria-label`，默认 `分页导航` |
| `bm-page-change` event | `detail: { page }`；组件已先更新 `current` |
| 键盘 | `←` / `→` 在按钮间移动焦点，`Home` / `End` 跳到首尾按钮 |
| 焦点 | 重新渲染时若焦点在导航内，焦点留在对应的新按钮上；该按钮被禁用（如末页的下一页）时移到当前页按钮 |

DOM 契约：`bm-pagination > nav.pagination-container > .pagination-prev, .pagination-page, .pagination-ellipsis, .pagination-next`。
当前页只用 `aria-current="page"` 表示（样式按它选择），首尾按钮用原生 `disabled`。

定位：导航条由组件自己 `position: fixed` 在视口底部水平居中，不使用页面的布局类。
`--bm-pagination-offset`（默认 `0px`）是居中后的水平偏移，由页面布局设置：
`layout.css` 在桌面端侧边栏展开时把 `.main-content` 上的它设为 `--desktop-base-offset`。

尺寸变量：`--pagination-button-size`、`--pagination-spacing`、`--pagination-font-size`、
`--pagination-button-padding`（移动端 6px，补足 44px 触控区域）。

例外：分页沿用旧版公开的 `--pagination-*` 变量名（不改名，避免破坏已有的自定义样式），
在 `bm-pagination.css` 的 `:root` 中定义，值全部引用 `base.css` 的全局令牌：
颜色 `--pagination-bg`、`--pagination-border`、`--pagination-text`、`--pagination-active-bg`、
`--pagination-active-text`、`--pagination-hover-bg`、`--pagination-disabled-text`，
圆角 `--pagination-border-radius`，阴影 `--pagination-shadow`、`--pagination-shadow-hover`、
`--pagination-shadow-active`、`--pagination-shadow-focus`。

## `<bm-breadcrumbs>`

| 接口 | 说明 |
| --- | --- |
| `path` property | `Array<{ title: string }>`，从根到当前文件夹 |
| `bm-navigate` event | `detail: { index }`，`-1` 表示主页，其余为 `path` 下标 |

元素为 `display: contents`，父元素（`#breadcrumbs`）作为横向滚动容器。组件只渲染自身子节点，
不读写父元素，也不监听滚动或尺寸。

边缘渐隐是纯 CSS，与侧边栏 `#sidebar-folders` 共用一套机制：`base.css` 注册
`--edge-fade-start` / `--edge-fade-end`（`<length>`，初始 `0px`）与关键帧
`edge-fade-start` / `edge-fade-end`；滚动容器设置 `--edge-fade-size`（面包屑 `1.5rem`），
`mask-image` 读这两个长度，动画用 `animation-timeline: scroll(self inline)`（侧边栏为
`scroll(self)`）驱动。有隐藏内容的一侧才渐隐：在起点只有右侧，滚动中两侧，到末端只有左侧；
内容不溢出时滚动时间线无效，两侧都不渐隐。不支持滚动驱动动画的浏览器不加渐隐动画，遮罩保持全显。

DOM 契约：`.breadcrumb-icon > bm-icon`、`.breadcrumb-item`（按钮）、`.breadcrumb-separator`；
最后一项为当前位置，带 `aria-current="location"` 且不触发导航，样式按 `[aria-current]` 选择。

面包屑项、分隔符与图标的样式（含窄屏的胶囊样式）都在 `bm-breadcrumbs.css`；
父元素 `#breadcrumbs` 是页面区域，它的版式、滚动与边缘渐隐写在全局样式（`components.css`、`responsive.css`）。

## `<bm-card>`

文件夹或书签条目，由 `createCard(type, item)` 创建。

| 接口 | 说明 |
| --- | --- |
| `type` attribute | `bookmark`（默认）或 `folder` |
| `item` property | `{ title, url?, icon? }`；`icon` 可为字符串或数组，`favicon.im` 优先 |
| `bm-open-folder` event | `folder` 类型被点击或按下 Enter / Space 时触发，`detail: { item, originalEvent }` |

状态与可访问性：`folder` 自动设置 `tabindex="0"`、`role="button"`、`aria-label="文件夹: 名称"`。
标题为空时，文件夹显示“未命名文件夹”，书签依次回退到域名、“未命名书签”。

DOM 契约：元素自身带 `.folder` / `.bookmark` 类（类只表示条目类型）；
文件夹 `.folder-icon > bm-icon` + `.folder-name`；
书签 `.bookmark-icon > (.bookmark-icon-emoji > bm-icon, img.bookmark-icon-img)` + `a`。

图标加载由组件完成：`img` 按 `item.icon` 排序后的地址依次尝试，加载失败或图片宽高不超过 1px
时换下一个地址；第一张有效图片加载后组件给 `.bookmark-icon` 加 `data-loaded`，CSS 据此隐藏
占位图标并淡入图片；全部失败时移除 `img`，保留占位图标。

样式全部在 `bm-card.css`，按所在位置区分：内容区 `#content .folder` / `#content .bookmark`，
侧边栏 `.sidebar .folder`（侧边栏收起时隐藏条目的规则属于 `bm-sidebar.css`）。

## `<bm-search>`

渐进增强页面中已有的搜索输入框（无 JS 时输入框仍可见）。

| 接口 | 说明 |
| --- | --- |
| `placeholder` attribute | 可选，覆盖内部输入框的占位文本 |
| `value` property | 输入框当前值（未修剪）；赋值不触发 `bm-search`。元素升级前赋的值在连接时写入输入框 |
| `focus()` | 聚焦内部输入框 |
| `bm-search` event | 每次输入或按 Enter 时触发，`detail: { query, originalEvent }`，`query` 为去掉首尾空白的值；防抖由应用处理 |
| 快捷键 | Apple 平台 `⌘ + K`，其他平台 `Ctrl + K` 聚焦输入框；按住 Shift、Alt 或输入法组字（`isComposing`）时不触发，Apple 平台不拦截 `Ctrl + K`（保留输入框的删除到行尾）；`.shortcut-hint` 内的按键提示与输入框的 `aria-keyshortcuts` 由组件按平台生成 |

应用只通过 `value`、`focus()` 与 `bm-search` 事件使用搜索框，不直接读写内部输入框；
需要知道搜索框是否获得焦点时监听元素自身的 `focusin`。

DOM 契约：内含 `input#search-input`（没有时组件创建一个 `type="text"` 的输入框）、
`bm-icon.search-icon`（仅在显示占位符时可见）、`.shortcut-hint`（窄屏隐藏）。
样式全部在 `bm-search.css`，只用 `bm-search > …` 选择器，不依赖页面上的 `id` 或类：元素自身是定位容器，
组件创建的输入框与页面已有的输入框样式相同。

## `<bm-sidebar>`

放在 `<aside class="sidebar">` 内，包裹侧边栏头部与 `#sidebar-folders`，自身 `display: contents`。
`<aside>` 是组件的宿主：组件自身不生成盒子，收起状态与样式都落在 `<aside>` 上。

| 接口 | 说明 |
| --- | --- |
| `[data-sidebar-toggle]` | 子元素中的切换按钮 |
| `collapsed` property | 读写。读取 `<aside>` 的 `data-state`；写入时把 `<aside>` 与元素自身的 `data-state` 设为 `collapsed` / `expanded`，并更新切换按钮的 `aria-expanded` |
| `toggle()` | 请求切换，触发 `bm-sidebar-toggle`，不直接改变状态 |
| `bm-sidebar-toggle` event | `detail: { collapsed }`，目标状态；应用决定是否执行，执行时写 `collapsed` |
| `data-state` attribute | `<aside>` 与 `<bm-sidebar>` 上的 `expanded` / `collapsed`，由 `collapsed` 写入；首次写入前没有该属性 |
| `data-scrolling` attribute | 由 `trackScrollActivity(this)` 加在正在滚动的子元素上（如 `#sidebar-folders`），规则见“滚动条” |

样式全部在 `bm-sidebar.css`，按 `.sidebar[data-state="collapsed"]` 选择收起状态。
脚本写入状态之前（`.sidebar:not([data-state])`），宽度小于 1024px 时侧边栏按收起样式显示，
避免加载时先展开再收起。收起时隐藏头部的 `.home-button` 与侧边栏中的 `bm-card`。
页面布局（`.main-content` 的边距、居中元素与分页条的偏移）在全局样式中按
`.sidebar[data-state="collapsed"] + .main-content` 跟随。

页面加载时宽度小于 1024px 则收起；
之后只在窗口跨过这一断点时自动收起或展开（`MediaQueryList` 的 `change` 事件），
同一布局内调整窗口大小不会覆盖手动切换的状态。
