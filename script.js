/**
 * 主题、设备适配、渲染和搜索功能模块
 */

const animationConfig = {
    duration: {
        short: 0.15,
        base: 0.2,
        medium: 0.3,
        long: 0.5,
    },
    ease: {
        inOutCubic: "cubic-bezier(0.4, 0, 0.2, 1)",
        outQuad: "power1.out",
        default: "ease",
    }
};

/** 主题相关 */
const initTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

// 焦点管理
const initFocusManagement = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"]), a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            } else if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        }
    });
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
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
                    duration: animationConfig.duration.medium, // 0.3s
                    ease: animationConfig.ease.outQuad       // "power1.out"
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
    const searchContainer = document.querySelector('.search-container');

    if (window.innerWidth < 768) {
        // 移动视图
        if (homeMessage) {
            homeMessage.style.left = '50%';
        }
        if (searchContainer) {
            searchContainer.style.left = '50%';
            // 确保在移动视图清除可能存在的偏移量
            searchContainer.style.removeProperty('--search-container-centering-offset');
        }
    } else {
        // 桌面视图
        if (homeMessage) {
            homeMessage.style.left = ''; // 由 CSS 控制
        }
        if (searchContainer) {
            searchContainer.style.left = ''; // 由 CSS 控制 left: 50%

            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                // 计算使 searchInput 在 searchContainer 内居中所需的偏移量
                // 这个计算假设任何使 searchInput 偏离 searchContainer 中心的额外宽度都在 searchInput 的右侧
                const searchInputOffsetLeft = searchInput.offsetLeft; // searchInput 相对于 searchContainer 的左偏移
                const searchInputWidth = searchInput.offsetWidth;
                const searchContainerWidth = searchContainer.offsetWidth;

                // shiftInPx > 0 表示 searchInput 的中心在 searchContainer 中心的左侧。
                // 因此，searchContainer 需要向右移动 shiftInPx 来使 searchInput 居中。
                const shiftInPx = (searchContainerWidth / 2) - (searchInputOffsetLeft + searchInputWidth / 2);
                
                searchContainer.style.setProperty('--search-container-centering-offset', `${shiftInPx}px`);
            } else {
                 // 如果找不到 searchInput，确保清除偏移量以防意外
                searchContainer.style.removeProperty('--search-container-centering-offset');
            }
        }
    }
};

