# ChuwuBookmarks - 设计规范文档

## 1. 项目概述

### 1.1 项目背景

ChuwuBookmarks是一个基于浏览器的书签导航网页应用，旨在将JSON书签数据转换为一个美观且功能丰富的网页应用。项目解决了传统浏览器书签管理界面不够美观、缺乏多级文件夹支持和搜索功能、无法在移动端良好展示等问题。

**目标用户**: 需要整理和管理浏览器书签的用户，尤其是希望将书签数据可视化、结构化展示的用户。

### 1.2 核心功能

- **侧边栏导航**: 显示一级文件夹，点击后在主内容区展示子文件夹和书签
- **主内容区**: 展示当前文件夹下的子文件夹和书签卡片，支持跳转
- **面包屑导航**: 显示当前路径并支持返回上一级
- **搜索功能**: 支持按标题搜索书签，实时渲染并分页展示
- **主题切换**: 支持深色/浅色模式，PC端有悬停动效，移动端优化触屏交互
- **响应式设计**: 支持PC和移动端，断点为1024px
- **GSAP动画**: 主页消息加入动画效果
- **键盘聚焦**: 支持Tab键导航和Ctrl+K聚焦搜索框

### 1.3 技术架构

**整体架构**: 前端单页应用架构，采用模块化设计，主要由HTML、CSS、JavaScript组成，使用Web Worker处理搜索任务。

**关键技术决策**:
- 使用Web Worker实现搜索功能，避免阻塞主线程
- 使用模块化JavaScript组织代码结构
- 使用CSS模块化样式（animations.css、base.css等）
- 使用JSON文件作为数据源（bookmarks.json）

**架构模式**:
- MVC模式（Model: bookmarks.json, View: HTML/CSS, Controller: JavaScript）
- 模块化设计（各功能模块独立封装在assets/js/modules下）
- 发布-订阅模式（通过事件监听器实现组件间通信）
- 工厂模式（用于创建分页组件等）

### 1.4 技术栈

**前端技术**:
- HTML5
- CSS3（含模块化CSS文件）
- JavaScript（ES6+）
- Web Worker（用于搜索）
- GSAP（用于动画效果）

**特点**:
- 未使用第三方前端框架（纯原生JS实现）
- 零构建步骤，直接部署静态文件
- 模块化ES6设计
- 响应式友好

## 2. 设计概述

本项目采用现代化的双主题设计系统，支持浅色和深色主题切换，注重用户体验和视觉一致性。设计风格简洁优雅，配色温和舒适，适合长时间使用。

## 3. 色彩系统

### 3.1 主色彩变量定义

项目使用CSS自定义属性（CSS Variables）实现主题系统，所有颜色定义在 `assets/css/base.css` 中：

#### 浅色主题 (Light Theme)
```css
:root {
    /* 背景色系 */
    --bg-color: #f8faef;           /* 主背景 - 温和的米白色 */
    --sidebar-bg: #e2f5f5;         /* 侧边栏背景 - 淡青色 */
    --hover-bg: #dfe6e9;           /* 悬停背景 - 浅灰蓝 */
    --header-bg: #88dcfa;          /* 头部背景 - 天蓝色 */
    
    /* 文字色系 */
    --text-color: #0e141a;         /* 主文字 - 深蓝灰 */
    --link-color: #23d6e3;         /* 链接色 - 青蓝色 */
    
    /* 按钮色系 */
    --button-bg: #a1dcf5;          /* 按钮背景 - 浅蓝色 */
    --button-hover: #faeaf4;       /* 按钮悬停 - 淡粉色 */
}
```

#### 深色主题 (Dark Theme)
```css
:root[data-theme='dark'] {
    /* 背景色系 */
    --bg-color: #1c1c1c;           /* 主背景 - 深灰色 */
    --sidebar-bg: #161515;         /* 侧边栏背景 - 更深灰 */
    --hover-bg: #2d3436;           /* 悬停背景 - 中灰色 */
    --header-bg: #ffffff4b;        /* 头部背景 - 半透明白 */
    
    /* 文字色系 */
    --text-color: #f9f1d5e6;       /* 主文字 - 暖白色(90%透明度) */
    --link-color: #74ceff;         /* 链接色 - 亮蓝色 */
    
    /* 按钮色系 */
    --button-bg: #5d6687;          /* 按钮背景 - 蓝灰色 */
    --button-hover: rgb(201, 207, 159); /* 按钮悬停 - 淡绿色 */
}
```

