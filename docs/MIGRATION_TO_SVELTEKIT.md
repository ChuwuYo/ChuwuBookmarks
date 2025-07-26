# 项目迁移指南：Vue 3 + Vite + TypeScript + SCSS

## 1. 迁移概述
本文档详细说明将当前书签导航项目迁移到Vue 3 + Vite + TypeScript + SCSS技术栈的完整步骤。

### 1.1 技术栈选择理由
- **Vue 3**: 提供优秀的响应式系统和组合式API，简化状态管理和组件逻辑
- **Vite**: 提供极快的开发体验和构建性能，支持热重载和模块化开发
- **TypeScript**: 提供类型安全和更好的开发体验，减少运行时错误
- **SCSS**: 提供强大的样式预处理功能，保持现有设计系统
- **Pinia**: Vue 3官方推荐的状态管理库，替代手动状态管理
- **Vue Router**: 官方路由库，实现SPA导航功能

### 1.2 框架化迁移原则
- **组件化**: 将现有功能模块转换为Vue组件
- **响应式**: 利用Vue的响应式系统替代手动DOM操作
- **声明式**: 使用模板语法替代命令式DOM操作
- **类型安全**: 全面使用TypeScript提供类型保护

## 2. 迁移准备
### 2.1 环境要求
- Node.js ≥ 18.x
- npm ≥ 9.x 或 pnpm ≥ 8.x
- Git

### 2.2 前期准备工作
1. 创建项目备份
```bash
git add .
git commit -m "备份：迁移前的完整项目状态"
git checkout -b migration-vue3
```

2. 分析当前项目结构
```bash
# 统计当前项目文件
find . -name "*.js" -o -name "*.css" -o -name "*.html" | wc -l
# 检查依赖的外部库
ls assets/js/
```

## 3. 项目初始化
### 3.1 创建新的Vue 3项目
```bash
# 在项目根目录外创建新项目
cd ..
npm create vue@latest chuwu-bookmarks-vue3
cd chuwu-bookmarks-vue3
```

在创建过程中，选择以下选项：
- Add TypeScript? → **Yes**
- Add JSX Support? → **No**
- Add Vue Router for Single Page Application development? → **Yes**
- Add Pinia for state management? → **Yes**
- Add Vitest for Unit Testing? → **Yes**
- Add an End-to-End Testing Solution? → **No**
- Add ESLint for code quality? → **Yes**
- Add Prettier for code formatting? → **Yes**

### 3.2 安装必要依赖
```bash
# 安装基础依赖
npm install

# 安装SCSS支持
npm install --save-dev sass

# 安装GSAP动画库（保持原有动画效果）
npm install gsap

# 安装其他可能需要的依赖
npm install --save-dev @types/node
npm install --save-dev @vitejs/plugin-vue

# 安装Vue 3相关类型定义
npm install --save-dev @vue/tsconfig
```

## 4. 文件结构调整
### 4.1 当前模块化文件结构分析
```
ChuwuBookmarks/
├── assets/
│   ├── css/                    # 模块化CSS文件
│   │   ├── animations.css      # 动画效果
│   │   ├── base.css           # 基础样式和CSS变量
│   │   ├── breakpoints.css    # 响应式断点
│   │   ├── components.css     # 组件样式
│   │   ├── layout.css         # 布局样式
│   │   ├── responsive.css     # 响应式样式
│   │   ├── theme-toggle.css   # 主题切换样式
│   │   ├── sidepanel.css      # 侧边栏样式
│   │   └── homebutton.css     # 首页按钮样式
│   ├── fonts/                 # 自定义字体文件
│   │   ├── LXGWWenKai-Medium.woff2
│   │   └── DingTalk-JinBuTi.woff2
│   ├── images/                # 图片资源
│   │   ├── moecat.gif         # 背景动画
│   │   ├── show_sidepanel.svg
│   │   └── hide_sidepanel.svg
│   ├── icon/                  # 图标文件
│   │   └── bocchi.png
│   └── js/
│       ├── modules/           # 模块化JavaScript
│       │   ├── listener/      # 事件监听模块
│       │   │   └── index.js
│       │   ├── loader/        # 数据加载模块
│       │   │   └── index.js
│       │   ├── render/        # 渲染模块
│       │   │   ├── content.js  # 主内容渲染
│       │   │   ├── device.js   # 设备检测和适配
│       │   │   ├── home.js     # 首页渲染
│       │   │   ├── search.js   # 搜索结果渲染
│       │   │   ├── sidebar.js  # 侧边栏渲染
│       │   │   └── theme.js    # 主题管理
│       │   ├── search/        # 搜索功能模块
│       │   │   └── index.js
│       │   └── utils/         # 工具函数模块
│       │       └── index.js
│       ├── data-worker.js     # 数据处理Web Worker
│       ├── search-worker.js   # 搜索Web Worker
│       ├── vendor.js          # 第三方库合并文件
│       ├── init.js           # 初始化脚本
│       └── instant.page_v5.2.0.js
├── docs/                      # 文档目录
├── index.html                 # 主HTML文件
├── script.js                  # 主入口文件（已模块化）
├── styles.css                 # 样式入口文件
└── bookmarks.json            # 书签数据文件
```

