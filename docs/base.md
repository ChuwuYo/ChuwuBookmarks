# ChuwuBookmarks - 设计规范文档

## 1. 设计概述

本项目采用现代化的双主题设计系统，支持浅色和深色主题切换，注重用户体验和视觉一致性。设计风格简洁优雅，配色温和舒适，适合长时间使用。

## 2. 色彩系统

### 2.1 主色彩变量定义

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

### 2.2 阴影系统

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

## 3. 字体系统

### 3.1 字体定义

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

### 3.2 字体应用规则

- **主体文字**: `'LXGW WenKai', Arial, sans-serif` - 用于正文、导航等
- **搜索框**: `'DingTalk JinBuTi', sans-serif` - 用于搜索输入框
- **主页消息**: `'DingTalk JinBuTi', sans-serif` - 用于首页欢迎信息

### 3.3 字体大小规范

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

## 4. 动画与过渡系统

### 4.1 动画时长变量

项目使用统一的动画时长系统，定义在 `assets/css/base.css` 中：

```css
--duration-short: 0.12s;    /* 短动画 - 快速反馈，用于按钮点击、悬停等 */
--duration-base: 0.15s;     /* 基础动画 - 标准过渡，用于常规交互 */
--duration-medium: 0.2s;    /* 中等动画 - 明显变化，用于主题切换 */
--duration-long: 0.3s;      /* 长动画 - 复杂过渡，用于页面切换 */
```

### 4.2 缓动函数系统

```css
--cubic-bezier: cubic-bezier(0.4, 0, 0.2, 1);         /* Material Design 标准缓动 */
--ease-in-out-cubic: var(--cubic-bezier);             /* 进出缓动，用于侧边栏切换 */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 出缓动，用于按钮动画 */
--ease-default: ease-out;                              /* 默认缓动，用于通用过渡 */
```

### 4.3 通用过渡变量

```css
--transition-normal: background-color var(--duration-short) ease-out, 
                     color var(--duration-short) ease-out;
```

这个变量应用于所有元素的全局过渡效果，确保主题切换时的平滑过渡。

### 4.3 关键动画效果

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

## 5. 组件设计规范

### 5.1 按钮设计

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

### 5.2 搜索框设计

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

### 5.3 面包屑导航

- **字体大小**: `1.5rem` (桌面端)
- **内边距**: `60px 0 0 10px`
- **项目样式**: `padding: 4px 8px; border-radius: 4px;`
- **悬停效果**: 背景变化 + 轻微缩放 + 下划线

### 5.4 侧边栏设计

- **宽度**: `230px` (展开) / `0px` (收起)
- **背景**: `--sidebar-bg`
- **阴影**: `--shadow-md`
- **内边距**: `20px 20px 40px`
- **滚动条**: 自定义样式，宽度 `8px`

## 6. 断点系统

项目使用统一的断点系统进行响应式设计：

### 6.1 JavaScript断点常量
```javascript
// assets/js/modules/render/device.js
const BREAKPOINT_MOBILE = 480;   // 移动端样式断点
const BREAKPOINT_SIDEBAR = 1024; // 侧边栏收起断点
```

### 6.2 CSS媒体查询断点
- **移动端特定样式**: `≤ 479px`
- **中间范围**: `480px - 1023px`
- **桌面端**: `≥ 1024px`

### 6.3 响应式行为
- **侧边栏**: 小于1024px自动收起，大于等于1024px默认展开
- **移动端优化**: 小于480px使用移动端专用样式和交互

## 7. 视觉特效

### 7.1 背景装饰

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

### 7.2 滚动条样式

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

### 7.3 主题切换特效

主题切换按钮具有复杂的日出/日落动画效果：
- 使用CSS `@property` 定义动画属性
- 多层径向渐变模拟光线效果
- 平滑的图标切换动画
- 悬停时的增强效果

## 8. 无障碍设计

### 8.1 焦点样式

```css
:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(43, 195, 206, 0.2);
    border-radius: 4px;
}
```

### 8.2 语义化标记

项目使用语义化HTML元素：
- `<aside>` - 侧边栏导航
- `<main>` - 主内容区域
- `<nav>` - 导航区域（面包屑、搜索、侧边栏）
- `<section>` - 内容区域
- `role` 属性 - 增强语义化
- `aria-label` - 提供无障碍标签

### 8.3 键盘导航

- **Tab键导航**: 支持所有交互元素的键盘焦点
- **Ctrl+K快捷键**: 快速聚焦搜索框
- **Enter/Space键**: 激活按钮和链接

### 8.4 颜色对比度

所有文字与背景的对比度符合WCAG 2.1 AA标准：
- 正常文字对比度 ≥ 4.5:1
- 大文字对比度 ≥ 3:1

## 9. 性能优化要点

### 9.1 字体优化
- 使用 `font-display: swap` 避免字体加载阻塞
- 使用WOFF2格式减小文件大小
- 预加载关键字体文件

### 9.2 动画优化
- 使用 `will-change` 属性优化动画性能
- 使用 `transform` 和 `opacity` 进行动画
- 使用 `contain` 属性限制布局影响范围
- 使用 `backface-visibility: hidden` 强制硬件加速

### 9.3 搜索优化
- 使用Web Worker进行后台搜索，避免阻塞主线程
- 防抖动处理减少搜索请求频率
- 虚拟滚动优化大量搜索结果的渲染

### 9.4 图片优化
- 使用 `loading="lazy"` 实现懒加载
- 使用SVG格式的图标减小文件大小
- 预加载关键图片资源

## 10. 项目架构说明

### 10.1 技术栈
- **前端框架**: 原生HTML/CSS/JavaScript
- **模块化**: ES6 Modules
- **动画库**: GSAP (GreenSock Animation Platform)
- **构建工具**: 无构建步骤，直接部署静态文件

### 10.2 文件结构
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

### 10.3 模块化设计
- **渲染模块**: 处理页面渲染逻辑
- **设备模块**: 处理响应式设计和设备适配
- **搜索模块**: 处理搜索功能和Web Worker
- **事件模块**: 处理用户交互事件

### 10.4 性能特性
- **零构建**: 无需打包工具，直接部署
- **模块化加载**: 使用ES6 Modules实现按需加载
- **Web Worker**: 后台搜索不阻塞主线程
- **懒加载**: 图片和非关键资源懒加载