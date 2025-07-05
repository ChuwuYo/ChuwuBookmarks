# 项目迁移指南：SvelteKit + TypeScript + SCSS

## 1. 迁移概述
本文档详细说明将当前项目迁移到SvelteKit + TypeScript + SCSS技术栈的步骤和注意事项。

## 2. 迁移准备
### 2.1 环境要求
- Node.js ≥ 18.x
- npm ≥ 9.x
- Git

### 2.2 前期准备工作
1. 创建项目备份
```bash
git checkout -b migration-sveltekit
```

2. 初始化新项目（无需全局安装CLI）
```bash
npm create svelte@latest chuwu-bookmarks-sveltekit
cd chuwu-bookmarks-sveltekit
npm install
```

## 3. 项目初始化
### 3.1 创建新的SvelteKit项目
```bash
create-svelte@latest chuwu-bookmarks-sveltekit
cd chuwu-bookmarks-sveltekit
npm install
```

在创建过程中，选择以下选项：
- TypeScript: Yes
- ESLint: Yes
- Prettier: Yes
- Playwright: No
- Vitest: Yes

### 3.2 安装必要依赖
```bash
# 安装SCSS支持
npm install --save-dev sass

# 可选：添加国际化支持（如需要）
npm install svelte-i18n

```

## 4. 文件结构调整
### 4.1 当前模块化文件结构
```
ChuwuBookmarks/
├── assets/
│   ├── css/
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── breakpoints.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── responsive.css
│   │   └── theme-toggle.css
│   ├── fonts/
│   ├── images/
│   ├── icon/
│   └── js/
│       ├── modules/
│       │   ├── listener/     # 事件监听模块
│       │   ├── loader/       # 数据加载模块
│       │   ├── render/       # 渲染模块
│       │   │   ├── content.js
│       │   │   ├── device.js
│       │   │   ├── home.js
│       │   │   ├── search.js
│       │   │   ├── sidebar.js
│       │   │   └── theme.js
│       │   ├── search/       # 搜索功能模块
│       │   └── utils/        # 工具函数模块
│       ├── data-worker.js
│       ├── search-worker.js
│       └── [外部库文件]
├── docs/
├── index.html
├── script.js                 # 主入口文件（已模块化）
├── styles.css
└── bookmarks.json
```

### 4.2 SvelteKit文件结构
```
chuwu-bookmarks-sveltekit/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   ├── styles/
│   │   └── utils/
│   ├── routes/
│   │   ├── +page.svelte        # 主页
│   │   └── folder/[id]/        # 动态文件夹页面
│   ├── app.d.ts
│   └── app.html
├── static/
│   ├── assets/
│   └── favicon.png
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

## 5. 具体迁移步骤
### 5.1 HTML结构迁移
将`index.html`内容迁移到`src/app.html`和`src/routes/+page.svelte`

### 5.2 CSS/SCSS迁移
1. 将`assets/css`目录下的文件迁移到`src/lib/styles`
2. 将`.css`文件重命名为`.scss`
3. 在组件中使用SCSS
```svelte
<style lang="scss">
  @import '$lib/styles/breakpoints';
  /* 组件样式 */
</style>
```

### 5.3 JavaScript模块迁移
当前项目已经实现了模块化架构，迁移时可以按模块进行：

#### 5.3.1 渲染模块 (render/)
```typescript
// src/lib/components/
├── Sidebar.svelte          # 从 sidebar.js 迁移
├── MainContent.svelte      # 从 content.js 迁移
├── HomePage.svelte         # 从 home.js 迁移
├── SearchResults.svelte    # 从 search.js 迁移
└── ThemeToggle.svelte      # 从 theme.js 迁移
```

#### 5.3.2 工具模块 (utils/)
```typescript
// src/lib/utils/
├── index.ts                # 从 utils/index.js 迁移
├── device.ts               # 从 render/device.js 迁移
└── breakpoints.ts          # 新增类型定义
```

#### 5.3.3 数据加载模块 (loader/)
```typescript
// src/lib/stores/
└── bookmarks.ts            # 从 loader/index.js 迁移为 Svelte store
```

#### 5.3.4 搜索模块 (search/)
```typescript
// src/lib/components/
└── SearchBox.svelte        # 从 search/index.js 迁移
```

#### 5.3.5 事件监听模块 (listener/)
在 SvelteKit 中，事件监听将集成到各个组件中，不需要单独的模块。

### 5.4 断点系统迁移
当前项目已实现统一断点系统，迁移时可直接使用：

#### 当前断点系统：
```javascript
// assets/js/modules/render/device.js
const BREAKPOINT = 1024;

const getDeviceType = () => {
    const width = window.innerWidth;
    return width < BREAKPOINT ? 'mobile' : 'desktop';
};
```

#### SvelteKit 迁移版本：
```typescript
// src/lib/utils/breakpoints.ts
export const BREAKPOINT = 1024;

