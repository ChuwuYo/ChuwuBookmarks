# 楚吴书签导航 - Vue 3重新开发指南

## 1. 项目概述

本项目将采用Vue 3 + Vite + TypeScript + SCSS技术栈从头重新构建Chuwu书签导航，完全拥抱Vue 3的设计理念，使用框架提供的响应式系统和现代化特性，保持原有的设计风格和功能特性。

### 1.1 技术栈选择

- **Vue 3**: 采用组合式API，充分利用响应式系统和内置功能
- **Vite**: 现代化构建工具，提供极快的开发体验和优化的生产构建
- **TypeScript**: 提供类型安全，与Vue 3完美集成
- **SCSS**: 强大的CSS预处理器，配合Vue的样式绑定系统
- **Pinia**: Vue 3官方推荐的状态管理库，完全响应式
- **Vue Router**: 官方路由库，声明式导航

### 1.2 Vue 3框架优先原则

- **响应式优先**: 完全使用Vue的响应式系统，避免手动DOM操作
- **组合式API**: 使用Composition API实现逻辑复用和类型推导
- **声明式渲染**: 通过模板和数据绑定实现UI更新
- **框架内置功能**: 优先使用Vue内置的指令、组件和功能
- **类型安全**: 充分利用Vue 3的TypeScript支持

## 2. 项目初始化

### 2.1 环境准备

```bash
# 确保Node.js版本 >= 18.x
node --version

# 确保npm版本 >= 9.x
npm --version
```

### 2.2 创建项目

```bash
# 创建Vue 3项目
npm create vue@latest chuwu-bookmarks-vue3

# 进入项目目录
cd chuwu-bookmarks-vue3

# 选择以下配置选项：
# ✅ Add TypeScript? → Yes
# ❌ Add JSX Support? → No  
# ✅ Add Vue Router for Single Page Application development? → Yes
# ✅ Add Pinia for state management? → Yes
# ✅ Add Vitest for Unit Testing? → Yes
# ❌ Add an End-to-End Testing Solution? → No
# ✅ Add ESLint for code quality? → Yes
# ✅ Add Prettier for code formatting? → Yes

# 安装依赖
npm install

# 安装Vue生态系统工具库（框架优先）
npm install --save-dev sass
npm install @vueuse/core  # Vue 3组合式工具库
npm install vue-toastification  # Vue 3通知组件
```

### 2.3 项目结构规划

```
chuwu-bookmarks-vue3/
├── src/
│   ├── components/           # Vue组件
│   │   ├── layout/          # 布局组件
│   │   │   ├── Sidebar.vue
│   │   │   ├── MainContent.vue
│   │   │   └── Header.vue
│   │   ├── ui/              # UI组件
│   │   │   ├── SearchBox.vue
│   │   │   ├── ThemeToggle.vue
│   │   │   ├── Breadcrumbs.vue
│   │   │   └── SidebarToggle.vue
│   │   └── content/         # 内容组件
│   │       ├── BookmarkItem.vue
│   │       ├── FolderItem.vue
│   │       ├── HomePage.vue
│   │       └── SearchResults.vue
│   ├── stores/              # Pinia状态管理
│   │   ├── bookmarks.ts
│   │   ├── theme.ts
│   │   ├── search.ts
│   │   ├── sidebar.ts
│   │   └── device.ts
│   ├── styles/              # SCSS样式
│   │   ├── _variables.scss  # CSS变量和主题
│   │   ├── _mixins.scss     # SCSS混入
│   │   ├── _breakpoints.scss # 响应式断点
│   │   ├── _animations.scss # 动画定义
│   │   ├── _components.scss # 组件样式
│   │   ├── _layout.scss     # 布局样式
│   │   └── main.scss        # 主样式文件
│   ├── utils/               # 工具函数
│   │   ├── device.ts
│   │   ├── animation.ts
│   │   ├── search.ts
│   │   └── index.ts
│   ├── types/               # TypeScript类型定义
│   │   ├── bookmark.ts
│   │   └── index.ts
│   ├── router/              # Vue Router配置
│   │   └── index.ts
│   ├── views/               # 页面视图
│   │   ├── HomeView.vue
│   │   └── FolderView.vue
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── public/                  # 静态资源
│   ├── assets/
│   │   ├── fonts/           # 字体文件
│   │   ├── images/          # 图片资源
│   │   └── icons/           # 图标文件
│   ├── bookmarks.json       # 书签数据
│   └── favicon.ico
├── docs/                    # 文档目录
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
└── package.json
```