### 3.2 阴影系统

项目使用分层阴影系统，根据主题自动调整：

#### 浅色主题阴影
```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);      /* 小阴影 */
--shadow-md: 2px 0 5px rgba(0, 0, 0, 0.2);      /* 中等阴影 */
--shadow-lg: 0 0 10px rgba(0, 0, 0, 0.2);       /* 大阴影 */
--button-shadow: 3px 0 8px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15);
--button-shadow-hover: 4px 0 12px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
--theme-shadow-hover: 0 0 10px rgba(0, 0, 0, 0.2);
```

#### 深色主题阴影
```css
--shadow-sm: 0 2px 4px rgba(255, 255, 255, 0.1);
--shadow-md: 2px 0 5px rgba(255, 255, 255, 0.2);
--shadow-lg: 0 0 10px rgba(255, 255, 255, 0.2);
--button-shadow: 3px 0 8px rgba(255, 255, 255, 0.15), 0 2px 4px rgba(255, 255, 255, 0.1);
--button-shadow-hover: 4px 0 12px rgba(255, 255, 255, 0.25), 0 4px 6px rgba(255, 255, 255, 0.2);
--theme-shadow-hover: 0 0 12px rgba(255, 255, 255, 0.3);
```

## 4. 字体系统

### 4.1 字体定义

项目使用两种主要字体，通过 `@font-face` 定义：

```css
/* 主要字体 - 霞鹜文楷 */
@font-face {
    font-family: 'LXGW WenKai';
    src: url('../fonts/LXGWWenKai-Medium.woff2') format('woff2');
    font-display: swap;
}

/* 辅助字体 - 钉钉进步体 */
@font-face {
    font-family: 'DingTalk JinBuTi';
    src: url('../fonts/DingTalk-JinBuTi.woff2') format('woff2');
    font-display: swap;
}
```

### 4.2 字体应用规则

- **主体文字**: `'LXGW WenKai', Arial, sans-serif` - 用于正文、导航等
- **搜索框**: `'DingTalk JinBuTi', sans-serif` - 用于搜索输入框
- **主页消息**: `'DingTalk JinBuTi', sans-serif` - 用于首页欢迎信息

### 4.3 字体大小规范

```css
/* 主页消息 */
.home-message .chinese-text { font-size: 3rem; }      /* 桌面端中文 */
.home-message .english-text { font-size: 2rem; }      /* 桌面端英文 */

/* 移动端响应式 */
.home-message .chinese-text { font-size: clamp(1.5rem, 8vw, 2rem); }
.home-message .english-text { font-size: clamp(1rem, 6vw, 1.5rem); }

/* 导航元素 */
.sidebar .folder-name { font-size: 1.15rem; }         /* 侧边栏文件夹 */
#breadcrumbs { font-size: 1.5rem; }                   /* 面包屑导航 */
#content .folder-name { font-size: 1.0rem; }          /* 内容区文件夹 */
#content .bookmark a { font-size: 1.0rem; }           /* 书签链接 */
```

## 5. 动画与过渡系统

### 5.1 动画时长变量

项目使用统一的动画时长系统，定义在 `assets/css/base.css` 中：

```css
--duration-short: 0.12s;    /* 短动画 - 快速反馈，用于按钮点击、悬停等 */
--duration-base: 0.15s;     /* 基础动画 - 标准过渡，用于常规交互 */
--duration-medium: 0.2s;    /* 中等动画 - 明显变化，用于主题切换 */
--duration-long: 0.3s;      /* 长动画 - 复杂过渡，用于页面切换 */
```

### 5.2 缓动函数系统

```css
--cubic-bezier: cubic-bezier(0.4, 0, 0.2, 1);         /* Material Design 标准缓动 */
--ease-in-out-cubic: var(--cubic-bezier);             /* 进出缓动，用于侧边栏切换 */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 出缓动，用于按钮动画 */
--ease-default: ease-out;                              /* 默认缓动，用于通用过渡 */
```