### 4.2 目标Vue 3文件结构
```
chuwu-bookmarks-vue3/
├── src/
│   ├── components/            # Vue组件
│   │   ├── Sidebar.vue
│   │   ├── MainContent.vue
│   │   ├── SearchBox.vue
│   │   ├── ThemeToggle.vue
│   │   ├── Breadcrumbs.vue
│   │   ├── BookmarkItem.vue
│   │   ├── FolderItem.vue
│   │   └── HomePage.vue
│   ├── stores/                # Pinia stores
│   │   ├── bookmarks.ts
│   │   ├── theme.ts
│   │   ├── search.ts
│   │   └── device.ts
│   ├── styles/                # SCSS样式文件
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _breakpoints.scss
│   │   ├── _animations.scss
│   │   ├── _components.scss
│   │   ├── _layout.scss
│   │   └── main.scss
│   ├── utils/                 # 工具函数
│   │   ├── device.ts
│   │   ├── animation.ts
│   │   ├── search.ts
│   │   └── index.ts
│   ├── workers/               # Web Workers
│   │   ├── data-worker.ts
│   │   └── search-worker.ts
│   ├── types/                 # TypeScript类型定义
│   │   ├── bookmark.ts
│   │   └── index.ts
│   ├── router/                # Vue Router配置
│   │   └── index.ts
│   ├── views/                 # 页面视图
│   │   ├── HomeView.vue
│   │   └── FolderView.vue
│   ├── App.vue                # 根组件
│   └── main.ts                # 应用入口
├── public/                    # 静态资源
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   ├── bookmarks.json
│   └── favicon.ico
├── index.html                 # HTML模板
├── vite.config.ts             # Vite配置
├── tsconfig.json              # TypeScript配置
├── package.json
└── README.md
```

## 5. 具体迁移步骤

### 5.1 配置文件设置
首先配置Vue 3项目的基础设置：

#### 5.1.1 更新 `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/_variables.scss";`
      }
    }
  },
  optimizeDeps: {
    include: ['gsap']
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          gsap: ['gsap']
        }
      }
    }
  }
})
```

#### 5.1.2 更新 `tsconfig.json`
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 5.2 HTML结构迁移

#### 5.2.1 更新 `index.html`
```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" dir="ltr" class="no-js" itemscope itemtype="http://schema.org/WebPage">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/assets/icons/bocchi.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' ws: wss:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:" />
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/assets/images/show_sidepanel.svg" as="image">
  <link rel="preload" href="/assets/images/hide_sidepanel.svg" as="image">
  <link rel="preload" href="/assets/images/moecat.gif" as="image">
  <link rel="preload" href="/assets/fonts/LXGWWenKai-Medium.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/DingTalk-JinBuTi.woff2" as="font" type="font/woff2" crossorigin>
  
  <title>楚吴书签导航</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 5.2.2 创建应用入口 `src/main.ts`
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import '@/styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
```

#### 5.2.3 创建根组件 `src/App.vue`
```vue
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useDeviceStore } from '@/stores/device'

const themeStore = useThemeStore()
const deviceStore = useDeviceStore()

onMounted(() => {
  // 初始化主题
  themeStore.init()
  // 初始化设备检测
  deviceStore.init()
})
</script>

