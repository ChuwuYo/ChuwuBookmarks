## CSS风格原则

1. **模块化**：每个组件或功能单独定义，避免样式冲突。
2. **变量化**：使用 CSS 变量（如 `--ds-*`）定义颜色、尺寸、过渡效果等，便于全局调整。
3. **过渡与动画**：为交互元素添加平滑的过渡效果（如 `transition`）。
4. **语义化类名**：类名清晰表达用途（如 `.ds-button--primary` 表示主要按钮）。
5. **响应式设计**：确保样式适应不同屏幕尺寸（如果需要）。

### 示例修改

如果你提供需要修改的文件内容或需求，我会按照以下方式调整：

#### 示例 1：卡片组件

```css
/* 卡片组件 */
.ds-card {
    --ds-card-background-color: rgb(var(--ds-rgb-elevated));
    --ds-card-border-radius: 12px;
    --ds-card-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: var(--ds-card-background-color);
    border-radius: var(--ds-card-border-radius);
    box-shadow: var(--ds-card-box-shadow);
    padding: var(--ds-spacing-m);
    transition: box-shadow var(--ds-transition-duration) var(--ds-ease-in-out);
}

.ds-card:hover {
    --ds-card-box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

#### 示例 2：导航栏

```css
/* 导航栏 */
.ds-navbar {
    --ds-navbar-background-color: rgb(var(--ds-rgb-primary));
    --ds-navbar-text-color: white;
    --ds-navbar-height: 64px;
    background-color: var(--ds-navbar-background-color);
    color: var(--ds-navbar-text-color);
    height: var(--ds-navbar-height);
    display: flex;
    align-items: center;
    padding: 0 var(--ds-spacing-l);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ds-navbar__item {
    margin-right: var(--ds-spacing-m);
    font-size: var(--ds-font-size-m);
    cursor: pointer;
    transition: opacity var(--ds-transition-duration) var(--ds-ease-in-out);
}

.ds-navbar__item:hover {
    opacity: 0.8;
}
```

#### 示例 3：表格

```css
/* 表格 */
.ds-table {
    --ds-table-border-color: rgb(var(--ds-rgb-border));
    --ds-table-header-background-color: rgb(var(--ds-rgb-label-3));
    --ds-table-row-hover-background-color: rgba(var(--ds-rgb-primary), 0.1);
    width: 100%;
    border-collapse: collapse;
}

.ds-table th,
.ds-table td {
    padding: var(--ds-spacing-s);
    border: 1px solid var(--ds-table-border-color);
    text-align: left;
}

.ds-table th {
    background-color: var(--ds-table-header-background-color);
    font-weight: bold;
}

.ds-table tr:hover {
    background-color: var(--ds-table-row-hover-background-color);
}
```

### 动画与过渡效果

```css
/* 淡入淡出及缩放动画 */
.ds-fade-in-zoom-in-enter {
    opacity: 0;
    transform: scale(.96);
}

.ds-fade-in-zoom-in-active {
    opacity: 1;
    transition: max-height var(--ds-ease-in)var(--ds-transition-duration-fast), opacity var(--ds-ease-in)var(--ds-transition-duration-fast), transform var(--ds-ease-in)var(--ds-transition-duration-fast);
    transform: scale(1);
}

.ds-fade-in-zoom-in-exit {
    opacity: 1;
    transform: scale(1);
}

.ds-fade-in-zoom-in-exit-active {
    opacity: 0;
    transition: max-height var(--ds-ease-out)var(--ds-transition-duration-fast), opacity var(--ds-ease-out)var(--ds-transition-duration-fast), transform var(--ds-ease-out)var(--ds-transition-duration-fast);
    transform: scale(.96);
}
```

示例：一个元素在进入视图时会先淡入并逐渐放大到正常大小，在退出视图时会逐渐淡出并缩小。

### 表单元素

```css
/* 输入框 */
.ds-input {
    --ds-input-text-color: rgb(var(--ds-rgb-label-1));
    --ds-input-placeholder-color: rgb(var(--ds-rgb-label-3));
    --ds-input-icon-color: rgb(var(--ds-rgb-label-3));
    --ds-input-prefix-text-color: rgb(var(--ds-rgb-label-1));
    --ds-input-color: rgb(var(--ds-rgb-input));
    --ds-input-font-weight: initial;
    --ds-input-color-focus: rgb(var(--ds-rgb-input-focus));
    cursor: text;
    background-color: var(--ds-input-color);
    width: 100%;
    color: var(--ds-input-text-color);
    box-sizing: border-box;
    border-radius: var(--ds-input-border-radius);
    transition: background-color var(--ds-transition-duration)var(--ds-ease-in-out), box-shadow var(--ds-transition-duration)var(--ds-ease-in-out), color var(--ds-transition-duration)var(--ds-ease-in-out);
    padding: var(--ds-input-padding);
    height: var(--ds-input-height);
    font-size: var(--ds-input-font-size);
    line-height: var(--ds-input-line-height);
    font-weight: var(--ds-input-font-weight);
    align-items: center;
    display: flex;
    position: relative;
}

/* 单选按钮 */
.ds-radio-button-group {
    color: var(--radio-button-group-button-text-color);
    transition: opacity var(--ds-transition-duration)var(--ds-ease-in-out);
    flex-wrap: wrap;
    margin-bottom: -12px;
    display: flex;
}

.ds-radio-button-group .ds-radio-button {
    box-shadow: var(--radio-button-group-button-box-shadow);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: pointer;
    background-color: var(--radio-button-group-button-color);
    box-sizing: border-box;
    height: 32px;
    transition: box-shadow var(--ds-transition-duration)var(--ds-ease-in-out), background-color var(--ds-transition-duration)var(--ds-ease-in-out), color var(--ds-transition-duration)var(--ds-ease-in-out);
    border-radius: 8px;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 14px;
    display: flex;
    position: relative;
}
```

示例：输入框具有基本的样式，如背景色、文字颜色等，并且在聚焦时会有颜色变化。单选按钮以组的形式出现，每个单选按钮有自己的样式，包括背景色、边框阴影等。

### 按钮

```css
.ds-button {
    --ds-button-color: transparent;
    --button-ring-color: rgb(var(--ds-rgb-primary));
    height: var(--button-height);
    line-height: var(--button-line-height);
    font-size: var(--button-font-size);
    border-radius: var(--button-border-radius);
    padding: var(--button-padding);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
    transition: opacity var(--ds-transition-duration)var(--ds-ease-in-out), background-color var(--ds-transition-duration)var(--ds-ease-in-out);
    font-variant-numeric: tabular-nums;
    outline: none;
    align-items: center;
    text-decoration: none;
    display: inline-flex;
    position: relative;
}

.ds-button.ds-button--filled.ds-button--primary {
    --ds-button-color: rgb(var(--ds-rgb-primary));
    --button-text-color: rgb(var(--ds-rgb-primary-foreground));
    --button-icon-color: rgb(var(--ds-rgb-primary-foreground));
}

.ds-button.ds-button--filled.ds-button--error {
    --ds-button-color: rgb(var(--ds-rgb-error));
    --button-text-color: white;
    --button-icon-color: white;
}

.ds-button.ds-button--filled.ds-button--secondary {
    background-color: var(--ds-secondary-button-color, var(--ds-button-color, rgb(var(--ds-rgb-input))));
    --button-text-color: rgb(var(--ds-rgb-label-1));
    --button-icon-color: rgb(var(--ds-rgb-label-2));
}

.ds-button.ds-button--filled.ds-button--success,
.ds-button.ds-button--filled.ds-button--info,
.ds-button.ds-button--filled.ds-button--warning {
    --ds-button-color: rgb(var(--ds-rgb-success));
    --button-text-color: white;
    --button-icon
```
