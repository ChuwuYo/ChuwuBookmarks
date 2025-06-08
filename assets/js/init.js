// FastClick 和 Swup 初始化
document.addEventListener('DOMContentLoaded', function() { 
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }
    
    // 初始化 Swup 页面过渡
    if (typeof Swup !== 'undefined') {
        const swup = new Swup({
            animationSelector: '[class*="transition-"]',
            containers: ['#content', '#breadcrumbs'],
            cache: true,
            linkSelector: 'a[href^="/"]:not([data-no-swup]), a[href^="./"], a[href^="../"]',
        });
    }
});