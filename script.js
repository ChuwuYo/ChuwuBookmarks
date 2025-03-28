/**
 * 主题、设备适配、渲染和搜索功能模块
 */

/** 主题相关 */
const initTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

/** 设备和视图适配 */
const isMobileDevice = () => {
    // 像素检测（原有逻辑）
    const isSmallScreen = window.innerWidth <= 1300;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    // UA检测（新增逻辑）
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);
    
    // 特殊情况处理：iPad等平板设备可能有较大屏幕但仍是移动设备
    const isTablet = /ipad|android(?!.*mobile)/i.test(ua);
    
    // 综合判断：像素检测 或 UA检测为移动设备
    return isSmallScreen || isCoarsePointer || isMobileUA || isTablet;
};

const updateSidebarState = (sidebar, isCollapsed) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    const toggleButton = document.getElementById('toggle-sidebar');
    const showPanel = toggleButton.querySelector('.show-panel');
    const hidePanel = toggleButton.querySelector('.hide-panel');
    showPanel.style.display = isCollapsed ? 'block' : 'none';
    hidePanel.style.display = isCollapsed ? 'none' : 'block';
    adjustHomeMessagePosition(isCollapsed);

    // 修复文件夹动画状态
    const folderElements = sidebar.querySelectorAll('.folder');
    
    // 添加检查确保元素存在且不为空
    if (folderElements && folderElements.length > 0) {
        if (isCollapsed) {
            // 收起时隐藏所有文件夹
            gsap.set(folderElements, { opacity: 0, visibility: 'hidden' });
        } else {
            // 展开时重置文件夹动画
            gsap.set(folderElements, { opacity: 0, visibility: 'visible' });
            folderElements.forEach((folder, index) => {
                gsap.to(folder, {
                    opacity: 1,
                    delay: index * 0.05, // 添加延迟以实现顺序动画
                    duration: 0.3,
                    ease: "power1.out"
                });
            });
        }
    }
};

const handleMobileView = () => {
    const sidebar = document.querySelector('.sidebar');
    const isMobile = isMobileDevice();
    document.body.classList.toggle('mobile-device', isMobile);
    updateSidebarState(sidebar, isMobile);
};

const adjustHomeMessagePosition = (isCollapsed) => {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        if (!isMobileDevice()) {
            homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
        } else {
            // 在移动设备上始终居中
            homeMessage.style.left = '50%';
        }
    }
};

// 在事件监听中保持调用
window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});