## 3. 开发步骤

### 3.1 第一阶段：基础配置和样式系统

#### 3.1.1 配置Vite构建工具

```typescript
// vite.config.ts
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
  server: {
    port: 3000,
    open: true
  }
})
```

#### 3.1.2 迁移CSS变量系统

创建 `src/styles/_variables.scss`，完整迁移原有的CSS变量定义：

```scss
// 从 assets/css/base.css 完整迁移所有CSS变量
:root {
    // 动画时长
    --duration-short: 0.12s;
    --duration-base: 0.15s;
    --duration-medium: 0.2s;
    --duration-long: 0.3s;
    
    // 缓动函数
    --cubic-bezier: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in-out-cubic: var(--cubic-bezier);
    --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --ease-default: ease-out;
    
    // 浅色主题色彩
    --bg-color: #f8faef;
    --sidebar-bg: #e2f5f5;
    --text-color: #0e141a;
    --link-color: #23d6e3;
    --hover-bg: #dfe6e9;
    --button-bg: #a1dcf5;
    --button-hover: #faeaf4;
    --header-bg: #88dcfa;
    
    // 阴影系统
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 2px 0 5px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 0 10px rgba(0, 0, 0, 0.2);
    --button-shadow: 3px 0 8px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15);
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
    --button-shadow-hover: 4px 0 12px rgba(255, 255, 255, 0.25), 0 4px 6px rgba(255, 255, 255, 0.2);
    --theme-shadow-hover: 0 0 12px rgba(255, 255, 255, 0.3);
}
```

#### 3.1.3 创建响应式断点系统

```scss
// src/styles/_breakpoints.scss
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
```

#### 3.1.4 迁移字体系统

```scss
// src/styles/main.scss
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

body {
    font-family: 'LXGW WenKai', Arial, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    transition: background-color var(--duration-short) var(--ease-default),
                color var(--duration-short) var(--ease-default);
}

// 背景GIF效果
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
```

### 3.2 第二阶段：TypeScript类型定义

#### 3.2.1 创建书签数据类型

```typescript
// src/types/bookmark.ts
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

### 3.3 第三阶段：Pinia状态管理

#### 3.3.1 主题管理Store

```typescript
// src/stores/theme.ts
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

#### 3.3.2 设备检测Store（使用Vue 3响应式系统）

```typescript
// src/stores/device.ts
import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { DeviceType } from '@/types'

export const useDeviceStore = defineStore('device', () => {
  // 使用Vue 3的响应式系统和VueUse工具库
  const isDesktopQuery = useMediaQuery('(min-width: 1024px)')
  const isTouchDevice = useMediaQuery('(pointer: coarse)')
  
  // 响应式计算设备类型
  const currentDevice = computed<DeviceType>(() => {
    // 触摸设备且屏幕较小时判定为移动端
    if (isTouchDevice.value && !isDesktopQuery.value) {
      return 'mobile'
    }
    return isDesktopQuery.value ? 'desktop' : 'mobile'
  })

  const isMobile = computed(() => currentDevice.value === 'mobile')
  const isDesktop = computed(() => currentDevice.value === 'desktop')

  // 使用Vue 3的watchEffect自动响应变化
  const init = () => {
    watchEffect(() => {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('mobile-device', isMobile.value)
        document.body.classList.toggle('desktop-device', isDesktop.value)
      }
    })
  }

  return {
    currentDevice,
    isMobile,
    isDesktop,
    init
  }
})
```

