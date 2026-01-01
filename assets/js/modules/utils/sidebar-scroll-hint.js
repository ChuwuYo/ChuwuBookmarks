/**
 * 侧边栏滚动提示器模块
 * 简单检测侧边栏是否需要滚动，并显示向下滚动提示
 */

let sidebar = null;
let hintElement = null;

/**
 * 检查侧边栏是否可滚动并更新提示显示
 */
function checkScrollable() {
    if (!sidebar || !hintElement) return;

    // 侧边栏折叠时隐藏提示
    if (sidebar.classList.contains('collapsed')) {
        hintElement.classList.remove('visible');
        return;
    }

    const scrollHeight = sidebar.scrollHeight;
    const clientHeight = sidebar.clientHeight;
    const scrollTop = sidebar.scrollTop;

    // 如果内容超出容器高度且未滚动到底部，显示提示
    const needsScroll = scrollHeight > clientHeight;
    const isAtBottom = scrollTop >= scrollHeight - clientHeight - 2; // 容差改为2px

    if (needsScroll && !isAtBottom) {
        // 更新提示器位置（侧边栏右下角）
        const sidebarWidth = sidebar.offsetWidth;
        hintElement.style.left = (sidebarWidth - 40) + 'px';
        hintElement.classList.add('visible');
    } else {
        hintElement.classList.remove('visible');
    }
}

/**
 * 初始化侧边栏滚动提示器
 */
function initSidebarScrollHint() {
    sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.warn('侧边栏元素未找到');
        return;
    }

    // 创建提示器元素
    hintElement = document.createElement('div');
    hintElement.className = 'sidebar-scroll-hint';
    hintElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hintElement);
    
    // 监听滚动事件
    sidebar.addEventListener('scroll', checkScrollable, { passive: true });
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkScrollable);
    
    // 监听侧边栏折叠状态变化
    const observer = new MutationObserver(checkScrollable);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

    // 初始检查
    setTimeout(checkScrollable, 100);
    
    console.log('侧边栏滚动提示器已初始化');
}

export { initSidebarScrollHint };
