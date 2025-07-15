# 项目迁移指南：SvelteKit + TypeScript + SCSS

## 1. 迁移概述
本文档详细说明将当前书签导航项目迁移到SvelteKit + TypeScript + SCSS技术栈的完整步骤。

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
git checkout -b migration-sveltekit
```

2. 分析当前项目结构
```bash
# 统计当前项目文件
find . -name "*.js" -o -name "*.css" -o -name "*.html" | wc -l
# 检查依赖的外部库
ls assets/js/
```

## 3. 项目初始化
### 3.1 创建新的SvelteKit项目
```bash
# 在项目根目录外创建新项目
cd ..
npm create svelte@latest chuwu-bookmarks-sveltekit
cd chuwu-bookmarks-sveltekit
```

在创建过程中，选择以下选项：
- Which Svelte app template? → **Skeleton project**
- Add type checking with TypeScript? → **Yes, using TypeScript syntax**
- Select additional options: → **Add ESLint for code linting, Add Prettier for code formatting, Add Vitest for unit testing**

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

### 4.2 目标SvelteKit文件结构
```
chuwu-bookmarks-sveltekit/
├── src/
│   ├── lib/
│   │   ├── components/        # Svelte组件
│   │   │   ├── Sidebar.svelte
│   │   │   ├── MainContent.svelte
│   │   │   ├── SearchBox.svelte
│   │   │   ├── ThemeToggle.svelte
│   │   │   ├── Breadcrumbs.svelte
│   │   │   ├── BookmarkItem.svelte
│   │   │   ├── FolderItem.svelte
│   │   │   └── HomePage.svelte
│   │   ├── stores/            # Svelte stores
│   │   │   ├── bookmarks.ts
│   │   │   ├── theme.ts
│   │   │   ├── search.ts
│   │   │   └── device.ts
│   │   ├── styles/            # SCSS样式文件
│   │   │   ├── _variables.scss
│   │   │   ├── _mixins.scss
│   │   │   ├── _breakpoints.scss
│   │   │   ├── _animations.scss
│   │   │   ├── _components.scss
│   │   │   ├── _layout.scss
│   │   │   └── global.scss
│   │   ├── utils/             # 工具函数
│   │   │   ├── device.ts
│   │   │   ├── animation.ts
│   │   │   ├── search.ts
│   │   │   └── index.ts
│   │   ├── workers/           # Web Workers
│   │   │   ├── data-worker.ts
│   │   │   └── search-worker.ts
│   │   └── types/             # TypeScript类型定义
│   │       ├── bookmark.ts
│   │       └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte     # 全局布局
│   │   ├── +layout.ts         # 布局数据加载
│   │   ├── +page.svelte       # 主页
│   │   ├── +page.ts           # 主页数据加载
│   │   └── folder/
│   │       └── [id]/
│   │           ├── +page.svelte
│   │           └── +page.ts
│   ├── app.d.ts               # 全局类型声明
│   └── app.html               # HTML模板
├── static/                    # 静态资源
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   ├── bookmarks.json
│   └── favicon.png
├── svelte.config.js           # SvelteKit配置
├── vite.config.ts             # Vite配置
├── tsconfig.json              # TypeScript配置
├── package.json
└── README.md
```

## 5. 具体迁移步骤

### 5.1 配置文件设置
首先配置SvelteKit项目的基础设置：

#### 5.1.1 更新 `svelte.config.js`
```javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;
```

#### 5.1.2 更新 `vite.config.ts`
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import '$lib/styles/_variables.scss';`
			}
		}
	},
	optimizeDeps: {
		include: ['gsap']
	}
});
```

### 5.2 HTML结构迁移

#### 5.2.1 创建 `src/app.html`
```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" dir="ltr" class="no-js" itemscope itemtype="http://schema.org/WebPage">
<head>
	<meta charset="utf-8" />
	<link rel="icon" type="image/png" href="%sveltekit.assets%/assets/icons/bocchi.png" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'self' ws: wss:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:" />
	
	<!-- 预加载关键资源 -->
	<link rel="preload" href="%sveltekit.assets%/assets/images/show_sidepanel.svg" as="image">
	<link rel="preload" href="%sveltekit.assets%/assets/images/hide_sidepanel.svg" as="image">
	<link rel="preload" href="%sveltekit.assets%/assets/images/moecat.gif" as="image">
	<link rel="preload" href="%sveltekit.assets%/assets/fonts/LXGWWenKai-Medium.woff2" as="font" type="font/woff2" crossorigin>
	<link rel="preload" href="%sveltekit.assets%/assets/fonts/DingTalk-JinBuTi.woff2" as="font" type="font/woff2" crossorigin>
	
	%sveltekit.head%
