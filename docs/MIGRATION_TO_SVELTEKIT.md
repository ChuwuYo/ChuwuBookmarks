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
### 4.1 原有文件结构
```
ChuwuBookmarks/
├── assets/
│   ├── css/
│   ├── fonts/
│   ├── images/
│   └── js/
├── docs/
├── index.html
├── script.js
└── styles.css
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

### 5.3 JavaScript迁移
1. 将`script.js`中的逻辑拆分为Svelte组件和工具函数
2. 创建TypeScript类型定义文件
3. 将`assets/js`中的库文件迁移到`static/assets/js`

### 5.4 断点系统迁移
原断点系统需要调整为SvelteKit兼容格式：

```typescript
// src/lib/utils/breakpoints.ts
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1024
};

export function getDeviceType(width: number) {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

⚠️：应在onMount中使用window.innerWidth，避免SSR报错。
  if (width < BREAKPOINTS.MOBILE) return 'mobile';
  if (width < BREAKPOINTS.DESKTOP) return 'tablet';
  return 'desktop';
}
```

对应的SCSS变量：
```scss
// src/lib/styles/_breakpoints.scss
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
$breakpoint-desktop: 1024px;

// 媒体查询混合宏
@mixin mobile {
  @media (max-width: $breakpoint-mobile - 1px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: $breakpoint-mobile) and (max-width: $breakpoint-tablet - 1px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: $breakpoint-desktop) {
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

## 9. 迁移后优化
1. 利用SvelteKit的路由系统重构页面导航
2. 使用Svelte的响应式系统优化状态管理
3. 实现服务端渲染提升性能和SEO
4. 使用代码分割减小初始加载体积

## 10. 迁移清单
- [ ] 所有HTML内容已迁移到Svelte组件
- [ ] 所有CSS已迁移到SCSS并整合到组件
- [ ] JavaScript逻辑已使用TypeScript重构
- [ ] 断点系统已适配新架构
- [ ] 所有功能通过测试
- [ ] 性能指标达到或超过原项目
- [ ] （可选）国际化资源结构已建立