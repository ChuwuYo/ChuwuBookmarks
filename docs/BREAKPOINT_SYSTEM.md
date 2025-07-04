# 统一断点系统重构


### 1. 统一断点定义
`assets/css/breakpoints.css` 文件，定义了两种设备类型：

```css
:root {
    --breakpoint-mobile: 1024px;   /* 移动端 */
    --breakpoint-desktop: 1024px;  /* 桌面端 */
}
```

### 2. JavaScript断点系统
`script.js` 统一的断点管理

```javascript
const BREAKPOINTS = {
    MOBILE: 1024,
    DESKTOP: 1024
};

const getDeviceType = () => {
    const width = window.innerWidth;
    return width < BREAKPOINTS.MOBILE ? 'mobile' : 'desktop';
};
```

### 3. 设备行为定义

| 设备类型 | 屏幕宽度 | 侧栏默认状态 | 布局特点 |
|---------|----------|-------------|----------|
| 移动端 | < 1024px | 关闭 | 侧栏不影响右侧元素位置 |
| 桌面端 | ≥ 1024px | 打开 | 侧栏影响右侧元素位置 |

**最佳实践：**
- 移动端：< 1024px
- 桌面端：≥ 1024px


## 使用方法

### 在JavaScript中：
```javascript
const deviceType = getDeviceType(); // 'mobile', 'desktop'
const isMobile = isMobileDevice();
const shouldCollapse = shouldCollapseSidebar();
```

### 在CSS中：
```css
/* 使用统一的断点值 */
@media screen and (max-width: 1023px) { /* 移动端 */ }
@media screen and (min-width: 1024px) { /* 桌面端 */ }
```