#### 3.3.3 侧边栏状态Store

```typescript
// src/stores/sidebar.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDeviceStore } from './device'

export const useSidebarStore = defineStore('sidebar', () => {
  const isExpanded = ref(true)
  const deviceStore = useDeviceStore()

  const toggle = () => {
    isExpanded.value = !isExpanded.value
    
    // 移动端自动收起
    if (deviceStore.isMobile) {
      setTimeout(() => {
        isExpanded.value = false
      }, 300)
    }
  }

  const expand = () => {
    isExpanded.value = true
  }

  const collapse = () => {
    isExpanded.value = false
  }

  const init = () => {
    // 移动端默认收起
    if (deviceStore.isMobile) {
      isExpanded.value = false
    }
  }

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    init
  }
})
```

#### 3.3.4 书签数据Store（使用Vue 3响应式系统）

```typescript
// src/stores/bookmarks.ts
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

#### 3.3.5 搜索功能Store（使用Vue 3响应式系统）

```typescript
// src/stores/search.ts
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

### 3.4 第四阶段：核心组件开发

#### 3.4.1 主题切换组件

```vue
<!-- src/components/ui/ThemeToggle.vue -->
<template>
  <button 
    class="theme-toggle" 
    aria-label="切换主题"
    @click="handleToggle"
  >
    <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  width: calc(1rem + 15px + 6px);
  height: calc(1rem + 15px + 6px);
  border: 2px solid #a4d1c4;
  border-radius: 10px;
  background: var(--button-bg);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base) var(--ease-default);
  box-shadow: var(--button-shadow);
  
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

#### 3.4.2 搜索框组件（使用Vue 3响应式和VueUse）

```vue
<!-- src/components/ui/SearchBox.vue -->
<template>
  <nav class="search-container" role="search">
    <input 
      ref="searchInput"
      v-model="searchStore.searchQuery"
      type="text" 
      id="search-input"
      placeholder="🔍 搜索 ( title / url )" 
      aria-label="搜索书签"
      :class="{ 'has-results': searchStore.searchResults.length > 0 }"
    />
    
    <div 
      v-if="deviceStore.isDesktop" 
      class="shortcut-hint" 
      aria-label="键盘快捷键"
    >
      <span>Ctrl</span><span>K</span>
    </div>
    
    <!-- 使用Vue 3的Transition组件实现动画 -->
    <Transition name="search-results">
      <div v-if="searchStore.searchQuery && searchStore.searchResults.length > 0" class="search-preview">
        找到 {{ searchStore.searchResults.length }} 个结果
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useSearchStore } from '@/stores/search'
import { useDeviceStore } from '@/stores/device'

const searchInput = ref<HTMLInputElement>()
const searchStore = useSearchStore()
const deviceStore = useDeviceStore()

// 使用VueUse的useMagicKeys处理键盘快捷键
const { ctrl_k, meta_k, escape } = useMagicKeys()

// 使用whenever替代手动事件监听
whenever(ctrl_k, () => {
  searchInput.value?.focus()
})

whenever(meta_k, () => {
  searchInput.value?.focus()
})

whenever(escape, () => {
  if (searchStore.searchQuery) {
    searchStore.clearQuery()
    searchInput.value?.blur()
  }
})
</script>

<style lang="scss" scoped>
.search-container {
  position: fixed;
  top: 20px;
  z-index: 999;
  display: flex;
  align-items: center;
  
  @include desktop {
    left: 50%;
    transform: translateX(calc(-50% + 110px));
  }
  
  @include mobile {
    left: 50%;
    transform: translateX(-50%);
  }
}

