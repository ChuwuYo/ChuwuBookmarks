/**
 * 图标加载模块
 * 
 * 专门处理图标的加载、缓存和错误处理
 * 提供统一的 API 供所有渲染模块使用
 */

// 创建图标懒加载观察器（单例模式）
let lazyImageObserver = null;

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
 */
const handleIconLoadError = (img, icon) => {
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
                    handleIconLoadError(this, icon);
                }
            };
            
            img.addEventListener('load', handleLoad, { once: true });
            img.addEventListener('error', () => handleIconLoadError(img, icon), { once: true });
            
            ensureImgVisible(img);
            img.src = iconUrls[nextIndex];
            
            if (img.complete) {
                if (img.naturalHeight === 0) {
                    handleIconLoadError(img, icon);
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
            handleIconLoadError(this, icon);
        }
    };
    
    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', () => handleIconLoadError(img, icon), { once: true });
    
    ensureImgVisible(img);
    img.src = iconUrls[0];
    
    if (img.complete) {
        if (img.naturalHeight === 0) {
            handleIconLoadError(img, icon);
        } else {
            handleLoad.call(img);
        }
    }
};

/**
 * 获取或创建 IntersectionObserver 单例
 * @returns {IntersectionObserver}
 */
const getLazyImageObserver = () => {
    if (!lazyImageObserver) {
        lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 支持观察 img 元素或其父容器 .bookmark-icon
                    let img, icon;
                    if (entry.target.tagName === 'IMG') {
                        img = entry.target;
                        icon = img.parentElement;
                    } else {
                        // 观察的是容器，从中找到 img
                        icon = entry.target;
                        img = icon.querySelector('img[data-src]');
                    }
                    
                    if (img && img.dataset.src) {
                        loadIcon(img, icon);
                    }
                    
                    lazyImageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0
        });
    }
    return lazyImageObserver;
};

export { 
    loadIcon, 
    handleIconLoadError, 
    getSortedIconUrls, 
    ensureImgVisible, 
    displayLoadedIcon, 
    getLazyImageObserver 
};