<style lang="scss">
// 全局样式已在 main.ts 中导入
</style>
```

### 5.3 CSS/SCSS迁移

#### 5.3.1 创建SCSS变量文件 `src/styles/_variables.scss`
```scss
// 从 assets/css/base.css 迁移CSS变量
:root {
    // 动画时长
    --transition-normal: background-color var(--duration-short) ease-out, color var(--duration-short) ease-out;
    --cubic-bezier: cubic-bezier(0.4, 0, 0.2, 1);
    --duration-short: 0.12s;
    --duration-base: 0.15s;
    --duration-medium: 0.2s;
    --duration-long: 0.3s;
    
    // 缓动函数
    --ease-in-out-cubic: var(--cubic-bezier);
    --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --ease-default: ease-out;
    
    // 浅色主题
    --bg-color: #f8faef;
    --sidebar-bg: #e2f5f5;
    --text-color: #0e141a;
    --link-color: #23d6e3;
    --hover-bg: #dfe6e9;
    --button-bg: #a1dcf5;
    --button-hover: #faeaf4;
    --header-bg: #88dcfa;
    
    // 阴影
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 2px 0 5px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 0 10px rgba(0, 0, 0, 0.2);
    --button-shadow: 3px 0 8px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15);
    --button-shadow-expanded: 0 2px 8px rgba(0, 0, 0, 0.25), -2px 0 4px rgba(0, 0, 0, 0.15);
    --button-shadow-hover: 4px 0 12px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
    --theme-shadow-hover: 0 0 10px rgba(0, 0, 0, 0.2);
}

// 深色主题
:root[data-theme='dark'] {
    --bg-color: #1c1c1c;
    --sidebar-bg: #161515;
    --text-color: #f9f1d5e6;
    --link-color: #74ceff;
    --hover-bg: #2d3436;
    --button-bg: #5d6687;
    --button-hover: rgb(201, 207, 159);
    --header-bg: #ffffff4b;
    --shadow-sm: 0 2px 4px rgba(255, 255, 255, 0.1);
    --shadow-md: 2px 0 5px rgba(255, 255, 255, 0.2);
    --shadow-lg: 0 0 10px rgba(255, 255, 255, 0.2);
    --button-shadow: 3px 0 8px rgba(255, 255, 255, 0.15), 0 2px 4px rgba(255, 255, 255, 0.1);
    --button-shadow-expanded: 0 2px 8px rgba(255, 255, 255, 0.15), -2px 0 4px rgba(255, 255, 255, 0.1);
    --button-shadow-hover: 4px 0 12px rgba(255, 255, 255, 0.25), 0 4px 6px rgba(255, 255, 255, 0.2);
    --theme-shadow-hover: 0 0 12px rgba(255, 255, 255, 0.3);
}
```

#### 5.3.2 创建断点系统 `src/styles/_breakpoints.scss`
```scss
// 从 assets/css/breakpoints.css 迁移
$breakpoint: 1024px;

@mixin mobile {
    @media screen and (max-width: #{$breakpoint - 1px}) {
        @content;
    }
}

@mixin desktop {
    @media screen and (min-width: $breakpoint) {
        @content;
    }
}

@mixin mobile-device {
    .mobile-device & {
        @content;
    }
}

@mixin desktop-device {
    .desktop-device & {
        @content;
    }
}
```

#### 5.3.3 创建全局样式 `src/styles/main.scss`
```scss
@import '_variables';
@import '_breakpoints';
@import '_animations';

// 字体定义
@font-face {
    font-family: 'LXGW WenKai';
    src: url('/assets/fonts/LXGWWenKai-Medium.woff2') format('woff2');
    font-display: swap;
}

@font-face {
    font-family: 'DingTalk JinBuTi';
    src: url('/assets/fonts/DingTalk-JinBuTi.woff2') format('woff2');
    font-display: swap;
}

// 全局重置
* {
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--duration-short) var(--ease-default),
                color var(--duration-short) var(--ease-default);
}

html {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) var(--bg-color);
}

// 统一滚动条样式
::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

::-webkit-scrollbar-track {
    background: var(--bg-color);
    border-radius: 6px;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
}

body {
    font-family: 'LXGW WenKai', Arial, sans-serif;
    background-color: var(--bg-color);
    position: relative;
    color: var(--text-color);
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
}

// 添加背景GIF
body::after {
    content: '';
    position: fixed;
    bottom: 0;
    right: 0;
    width: 1000px;
    height: 1000px;
    background: url('/assets/images/moecat.gif') no-repeat right bottom;
    background-size: contain;
    z-index: 1;
    pointer-events: none;
}

// 确保其他内容在GIF之上
.sidebar, .main-content, .search-container, .github-link, .theme-toggle {
    position: relative;
    z-index: 2;
}
```

### 5.4 TypeScript类型定义

#### 5.4.1 创建书签类型 `src/types/bookmark.ts`
```typescript
export interface BookmarkItem {
  type: 'link';
  addDate: number;
  title: string;
  url: string;
  icon?: string;
}

export interface FolderItem {
  type: 'folder';
  addDate: number;
  title: string;
  children: (BookmarkItem | FolderItem)[];
}

export type BookmarkNode = BookmarkItem | FolderItem;