### 5.3 通用过渡变量

```css
--transition-normal: background-color var(--duration-short) ease-out, 
                     color var(--duration-short) ease-out;
```

这个变量应用于所有元素的全局过渡效果，确保主题切换时的平滑过渡。

### 5.3 关键动画效果

#### 淡入上升动画
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

#### 下滑动画
```css
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

#### 文字跳跃动画
```css
@keyframes textJump {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px) scale(1.05); }
}
```

## 6. 组件设计规范

### 6.1 按钮设计

#### 主题切换按钮
- **尺寸**: `calc(1rem + 15px + 6px)` 正方形
- **边框**: `2px solid #a4d1c4`
- **圆角**: `10px`
- **背景**: 使用 `--button-bg` 变量
- **特效**: 复杂的日出/日落CSS动画效果

#### 主页按钮
- **背景**: `linear-gradient(to bottom, #9ee9f4d8, #d1d1f3a5)`
- **内边距**: `10px 25px`
- **圆角**: `12px`
- **阴影**: `0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)`

#### 侧边栏切换按钮
- **背景**: `--button-hover`
- **边框**: `2px solid #a4d1c4`
- **圆角**: `0 15px 15px 0` (右侧圆角)
- **内边距**: `8px 12px`

### 6.2 搜索框设计

```css
#search-input {
    padding: 6px;
    font-size: 1rem;
    border: 2px solid #a4d1c4;
    border-radius: 8px;
    width: 200px;                    /* 桌面端 */
    max-width: calc(100vw - 120px);  /* 移动端自适应 */
    background: var(--bg-color);
    color: var(--text-color);
    font-family: 'DingTalk JinBuTi', sans-serif;
}
```

### 6.3 面包屑导航

- **字体大小**: `1.5rem` (桌面端)
- **内边距**: `60px 0 0 10px`
- **项目样式**: `padding: 4px 8px; border-radius: 4px;`
- **悬停效果**: 背景变化 + 轻微缩放 + 下划线

### 6.4 侧边栏设计

- **宽度**: `230px` (展开) / `0px` (收起)
- **背景**: `--sidebar-bg`
- **阴影**: `--shadow-md`
- **内边距**: `20px 20px 40px`
- **滚动条**: 自定义样式，宽度 `8px`

## 7. 断点系统

项目使用统一的断点系统进行响应式设计：

### 7.1 JavaScript断点常量
```javascript
// assets/js/modules/render/device.js
const BREAKPOINT_MOBILE = 480;   // 移动端样式断点
const BREAKPOINT_SIDEBAR = 1024; // 侧边栏收起断点
```

### 7.2 CSS媒体查询断点
- **移动端特定样式**: `≤ 479px`
- **中间范围**: `480px - 1023px`
- **桌面端**: `≥ 1024px`

### 7.3 响应式行为
- **侧边栏**: 小于1024px自动收起，大于等于1024px默认展开
- **移动端优化**: 小于480px使用移动端专用样式和交互

## 8. 视觉特效

### 8.1 背景装饰

```css
/* 背景GIF动画 */
body::after {
    content: '';
    position: fixed;
    bottom: 0;
    right: 0;
    width: 1000px;
    height: 1000px;
    background: url('../images/moecat.gif') no-repeat right bottom;
    background-size: contain;
    z-index: 1;
    pointer-events: none;
}
```

### 8.2 滚动条样式

#### Webkit浏览器
```css
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-track { 
    background: var(--bg-color); 
    border-radius: 6px; 
}
::-webkit-scrollbar-thumb { 
    background: rgba(0, 0, 0, 0.2); 
    border-radius: 6px; 
}
```

#### Firefox浏览器
```css
html {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) var(--bg-color);
}
```

### 8.3 主题切换特效

主题切换按钮具有复杂的日出/日落动画效果：
- 使用CSS `@property` 定义动画属性
- 多层径向渐变模拟光线效果
- 平滑的图标切换动画
- 悬停时的增强效果

## 9. 无障碍设计

### 9.1 焦点样式

```css
:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(43, 195, 206, 0.2);
    border-radius: 4px;
}
```

### 9.2 语义化标记