</head>
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
</html>
```

#### 5.2.2 创建全局布局 `src/routes/+layout.svelte`
```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme';
	import { deviceStore } from '$lib/stores/device';
	import '$lib/styles/global.scss';

	onMount(() => {
		// 初始化主题
		themeStore.init();
		// 初始化设备检测
		deviceStore.init();
	});
</script>

<main>
	<slot />
</main>
```

### 5.3 CSS/SCSS迁移

#### 5.3.1 创建SCSS变量文件 `src/lib/styles/_variables.scss`
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

#### 5.3.2 创建断点系统 `src/lib/styles/_breakpoints.scss`
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

#### 5.3.3 创建全局样式 `src/lib/styles/global.scss`
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

#### 5.4.1 创建书签类型 `src/lib/types/bookmark.ts`
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

#### 5.4.2 创建全局类型 `src/lib/types/index.ts`
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

### 5.5 Svelte Stores 创建

#### 5.5.1 主题管理 Store `src/lib/stores/theme.ts`
```typescript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme } from '$lib/types';

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>('light');

  return {
    subscribe,
    init: () => {
      if (!browser) return;
      
      const savedTheme = localStorage.getItem('theme') as Theme || 'light';
      set(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    },
    toggle: () => {
      update(currentTheme => {
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (browser) {
          localStorage.setItem('theme', newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
        
        return newTheme;
      });
    },
    set: (theme: Theme) => {
      set(theme);
      if (browser) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  };
}

export const themeStore = createThemeStore();
```

#### 5.5.2 设备检测 Store `src/lib/stores/device.ts`
```typescript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { DeviceType } from '$lib/types';

const BREAKPOINT = 1024;

function createDeviceStore() {
  const { subscribe, set } = writable<DeviceType>('desktop');

  const getDeviceType = (): DeviceType => {
    if (!browser) return 'desktop';
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 手机设备（包括横屏）优先使用移动端样式
    if (isTouchDevice && (width < BREAKPOINT || height < 600)) {
      return 'mobile';
    }
    
    return width < BREAKPOINT ? 'mobile' : 'desktop';
  };

  const updateDeviceType = () => {
    const deviceType = getDeviceType();
    set(deviceType);
    
    if (browser) {
      document.body.classList.toggle('mobile-device', deviceType === 'mobile');
      document.body.classList.toggle('desktop-device', deviceType === 'desktop');
    }
  };

  return {
    subscribe,
    init: () => {
      if (!browser) return;
      
      updateDeviceType();
      window.addEventListener('resize', updateDeviceType);
      
      return () => {
        window.removeEventListener('resize', updateDeviceType);
      };
    },
    getDeviceType,
    isMobile: () => getDeviceType() === 'mobile',
    isDesktop: () => getDeviceType() === 'desktop'
  };
}

export const deviceStore = createDeviceStore();
```

#### 5.5.3 书签数据 Store `src/lib/stores/bookmarks.ts`
```typescript
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { BookmarkData, FolderItem, BookmarkItem } from '$lib/types';

function createBookmarksStore() {
  const { subscribe, set, update } = writable<BookmarkData>({
    folders: [],
    allBookmarks: []
  });

  const loadBookmarksData = async (): Promise<BookmarkData> => {
    try {
      // 尝试从缓存获取数据
      if (browser) {
        const cachedData = localStorage.getItem('bookmarksData');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          set(parsed);
        }
      }

      // 加载新数据
      const response = await fetch('/bookmarks.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      const processedData = processBookmarkData(rawData);
      
      // 更新缓存和store
      if (browser) {
        localStorage.setItem('bookmarksData', JSON.stringify(processedData));
      }
      set(processedData);
      
      return processedData;
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      throw error;
    }
  };

  const processBookmarkData = (rawData: any[]): BookmarkData => {
    const allBookmarks: BookmarkItem[] = [];
    
    const processNode = (node: any): FolderItem | BookmarkItem => {
      if (node.type === 'folder') {
        return {
          type: 'folder',
          addDate: node.addDate,
          title: node.title,
          children: node.children?.map(processNode) || []
        };
      } else {
        const bookmark: BookmarkItem = {
          type: 'link',
          addDate: node.addDate,
          title: node.title,
          url: node.url,
          icon: node.icon
        };
        allBookmarks.push(bookmark);
        return bookmark;
      }
    };

    const folders = rawData.map(processNode).filter(node => node.type === 'folder') as FolderItem[];
    
    return {
      folders,
      allBookmarks
    };
  };

  return {
    subscribe,
    load: loadBookmarksData,
    reload: async () => {
      if (browser) {
        localStorage.removeItem('bookmarksData');
      }
      return loadBookmarksData();
    }
  };
}

export const bookmarksStore = createBookmarksStore();

// 派生store用于搜索
export const searchableBookmarks = derived(
  bookmarksStore,
  ($bookmarks) => $bookmarks.allBookmarks
);
```

#### 5.5.4 搜索功能 Store `src/lib/stores/search.ts`
```typescript
import { writable, derived } from 'svelte/store';
import { searchableBookmarks } from './bookmarks';
import type { BookmarkItem, SearchResult } from '$lib/types';

function createSearchStore() {
  const { subscribe, set } = writable<string>('');

  const performSearch = (query: string, bookmarks: BookmarkItem[]): SearchResult[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];
    
    bookmarks.forEach(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(searchTerm);
      const urlMatch = bookmark.url.toLowerCase().includes(searchTerm);
      
      if (titleMatch || urlMatch) {
        let score = 0;
        if (titleMatch) score += 2;
        if (urlMatch) score += 1;
        
        results.push({
          item: bookmark,
          score,
          matches: {
            title: titleMatch,
            url: urlMatch
          }
        });
      }
    });
    
    return results.sort((a, b) => b.score - a.score);
  };

  return {
    subscribe,
    set,
    clear: () => set('')
  };
}

export const searchStore = createSearchStore();

// 派生store用于搜索结果
export const searchResults = derived(
  [searchStore, searchableBookmarks],
  ([$searchQuery, $bookmarks]) => {
    if (!$searchQuery.trim()) return [];
    
    const results: SearchResult[] = [];
    const searchTerm = $searchQuery.toLowerCase();
    
    $bookmarks.forEach(bookmark => {
      const titleMatch = bookmark.title.toLowerCase().includes(searchTerm);
      const urlMatch = bookmark.url.toLowerCase().includes(searchTerm);
      
      if (titleMatch || urlMatch) {
        let score = 0;
        if (titleMatch) score += 2;
        if (urlMatch) score += 1;
        
        results.push({
          item: bookmark,
          score,
          matches: {
            title: titleMatch,
            url: urlMatch
          }
        });
      }
    });
    
    return results.sort((a, b) => b.score - a.score);
  }
);
```

### 5.6 核心组件创建

#### 5.6.1 主题切换组件 `src/lib/components/ThemeToggle.svelte`
```svelte
<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
  
  const handleToggle = () => {
    themeStore.toggle();
  };
</script>

<button 
  id="theme-toggle" 
  class="theme-toggle" 
  aria-label="切换主题"
  on:click={handleToggle}
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

<style lang="scss">
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

#### 5.6.2 搜索框组件 `src/lib/components/SearchBox.svelte`
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { searchStore } from '$lib/stores/search';
  import { deviceStore } from '$lib/stores/device';
  
  let searchInput: HTMLInputElement;
  let searchQuery = '';
  
  // 响应式订阅搜索查询
  $: searchStore.set(searchQuery);
  
  const handleKeydown = (event: KeyboardEvent) => {
    // Ctrl+K 快捷键聚焦搜索框
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      searchInput?.focus();
    }
    
    // ESC 清空搜索
    if (event.key === 'Escape') {
      searchQuery = '';
      searchInput?.blur();
    }
  };
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<nav class="search-container" role="search">
  <input 
    bind:this={searchInput}
    bind:value={searchQuery}
    type="text" 
    id="search-input"
    name="query" 
    placeholder="🔍 搜索 ( title / url )" 
    aria-label="搜索书签"
    aria-describedby="search-hint"
  />
  
  {#if $deviceStore === 'desktop'}
    <div id="search-hint" class="shortcut-hint" aria-label="键盘快捷键">
      <span aria-hidden="true">Ctrl</span><span aria-hidden="true">K</span>
    </div>
  {/if}
  
  <slot name="theme-toggle" />
</nav>

<style lang="scss">
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