export interface BookmarkData {
  folders: FolderItem[];
  allBookmarks: BookmarkItem[];
}

export interface SearchResult {
  item: BookmarkItem;
  score: number;
  matches: {
    title?: boolean;
    url?: boolean;
  };
}

export type DeviceType = 'mobile' | 'desktop';
export type Theme = 'light' | 'dark';
```

#### 5.4.2 创建全局类型 `src/types/index.ts`
```typescript
export * from './bookmark';

export interface AnimationConfig {
  duration: {
    short: number;
    base: number;
    medium: number;
    long: number;
  };
  ease: {
    inOutCubic: string;
    outQuad: string;
    default: string;
  };
}
```

### 5.5 Pinia Stores 创建

#### 5.5.1 主题管理 Store `src/stores/theme.ts`
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Theme } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  const init = () => {
    if (typeof window === 'undefined') return
    
    const savedTheme = localStorage.getItem('theme') as Theme || 'light'
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  const toggle = () => {
    const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  return {
    currentTheme,
    init,
    toggle,
    setTheme
  }
})
```

#### 5.5.2 设备检测 Store `src/stores/device.ts`
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DeviceType } from '@/types'

const BREAKPOINT = 1024

export const useDeviceStore = defineStore('device', () => {
  const currentDevice = ref<DeviceType>('desktop')

  const getDeviceType = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    const height = window.innerHeight
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // 手机设备（包括横屏）优先使用移动端样式
    if (isTouchDevice && (width < BREAKPOINT || height < 600)) {
      return 'mobile'
    }
    
    return width < BREAKPOINT ? 'mobile' : 'desktop'
  }

  const updateDeviceType = () => {
    const deviceType = getDeviceType()
    currentDevice.value = deviceType
    
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('mobile-device', deviceType === 'mobile')
      document.body.classList.toggle('desktop-device', deviceType === 'desktop')
    }
  }

  const init = () => {
    if (typeof window === 'undefined') return
    
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    
    return () => {
      window.removeEventListener('resize', updateDeviceType)
    }
  }

  const isMobile = computed(() => currentDevice.value === 'mobile')
  const isDesktop = computed(() => currentDevice.value === 'desktop')

  return {
    currentDevice,
    init,
    getDeviceType,
    isMobile,
    isDesktop
  }
})
```

#### 5.5.3 书签数据 Store `src/stores/bookmarks.ts`
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookmarkData, FolderItem, BookmarkItem } from '@/types'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const bookmarkData = ref<BookmarkData>({
    folders: [],
    allBookmarks: []
  })

  const processBookmarkData = (rawData: any[]): BookmarkData => {
    const allBookmarks: BookmarkItem[] = []
    
    const processNode = (node: any): FolderItem | BookmarkItem => {
      if (node.type === 'folder') {
        return {
          type: 'folder',
          addDate: node.addDate,
          title: node.title,
          children: node.children?.map(processNode) || []
        }
      } else {
        const bookmark: BookmarkItem = {
          type: 'link',
          addDate: node.addDate,
          title: node.title,
          url: node.url,
          icon: node.icon
        }
        allBookmarks.push(bookmark)
        return bookmark
      }
    }

    const folders = rawData.map(processNode).filter(node => node.type === 'folder') as FolderItem[]
    
    return {
      folders,
      allBookmarks
    }
  }

  const loadBookmarksData = async (): Promise<BookmarkData> => {
    try {
      // 尝试从缓存获取数据
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem('bookmarksData')
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          bookmarkData.value = parsed
        }
      }

      // 加载新数据
      const response = await fetch('/bookmarks.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const rawData = await response.json()
      const processedData = processBookmarkData(rawData)
      
      // 更新缓存和store
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookmarksData', JSON.stringify(processedData))
      }
      bookmarkData.value = processedData
      
      return processedData
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      throw error
    }
  }

  const reload = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookmarksData')
    }
    return loadBookmarksData()
  }

  // 计算属性用于搜索
  const searchableBookmarks = computed(() => bookmarkData.value.allBookmarks)

  return {
    bookmarkData,
    searchableBookmarks,
    loadBookmarksData,
    reload
  }
})
```

#### 5.5.4 搜索功能 Store `src/stores/search.ts`
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBookmarksStore } from './bookmarks'
import type { BookmarkItem, SearchResult } from '@/types'