#search-input {
  padding: 6px;
  font-size: 1rem;
  border: 2px solid #a4d1c4;
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: 'DingTalk JinBuTi', sans-serif;
  transition: all var(--duration-base) var(--ease-default);
  
  @include desktop {
    width: 200px;
  }
  
  @include mobile {
    width: 200px;
    max-width: calc(100vw - 120px);
  }
  
  &:focus {
    outline: none;
    border-color: var(--link-color);
    box-shadow: var(--shadow-lg);
  }
}

.shortcut-hint {
  margin-left: 10px;
  display: flex;
  gap: 2px;
  
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

#### 3.4.3 侧边栏切换按钮

```vue
<!-- src/components/ui/SidebarToggle.vue -->
<template>
  <button 
    class="sidebar-toggle"
    :class="{ expanded: sidebarStore.isExpanded }"
    aria-label="切换侧边栏"
    @click="sidebarStore.toggle"
  >
    <img 
      :src="sidebarStore.isExpanded ? '/assets/images/hide_sidepanel.svg' : '/assets/images/show_sidepanel.svg'"
      :alt="sidebarStore.isExpanded ? '隐藏侧边栏' : '显示侧边栏'"
    />
  </button>
</template>

<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'

const sidebarStore = useSidebarStore()
</script>

<style lang="scss" scoped>
.sidebar-toggle {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 1000;
  background: var(--button-hover);
  border: 2px solid #a4d1c4;
  border-left: none;
  border-radius: 0 15px 15px 0;
  padding: 8px 12px;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-default);
  box-shadow: var(--button-shadow);
  
  &.expanded {
    left: 230px;
    box-shadow: var(--button-shadow-expanded);
  }
  
  &:hover {
    background: var(--button-bg);
    transform: translateY(-50%) scale(1.05);
  }
  
  img {
    width: 20px;
    height: 20px;
    display: block;
  }
  
  @include mobile {
    &.expanded {
      left: 0;
    }
  }
}
</style>
```

### 3.5 第五阶段：布局组件开发

#### 3.5.1 侧边栏组件

```vue
<!-- src/components/layout/Sidebar.vue -->
<template>
  <aside 
    class="sidebar"
    :class="{ 
      expanded: sidebarStore.isExpanded,
      'mobile-device': deviceStore.isMobile 
    }"
  >
    <div class="sidebar-content">
      <nav class="folder-nav" role="navigation" aria-label="书签文件夹导航">
        <FolderItem 
          v-for="folder in bookmarksStore.bookmarkData.folders"
          :key="folder.title"
          :folder="folder"
          :level="0"
        />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useDeviceStore } from '@/stores/device'
import { useBookmarksStore } from '@/stores/bookmarks'
import FolderItem from '@/components/content/FolderItem.vue'

const sidebarStore = useSidebarStore()
const deviceStore = useDeviceStore()
const bookmarksStore = useBookmarksStore()

onMounted(() => {
  sidebarStore.init()
})
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 100vh;
  background: var(--sidebar-bg);
  box-shadow: var(--shadow-md);
  transition: width var(--duration-medium) var(--ease-in-out-cubic);
  overflow: hidden;
  z-index: 998;
  
  &.expanded {
    width: 230px;
  }
  
  &.mobile-device.expanded {
    width: 100vw;
  }
}

.sidebar-content {
  width: 230px;
  height: 100%;
  padding: 20px 20px 40px;
  overflow-y: auto;
  overflow-x: hidden;
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}

.folder-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
```

#### 3.5.2 主内容区组件

```vue
<!-- src/components/layout/MainContent.vue -->
<template>
  <main 
    class="main-content"
    :class="{ 
      'sidebar-expanded': sidebarStore.isExpanded,
      'mobile-device': deviceStore.isMobile 
    }"
  >
    <div class="content-wrapper">
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import { useDeviceStore } from '@/stores/device'

const sidebarStore = useSidebarStore()
const deviceStore = useDeviceStore()
</script>

<style lang="scss" scoped>
.main-content {
  min-height: 100vh;
  padding: 80px 20px 20px;
  transition: margin-left var(--duration-medium) var(--ease-in-out-cubic);
  position: relative;
  z-index: 2;
  
  @include desktop {
    margin-left: 0;
    
    &.sidebar-expanded {
      margin-left: 230px;
    }
  }
  
  @include mobile {
    margin-left: 0;
    padding: 80px 10px 20px;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

### 3.6 第六阶段：内容组件开发

#### 3.6.1 文件夹项组件

```vue
<!-- src/components/content/FolderItem.vue -->
<template>
  <div class="folder-item" :style="{ paddingLeft: `${level * 15}px` }">
    <button 
      class="folder-button"
      @click="handleFolderClick"
    >
      <span class="folder-icon">📁</span>
      <span class="folder-name">{{ folder.title }}</span>
    </button>
    
    <div 
      v-if="hasChildren" 
      class="folder-children"
      :class="{ expanded: isExpanded }"
    >
      <template v-for="child in folder.children" :key="child.title">
        <FolderItem 
          v-if="child.type === 'folder'"
          :folder="child"
          :level="level + 1"
        />
        <BookmarkItem 
          v-else
          :bookmark="child"
          :level="level + 1"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FolderItem as FolderType } from '@/types'
