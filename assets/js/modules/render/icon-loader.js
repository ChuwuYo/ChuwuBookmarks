/**
 * 图标加载模块
 * 
 * 专门处理图标的加载、缓存和错误处理
 * 提供统一的 API 供所有渲染模块使用
 */

/**
 * 确保图标元素可见（有尺寸）
 * @param {HTMLImageElement} img - 图标元素
 */
const ensureImgVisible = (img) => {
    if (img.style.display === 'none') {
        img.style.display = 'block';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.visibility = 'hidden';
    }
};

/**
 * 显示加载成功的图标
 * @param {HTMLImageElement} img - 图标元素
 * @param {HTMLElement} icon - 图标容器
 * @returns {boolean} 是否成功显示
 */
const displayLoadedIcon = (img, icon) => {
    if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        icon.textContent = '';
        img.style.display = '';
        img.style.visibility = 'visible';
        icon.appendChild(img);
        return true;
    }
    return false;
};

/**
 * 处理图标加载失败，尝试备用源
 * @param {HTMLImageElement} img - 图标元素
 * @param {HTMLElement} icon - 图标容器
 * @param {number} retryCount - 当前重试次数（防止栈溢出）
 */
const handleIconLoadError = (img, icon, retryCount = 0) => {
    const MAX_RETRIES = 10; // 防止无限递归
    
    if (retryCount > MAX_RETRIES) {
        img.remove();
        return;
    }
    
    const iconUrlsJson = img.dataset.iconUrls;
    
    if (!iconUrlsJson) {
        img.remove();
        return;
    }
    
    try {
        const iconUrls = JSON.parse(iconUrlsJson);
        const currentIndex = parseInt(img.dataset.currentIndex || '0', 10);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < iconUrls.length) {
            img.dataset.currentIndex = nextIndex.toString();
            
            const handleLoad = function() {
                if (!displayLoadedIcon(this, icon)) {
                    // 使用 setTimeout 打破同步递归链，防止栈溢出
                    setTimeout(() => handleIconLoadError(this, icon, retryCount + 1), 0);
                }
            };
            
            img.addEventListener('load', handleLoad, { once: true });
            img.addEventListener('error', () => {
                // 使用 setTimeout 打破同步递归链
                setTimeout(() => handleIconLoadError(img, icon, retryCount + 1), 0);
            }, { once: true });
            
            ensureImgVisible(img);
            img.src = iconUrls[nextIndex];
            
            if (img.complete) {
                if (img.naturalHeight === 0) {
                    // 使用 setTimeout 打破同步递归链
                    setTimeout(() => handleIconLoadError(img, icon, retryCount + 1), 0);
                } else {
                    handleLoad.call(img);
                }
            }
        } else {
            img.remove();
        }
    } catch (error) {
        img.remove();
    }
};

/**
 * 获取排序后的图标 URL 列表
 * favicon.im 优先于 Google S2（因为 Google S2 在中国无法使用）
 * @param {HTMLImageElement} img - 图标元素
 * @returns {string[]} 排序后的图标 URL 列表
 */
const getSortedIconUrls = (img) => {
    const iconUrlsJson = img.dataset.iconUrls;
    let iconUrls = [];
    
    if (iconUrlsJson) {
        try {
            iconUrls = JSON.parse(iconUrlsJson);
        } catch (e) {
            iconUrls = [img.dataset.src];
        }
    } else {
        iconUrls = [img.dataset.src];
    }
    
    return iconUrls.sort((a, b) => {
        const aIsFavicon = a.includes('favicon.im');
        const bIsFavicon = b.includes('favicon.im');
        if (aIsFavicon && !bIsFavicon) return -1;
        if (!aIsFavicon && bIsFavicon) return 1;
        return 0;
    });
};

/**
 * 加载单个图标
 * @param {HTMLImageElement} img - 图标元素
 * @param {HTMLElement} icon - 图标容器
 */
const loadIcon = (img, icon) => {
    if (!img || !img.dataset.src) return;
    
    const iconUrls = getSortedIconUrls(img);
    img.dataset.iconUrls = JSON.stringify(iconUrls);
    img.dataset.currentIndex = '0';
    
    const handleLoad = function() {
        if (!displayLoadedIcon(this, icon)) {
            // 使用 setTimeout 打破同步递归链，防止栈溢出
            setTimeout(() => handleIconLoadError(this, icon, 0), 0);
        }
    };
    
    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', () => {
        // 使用 setTimeout 打破同步递归链
        setTimeout(() => handleIconLoadError(img, icon, 0), 0);
    }, { once: true });
    
    ensureImgVisible(img);
    img.src = iconUrls[0];
    
    if (img.complete) {
        if (img.naturalHeight === 0) {
            // 使用 setTimeout 打破同步递归链
            setTimeout(() => handleIconLoadError(img, icon, 0), 0);
        } else {
            handleLoad.call(img);
        }
    }
};

/**
 * 批量加载书签元素的图标
 * @param {HTMLElement[]} bookmarkElements - 书签元素数组
 */
const loadIconsForElements = (bookmarkElements) => {
    bookmarkElements.forEach(element => {
        const iconContainer = element.querySelector('.bookmark-icon');
        const img = iconContainer?.querySelector('img[data-src]');
        if (iconContainer && img) {
            loadIcon(img, iconContainer);
        }
    });
};

// 导出外部需要使用的函数
export { loadIcon, loadIconsForElements };