export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref<string>('')
  const bookmarksStore = useBookmarksStore()

  const performSearch = (query: string, bookmarks: BookmarkItem[]): SearchResult[] => {
    if (!query.trim()) return []
    
    const searchTerm = query.toLowerCase()
    const results: SearchResult[] = []
    
    bookmarks.forEach(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(searchTerm)
      const urlMatch = bookmark.url.toLowerCase().includes(searchTerm)
      
      if (titleMatch || urlMatch) {
        let score = 0
        if (titleMatch) score += 2
        if (urlMatch) score += 1
        
        results.push({
          item: bookmark,
          score,
          matches: {
            title: titleMatch,
            url: urlMatch
          }
        })
      }
    })
    
    return results.sort((a, b) => b.score - a.score)
  }

  // 计算属性用于搜索结果
  const searchResults = computed(() => {
    if (!searchQuery.value.trim()) return []
    
    return performSearch(searchQuery.value, bookmarksStore.searchableBookmarks)
  })

  const setQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearQuery = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    searchResults,
    setQuery,
    clearQuery
  }
})
```

### 5.6 核心组件创建

#### 5.6.1 主题切换组件 `src/components/ThemeToggle.vue`
```vue
<template>
  <button 
    id="theme-toggle" 
    class="theme-toggle" 
    aria-label="切换主题"
    @click="handleToggle"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const handleToggle = () => {
  themeStore.toggle()
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--button-bg);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base) var(--ease-default);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    background: var(--button-hover);
    box-shadow: var(--theme-shadow-hover);
    transform: scale(1.05);
  }
  
  svg {
    width: 20px;
    height: 20px;
    transition: opacity var(--duration-base) var(--ease-default);
  }
  
  .sun {
    opacity: 1;
  }
  
  .moon {
    position: absolute;
    opacity: 0;
  }
}

:global([data-theme='dark']) .theme-toggle {
  .sun {
    opacity: 0;
  }
  
  .moon {
    opacity: 1;
  }
}
</style>
```

#### 5.6.2 搜索框组件 `src/components/SearchBox.vue`
```vue
<template>
  <nav class="search-container" role="search">
    <input 
      ref="searchInput"
      v-model="searchQuery"
      type="text" 
      id="search-input"
      name="query" 
      placeholder="🔍 搜索 ( title / url )" 
      aria-label="搜索书签"
      aria-describedby="search-hint"
    />
    
    <div 
      v-if="deviceStore.isDesktop" 
      id="search-hint" 
      class="shortcut-hint" 
      aria-label="键盘快捷键"
    >
      <span aria-hidden="true">Ctrl</span><span aria-hidden="true">K</span>
    </div>
    
    <slot name="theme-toggle" />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useDeviceStore } from '@/stores/device'

const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const searchStore = useSearchStore()
const deviceStore = useDeviceStore()

// 监听搜索查询变化
watch(searchQuery, (newQuery) => {
  searchStore.setQuery(newQuery)
})

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+K 快捷键聚焦搜索框
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
  
  // ESC 清空搜索
  if (event.key === 'Escape') {
    searchQuery.value = ''
    searchInput.value?.blur()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.search-container {
  position: fixed;
  top: 20px;
  z-index: 999;
  display: flex;
  align-items: center;
  white-space: nowrap;
  user-select: none;
  contain: layout;
  outline: none;
  
  @include desktop {
    left: 50%;
    transform: translateX(calc(-50% + 110px + var(--search-container-centering-offset, 0px)));
    transition: transform var(--duration-base) var(--ease-in-out-cubic), 
                opacity var(--duration-base) var(--ease-default);
    will-change: transform, opacity;
  }
  
  @include mobile {
    left: 50%;
    transform: translateX(-50%);
    transition: opacity 0.2s ease;
    justify-content: center;
  }
}

#search-input {
  padding: 10px 15px;
  border: 2px solid transparent;
  border-radius: 25px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 16px;
  font-family: inherit;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-default);
  outline: none;
  
  @include desktop {
    width: 300px;
  }
  
  @include mobile {
    width: 200px;
    max-width: calc(100vw - 40px);
    margin: 0;
  }
  
  &:focus {
    border-color: var(--link-color);
    box-shadow: var(--shadow-lg);
    transform: scale(1.02);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.7;
  }
}

.shortcut-hint {
  margin-left: 10px;
  display: flex;
  gap: 2px;
  
  @include mobile {
    display: none;
  }
  
  span {
    padding: 4px 8px;
    background: var(--button-bg);
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    color: var(--text-color);
    box-shadow: var(--shadow-sm);
  }
}
</style>
```

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

#### Vue 3 迁移版本：
```typescript
// src/utils/breakpoints.ts
export const BREAKPOINT = 1024;