import BookmarkItem from './BookmarkItem.vue'

interface Props {
  folder: FolderType
  level: number
}

const props = defineProps<Props>()
const router = useRouter()
const isExpanded = ref(false)

const hasChildren = computed(() => 
  props.folder.children && props.folder.children.length > 0
)

const handleFolderClick = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
  
  // 导航到文件夹页面
  router.push(`/folder/${encodeURIComponent(props.folder.title)}`)
}
</script>

<style lang="scss" scoped>
.folder-item {
  margin-bottom: 4px;
}

.folder-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--duration-short) var(--ease-default);
  text-align: left;
  
  &:hover {
    background: var(--hover-bg);
    transform: translateX(2px);
  }
}

.folder-icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.folder-name {
  font-size: 1.15rem;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-children {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--duration-medium) var(--ease-in-out-cubic);
  
  &.expanded {
    max-height: 1000px;
  }
}
</style>
```

#### 3.6.2 书签项组件

```vue
<!-- src/components/content/BookmarkItem.vue -->
<template>
  <div class="bookmark-item" :style="{ paddingLeft: `${level * 15}px` }">
    <a 
      :href="bookmark.url"
      class="bookmark-link"
      target="_blank"
      rel="noopener noreferrer"
      :title="bookmark.title"
    >
      <img 
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="`${bookmark.title} 图标`"
        class="bookmark-icon"
        @error="handleIconError"
      />
      <span v-else class="bookmark-icon-placeholder">🔗</span>
      <span class="bookmark-title">{{ bookmark.title }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BookmarkItem as BookmarkType } from '@/types'

interface Props {
  bookmark: BookmarkType
  level: number
}

const props = defineProps<Props>()
const iconError = ref(false)

const handleIconError = () => {
  iconError.value = true
}
</script>

<style lang="scss" scoped>
.bookmark-item {
  margin-bottom: 2px;
}

.bookmark-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 6px;
  transition: all var(--duration-short) var(--ease-default);
  
  &:hover {
    background: var(--hover-bg);
    color: var(--link-color);
    transform: translateX(2px);
  }
}

.bookmark-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 2px;
}

.bookmark-icon-placeholder {
  font-size: 16px;
  flex-shrink: 0;
}

