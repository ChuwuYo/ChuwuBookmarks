# 组件规范

站点 UI 由原生 Custom Elements 组成，零构建、Light DOM（不使用 Shadow DOM），
全局样式与主题变量直接生效。本文件是组件的唯一规范：先改规范，再改实现。

## 通用约定

### 文件结构

每个组件一个目录，结构、行为、样式分离，可整体复制到其他项目使用：

```
assets/components/<name>/
  <name>.js    # customElements.define，仅依赖浏览器 API 与同目录文件
  <name>.css   # 只引用设计令牌（CSS 变量），不写死颜色
```

组件 CSS 由 `styles.css` 统一 `@import`；组件 JS 由 `assets/components/index.js` 统一注册。

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

DOM 契约：`<bm-icon name="folder"><svg><use href="…#folder"></use></svg></bm-icon>`

## `<bm-pagination>`

搜索结果分页导航。页码计算由纯函数 `getPageRange(current, total, siblings)` 完成。

| 接口 | 说明 |
| --- | --- |
| `current` attribute | 当前页，从 1 开始，默认 `1` |
| `total` attribute | 总页数，默认 `1`；`total <= 1` 时不渲染 |
| `bm-page-change` event | `detail: { page }`，点击页码或上一页/下一页时触发 |

DOM 契约：`nav.pagination-container > .pagination-prev, .pagination-page(.active), .pagination-ellipsis, .pagination-next`

## `<bm-breadcrumbs>`

| 接口 | 说明 |
| --- | --- |
| `path` property | `Array<{ title: string }>`，从根到当前文件夹 |
| `bm-navigate` event | `detail: { index }`，`-1` 表示主页 |

DOM 契约：`.breadcrumb-item`（按钮），最后一项为当前位置，带 `aria-current="location"`。

## `<bm-card>`

书签或文件夹条目。

| 接口 | 说明 |
| --- | --- |
| `type` attribute | `bookmark`（默认）或 `folder` |
| `title`、`href` attributes | 标题与链接（`folder` 不需要 `href`） |
| `bm-open-folder` event | `folder` 类型被点击或按下 Enter/Space 时触发 |

DOM 契约：`.bookmark` / `.folder`，内含 `<bm-icon>` 与标题文本。

## `<bm-search>`

| 接口 | 说明 |
| --- | --- |
| `placeholder` attribute | 输入框占位文本 |
| `bm-search` event | `detail: { query }`，输入防抖后触发 |

DOM 契约：保留 `#search-input` 与 `Ctrl K` 快捷键提示。

## `<bm-sidebar>`

| 接口 | 说明 |
| --- | --- |
| `data-state` attribute | `expanded` 或 `collapsed`，同步到 `<html data-sidebar>` 供布局使用 |
| `bm-sidebar-toggle` event | `detail: { collapsed }` |

布局宽度通过 `--sidebar-w` 变量控制，主内容区由 CSS Grid 自动让位，不使用 JS 计算位置。