export function getDeviceType(): 'mobile' | 'desktop' {
    // ⚠️ 在 onMount 中使用，避免 SSR 报错
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < BREAKPOINT ? 'mobile' : 'desktop';
}

export const isMobileDevice = () => getDeviceType() === 'mobile';
```

#### 对应的 SCSS 变量：
```scss
// src/lib/styles/_breakpoints.scss
$breakpoint: 1024px;

@mixin mobile {
    @media (max-width: #{$breakpoint - 1px}) {
        @content;
    }
}

@mixin desktop {
    @media (min-width: $breakpoint) {
        @content;
    }
}
```

## 6. 依赖项变更
| 原依赖 | 新依赖/替代方案 | 说明 |
|--------|----------------|------|
| 原生JavaScript | TypeScript | 提供类型安全 |
| CSS | SCSS | 提供更强大的样式功能 |
| 无构建工具 | SvelteKit(Vite) | 提供构建、路由、服务端渲染等功能 |
| swup | sveltekit-page-transitions | SvelteKit专用页面过渡库 |

## 7. 兼容性问题及解决方案
### 7.1 全局变量
问题：原代码可能依赖全局变量
解决方案：使用SvelteKit的stores或context API

### 7.2 DOM操作
问题：原代码可能直接操作DOM
解决方案：使用Svelte的响应式声明和绑定

### 7.3 第三方库集成
- 所有DOM操作请改用绑定/onMount
- 客户端库必须在onMount动态import
- 如需CommonJS库支持，请配置：
```ts
// vite.config.ts
optimizeDeps: {
  include: ['某个库'],
}```
问题：某些库可能需要特殊配置才能在SvelteKit中使用
解决方案：
- 对于客户端专用库，使用`onMount`导入
- 配置`vite.config.ts`中的`optimizeDeps`

## 8. 测试与验证
1. 运行开发服务器
```bash
npm run dev
```

2. 运行测试
```bash
npm run test
```

3. 构建生产版本
```bash
npm run build
npm run preview
```

## 9. 当前模块化架构优势
当前项目已经实现了良好的模块化架构，为 SvelteKit 迁移提供了以下优势：

### 9.1 清晰的模块分离
- **渲染模块**: 每个渲染功能都有独立的文件，易于转换为 Svelte 组件
- **事件监听模块**: 所有事件处理逻辑集中管理，易于集成到 Svelte 组件
- **数据加载模块**: 数据获取逻辑独立，可直接转换为 SvelteKit 的 load 函数
- **搜索模块**: 搜索功能独立，可转换为搜索组件
- **工具模块**: 通用工具函数，可直接迁移

### 9.2 统一的断点系统
- 已实现 CSS 和 JavaScript 的断点统一
- 单一断点值 (1024px) 简化了响应式设计
- 设备类型检测函数已模块化

### 9.3 Web Workers 支持
- 搜索和数据处理已使用 Web Workers
- 在 SvelteKit 中可继续使用或转换为服务端处理

## 10. 迁移后优化
1. 利用SvelteKit的路由系统重构页面导航
2. 使用Svelte的响应式系统优化状态管理
3. 实现服务端渲染提升性能和SEO
4. 使用代码分割减小初始加载体积

## 11. 迁移清单

### 模块迁移清单
- [ ] **渲染模块迁移**
  - [ ] sidebar.js → Sidebar.svelte
  - [ ] content.js → MainContent.svelte  
  - [ ] home.js → HomePage.svelte
  - [ ] search.js → SearchResults.svelte
  - [ ] theme.js → ThemeToggle.svelte
  - [ ] device.js → utils/device.ts

- [ ] **数据加载模块迁移**
  - [ ] loader/index.js → stores/bookmarks.ts
  - [ ] 实现 SvelteKit load 函数

- [ ] **搜索模块迁移**
  - [ ] search/index.js → SearchBox.svelte
  - [ ] Web Workers 适配或转为服务端处理

- [ ] **工具模块迁移**
  - [ ] utils/index.js → utils/index.ts
  - [ ] 添加 TypeScript 类型定义

- [ ] **事件监听模块迁移**
  - [ ] 将事件处理逻辑集成到对应组件

### 样式迁移清单
- [ ] **CSS 模块化迁移**
  - [ ] base.css → _base.scss
  - [ ] breakpoints.css → _breakpoints.scss
  - [ ] components.css → _components.scss
  - [ ] layout.css → _layout.scss
  - [ ] animations.css → _animations.scss
  - [ ] theme-toggle.css → 集成到 ThemeToggle.svelte

### 功能验证清单
- [ ] 侧边栏切换功能正常
- [ ] 主题切换功能正常
- [ ] 搜索功能正常
- [ ] 响应式布局正常
- [ ] 书签数据加载正常
- [ ] 面包屑导航正常
- [ ] 键盘快捷键正常
- [ ] 动画效果正常

### 性能优化清单
- [ ] 性能指标达到或超过原项目
- [ ] SSR/SSG 实现
- [ ] 代码分割优化
- [ ] 图片懒加载适配
- [ ] （可选）国际化资源结构建立