.bookmark-title {
  font-size: 1rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

### 3.7 第七阶段：页面视图开发（使用Vue 3内置功能）

#### 3.7.1 首页视图

```vue
<!-- src/views/HomeView.vue -->
<template>
  <div class="home-view">
    <SearchBox />
    
    <!-- 使用Vue 3的Teleport组件管理固定定位元素 -->
    <Teleport to="body">
      <div class="fixed-controls">
        <ThemeToggle />
        <SidebarToggle />
      </div>
    </Teleport>
    
    <Sidebar />
    
    <MainContent>
      <!-- 使用Vue 3的Transition组件实现页面切换动画 -->
      <Transition name="page-switch" mode="out-in">
        <div v-if="searchStore.searchQuery" key="search" class="search-results">
          <SearchResults />
        </div>
        
        <div v-else key="home" class="home-content">
          <HomePage />
        </div>
      </Transition>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useDeviceStore } from '@/stores/device'
import { useBookmarksStore } from '@/stores/bookmarks'
import { useSearchStore } from '@/stores/search'
import SearchBox from '@/components/ui/SearchBox.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import SidebarToggle from '@/components/ui/SidebarToggle.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import MainContent from '@/components/layout/MainContent.vue'
import HomePage from '@/components/content/HomePage.vue'
import SearchResults from '@/components/content/SearchResults.vue'

const themeStore = useThemeStore()
const deviceStore = useDeviceStore()
const bookmarksStore = useBookmarksStore()
const searchStore = useSearchStore()

onMounted(async () => {
  // 初始化各个store
  themeStore.init()
  deviceStore.init()
  
  // 加载书签数据
  try {
    await bookmarksStore.loadBookmarksData()
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
})
</script>

<style lang="scss" scoped>
.home-view {
  position: relative;
  min-height: 100vh;
}

.fixed-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

// Vue 3 Transition动画样式
.page-switch-enter-active,
.page-switch-leave-active {
  transition: all var(--duration-medium) var(--ease-default);
}

.page-switch-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-switch-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.search-results-enter-active,
.search-results-leave-active {
  transition: all var(--duration-base) var(--ease-default);
}

.search-results-enter-from,
.search-results-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 3.8 第八阶段：应用入口配置

#### 3.8.1 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/folder/:id',
      name: 'folder',
      component: () => import('@/views/FolderView.vue')
    }
  ]
})

export default router
```

#### 3.8.2 应用入口

```typescript
// src/main.ts
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

#### 3.8.3 根组件

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// 全局样式已在 main.ts 中导入
</script>

<style lang="scss">
// 全局样式重置和基础样式
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

## 4. Vue 3框架特性深度应用

### 4.1 响应式系统最佳实践

#### 4.1.1 使用computed进行派生状态

```typescript
// 在stores中使用computed创建派生状态
const filteredBookmarks = computed(() => {
  if (!searchQuery.value) return []
  return bookmarkData.value.allBookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
```

#### 4.1.2 使用watchEffect进行副作用

```typescript
// 自动响应主题变化
watchEffect(() => {
  if (currentTheme.value === 'dark') {
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
  }
})
```

### 4.2 组合式API模式

#### 4.2.1 创建可复用的组合式函数

```typescript
// src/composables/useKeyboardShortcuts.ts
import { onMounted, onUnmounted } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'

export function useKeyboardShortcuts() {
  const { ctrl_k, meta_k, escape } = useMagicKeys()
  
  const focusSearch = () => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement
    searchInput?.focus()
  }
  
  const clearSearch = () => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ''
      searchInput.blur()
    }
  }
  
  whenever(ctrl_k, focusSearch)
  whenever(meta_k, focusSearch)
  whenever(escape, clearSearch)
  
  return {
    focusSearch,
    clearSearch
  }
}
```

#### 4.2.2 使用provide/inject进行依赖注入

```typescript
// 在App.vue中提供全局配置
import { provide } from 'vue'

const appConfig = {
  breakpoint: 1024,
  animationDuration: {
    short: 150,
    medium: 300,
    long: 500
  }
}

provide('appConfig', appConfig)

// 在子组件中注入
import { inject } from 'vue'

const appConfig = inject('appConfig')
```

### 4.3 Vue 3内置组件应用

#### 4.3.1 使用Suspense处理异步组件

```vue
<!-- 在需要异步加载的地方使用Suspense -->
<template>
  <Suspense>
    <template #default>
      <AsyncBookmarkList />
    </template>
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>
```

#### 4.3.2 使用KeepAlive缓存组件状态

```vue
<!-- 缓存搜索结果组件状态 -->
<template>
  <KeepAlive>
    <SearchResults v-if="searchStore.searchQuery" />
  </KeepAlive>