// 在事件监听中保持调用
/** 渲染相关 */
const renderHome = () => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    
    if (!content || !breadcrumbs) return;
    
    // 使用DocumentFragment减少DOM操作
    const fragment = document.createDocumentFragment();
    
    // 创建主页消息容器
    const homeMessage = document.createElement('div');
    homeMessage.className = 'home-message';
    
    // 创建中文和英文文本元素
    const chineseText = document.createElement('div');
    chineseText.className = 'chinese-text';
    
    const englishText = document.createElement('div');
    englishText.className = 'english-text';
    
    // 将元素添加到fragment
    homeMessage.appendChild(chineseText);
    homeMessage.appendChild(englishText);
    fragment.appendChild(homeMessage);
    
    // 清空内容区域并添加fragment
    content.innerHTML = '';
    content.appendChild(fragment);
    breadcrumbs.innerHTML = '';
    
    // 调整位置
    adjustHomeMessagePosition(document.querySelector('.sidebar')?.classList.contains('collapsed'));

    // 优化动画性能 - 使用一个主时间线
    const masterTimeline = gsap.timeline();

    // 设置初始状态 - 简化初始设置
    gsap.set(homeMessage, { opacity: 0 });
    gsap.set(chineseText, {
        opacity: 0,
        scale: 0.8,
        x: -50,
        transformOrigin: "center center",
        textContent: '初五的书签'
    });
    gsap.set(englishText, {
        opacity: 0,
        scale: 0.8,
        x: -50,
        transformOrigin: "center center",
        textContent: "Chuwu's Bookmarks"
    });

    // 主容器淡入
    masterTimeline.to(homeMessage, {
        opacity: 1,
        duration: animationConfig.duration.medium,
        ease: animationConfig.ease.outQuad
    });

    // 简化中文和英文文本动画
    masterTimeline.to(chineseText, {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: animationConfig.duration.long,
        ease: animationConfig.ease.outQuad
    }, "-=0.2");

    masterTimeline.to(englishText, {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: animationConfig.duration.long,
        ease: animationConfig.ease.outQuad
    }, "-=0.3");

    // 批量创建字符动画元素
    requestAnimationFrame(() => {
        // 为中文文本的每个字符添加特殊动画效果
        const chineseChars = '初五的书签'.split('');
        const chineseFragment = document.createDocumentFragment();
        
        // 预先创建所有字符元素
        const chineseSpans = chineseChars.map(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.display = 'inline-block';
            charSpan.style.position = 'relative';
            return charSpan;
        });
        
        // 一次性添加所有字符元素
        chineseSpans.forEach(span => chineseFragment.appendChild(span));
        chineseText.textContent = '';
        chineseText.appendChild(chineseFragment);
        
        // 批量设置动画
        chineseSpans.forEach((charSpan, index) => {
            const char = charSpan.textContent;
            
            if (char === '的') {
                // 为"的"字符添加从上方掉落的动画
                gsap.set(charSpan, {
                    y: -50,
                    opacity: 0
                });
                
                gsap.to(charSpan, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 1.2,
                    ease: "bounce.out"
                });
            } else {
                // 为其他字符添加渐显动画
                gsap.set(charSpan, {
                    opacity: 0,
                    x: -10
                });
                
                gsap.to(charSpan, {
                    opacity: 1,
                    x: 0,
                    duration: 0.2,
                    delay: 0.5 + (index * 0.05),
                    ease: "power1.out"
                });
            }
        });

        // 为英文文本的每个字符添加特殊动画效果
        const englishChars = "Chuwu's Bookmarks".split('');
        const englishFragment = document.createDocumentFragment();
        
        // 预先创建所有字符元素
        const englishSpans = englishChars.map(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.display = 'inline-block';
            charSpan.style.position = 'relative';
            return charSpan;
        });
        
        // 一次性添加所有字符元素
        englishSpans.forEach(span => englishFragment.appendChild(span));
        englishText.textContent = '';
        englishText.appendChild(englishFragment);
        
        // 批量设置动画
        englishSpans.forEach((charSpan, index) => {
            const char = charSpan.textContent;
            
            if (char === "'" || char === "s") {
                // 为"'s"添加从上方掉落的动画
                gsap.set(charSpan, {
                    y: -50,
                    opacity: 0
                });
                
                gsap.to(charSpan, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: char === "'" ? 1.5 : 1.7,
                    ease: "bounce.out"
                });
            } else {
                // 为其他字符添加渐显动画
                gsap.set(charSpan, {
                    opacity: 0,
                    x: -10
                });
                
                gsap.to(charSpan, {
                    opacity: 1,
                    x: 0,
                    duration: 0.2,
                    delay: 0.7 + (index * 0.04),
                    ease: "power1.out"
                });
            }
        });
    });
}



const createElement = (type, item, onClick) => {
    const element = document.createElement('div');
    element.className = type;

    if (type === 'folder') {
        // 使用textContent代替innerHTML，减少HTML解析开销
        const folderIcon = document.createElement('span');
        folderIcon.className = 'folder-icon';
        folderIcon.textContent = '📁';
        
        const folderName = document.createElement('span');
        folderName.className = 'folder-name';
        folderName.textContent = item.title;
        
        element.appendChild(folderIcon);
        element.appendChild(folderName);
    } else {
        const bookmarkIcon = document.createElement('span');
        bookmarkIcon.className = 'bookmark-icon';
        bookmarkIcon.textContent = '🔗';

        if (item.icon) {
            const img = document.createElement('img');
            // 使用 lazysizes 库进行懒加载
            img.dataset.src = item.icon;
            img.alt = '🔗';
            img.classList.add('lazyload');
            
            // 使用一个事件处理函数处理多个事件
            const imgHandler = function(e) {
                if (e.type === 'load') {
                    bookmarkIcon.textContent = '';
                    bookmarkIcon.appendChild(img);
                } else if (e.type === 'error') {
                    this.remove();
                }
            };
            
            // 添加事件处理
            img.addEventListener('load', imgHandler);
            img.addEventListener('error', imgHandler);
            
            // 先将图片添加到DOM，lazysizes会自动处理加载
            bookmarkIcon.appendChild(img);
        }

        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.textContent = item.title;
        
        // 一次性添加多个子元素
        element.append(bookmarkIcon, link);
    }

    if (onClick) element.addEventListener('click', onClick);
    return element;
};