项目使用语义化HTML元素：
- `<aside>` - 侧边栏导航
- `<main>` - 主内容区域
- `<nav>` - 导航区域（面包屑、搜索、侧边栏）
- `<section>` - 内容区域
- `role` 属性 - 增强语义化
- `aria-label` - 提供无障碍标签

### 9.3 键盘导航

- **Tab键导航**: 支持所有交互元素的键盘焦点
- **Ctrl+K快捷键**: 快速聚焦搜索框
- **Enter/Space键**: 激活按钮和链接

### 9.4 颜色对比度

所有文字与背景的对比度符合WCAG 2.1 AA标准：
- 正常文字对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1

## 10. 性能优化要点

### 10.1 字体优化
- 使用 `font-display: swap` 避免字体加载阻塞
- 使用WOFF2格式减小文件大小
- 预加载关键字体文件

### 10.2 动画优化
- 使用 `will-change` 属性优化动画性能
- 使用 `transform` 和 `opacity` 进行动画
- 使用 `contain` 属性限制布局影响范围
- 使用 `backface-visibility: hidden` 强制硬件加速

### 10.3 搜索优化
- 使用Web Worker进行后台搜索，避免阻塞主线程
- 防抖动处理减少搜索请求频率
- 虚拟滚动优化大量搜索结果的渲染

### 10.4 图片优化
- 使用 `loading="lazy"` 实现懒加载
- 使用SVG格式的图标减小文件大小
- 预加载关键图片资源

### 10.5 Web Worker 实现

**搜索Worker架构**:
项目使用主从模式的Web Worker架构，主线程负责UI交互和渲染，Worker线程负责计算密集型的搜索任务。

```javascript
// 搜索Worker创建和通信
const searchWorker = new Worker('assets/js/search-worker.js');

// 发送搜索请求
searchWorker.postMessage({
    type: 'search',
    query: searchTerm,
    data: bookmarksData
});

// 接收搜索结果
searchWorker.onmessage = function(event) {
    const { results, total } = event.data;
    renderSearchResults(results, total);
};
```

**数据Worker架构**:
使用独立的数据Worker加载和解析bookmarks.json，避免阻塞主线程。

```javascript
// 数据Worker创建
const dataWorker = new Worker('assets/js/data-worker.js');

// 异步加载数据
dataWorker.postMessage({ type: 'load', url: 'bookmarks.json' });

// 数据加载完成后的处理
dataWorker.onmessage = function(event) {
    const { data, cached } = event.data;
    if (!cached) {
        updateBookmarksData(data);
        renderSidebar(data);
        renderHome();
    }
};
```

## 11. 项目架构说明

### 11.1 技术栈
- **前端框架**: 原生HTML/CSS/JavaScript
- **模块化**: ES6 Modules
- **动画库**: GSAP (GreenSock Animation Platform)
- **构建工具**: 无构建步骤，直接部署静态文件

### 11.2 文件结构
```
assets/
├── css/           # 样式文件
│   ├── base.css      # 基础样式和主题变量
│   ├── layout.css    # 布局样式
│   ├── components.css # 组件样式
│   └── responsive.css # 响应式样式
├── js/
│   └── modules/      # 模块化JavaScript
├── fonts/         # 字体文件
└── images/        # 图片资源
```

### 11.3 模块化设计
- **渲染模块**: 处理页面渲染逻辑
- **设备模块**: 处理响应式设计和设备适配
- **搜索模块**: 处理搜索功能和Web Worker
- **事件模块**: 处理用户交互事件
- **分页模块**: 处理搜索结果分页和导航

**核心模块详解**:

```
assets/js/modules/
├── render/           # 渲染模块
│   ├── content.js      # 内容区渲染
│   ├── device.js       # 设备适配与响应式处理
│   ├── home.js         # 主页渲染
│   ├── search.js       # 搜索结果渲染
│   ├── sidebar.js      # 侧边栏渲染
│   └── theme.js        # 主题切换处理
├── search/          # 搜索模块
│   └── index.js        # 搜索逻辑与 Worker 集成
├── pagination/      # 分页模块
│   ├── controller.js   # 分页控制逻辑
│   ├── renderer.js     # 分页渲染
│   ├── responsive.js   # 响应式分页配置
│   ├── performance.js  # 性能监控
│   └── errors.js       # 错误处理
├── loader/          # 数据加载模块
│   └── index.js        # 书签数据加载与缓存
├── listener/        # 事件监听模块
│   └── index.js        # 用户交互事件处理
└── utils/           # 工具模块
    └── index.js        # 通用工具函数
```