</template>
```

### 4.4 TypeScript与Vue 3集成

#### 4.4.1 组件Props类型定义

```typescript
// 使用interface定义Props类型
interface BookmarkItemProps {
  bookmark: BookmarkItem
  level: number
  isActive?: boolean
}

// 在组件中使用
const props = withDefaults(defineProps<BookmarkItemProps>(), {
  isActive: false
})
```

#### 4.4.2 组件Emits类型定义

```typescript
// 定义组件事件类型
interface BookmarkItemEmits {
  click: [bookmark: BookmarkItem]
  hover: [bookmark: BookmarkItem, isHovering: boolean]
}

const emit = defineEmits<BookmarkItemEmits>()
```

## 5. 开发流程与最佳实践

### 5.1 开发命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 5.2 Vue 3开发最佳实践

#### 5.2.1 组件设计原则

- **单一职责**: 每个组件只负责一个功能
- **Props向下，Events向上**: 遵循Vue的数据流原则
- **使用组合式API**: 提高逻辑复用性和类型推导
- **响应式优先**: 充分利用Vue的响应式系统

#### 5.2.2 状态管理原则

- **Store分离**: 按功能域分离不同的store
- **计算属性**: 使用computed创建派生状态
- **响应式**: 所有状态都应该是响应式的
- **类型安全**: 为所有store提供完整的TypeScript类型

#### 5.2.3 性能优化策略

- **按需加载**: 使用动态import进行代码分割
- **组件缓存**: 合理使用KeepAlive缓存组件
- **响应式优化**: 避免不必要的响应式包装
- **虚拟滚动**: 对大列表使用虚拟滚动技术

### 5.3 开发顺序建议

1. **基础配置** (1-2天)
   - 项目初始化和Vite配置
   - CSS变量系统和SCSS配置
   - TypeScript类型定义

2. **状态管理** (2-3天)
   - 创建所有Pinia stores
   - 实现响应式状态逻辑
   - 添加computed和watch

3. **UI组件** (3-4天)
   - 主题切换组件（使用Vue响应式）
   - 搜索框组件（使用VueUse）
   - 侧边栏切换按钮

4. **布局组件** (2-3天)
   - 侧边栏组件（使用Vue Transition）
   - 主内容区组件

5. **内容组件** (3-4天)
   - 文件夹项组件（使用Vue Router）
   - 书签项组件
   - 首页内容组件
   - 搜索结果组件

6. **页面视图** (2-3天)
   - 首页视图（使用Teleport和Transition）
   - 文件夹视图

7. **功能完善** (2-3天)
   - 搜索功能（使用computed）
   - 动画效果（使用Vue Transition）
   - 响应式适配（使用VueUse）

8. **测试优化** (1-2天)
   - 功能测试
   - 性能优化
   - 兼容性测试

## 6. Vue 3框架优势总结

### 6.1 响应式系统优势

- **自动依赖追踪**: 无需手动管理依赖关系
- **精确更新**: 只更新真正变化的部分
- **类型推导**: 完美的TypeScript集成
- **性能优化**: 编译时优化和运行时优化

### 6.2 组合式API优势

- **逻辑复用**: 通过composables实现逻辑复用
- **类型推导**: 更好的TypeScript支持
- **代码组织**: 按功能而非选项组织代码
- **性能优化**: 更精确的依赖追踪

### 6.3 内置功能优势

- **Transition**: 内置动画系统
- **Teleport**: 灵活的DOM传送
- **Suspense**: 异步组件处理
- **KeepAlive**: 组件状态缓存

## 7. 注意事项

### 7.1 设计一致性

- 严格按照 `docs/base.md` 中的设计规范实现
- 保持所有CSS变量和动画效果
- 确保响应式断点系统一致

### 7.2 Vue 3框架优先

- 优先使用Vue 3内置功能而非第三方库
- 充分利用响应式系统避免手动DOM操作
- 使用组合式API提高代码复用性
- 利用TypeScript提供完整的类型安全

### 7.3 性能优化

- 使用Vue 3的响应式系统优化渲染性能
- 利用Vite的代码分割和懒加载
- 优化图片和字体资源加载
- 合理使用Vue 3的内置优化功能

### 7.4 用户体验

- 保持原有的交互逻辑和动画效果
- 确保键盘快捷键功能正常（使用VueUse）
- 维护良好的无障碍访问性
- 使用Vue 3的Transition提供流畅的动画体验

这个开发指南完全拥抱Vue 3的设计理念，充分利用框架提供的响应式系统、组合式API、内置组件和TypeScript集成，确保新版本能够完美保持原有的设计风格和功能特性，同时获得现代化框架的所有优势。kmarksStore = useBookmarksStore()
const searchStore = useSearchStore()

onMounted(async () => {
  // 初始化各个store
  themeStore.init()
  deviceStore.init()
  
  // 加载书签数据
  try {
    await bookmarksStore.loadBookmarksData()
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
})
</script>

<style lang="scss" scoped>
.home-view {
  position: relative;
  min-height: 100vh;
}

.fixed-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

// Vue 3 Transition动画样式
.page-switch-enter-active,
.page-switch-leave-active {
  transition: all var(--duration-medium) var(--ease-default);
}

.page-switch-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-switch-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.search-results-enter-active,
.search-results-leave-active {
  transition: all var(--duration-base) var(--ease-default);
}

.search-results-enter-from,
.search-results-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 3.8 第八阶段：应用入口配置

#### 3.8.1 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/folder/:id',
      name: 'folder',
      component: () => import('@/views/FolderView.vue')
    }
  ]
})

export default router
```