const renderSidebar = (data) => {
    const sidebar = document.getElementById('sidebar-folders');
    if (!sidebar) return;
    
    sidebar.innerHTML = '';
    const rootFolder = data.find(item => item.title === '书签栏' || item.title === 'Bookmarks Bar');
    if (!rootFolder) return;

    // 使用DocumentFragment减少DOM操作
    const fragment = document.createDocumentFragment();
    
    // 预先过滤所有文件夹，避免在循环中重复过滤
    const folders = rootFolder.children.filter(item => item.type === 'folder');
    
    // 批量设置父引用
    folders.forEach(item => {
        item.parent = rootFolder;
        if (item.children) setParentReferences(item.children, item);
    });

    // 创建所有文件夹元素
    const folderElements = folders.map(item => {
        const folderElement = createElement('folder', item, (e) => {
            e.stopPropagation();
            renderMainContent(item, true);
        });
        
        // 添加键盘可访问性
        folderElement.setAttribute('tabindex', '0');
        folderElement.setAttribute('role', 'button');
        folderElement.setAttribute('aria-label', `文件夹: ${item.title}`);
        folderElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderMainContent(item, true);
            }
        });
        
        return folderElement;
    });
    
    // 一次性将所有元素添加到fragment
    folderElements.forEach(element => fragment.appendChild(element));

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
    if (!content || !breadcrumbs) return;
    
    content.innerHTML = breadcrumbs.innerHTML = '';

    if (fromSidebar && isMobileDevice()) {
        updateSidebarState(document.querySelector('.sidebar'), true);
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 预先构建面包屑路径
        const breadcrumbPath = [];
        let current = folder;
        while (current) {
            breadcrumbPath.unshift(current);
            current = current.parent;
        }
        
        // 过滤掉根文件夹
        const filteredBreadcrumbs = breadcrumbPath.filter(
            crumb => crumb.title !== '书签栏' && crumb.title !== 'Bookmarks Bar'
        );
        
        // 使用DocumentFragment减少DOM操作
        const breadcrumbFragment = document.createDocumentFragment();

        // 添加主页链接
        const homeLink = document.createElement('span');
        homeLink.className = 'breadcrumb-item';
        homeLink.textContent = '主页';
        homeLink.setAttribute('tabindex', '0');
        homeLink.setAttribute('role', 'button');
        homeLink.setAttribute('aria-label', '返回主页');
        
        // 使用事件委托，减少事件监听器
        const homeLinkHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                e.stopPropagation();
                renderHome();
            }
        };
        
        homeLink.addEventListener('click', homeLinkHandler);
        homeLink.addEventListener('keydown', homeLinkHandler);
        breadcrumbFragment.appendChild(homeLink);

        // 批量创建面包屑元素
        if (filteredBreadcrumbs.length > 0) {
            const breadcrumbElements = filteredBreadcrumbs.map((crumb, index, arr) => {
                // 创建分隔符和面包屑元素
                const fragment = document.createDocumentFragment();
                
                // 添加分隔符
                const separator = document.createElement('span');
                separator.textContent = ' > ';
                separator.className = 'breadcrumb-separator';
                fragment.appendChild(separator);
                
                // 创建面包屑项
                const crumbElement = document.createElement('span');
                crumbElement.textContent = crumb.title;
                crumbElement.className = 'breadcrumb-item';
                
                if (crumb.parent && index < arr.length - 1) {
                    crumbElement.setAttribute('tabindex', '0');
                    crumbElement.setAttribute('role', 'button');
                    crumbElement.setAttribute('aria-label', `导航到${crumb.title}`);
                    
                    // 使用事件委托，减少事件监听器
                    const crumbHandler = (e) => {
                        if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                            e.preventDefault();
                            e.stopPropagation();
                            renderMainContent(crumb, true);
                        }
                    };
                    
                    crumbElement.addEventListener('click', crumbHandler);
                    crumbElement.addEventListener('keydown', crumbHandler);
                }
                
                fragment.appendChild(crumbElement);
                return fragment;
            });
            
            // 一次性将所有面包屑元素添加到fragment
            breadcrumbElements.forEach(element => breadcrumbFragment.appendChild(element));
        }

        // 一次性将所有面包屑元素添加到DOM
        breadcrumbs.appendChild(breadcrumbFragment);

        // 处理内容区域
        if (folder.children && folder.children.length > 0) {
            // 预先分类文件夹和书签，减少条件判断
            const folderItems = [];
            const bookmarkItems = [];
            
            folder.children.forEach((item, index) => {
                if (item.type === 'folder') {
                    folderItems.push({item, index});
                } else {
                    bookmarkItems.push({item, index});
                }
            });
            
            // 使用DocumentFragment减少DOM操作
            const contentFragment = document.createDocumentFragment();
            
            // 批量创建文件夹元素
            folderItems.forEach(({item, index}) => {
                const element = createElement('folder', item, () => renderMainContent(item));
                
                // 添加键盘可访问性
                element.setAttribute('tabindex', '0');
                element.setAttribute('role', 'button');
                element.setAttribute('aria-label', `文件夹: ${item.title}`);
                
                // 使用事件委托，减少事件监听器
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        renderMainContent(item);
                    }
                });
                
                // 设置动画延迟索引
                element.style.setProperty('--item-index', index);
                contentFragment.appendChild(element);
            });
            
            // 批量创建书签元素
            bookmarkItems.forEach(({item, index}) => {
                const element = createElement('bookmark', item, null);
                element.style.setProperty('--item-index', index);
                contentFragment.appendChild(element);
            });
            
            // 一次性将所有内容元素添加到DOM
            content.appendChild(contentFragment);
        }
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
    const breadcrumbs = document.getElementById('breadcrumbs');
    
    if (!content || !breadcrumbs) return;
    
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    if (!results || !results.length) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '未找到匹配的书签。';
        content.appendChild(noResults);
        return;
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 预先分类结果，减少循环中的过滤操作
        const folderResults = results.filter(item => item.type === 'folder');
        const linkResults = results.filter(item => item.type === 'link' || item.type === 'bookmark');
        
        // 使用DocumentFragment减少DOM操作
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'results-container';

        // 批量创建文件夹元素
        const folderElements = folderResults.map((item, index) => {
            const element = createElement(
                'folder',
                item,
                () => renderMainContent(item)
            );
            element.style.setProperty('--item-index', index);
            return element;
        });
        
        // 批量创建书签元素
        const bookmarkElements = linkResults.map((item, index) => {
            const element = createElement(
                'bookmark',
                item,
                null
            );
            element.style.setProperty('--item-index', folderElements.length + index);
            return element;
        });
        
        // 一次性将所有元素添加到container
        folderElements.forEach(element => container.appendChild(element));
        bookmarkElements.forEach(element => container.appendChild(element));

        fragment.appendChild(container);
        // 一次性将所有元素添加到DOM
        content.appendChild(fragment);
    });
};