export function getDeviceType(): 'mobile' | 'desktop' {
    // ⚠️ 在客户端使用，避免 SSR 报错
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < BREAKPOINT ? 'mobile' : 'desktop';
}

export const isMobileDevice = () => getDeviceType() === 'mobile';
```

#### 对应的 SCSS 变量：
```scss
// src/styles/_breakpoints.scss
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
| 无构建工具 | Vue 3 + Vite | 提供构建、开发服务器、热重载等功能 |
| 无状态管理 | Pinia | Vue 3官方推荐的状态管理库 |
| 无路由 | Vue Router | Vue 3官方路由库 |
| swup | Vue Transition | Vue 3内置页面过渡功能 |

## 7. 框架化迁移策略

### 7.1 从命令式到声明式
**原有方式**: 手动DOM操作和事件绑定
```javascript
// 原有的命令式代码
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.documentElement.setAttribute('data-theme', newTheme)
})
```

**Vue 3方式**: 响应式数据和模板绑定
```vue
<template>
  <button @click="themeStore.toggle()">切换主题</button>
</template>
<script setup>
const themeStore = useThemeStore()
</script>
```

### 7.2 状态管理现代化
**原有方式**: 全局变量和手动状态同步
**Vue 3方式**: Pinia stores统一管理状态

### 7.3 组件化重构原则
- **单一职责**: 每个组件只负责一个功能模块
- **响应式优先**: 使用Vue的响应式系统替代手动更新
- **类型安全**: 全面使用TypeScript类型定义
- **组合式API**: 使用Composition API提高代码复用性

## 8. Vue 3框架特性应用

### 8.1 响应式系统应用
- **数据驱动**: 所有UI更新通过响应式数据变化自动触发
- **计算属性**: 使用computed处理派生数据，如搜索结果
- **侦听器**: 使用watch监听数据变化，执行副作用

### 8.2 组合式API优势
- **逻辑复用**: 通过composables提取可复用逻辑
- **类型推导**: 更好的TypeScript支持
- **性能优化**: 更精确的依赖追踪

### 8.3 Vue Router集成
- **声明式导航**: 使用router-link和router-view
- **路由守卫**: 实现导航控制和权限验证
- **动态路由**: 支持文件夹ID参数路由

