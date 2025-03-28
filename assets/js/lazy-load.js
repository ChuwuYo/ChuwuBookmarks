/**
 * 图片懒加载工具函数
 * 用于优化图片加载性能，减少初始加载时的资源消耗
 */

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
                    lazyImage.onload = function() {
                        // 移除占位符
                        if (lazyImage.parentNode && lazyImage.parentNode.classList.contains('bookmark-icon')) {
                            lazyImage.parentNode.textContent = '';
                        }
                        
                        // 显示图片
                        lazyImage.style.display = '';
                        lazyImage.classList.remove('lazy-image');
                        lazyImage.classList.add('loaded');
                    };
                    
                    // 图片加载失败的处理
                    lazyImage.onerror = function() {
                        this.remove();
                    };
                }
                
                // 图片已开始加载，停止观察
                observer.unobserve(lazyImage);
            }
        });
    }, {
        rootMargin: '200px', // 提前200px开始加载
        threshold: 0.01 // 当1%的元素可见时触发
    });
    
    // 获取所有懒加载图片并开始观察
    const lazyImages = document.querySelectorAll('img.lazy-image');
    lazyImages.forEach(img => {
        lazyImageObserver.observe(img);
    });
    
    // 返回观察者实例，以便后续使用
    return lazyImageObserver;
};

// 降级处理：立即加载所有图片
const loadAllImages = () => {
    const lazyImages = document.querySelectorAll('img.lazy-image');
    lazyImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
};

// 动态添加的图片懒加载处理
const observeNewImage = (img, observer) => {
    if (!observer && window.lazyImageObserver) {
        observer = window.lazyImageObserver;
    }
    
    if (observer && img.classList.contains('lazy-image')) {
        observer.observe(img);
    }
};

// 导出函数
window.lazyLoad = {
    init: initLazyLoading,
    loadAll: loadAllImages,
    observeNewImage: observeNewImage
};

// 页面加载完成后初始化懒加载
document.addEventListener('DOMContentLoaded', () => {
    window.lazyImageObserver = initLazyLoading();
});