/** 渲染相关 */
const renderHome = () => {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="home-message">
            <div class="chinese-text">初五的书签</div>
            <div class="english-text">Chuwu's Bookmarks</div>
        </div>
    `;
    document.getElementById('breadcrumbs').innerHTML = '';
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));

    // 优化动画性能 - 减少初始动画复杂度
    const masterTimeline = gsap.timeline();
    
    // 设置初始状态 - 简化初始设置
    gsap.set('.home-message', { opacity: 0 });
    gsap.set('.chinese-text', { 
        opacity: 0,
        scale: 0.8,  // 从0.5改为0.8，减少变形量
        x: -50,      // 从-100改为-50，减少移动距离
        transformOrigin: "center center"
    });
    gsap.set('.english-text', { 
        opacity: 0,
        scale: 0.8,  // 从0.5改为0.8
        x: -50,      // 从-100改为-50
        transformOrigin: "center center"
    });
    
    // 主容器淡入 - 进一步减少延迟
    masterTimeline.to('.home-message', {
        opacity: 1,
        duration: 0.3,  // 从0.5减少到0.3
        ease: "power1.out"  // 使用更简单的缓动函数
    });
    
    // 简化中文和英文文本动画 - 移除重复的动画
    masterTimeline.to('.chinese-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.5,  // 从0.8减少到0.5
        ease: "power1.out"
    }, "-=0.2");  // 从-0.3改为-0.2
    
    masterTimeline.to('.english-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.5,  // 从0.8减少到0.5
        ease: "power1.out"
    }, "-=0.3");  // 从-0.6改为-0.3
    
    // 移除重复的动画部分
    // 为中文文本的每个字符添加特殊动画效果 - 优化动画延迟
    const chineseText = document.querySelector('.chinese-text');
    const chineseChars = chineseText.textContent.split('');
    chineseText.innerHTML = '';
    
    chineseChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        chineseText.appendChild(charSpan);
        
        // 为每个字符添加渐显动画 - 减少延迟和持续时间
        gsap.set(charSpan, {
            opacity: 0,
            x: -10  // 从-20改为-10
        });
        
        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.2,  // 从0.3减少到0.2
            delay: 0.5 + (index * 0.05),  // 从0.8减少到0.5，从0.08减少到0.05
            ease: "power1.out"
        });
        
        // 为"的"字符添加从上方掉落的动画 - 减少延迟
        if (char === '的') {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.2,     // 从1.8减少到1.2
                ease: "bounce.out"
            });
        }
    });
    
    // 为英文文本的每个字符添加特殊动画效果 - 优化动画延迟
    const englishText = document.querySelector('.english-text');
    const englishChars = englishText.textContent.split('');
    englishText.innerHTML = '';
    
    englishChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        englishText.appendChild(charSpan);
        
        // 为每个字符添加从左向右渐显动画 - 减少延迟和持续时间
        gsap.set(charSpan, {
            opacity: 0,
            x: -10  // 从-20改为-10
        });
        
        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.2,  // 从0.3减少到0.2
            delay: 0.7 + (index * 0.04),  // 从1减少到0.7，从0.06减少到0.04
            ease: "power1.out"
        });
        
        // 为"'s"添加从上方掉落的动画 - 减少延迟
        if (char === "'") {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.5,     // 从2.2减少到1.5
                ease: "bounce.out"
            });
        } else if (char === "s") {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.7,     // 从2.4减少到1.7
                ease: "bounce.out"
            });
        }
    });
}
    


const createElement = (type, item, onClick) => {
    const element = document.createElement('div');
    element.className = type;
    
    if (type === 'folder') {
        element.innerHTML = `<span class="folder-icon">📁</span><span class="folder-name">${item.title}</span>`;
    } else {
        const bookmarkIcon = document.createElement('span');
        bookmarkIcon.className = 'bookmark-icon';
        bookmarkIcon.textContent = '🔗';
        
        if (item.icon) {
            const img = document.createElement('img');
            // 实现图片懒加载 - 使用data-src存储实际URL
            img.dataset.src = item.icon;
            img.alt = '🔗';
            img.style.display = 'none';
            img.classList.add('lazy-image');
            
            // 将图片添加到DOM，但不立即加载
            bookmarkIcon.appendChild(img);
            
            // 使用IntersectionObserver实现懒加载
            if ('IntersectionObserver' in window) {
                // 延迟执行，确保元素已添加到DOM
                setTimeout(() => {
                    if (!window.lazyImageObserver) {
                        // 创建全局观察者实例
                        window.lazyImageObserver = new IntersectionObserver((entries, observer) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const lazyImage = entry.target;
                                    lazyImage.src = lazyImage.dataset.src;
                                    lazyImage.onload = function() {
                                        lazyImage.parentNode.textContent = '';
                                        lazyImage.style.display = '';
                                        lazyImage.parentNode.appendChild(lazyImage);
                                        lazyImage.classList.remove('lazy-image');
                                    };
                                    lazyImage.onerror = function() {
                                        this.remove();
                                    };
                                    observer.unobserve(lazyImage);
                                }
                            });
                        }, {
                            rootMargin: '200px', // 提前200px开始加载
                            threshold: 0.01 // 当1%的元素可见时触发
                        });
                    }
                    
                    // 观察新添加的图片
                    window.lazyImageObserver.observe(img);
                }, 0);
            } else {
                // 降级处理：如果不支持IntersectionObserver，则立即加载
                img.src = img.dataset.src;
                img.onload = function() {
                    bookmarkIcon.textContent = '';
                    this.style.display = '';
                    bookmarkIcon.appendChild(this);
                };
                img.onerror = function() {
                    this.remove();
                };
            }
        }
        
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.textContent = item.title;
        element.appendChild(bookmarkIcon);
        element.appendChild(link);
    }
    
    if (onClick) element.addEventListener('click', onClick);
    return element;
};

const renderSidebar = (data) => {
    const sidebar = document.getElementById('sidebar-folders');
    sidebar.innerHTML = '';
    const rootFolder = data.find(item => item.title === '书签栏');
    if (!rootFolder) return;
    
    // 使用DocumentFragment减少DOM操作
    const fragment = document.createDocumentFragment();
    
    rootFolder.children
        .filter(item => item.type === 'folder')
        .forEach(item => {
            item.parent = rootFolder;
            if (item.children) setParentReferences(item.children, item);
            fragment.appendChild(createElement('folder', item, (e) => {
                e.stopPropagation();
                renderMainContent(item, true);
            }));
        });
    
    // 一次性将所有元素添加到DOM
    sidebar.appendChild(fragment);
};

const setParentReferences = (items, parent) => {
    items.forEach(item => {
        if (item.type === 'folder') {
            item.parent = parent;
            if (item.children) setParentReferences(item.children, item);
        }
    });
};

const renderMainContent = (folder, fromSidebar = false) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = breadcrumbs.innerHTML = '';

    if (fromSidebar && isMobileDevice()) {
        updateSidebarState(document.querySelector('.sidebar'), true);
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 使用DocumentFragment减少DOM操作
        const breadcrumbFragment = document.createDocumentFragment();
        
        const breadcrumbPath = [];
        let current = folder;
        while (current) {
            breadcrumbPath.unshift(current);
            current = current.parent;
        }

        breadcrumbPath
            .filter(crumb => crumb.title !== '书签栏')
            .forEach((crumb, index, arr) => {
                const crumbElement = document.createElement('span');
                crumbElement.textContent = crumb.title;
                crumbElement.className = 'breadcrumb-item';
                if (crumb.parent && index < arr.length - 1) {
                    crumbElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        renderMainContent(crumb, true);
                    });
                }
                breadcrumbFragment.appendChild(crumbElement);
                if (index < arr.length - 1) {
                    breadcrumbFragment.appendChild(Object.assign(document.createElement('span'), {
                        textContent: ' > ',
                        className: 'breadcrumb-separator'
                    }));
                }
            });
            
        // 一次性将所有面包屑元素添加到DOM
        breadcrumbs.appendChild(breadcrumbFragment);
        
        // 使用DocumentFragment减少DOM操作
        const contentFragment = document.createDocumentFragment();
        
        folder.children?.forEach((item, index) => {
            const element = createElement(
                item.type === 'folder' ? 'folder' : 'bookmark',
                item,
                item.type === 'folder' ? () => renderMainContent(item) : null
            );
            
            // 设置动画延迟索引
            element.style.setProperty('--item-index', index);
            contentFragment.appendChild(element);
        });
        
        // 一次性将所有内容元素添加到DOM
        content.appendChild(contentFragment);
    });
};

/** 搜索相关 */
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

const searchBookmarks = (keyword, data) => {
    const results = [];
    keyword = keyword.toLowerCase();
    const searchItems = (items) => {
        items.forEach(item => {
            if (item.title.toLowerCase().includes(keyword) || 
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            if (item.children) searchItems(item.children);
        });
    };
    searchItems(data);
    return results;
};

const renderSearchResults = (results) => {
    const content = document.getElementById('content');
    content.innerHTML = '';
    document.getElementById('breadcrumbs').innerHTML = '';

    if (!results.length) {
        content.innerHTML = '<div class="no-results">未找到匹配的书签。</div>';
        return;
    }
    
    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 使用DocumentFragment减少DOM操作
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'results-container';
        
        let itemIndex = 0;
        ['folder', 'link'].forEach(type => {
            results.filter(item => item.type === type)
                .forEach(item => {
                    const element = createElement(
                        type === 'folder' ? 'folder' : 'bookmark',
                        item,
                        type === 'folder' ? () => renderMainContent(item) : null
                    );
                    // 设置动画延迟索引
                    element.style.setProperty('--item-index', itemIndex++);
                    container.appendChild(element);
                });
        });
        
        fragment.appendChild(container);
        // 一次性将所有元素添加到DOM
        content.appendChild(fragment);
    });
};

// 初始化Web Worker
let searchWorker;

// 检查浏览器是否支持Web Worker
const initSearchWorker = () => {
    if (window.Worker) {
        searchWorker = new Worker('assets/js/search-worker.js');
        
        // 监听来自Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message } = e.data;
            
            switch(action) {
                case 'searchResults':
                    renderSearchResults(results);
                    break;
                case 'error':
                    console.error('搜索Worker错误:', message);
                    break;
            }
        });
    }
};

const debounceSearch = debounce((event) => {
    const keyword = event.target.value.trim();
    if (!keyword) return renderHome();
    
    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
    
    // 如果支持Web Worker，则使用Worker执行搜索
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'search',
            data: {
                keyword: keyword,
                bookmarks: data
            }
        });
    } else {
        // 降级处理：如果不支持Web Worker，则在主线程中执行搜索
        renderSearchResults(searchBookmarks(keyword, data));
    }
}, 500);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和移动视图
    initTheme();
    handleMobileView();
    
    // 初始化搜索Web Worker
    initSearchWorker();
    
    try {
        // 使用requestAnimationFrame优化初始化流程
        requestAnimationFrame(async () => {
            try {
                // 添加更详细的错误处理
                const response = await fetch('bookmarks.json');
                if (!response.ok) {
                    console.error(`加载书签文件失败: ${response.status} ${response.statusText}`);
                    // 尝试使用备用路径
                    const backupResponse = await fetch('./bookmarks.json');
                    if (!backupResponse.ok) {
                        throw new Error(`无法加载书签文件，请确保 bookmarks.json 存在于正确位置`);
                    }
                    const data = await backupResponse.json();
                    localStorage.setItem('bookmarksData', JSON.stringify(data));
                    renderSidebar(data);
                    renderHome();
                } else {
                    const data = await response.json();
                    localStorage.setItem('bookmarksData', JSON.stringify(data));
                    renderSidebar(data);
                    renderHome();
                }
            } catch (error) {
                console.error('书签加载错误:', error);
                // 显示错误信息给用户
                document.getElementById('content').innerHTML = `
                    <div class="error-message" style="text-align:center; margin-top:50px; color:var(--text-color)">
                        <h2>加载书签数据失败</h2>
                        <p>请确保 bookmarks.json 文件存在且格式正确</p>
                        <p>错误详情: ${error.message}</p>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('初始化错误:', error);
    }

    // 使用事件委托减少事件监听器数量
    const sidebar = document.querySelector('.sidebar');
    document.getElementById('toggle-sidebar').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
    });

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('search-input').addEventListener('keyup', debounceSearch);
    
    // 初始化背景图片懒加载
    const lazyLoadBackgroundImage = () => {
        // 创建一个新的Image对象预加载背景GIF
        const bgImage = new Image();
        bgImage.src = 'assets/images/moecat.gif';
        bgImage.onload = () => {
            // 图片加载完成后，添加类以显示背景
            document.body.classList.add('bg-loaded');
        };
    };
    
    // 延迟加载背景图片，优先加载关键内容
    setTimeout(lazyLoadBackgroundImage, 100);
});

window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});

// 简化 FastClick 初始化，避免嵌套的事件监听器
document.addEventListener('DOMContentLoaded', function() { 
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }
});

// 标题变更功能
const originalTitle = document.title;
const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

// 鼠标离开页面时触发的事件
document.addEventListener('mouseout', function(e) {
    // 仅当鼠标离开窗口时进行处理
    if (e.relatedTarget === null) {
        document.title = newTitle;
    }
});

// 鼠标回到页面时触发的事件
document.addEventListener('mouseover', function() {
    document.title = originalTitle;
});