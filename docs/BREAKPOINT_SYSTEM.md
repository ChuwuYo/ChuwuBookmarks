# 统一断点系统重构


### 1. 统一断点定义
`assets/css/breakpoints.css` 文件，定义了三种设备类型：

```css
:root {
    --breakpoint-mobile: 768px;   /* 手机 */
    --breakpoint-tablet: 1024px;  /* 平板 */
    --breakpoint-desktop: 1024px; /* PC */
}
```

### 2. JavaScript断点系统
`script.js` 统一的断点管理

```javascript
const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1024
};

const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < BREAKPOINTS.MOBILE) return 'mobile';  // < 768px
    if (width < BREAKPOINTS.DESKTOP) return 'tablet';  // 768px - 1023px  
    return 'desktop';  // >= 1024
};
```

### 3. 设备行为定义

| 设备类型 | 屏幕宽度 | 侧栏默认状态 | 布局特点 |
|---------|----------|-------------|----------|
| 手机 | < 768px | 关闭 | 侧栏不影响右侧元素位置 |
| 平板 | 768px - 1023px | 打开 | 侧栏影响右侧元素位置 |
| PC | ≥ 1024px | 打开 | 侧栏影响右侧元素位置 |

**最佳实践：**
- 手机：< 768px
- 平板：768px - 1023px  
- PC：≥ 1024px


## 使用方法

### 在JavaScript中：
```javascript
const deviceType = getDeviceType(); // 'mobile', 'tablet', 'desktop'
const isMobile = isMobileDevice();
const shouldCollapse = shouldCollapseSidebar();
```

### 在CSS中：
```css
/* 使用统一的断点值 */
@media screen and (max-width: 767px) { /* 手机 */ }
@media screen and (min-width: 768px) and (max-width: 1023px) { /* 平板 */ }
@media screen and (min-width: 1024px) { /* PC */ }
```