// 初始化Web Worker
let searchWorker;
let dataWorker;

// 清除所有Worker缓存
const clearWorkerCaches = () => {
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'clearCache'
        });
    }
    
    if (dataWorker) {
        dataWorker.postMessage({
            action: 'clearCache'
        });
    }
};

// 检查浏览器是否支持Web Worker
const initSearchWorker = () => {
    if (window.Worker) {
        // 初始化搜索Worker
        searchWorker = new Worker('assets/js/search-worker.js');

        // 监听来自搜索Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message, fromCache } = e.data;

            switch (action) {
                case 'searchResults':
                    renderSearchResults(results);
                    if (fromCache) {
                        console.log('使用缓存的搜索结果');
                    }
                    break;
                case 'cacheCleared':
                    console.log('搜索缓存已清除');
                    break;
                case 'error':
                    console.error('搜索Worker错误:', message);
                    break;
            }
        });
        
        // 初始化数据处理Worker
        dataWorker = new Worker('assets/js/data-worker.js');
        
        // 监听来自数据Worker的消息
        dataWorker.addEventListener('message', (e) => {
            const { action, result, message, fromCache } = e.data;
            
            switch (action) {
                case 'processResult':
                case 'sortResult':
                case 'filterResult':
                    if (fromCache) {
                        console.log(`使用缓存的${action}结果`);
                    }
                    break;
                case 'cacheCleared':
                    console.log('数据处理缓存已清除');
                    break;
                case 'error':
                    console.error('数据处理Worker错误:', message);
                    break;
            }
        });
    }
};

