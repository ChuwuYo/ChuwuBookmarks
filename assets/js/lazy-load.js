/**
 * 图片懒加载工具函数
 * 使用 IntersectionObserver API 优化图片加载性能，减少初始加载时的资源消耗。
 */

// 默认错误图片路径，如果加载失败则显示此图片
const DEFAULT_ERROR_IMAGE = 'assets/images/placeholder.svg'; // 请确保此路径有效或替换为你的错误图片路径

// 初始化懒加载观察者
const initLazyLoading = () => {
    // 检查浏览器是否支持IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        // 不支持时，立即加载所有图片
        loadAllImages();
        return;
    }
    
    // 创建观察者实例
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // 当图片进入视口时
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                
                // 设置图片的src属性，触发加载
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                    
                    // 图片加载完成后的处理
                    handleImageLoadSuccess(lazyImage);
                    
                    // 图片加载失败的处理
                    lazyImage.onerror = function() {
                        handleImageLoadError(this);
                    };
                }
                
                // 图片已开始加载，停止观察
                observer.unobserve(lazyImage);
            }
        });
    }, {
        rootMargin: '200px 0px 200px 0px', // 垂直方向上提前200px开始加载，优化滚动体验
        threshold: 0.01 // 当元素至少1%可见时触发回调
    });
    
    // 获取所有懒加载图片并开始观察
    const lazyImages = document.querySelectorAll('img.lazy-image');
    lazyImages.forEach(img => {
        lazyImageObserver.observe(img);
    });
    
    // 返回观察者实例，以便后续使用
    return lazyImageObserver;
};

// 降级处理：当 IntersectionObserver 不可用时，立即加载所有图片
const loadAllImages = () => {
    console.warn('IntersectionObserver not supported, loading all images immediately.');
    const lazyImages = document.querySelectorAll('img.lazy-image');
    lazyImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            // 移除懒加载类，避免样式冲突
            img.classList.remove('lazy-image');
            img.classList.add('loaded'); 
        }
    });
};

/**
 * 观察动态添加到 DOM 中的新图片。
 * @param {HTMLImageElement} img - 需要观察的图片元素。
 * @param {IntersectionObserver} [observer] - 观察者实例。如果未提供，则尝试使用全局实例。
 */
/**
 * 处理图片加载成功。
 * @param {HTMLImageElement} img - 加载成功的图片元素。
 */
const handleImageLoadSuccess = (img) => {
    // 移除可能存在的占位符文本（如果父元素是 .bookmark-icon）
    if (img.parentNode && img.parentNode.classList.contains('bookmark-icon')) {
        // 检查并移除文本节点，避免影响其他可能的子元素
        Array.from(img.parentNode.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = '';
            }
        });
        // 确保图片在父元素内可见
        img.parentNode.appendChild(img);
    }

    // 标记图片为已加载，并移除懒加载状态类，添加过渡效果类
    img.classList.remove('lazy-image');
    img.classList.add('loaded'); // 添加 'loaded' 类以触发 CSS 过渡
    img.style.display = ''; // 确保图片可见
};

/**
 * 处理图片加载失败。
 * @param {HTMLImageElement} img - 加载失败的图片元素。
 */
const handleImageLoadError = (img) => {
    console.error(`图片加载失败: ${img.dataset.src}`);
    // 设置为默认错误图片
    img.src = DEFAULT_ERROR_IMAGE;
    // 移除懒加载类，添加错误标记类
    img.classList.remove('lazy-image');
    img.classList.add('load-error');
    // 移除 onerror 处理程序，防止因错误图片也加载失败而无限循环
    img.onerror = null; 
};

/**
 * 观察动态添加到 DOM 中的新图片。
 * @param {HTMLImageElement} img - 需要观察的图片元素。
 * @param {IntersectionObserver} [observer] - 观察者实例。如果未提供，则尝试使用全局实例。
 */
const observeNewImage = (img, observer) => {
    // 如果未传入 observer，尝试使用全局缓存的 observer
    if (!observer && window.lazyImageObserver) {
        observer = window.lazyImageObserver;
    }
    
    // 确保 observer 存在且图片具有 lazy-image 类
    if (observer && img instanceof HTMLImageElement && img.classList.contains('lazy-image')) {
        observer.observe(img);
    } else if (!observer) {
        console.warn('Lazy load observer not available for new image.');
        // 如果观察者不存在，立即加载图片并处理加载结果
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => handleImageLoadSuccess(img);
            img.onerror = () => handleImageLoadError(img);
        }
    }
};


// 将主要功能暴露到全局 window.lazyLoad 对象下
window.lazyLoad = {
    init: initLazyLoading,
    loadAll: loadAllImages,
    observeNewImage: observeNewImage
};

// 页面加载完成后初始化懒加载
document.addEventListener('DOMContentLoaded', () => {
    // 初始化懒加载并将观察者实例存储在全局变量中，以便 observeNewImage 函数使用
    window.lazyImageObserver = initLazyLoading();
});