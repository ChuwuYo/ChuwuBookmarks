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

`<bm-icon>` 是唯一的共享依赖：`bm-card` 与 `bm-breadcrumbs` 通过
`../bm-icon/bm-icon.js` 创建图标，复制这两个组件时需连同 `bm-icon/` 目录与
`assets/images/icons.svg` 一起复制。其余组件可单独复制。

组件 CSS 由 `index.html` 用 `<link rel="stylesheet">` 统一引入；组件 JS 由 `assets/components/index.js` 统一注册。

### 设计令牌

颜色、阴影、圆角、时长等定义在 `assets/css/base.css` 的 `:root` 与
`:root[data-theme="dark"]` 中。组件只读这些变量，并为自身可调部分暴露
`--bm-<组件>-*` 变量，默认值回落到全局令牌，例如：

```css
bm-icon { width: var(--bm-icon-size, 1em); }
```

### 公开接口

- **Attributes**：字符串/布尔配置，均有默认值；需要响应变化的写进 `observedAttributes`。
- **Properties**：结构化数据（数组、对象）只通过 property 传入，不序列化进 attribute。
- **Events**：`bm-<动作>` 命名的 `CustomEvent`，`bubbles: true`，数据放在 `detail`。
  组件不直接调用应用模块，由监听层处理事件。
- **DOM 契约**：组件渲染出的 class 名与结构写在下面各节，测试与样式只依赖这些契约。

### 状态

统一用 attribute 表示，便于 CSS 选择与测试断言：

| 状态 | 表示方式 |
| --- | --- |
| 当前项 | `aria-current="page"` / `aria-current="location"` |
| 禁用 | 原生 `disabled` 或 `aria-disabled="true"` |
| 展开/收起 | `aria-expanded` / `data-state="collapsed"` |
| 空结果 | 渲染空状态文本节点，不渲染列表 |

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

DOM 契约：`bm-pagination > nav.pagination-container > .pagination-prev, .pagination-page(.active[aria-current=page]), .pagination-ellipsis, .pagination-next`

尺寸变量：`--pagination-button-size`、`--pagination-spacing`、`--pagination-font-size`、
`--pagination-button-padding`（移动端 6px，补足 44px 触控区域）。

例外：分页沿用旧版公开的 `--pagination-*` 变量名（不改名，避免破坏已有的自定义样式），
并在 `bm-pagination.css` 的 `:root` 中用 `rgba(...)` 定义自身的颜色与阴影令牌；
省略号的文字阴影仍直接写在规则中。

## `<bm-breadcrumbs>`

| 接口 | 说明 |
| --- | --- |
| `path` property | `Array<{ title: string }>`，从根到当前文件夹 |
| `bm-navigate` event | `detail: { index }`，`-1` 表示主页，其余为 `path` 下标 |

元素为 `display: contents`，父元素（`#breadcrumbs`）作为横向滚动容器；组件为父元素维护
`scrollable`、`at-start`、`at-end` 类与边缘渐隐遮罩。

DOM 契约：`.breadcrumb-icon > bm-icon`、`.breadcrumb-item`（按钮）、`.breadcrumb-separator`；
最后一项为当前位置，带 `aria-current="location"` 且不触发导航。

## `<bm-card>`

文件夹或书签条目，由 `createCard(type, item)` 创建。

| 接口 | 说明 |
| --- | --- |
| `type` attribute | `bookmark`（默认）或 `folder` |
| `item` property | `{ title, url?, icon? }`；`icon` 可为字符串或数组，`favicon.im` 优先 |
| `bm-open-folder` event | `folder` 类型被点击或按下 Enter / Space 时触发，`detail: { item, originalEvent }` |

状态与可访问性：`folder` 自动设置 `tabindex="0"`、`role="button"`、`aria-label="文件夹: 名称"`。
标题为空时，文件夹显示“未命名文件夹”，书签依次回退到域名、“未命名书签”。

DOM 契约：元素自身带 `.folder` / `.bookmark` 类；
文件夹 `.folder-icon > bm-icon` + `.folder-name`；
书签 `.bookmark-icon > (.bookmark-icon-emoji > bm-icon, img.bookmark-icon-img)` + `a`。
favicon 加载成功后 `icon-loader.js` 给 `.bookmark-icon` 加 `bookmark-icon--img-loaded`。

## `<bm-search>`

渐进增强页面中已有的搜索输入框（无 JS 时输入框仍可见）。

| 接口 | 说明 |
| --- | --- |
| `placeholder` attribute | 可选，覆盖内部输入框的占位文本 |
| `value` property | 输入框当前值 |
| `bm-search` event | 每次输入或按 Enter 时触发，`detail: { query, originalEvent }`；防抖由应用处理 |
| 快捷键 | Apple 平台 `⌘ + K`，其他平台 `Ctrl + K` 聚焦输入框；按住 Shift、Alt 或输入法组字（`isComposing`）时不触发，Apple 平台不拦截 `Ctrl + K`（保留输入框的删除到行尾）；`.shortcut-hint` 内的按键提示与输入框的 `aria-keyshortcuts` 由组件按平台生成 |

DOM 契约：内含 `input#search-input`、`bm-icon.search-icon`（仅在显示占位符时可见）、
`.shortcut-hint`。

## `<bm-sidebar>`

放在 `<aside class="sidebar">` 内，包裹侧边栏头部与 `#sidebar-folders`，自身 `display: contents`。

| 接口 | 说明 |
| --- | --- |
| `[data-sidebar-toggle]` | 子元素中的切换按钮 |
| `collapsed` property | 只读，侧边栏是否收起（`.sidebar.collapsed`） |
| `toggle()` | 请求切换，触发 `bm-sidebar-toggle` |
| `bm-sidebar-toggle` event | `detail: { collapsed }`，目标状态；收起/展开动画由应用执行 |
| `data-state` attribute | 自动同步为 `expanded` / `collapsed` |

切换按钮的 `aria-expanded` 随侧边栏状态自动更新。