### 11.4 性能特性
- **零构建**: 无需打包工具，直接部署
- **模块化加载**: 使用ES6 Modules实现按需加载
- **Web Worker**: 后台搜索不阻塞主线程
- **懒加载**: 图片和非关键资源懒加载
- **虚拟滚动**: 大量搜索结果的高性能渲染
- **智能分页**: 响应式分页控件，优化移动端体验

## 12. 分页系统设计

### 12.1 分页控件样式

项目实现了完整的响应式分页系统，支持多种设备和屏幕尺寸：

#### 分页变量系统
```css
:root {
    /* 分页控件颜色变量 */
    --pagination-bg: var(--bg-color);
    --pagination-border: var(--hover-bg);
    --pagination-text: var(--text-color);
    --pagination-active-bg: var(--link-color);
    --pagination-active-text: var(--bg-color);
    --pagination-hover-bg: var(--hover-bg);
    
    /* 分页控件尺寸和间距变量 */
    --pagination-spacing: 6px;
    --pagination-button-size: 36px;      /* 桌面端按钮尺寸 */
    --pagination-border-radius: 6px;
    --pagination-font-size: 13px;
}
```

#### 响应式按钮尺寸
- **移动端** (≤479px): `32px × 32px`
- **平板端** (480px-1023px): `40px × 40px`
- **桌面端** (≥1024px): `40px × 40px`

### 12.2 分页功能特性

#### 智能页码显示
- **桌面端**: 最多显示3个页码按钮
- **移动端**: 最多显示3个页码按钮
- **省略号**: 自动显示省略号表示更多页面

#### 响应式适配
```css
/* 移动端分页优化 */
@media screen and (max-width: 479px) {
    .pagination-container {
        gap: 3px;
        margin: 0.1rem 0;        /* 减少上下边距 */
        padding: 0.1rem;         /* 减少内边距 */
        overflow-x: auto;        /* 支持水平滚动 */
        scroll-snap-type: x proximity;
    }
    
    .pagination-button {
        min-width: 32px;
        height: 32px;
        font-size: 13px;
        border-radius: 5px;
        border-width: 1px;
    }
}
```

### 12.3 分页交互设计

#### 悬停效果 (仅PC端)
```css
@media (hover: hover) and (pointer: fine) {
    .pagination-button:hover:not(:disabled):not(.active) {
        background: var(--pagination-hover-bg);
        box-shadow: var(--pagination-shadow-hover);
        transform: translateZ(0) scale(1.02);
        border-color: var(--link-color);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
}
```

#### 移动端点击反馈
```css
.pagination-button:active:not(:disabled) {
    background: var(--pagination-hover-bg);
    transform: scale(0.95);
    border-color: var(--link-color);
}
```

#### 激活状态样式
- **背景**: 使用主题链接色
- **文字**: 使用背景色作为文字色
- **发光效果**: 微妙的外发光效果
- **字重**: 增加到600

### 12.4 分页性能优化

#### 硬件加速
```css
.pagination-button {
    will-change: transform, background-color, box-shadow, border-color;
    backface-visibility: hidden;
    transform: translateZ(0);  /* 强制硬件加速 */
}
```

#### 动画优化
- 使用 `transform` 和 `opacity` 进行动画
- 分离颜色和变形动画以提升性能
- 支持 `prefers-reduced-motion` 减少动画偏好

#### 滚动优化
- 移动端支持水平滚动
- 使用 `scroll-snap-type` 实现吸附效果
- 隐藏滚动条但保持功能

### 12.5 分页无障碍设计

#### 键盘导航支持
```css
.pagination-button:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(35, 214, 227, 0.2);
}
```

#### 高对比度模式支持
```css
@media (prefers-contrast: high) {
    .pagination-button {
        border-width: 3px;
        font-weight: 600;
    }
    
    .pagination-button.active {
        border-width: 4px;
        font-weight: 700;
    }
}
```