## 9. 开发与构建
```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 10. Vue 3框架化重构要点

### 10.1 组件化架构设计
**原有模块** → **Vue 3组件**
- `sidebar.js` → `Sidebar.vue` (侧边栏组件)
- `content.js` → `MainContent.vue` (主内容区组件)
- `search.js` → `SearchBox.vue` + `SearchResults.vue` (搜索相关组件)
- `theme.js` → `ThemeToggle.vue` (主题切换组件)
- `breadcrumbs` → `Breadcrumbs.vue` (面包屑导航组件)

### 10.2 状态管理现代化
**原有全局状态** → **Pinia Stores**
- 主题状态 → `useThemeStore()`
- 设备检测 → `useDeviceStore()`
- 书签数据 → `useBookmarksStore()`
- 搜索状态 → `useSearchStore()`

### 10.3 路由系统建立
**原有URL管理** → **Vue Router**
```typescript
// src/router/index.ts
const routes = [
  { path: '/', component: HomeView },
  { path: '/folder/:id', component: FolderView }
]
```

### 10.4 响应式数据流
**原有手动更新** → **Vue响应式系统**
- DOM操作 → 模板绑定
- 事件监听 → `@click`、`@input`等指令
- 状态同步 → 响应式数据自动更新

## 10. 迁移后优化
1. 利用Vue Router的路由系统重构页面导航
2. 使用Vue 3的响应式系统和Pinia优化状态管理
3. 利用Vite的构建优化提升性能和开发体验
4. 使用代码分割和懒加载减小初始加载体积
5. 利用Vue 3的Composition API提升代码复用性

## 11. Vue 3框架化迁移清单

### 11.1 组件化重构清单
- [ ] **核心组件创建**
  - [ ] `Sidebar.vue` - 侧边栏组件，使用响应式数据管理展开/收起状态
  - [ ] `MainContent.vue` - 主内容区组件，通过props接收数据
  - [ ] `SearchBox.vue` - 搜索框组件，使用v-model双向绑定
  - [ ] `SearchResults.vue` - 搜索结果组件，使用计算属性实时更新
  - [ ] `ThemeToggle.vue` - 主题切换组件，集成Pinia store
  - [ ] `Breadcrumbs.vue` - 面包屑导航组件，使用Vue Router
  - [ ] `BookmarkItem.vue` - 书签项组件，可复用的列表项
  - [ ] `FolderItem.vue` - 文件夹项组件，支持嵌套结构

### 11.2 状态管理现代化清单
- [ ] **Pinia Stores实现**
  - [ ] `useThemeStore()` - 主题状态管理，替代手动DOM操作
  - [ ] `useDeviceStore()` - 设备检测，使用响应式数据和计算属性
  - [ ] `useBookmarksStore()` - 书签数据管理，异步数据加载
  - [ ] `useSearchStore()` - 搜索状态管理，实时搜索结果计算

### 11.3 路由系统建立清单
- [ ] **Vue Router配置**
  - [ ] 创建路由配置文件 `src/router/index.ts`
  - [ ] 实现首页路由 `/`
  - [ ] 实现文件夹路由 `/folder/:id`
  - [ ] 配置路由守卫和导航控制

### 11.4 样式系统迁移清单
- [ ] **SCSS模块化**
  - [ ] `_variables.scss` - 保持完整的CSS变量系统
  - [ ] `_breakpoints.scss` - 保持统一断点系统
  - [ ] `_animations.scss` - 保持所有动画定义
  - [ ] `main.scss` - 全局样式入口
  - [ ] 组件级scoped样式 - 每个Vue组件的独立样式

### 11.5 框架特性应用清单
- [ ] **响应式系统**
  - [ ] 使用`ref()`和`reactive()`管理组件状态
  - [ ] 使用`computed()`处理派生数据
  - [ ] 使用`watch()`监听数据变化
  - [ ] 消除所有手动DOM操作

- [ ] **组合式API**
  - [ ] 创建可复用的composables函数
  - [ ] 使用`<script setup>`语法糖
  - [ ] 实现逻辑复用和代码组织

- [ ] **模板系统**
  - [ ] 使用`v-model`实现双向绑定
  - [ ] 使用`@click`等事件指令
  - [ ] 使用`v-if`、`v-for`等条件渲染
  - [ ] 使用插槽(slots)实现组件组合

## 12. 框架化验证标准

### 12.1 技术实现验证
- [ ] **零手动DOM操作**: 完全使用Vue的声明式语法
- [ ] **类型安全**: 所有组件和store都有TypeScript类型
- [ ] **响应式数据流**: 所有状态变化自动触发UI更新
- [ ] **组件化程度**: 功能模块完全组件化，职责单一

### 12.2 开发体验验证
- [ ] **热重载**: 代码修改后毫秒级更新
- [ ] **类型检查**: 开发时实时类型错误提示
- [ ] **代码提示**: IDE完整的自动补全支持
- [ ] **调试工具**: Vue DevTools完整支持

### 12.3 性能优化验证
- [ ] **构建优化**: Vite提供的现代化构建
- [ ] **代码分割**: 路由级别的懒加载
- [ ] **Tree Shaking**: 自动移除未使用代码
- [ ] **响应式优化**: Vue 3的Proxy-based响应式系统

### 12.4 设计一致性验证
- [ ] **视觉效果**: 与原项目完全一致的外观
- [ ] **交互体验**: 保持所有原有的交互逻辑
- [ ] **动画效果**: 所有动画在Vue组件中正常工作
- [ ] **主题切换**: 完整的双主题支持

## 13. 迁移成功的技术优势

### 13.1 开发效率提升
- **声明式编程**: Vue模板语法比命令式DOM操作更直观
- **组件复用**: 可复用的Vue组件减少重复代码
- **类型安全**: TypeScript在开发时捕获错误，减少调试时间
- **热重载**: Vite提供毫秒级的开发反馈

### 13.2 代码质量改善
- **状态管理**: Pinia提供集中式、类型安全的状态管理
- **组件隔离**: 每个组件职责单一，便于测试和维护
- **逻辑复用**: Composition API和composables提高代码复用性
- **类型推导**: 更好的IDE支持和代码智能提示

### 13.3 性能优化收益
- **响应式系统**: Vue 3的Proxy-based响应式系统性能更优
- **编译优化**: Vite的现代化构建工具链
- **按需加载**: 路由级别的代码分割
- **Tree Shaking**: 自动移除未使用的代码

### 13.4 维护性提升
- **框架生态**: 丰富的Vue 3生态系统支持
- **长期支持**: Vue 3的长期维护保证
- **社区支持**: 活跃的开发者社区
- **文档完善**: 完整的官方文档和最佳实践

这个Vue 3迁移指南确保了项目能够充分利用现代前端框架的优势，实现从传统JavaScript到现代化Vue 3应用的完整转换，同时完美保持原有的设计和功能体验。rks.ts
  - [ ] 实现 Pinia stores 和异步数据加载

- [ ] **搜索模块迁移**
  - [ ] search/index.js → SearchBox.vue + stores/search.ts
  - [ ] 使用Vue的计算属性实现实时搜索

- [ ] **工具模块迁移**
  - [ ] utils/index.js → utils/index.ts + composables/
  - [ ] 创建Vue组合式函数(composables)提取可复用逻辑

- [ ] **路由系统建立**
  - [ ] 创建 Vue Router 配置
  - [ ] 实现页面视图组件和路由守卫

### 样式迁移清单
- [ ] **SCSS模块化迁移**
  - [ ] base.css → _variables.scss (保持CSS变量系统)
  - [ ] breakpoints.css → _breakpoints.scss (保持断点系统)
  - [ ] components.css → 分散到各Vue组件的scoped样式
  - [ ] layout.css → _layout.scss (全局布局样式)
  - [ ] animations.css → _animations.scss (保持动画系统)

### Vue 3框架特性应用清单
- [ ] **组件化重构**
  - [ ] 所有功能模块转换为Vue单文件组件
  - [ ] 使用Composition API组织组件逻辑
  - [ ] 实现组件间的props和事件通信

- [ ] **响应式系统应用**
  - [ ] 使用ref/reactive管理组件状态
  - [ ] 使用computed处理派生数据
  - [ ] 使用watch监听数据变化

- [ ] **状态管理现代化**
  - [ ] 全局状态迁移到Pinia stores
  - [ ] 实现store之间的数据共享
  - [ ] 使用TypeScript为store提供类型安全

### 功能验证清单
- [ ] 侧边栏切换功能通过Vue响应式实现
- [ ] 主题切换功能通过Pinia store管理
- [ ] 搜索功能通过计算属性实时响应
- [ ] 响应式布局通过Vue指令和CSS媒体查询实现
- [ ] 书签数据加载通过异步组合式函数实现
- [ ] 面包屑导航通过Vue Router实现
- [ ] 键盘快捷键通过Vue事件监听实现
- [ ] 动画效果在Vue组件中正常工作

### Vue 3迁移成功标准
- [ ] **框架化程度**: 完全消除手动DOM操作，全部使用Vue声明式语法
- [ ] **类型安全**: 所有组件和store都有完整的TypeScript类型定义
- [ ] **性能优化**: 利用Vue 3的响应式系统和Vite构建优化
- [ ] **开发体验**: 支持热重载、类型检查、代码提示等现代开发特性
- [ ] **设计一致性**: 完美保持原有的视觉效果和用户体验

## 12. 迁移后的技术优势

### 12.1 开发效率提升
- **热重载**: Vite提供毫秒级的热更新
- **类型安全**: TypeScript在开发时捕获错误
- **组件化**: 可复用的Vue组件提高开发效率
- **声明式**: Vue模板语法比命令式DOM操作更直观

### 12.2 维护性改善
- **状态管理**: Pinia提供集中式、类型安全的状态管理
- **组件隔离**: 每个组件职责单一，便于维护
- **代码复用**: Composition API和composables提高代码复用性

### 12.3 性能优化
- **响应式系统**: Vue 3的Proxy-based响应式系统性能更优
- **Tree-shaking**: Vite构建时自动移除未使用代码
- **代码分割**: 路由级别的懒加载减少初始包大小

这个Vue 3迁移指南确保了项目能够充分利用现代前端框架的优势，同时完美保持原有的设计和功能。rks.ts
  - [ ] 实现 Pinia stores 和异步数据加载

- [ ] **搜索模块迁移**
  - [ ] search/index.js → SearchBox.vue + stores/search.ts
  - [ ] Web Workers 适配或优化为客户端处理

- [ ] **工具模块迁移**
  - [ ] utils/index.js → utils/index.ts
  - [ ] 添加 TypeScript 类型定义

- [ ] **事件监听模块迁移**
  - [ ] 将事件处理逻辑集成到对应Vue组件

- [ ] **路由系统建立**
  - [ ] 创建 Vue Router 配置
  - [ ] 实现页面视图组件

### 样式迁移清单
- [ ] **CSS 模块化迁移**
  - [ ] base.css → _variables.scss
  - [ ] breakpoints.css → _breakpoints.scss
  - [ ] components.css → _components.scss
  - [ ] layout.css → _layout.scss
  - [ ] animations.css → _animations.scss
  - [ ] theme-toggle.css → 集成到 ThemeToggle.vue

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