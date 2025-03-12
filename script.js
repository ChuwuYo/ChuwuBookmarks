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
const isMobileDevice = () => 
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;

const updateSidebarState = (sidebar, isCollapsed) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    document.getElementById('toggle-sidebar').textContent = isCollapsed ? '🫸' : '🫷';
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
    updateSidebarState(sidebar, isMobileDevice());
};

const adjustHomeMessagePosition = (isCollapsed) => {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        if (!isMobileDevice()) {
            homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
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

    const masterTimeline = gsap.timeline();
    
    // 设置初始状态
    gsap.set('.home-message', { opacity: 0 });
    gsap.set('.chinese-text', { 
        opacity: 0,
        scale: 0.5,
        x: -100,
        transformPerspective: 1000,
        transformOrigin: "center center"
    });
    gsap.set('.english-text', { 
        opacity: 0,
        scale: 0.5,
        x: -100,
        transformPerspective: 1000,
        transformOrigin: "center center"
    });
    
    // 主容器淡入 - 减少延迟
    masterTimeline.to('.home-message', {
        opacity: 1,
        duration: 0.5,  // 从 0.8 减少到 0.5
        ease: "power2.inOut"
    });
    
    // 中文文本动画 - 减少延迟
    masterTimeline.to('.chinese-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.8,  // 从 1.2 减少到 0.8
        ease: "power2.out"
    }, "-=0.3");  // 从 -0.4 改为 -0.3
    
    // 英文文本动画 - 减少延迟
    masterTimeline.to('.english-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.8,  // 从 1.2 减少到 0.8
        ease: "power2.out"
    }, "-=0.6");  // 从 -0.8 改为 -0.6
    
    // 中文文本动画 - 从左向右渐显
    masterTimeline.to('.chinese-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 1.2,
        ease: "power2.out"
    }, "-=0.4");
    
    // 英文文本动画 - 从左向右渐显
    masterTimeline.to('.english-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 1.2,
        ease: "power2.out"
    }, "-=0.8");
    
    // 为中文文本的每个字符添加特殊动画效果
    const chineseText = document.querySelector('.chinese-text');
    const chineseChars = chineseText.textContent.split('');
    chineseText.innerHTML = '';
    
    chineseChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        chineseText.appendChild(charSpan);
        
        // 为每个字符添加从左向右渐显动画
        gsap.set(charSpan, {
            opacity: 0,
            x: -20
        });
        
        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.3,
            delay: 0.8 + (index * 0.08),  // 从 1.2 减少到 0.8，从 0.1 减少到 0.08
            ease: "power1.out"
        });
        
        // 为"的"字符添加从上方掉落的动画
        if (char === '的') {
            gsap.set(charSpan, {
                y: -100,
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 1,  // 从 1.2 减少到 1
                delay: 1.8,   // 从 2.5 减少到 1.8
                ease: "bounce.out"
            });
        }
    });
    
    // 为英文文本的每个字符添加特殊动画效果
    const englishText = document.querySelector('.english-text');
    const englishChars = englishText.textContent.split('');
    englishText.innerHTML = '';
    
    englishChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        englishText.appendChild(charSpan);
        
        // 为每个字符添加从左向右渐显动画
        gsap.set(charSpan, {
            opacity: 0,
            x: -20
        });
        
        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.3,
            delay: 1 + (index * 0.06),  // 从 1.5 减少到 1，从 0.08 减少到 0.06
            ease: "power1.out"
        });
        
        // 为"'s"添加从上方掉落的动画
        if (char === "'") {
            gsap.set(charSpan, {
                y: -100,
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 1,    // 从 1.2 减少到 1
                delay: 2.2,     // 从 3.0 减少到 2.2
                ease: "bounce.out"
            });
        } else if (char === "s") {
            gsap.set(charSpan, {
                y: -100,
                opacity: 0
            });
            
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 1,    // 从 1.2 减少到 1
                delay: 2.4,     // 从 3.2 减少到 2.4
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
            img.src = item.icon;
            img.alt = '🔗';
            img.style.display = 'none';
            img.onload = function() {
                bookmarkIcon.textContent = '';
                this.style.display = '';
                bookmarkIcon.appendChild(this);
            };
            img.onerror = function() {
                this.remove();
            };
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

    rootFolder.children
        .filter(item => item.type === 'folder')
        .forEach(item => {
            item.parent = rootFolder;
            if (item.children) setParentReferences(item.children, item);
            sidebar.appendChild(createElement('folder', item, (e) => {
                e.stopPropagation();
                renderMainContent(item, true);
            }));
        });
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
            breadcrumbs.appendChild(crumbElement);
            if (index < arr.length - 1) {
                breadcrumbs.appendChild(Object.assign(document.createElement('span'), {
                    textContent: ' > ',
                    className: 'breadcrumb-separator'
                }));
            }
        });

    folder.children?.forEach(item => {
        content.appendChild(createElement(
            item.type === 'folder' ? 'folder' : 'bookmark',
            item,
            item.type === 'folder' ? () => renderMainContent(item) : null
        ));
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

    const container = document.createElement('div');
    container.className = 'results-container';
    ['folder', 'link'].forEach(type => {
        results.filter(item => item.type === type)
            .forEach(item => container.appendChild(createElement(
                type === 'folder' ? 'folder' : 'bookmark',
                item,
                type === 'folder' ? () => renderMainContent(item) : null
            )));
    });
    content.appendChild(container);
};

const debounceSearch = debounce((event) => {
    const keyword = event.target.value.trim();
    if (!keyword) return renderHome();
    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
    renderSearchResults(searchBookmarks(keyword, data));
}, 500);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    handleMobileView();

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

    const sidebar = document.querySelector('.sidebar');
    document.getElementById('toggle-sidebar').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
    });

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('search-input').addEventListener('keyup', debounceSearch);
});

window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});