#### 3.8.2 应用入口

```typescript
// src/main.ts
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

#### 3.8.3 根组件

```vue
<!-- src/App.vue -->
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// 全局样式已在 main.ts 中导入
</script>

<style lang="scss">
// 全局样式重置和基础样式
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

## 4. 开发流程

### 4.1 开发命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 4.2 开发顺序建议

1. **基础配置** (1-2天)
   - 项目初始化和配置
   - CSS变量系统迁移
   - TypeScript类型定义

2. **状态管理** (2-3天)
   - 创建所有Pinia stores
   - 实现响应式状态逻辑

3. **UI组件** (3-4天)
   - 主题切换组件
   - 搜索框组件
   - 侧边栏切换按钮

4. **布局组件** (2-3天)
   - 侧边栏组件
   - 主内容区组件

5. **内容组件** (3-4天)
   - 文件夹项组件
   - 书签项组件
   - 首页内容组件
   - 搜索结果组件

6. **页面视图** (2-3天)
   - 首页视图
   - 文件夹视图

7. **功能完善** (2-3天)
   - 搜索功能
   - 动画效果
   - 响应式适配

8. **测试优化** (1-2天)
   - 功能测试
   - 性能优化
   - 兼容性测试

## 5. 注意事项

### 5.1 设计一致性

- 严格按照 `docs/base.md` 中的设计规范实现
- 保持所有CSS变量和动画效果
- 确保响应式断点系统一致

### 5.2 性能优化

- 使用Vue 3的响应式系统优化渲染性能
- 利用Vite的代码分割和懒加载
- 优化图片和字体资源加载

### 5.3 类型安全

- 为所有组件和函数提供完整的TypeScript类型
- 使用严格的TypeScript配置
- 确保编译时类型检查通过

### 5.4 用户体验

- 保持原有的交互逻辑和动画效果
- 确保键盘快捷键功能正常
- 维护良好的无障碍访问性

这个开发指南提供了完整的重新开发路径，确保新版本能够完美保持原有的设计风格和功能特性，同时获得现代化框架的所有优势。