#### 强制颜色模式支持
```css
@media (forced-colors: active) {
    .pagination-button {
        border: 2px solid ButtonBorder;
        background: ButtonFace;
        color: ButtonText;
    }
    
    .pagination-button.active {
        background: Highlight;
        color: HighlightText;
    }
}
```

### 12.6 分页模块架构

#### JavaScript模块结构
```
assets/js/modules/pagination/
├── renderer.js      # 分页渲染逻辑
├── responsive.js    # 响应式配置
├── performance.js   # 性能优化
└── errors.js        # 错误处理
```

#### 核心功能
- **动态渲染**: 根据总页数和当前页动态生成分页控件
- **响应式配置**: 根据设备类型调整显示参数
- **性能监控**: 渲染性能监控和优化
- **错误处理**: 完善的错误处理和降级方案

### 12.7 分页与搜索集成

#### 搜索结果分页
- **虚拟滚动**: 大量结果的高性能渲染
- **平滑切换**: 页面切换时的平滑滚动动画
- **状态保持**: 搜索状态和分页状态的同步

#### 滚动行为优化
```javascript
// 页面切换时滚动到顶部
function scrollToSearchResults() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
```

### 12.8 移动端优化

#### 触摸优化
```css
.pagination-button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}
```

#### 间距优化
- **容器边距**: 大幅减少移动端上下边距
- **内容区间距**: 优化搜索结果与分页控件的间距
- **左侧边距**: 增加移动端内容区左侧内边距

#### 滚动提示
- 当分页控件可水平滚动时显示滑动提示
- 使用CSS动画提供视觉反馈

## 13. 技术特色与优势

### 13.1 核心技术优势

**零构建架构**:
- 无需打包工具，直接部署静态文件
- 快速部署到任何静态网站托管服务
- 简化的开发流程和维护成本

**模块化设计**:
- ES6 Modules 实现模块化
- 清晰的关注点分离
- 便于维护和扩展

**高性能设计**:
- Web Worker 后台处理搜索
- 分页机制优化大量数据展示
- CSS 变量系统实现高效主题切换
- 硬件加速和动画优化

### 13.2 用户体验优势

**响应式设计**:
- 统一的断点管理系统
- 移动端和桌面端一致的体验
- 数字友好的接口设计

**无障碍支持**:
- 完善的键盘导航支持
- 语义化HTML结构
- 高对比度和强制颜色模式支持
- WCAG 2.1 AA 标准兼容

**交互体验**:
- 直观的导航系统
- 平滑的动画过渡
- 快速的搜索反馈
- 智能的分页系统

### 13.3 技术创新点

**CSS 变量系统**:
- 全局统一的设计令牌管理
- 动态主题切换
- 响应式设计变量

**搜索系统创新**:
- 防抖处理优化性能
- Worker 线程后台处理
- 实时搜索结果渲染

**响应式分页**:
- 跨设备一致的交互体验
- 触屏优化设计
- 自适应尺寸调整

## 14. 开发指南

### 14.1 环境要求

**基本要求**:
- 支持 ES6+ 的现代浏览器
- 支持 Web Worker 的浏览器
- 本地开发服务器（如 Live Server）

**开发工具**:
- 文本编辑器（推荐 VSCode）
- Git 版本控制
- 浏览器开发者工具

### 14.2 部署指南

**本地开发**:
1. 克隆项目到本地
2. 更换 `bookmarks.json` 为自己的书签数据
3. 使用本地服务器运行（如 Live Server）

**生产部署**:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- Edgeone

### 14.3 自定义指南

**主题自定义**:
- 修改 `assets/css/base.css` 中的 CSS 变量
- 自定义颜色、字体、间距等

**功能扩展**:
- 在 `assets/js/modules` 中添加新模块
- 修改 `script.js` 进行模块集成
- 扩展搜索功能和排序算法

**数据格式**:
- 支持标准的 Chrome/Firefox 书签导出 JSON 格式
- 支持嵌套文件夹结构
- 自动识别书签和文件夹

---

**文档版本**: v2.0  
**最后更新**: 2025-08-29  
**作者**: Chuwu