const debounceSearch = debounce((event) => {
    const keyword = event.target.value.trim();
    if (!keyword) return renderHome();
    
    // 显示加载指示器
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="loading-indicator" style="text-align:center; margin-top:50px; color:var(--text-color)">
            <h2>正在搜索...</h2>
            <div class="loading-spinner"></div>
        </div>
    `;

    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');

    // 如果支持Web Worker，则使用Worker执行搜索
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'search',
            data: {
                keyword: keyword,
                bookmarks: data,
                useCache: true // 明确指定使用缓存
            }
        });
    } else {
        // 降级处理：如果不支持Web Worker，则在主线程中执行搜索
        renderSearchResults(searchBookmarks(keyword, data));
    }
}, 250);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和移动视图
    initTheme();
    initFocusManagement();
    handleMobileView();

    // 初始化搜索Web Worker
    initSearchWorker();
    
    // 添加加载状态指示器
    const showLoadingIndicator = () => {
        const content = document.getElementById('content');
        if (!content) return;
        
        // 使用DOM API创建加载指示器，避免innerHTML解析
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.style.textAlign = 'center';
        loadingIndicator.style.marginTop = '50px';
        loadingIndicator.style.color = 'var(--text-color)';
        
        const heading = document.createElement('h2');
        heading.textContent = '正在加载书签数据...';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        loadingIndicator.appendChild(heading);
        loadingIndicator.appendChild(spinner);
        
        content.innerHTML = '';
        content.appendChild(loadingIndicator);
    };
    
    // 显示加载指示器
    showLoadingIndicator();

    try {
        // 使用requestAnimationFrame优化初始化流程
        requestAnimationFrame(async () => {
            try {
                // 首先尝试从localStorage获取缓存数据进行快速渲染
                const cachedData = localStorage.getItem('bookmarksData');
                let data;
                
                if (cachedData) {
                    try {
                        // 使用缓存数据进行初始渲染
                        data = JSON.parse(cachedData);
                        // 先渲染侧边栏和主页，提高用户体验
                        renderSidebar(data);
                        renderHome();
                    } catch (parseError) {
                        console.error('缓存数据解析错误:', parseError);
                        // 缓存数据无效，继续加载新数据
                    }
                }
                
                // 无论是否有缓存，都异步加载最新数据
                let fetchSuccess = false;
                let newData;
                
                try {
                    // 尝试主路径
                    const response = await fetch('bookmarks.json');
                    if (response.ok) {
                        newData = await response.json();
                        fetchSuccess = true;
                    } else {
                        console.error(`加载书签文件失败: ${response.status} ${response.statusText}`);
                    }
                } catch (fetchError) {
                    console.error('主路径加载失败:', fetchError);
                }
                
                // 如果主路径失败，尝试备用路径
                if (!fetchSuccess) {
                    try {
                        const backupResponse = await fetch('./bookmarks.json');
                        if (backupResponse.ok) {
                            newData = await backupResponse.json();
                            fetchSuccess = true;
                        } else {
                            console.error(`备用路径加载失败: ${backupResponse.status} ${backupResponse.statusText}`);
                        }
                    } catch (backupError) {
                        console.error('备用路径加载失败:', backupError);
                    }
                }
                
                // 处理加载结果
                if (fetchSuccess) {
                    // 成功获取新数据
                    const newDataString = JSON.stringify(newData);
                    
                    // 只在数据有变化或之前没有缓存时更新存储和视图
                    if (!cachedData || newDataString !== cachedData) {
                        localStorage.setItem('bookmarksData', newDataString);
                        clearWorkerCaches();
                        renderSidebar(newData);
                        renderHome();
                    }
                } else if (!data) {
                    // 加载失败且没有缓存数据
                    throw new Error('无法加载书签文件，请确保 bookmarks.json 存在于正确位置');
                }
                // 如果加载失败但有缓存数据，继续使用缓存数据，无需额外操作
                
            } catch (error) {
                console.error('书签加载错误:', error);
                // 显示错误信息给用户
                const content = document.getElementById('content');
                if (content) {
                    // 使用DOM API创建错误消息，避免innerHTML解析
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.style.textAlign = 'center';
                    errorMessage.style.marginTop = '50px';
                    errorMessage.style.color = 'var(--text-color)';
                    
                    const heading = document.createElement('h2');
                    heading.textContent = '加载书签数据失败';
                    
                    const message1 = document.createElement('p');
                    message1.textContent = '请确保 bookmarks.json 文件存在且格式正确';
                    
                    const message2 = document.createElement('p');
                    message2.textContent = `错误详情: ${error.message}`;
                    
                    errorMessage.appendChild(heading);
                    errorMessage.appendChild(message1);
                    errorMessage.appendChild(message2);
                    
                    content.innerHTML = '';
                    content.appendChild(errorMessage);
                }
            }
        });
    } catch (error) {
        console.error('初始化错误:', error);
    }

    // 使用事件委托减少事件监听器数量
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    
    if (toggleSidebar) {
        // 合并点击和键盘事件处理
        const toggleSidebarHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                e.stopPropagation();
                if (sidebar) {
                    updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
                }
            }
        };
        
        toggleSidebar.addEventListener('click', toggleSidebarHandler);
        toggleSidebar.addEventListener('keydown', toggleSidebarHandler);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 合并点击和键盘事件处理
        const themeToggleHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                toggleTheme();
            }
        };
        
        themeToggle.addEventListener('click', themeToggleHandler);
        themeToggle.addEventListener('keydown', themeToggleHandler);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', debounceSearch);
    }

    // 主页按钮键盘事件
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        homeButton.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderHome();
            }
        });
    }

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

// 简化 FastClick 初始化，避免嵌套的事件监听器
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }

    // 添加Ctrl+K快捷键聚焦搜索框功能
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
    window.addEventListener('resize', () => {
        handleMobileView();
        adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
    });
});

// 标题变更功能
const originalTitle = document.title;
const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

// 鼠标离开页面时触发的事件
document.addEventListener('mouseout', function (e) {
    // 仅当鼠标离开窗口时进行处理
    if (e.relatedTarget === null) {
        document.title = newTitle;
    }
});

// 鼠标回到页面时触发的事件
document.addEventListener('mouseover', function () {
    document.title = originalTitle;
});

/** 键盘导航系统 */
const initKeyboardNavigation = (direction, e) => {
    // 定义可聚焦元素的选择器
    const focusableSelectors = [
        '.home-button',                // 主页按钮
        '#toggle-sidebar',             // 侧边栏切换按钮
        '#theme-toggle',               // 主题切换按钮
        '.sidebar .folder',            // 侧边栏文件夹
        '.breadcrumb-item',            // 面包屑导航项
        '#content .folder',            // 内容区域文件夹
        '#content .bookmark a'         // 内容区域书签链接
    ];

    // 设置搜索框的tabindex为-1，使其在Tab键导航序列中被跳过
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.setAttribute('tabindex', '-1');
    }

    // 添加Ctrl+K快捷键功能，按下该组合键可以直接聚焦到搜索框
    document.addEventListener('keydown', (e) => {
        // 检测Ctrl+K组合键
        if (e.ctrlKey && e.key === 'k') {
            if (e) e.preventDefault(); // 阻止默认行为
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // 获取所有可聚焦元素
    const getFocusableElements = () => {
        return Array.from(document.querySelectorAll(focusableSelectors.join(',')));
    };

    // 获取当前聚焦元素的索引
    const getCurrentFocusIndex = (elements) => {
        const activeElement = document.activeElement;
        return elements.findIndex(el => el === activeElement);
    };

    // 获取元素的区域类型
    const getElementRegion = (element) => {
        if (!element) return null;

        if (element.closest('.sidebar')) return 'sidebar';
        if (element.closest('#breadcrumbs')) return 'breadcrumbs';
        if (element.closest('#content')) return 'content';
        if (element.id === 'search-input') return 'search';
        if (element.id === 'theme-toggle') return 'theme';
        if (element.id === 'toggle-sidebar' || element.classList.contains('home-button')) return 'controls';

        return null;
    };

    // 根据方向和当前位置获取下一个要聚焦的元素
    const getNextFocusElement = (direction, currentIndex, elements) => {
        const currentElement = elements[currentIndex];
        const currentRegion = getElementRegion(currentElement);

        // 如果当前没有聚焦元素，默认聚焦主页按钮
        if (currentIndex === -1) {
            return elements.find(el => el.classList.contains('home-button')) || elements[0];
        }

        // 根据方向和区域确定下一个聚焦元素
        switch (direction) {
            case 'right': {
                // 从左到右的导航逻辑
                if (currentRegion === 'sidebar') {
                    // 从侧边栏移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') ||
                        elements[currentIndex + 1] || elements[0];
                } else if (currentRegion === 'theme') {
                    // 从主题按钮移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                } else if (currentRegion === 'breadcrumbs') {
                    // 从面包屑移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                } else {
                    // 默认向右移动一个元素
                    return elements[currentIndex + 1] || elements[0];
                }
            }
            case 'left': {
                // 从右到左的导航逻辑
                if (currentRegion === 'content') {
                    // 从内容区域移动到侧边栏或面包屑
                    const breadcrumbElement = elements.find(el => getElementRegion(el) === 'breadcrumbs');
                    const sidebarElement = elements.find(el => getElementRegion(el) === 'sidebar');
                    return breadcrumbElement || sidebarElement || elements[currentIndex - 1] || elements[elements.length - 1];
                } else if (currentRegion === 'theme') {
                    // 从主题按钮移动到侧边栏
                    return elements.find(el => getElementRegion(el) === 'sidebar') || elements[currentIndex - 1] || elements[elements.length - 1];
                } else {
                    // 默认向左移动一个元素
                    return elements[currentIndex - 1] || elements[elements.length - 1];
                }
            }
            case 'up': {
                // 向上导航逻辑
                const sameRegionElements = elements.filter(el => getElementRegion(el) === currentRegion);
                const currentRegionIndex = sameRegionElements.findIndex(el => el === currentElement);

                if (currentRegionIndex > 0) {
                    // 同一区域内向上移动
                    return sameRegionElements[currentRegionIndex - 1];
                } else {
                    // 跨区域向上移动
                    if (currentRegion === 'content') {
                        // 从内容区域移动到面包屑
                        return elements.find(el => getElementRegion(el) === 'breadcrumbs') ||
                            elements.find(el => el.classList.contains('home-button')) ||
                            elements[currentIndex - 1] || elements[elements.length - 1];
                    } else if (currentRegion === 'breadcrumbs') {
                        // 从面包屑移动到主页按钮
                        return elements.find(el => el.classList.contains('home-button')) || elements[currentIndex - 1] || elements[elements.length - 1];
                    } else {
                        // 默认向上移动到上一个元素
                        return elements[currentIndex - 1] || elements[elements.length - 1];
                    }
                }
            }
            case 'down': {
                // 向下导航逻辑
                const sameRegionElements = elements.filter(el => getElementRegion(el) === currentRegion);
                const currentRegionIndex = sameRegionElements.findIndex(el => el === currentElement);

                if (currentRegionIndex < sameRegionElements.length - 1) {
                    // 同一区域内向下移动
                    return sameRegionElements[currentRegionIndex + 1];
                } else {
                    // 跨区域向下移动
                    if (currentRegion === 'theme' || currentRegion === 'controls') {
                        // 从顶部控件移动到面包屑或内容区域
                        return elements.find(el => getElementRegion(el) === 'breadcrumbs') ||
                            elements.find(el => getElementRegion(el) === 'content') ||
                            elements[currentIndex + 1] || elements[0];
                    } else if (currentRegion === 'breadcrumbs') {
                        // 从面包屑移动到内容区域
                        return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                    } else {
                        // 默认向下移动到下一个元素
                        return elements[currentIndex + 1] || elements[0];
                    }
                }
            }
            default:
                return elements[currentIndex];
        }
    };

    if (e) e.preventDefault(); // 阻止默认行为

    const focusableElements = getFocusableElements();
    const currentIndex = getCurrentFocusIndex(focusableElements);
    const nextElement = getNextFocusElement(direction, currentIndex, focusableElements);

    if (nextElement) {
        nextElement.focus();

        // 如果是侧边栏折叠状态且聚焦到侧边栏元素，自动展开侧边栏
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('collapsed') && getElementRegion(nextElement) === 'sidebar') {
            updateSidebarState(sidebar, false);
        }

        // 滚动到可见区域
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};


// 在DOM加载完成后初始化键盘导航
document.addEventListener('DOMContentLoaded', function () {
    // 添加键盘导航事件监听
    document.addEventListener('keydown', function (e) {
        // 方向键导航
        if (e.key === 'ArrowUp') {
            initKeyboardNavigation('up', e);
        } else if (e.key === 'ArrowDown') {
            initKeyboardNavigation('down', e);
        } else if (e.key === 'ArrowLeft') {
            initKeyboardNavigation('left', e);
        } else if (e.key === 'ArrowRight') {
            initKeyboardNavigation('right', e);
        }
    });
});