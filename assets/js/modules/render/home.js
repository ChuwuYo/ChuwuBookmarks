/**
 * 主页渲染模块
 */

import { animationConfig } from './theme.js';
import { getDeviceType } from './device.js';
import { resetSearchPagination } from './search.js';
import { getCenteringManager } from '../utils/centering.js';

// 创建主页基础DOM结构
const createHomeStructure = () => {
    const fragment = document.createDocumentFragment();
    const homeMessage = document.createElement('div');
    homeMessage.className = 'home-message centered-element vertical-center';

    const chineseText = document.createElement('div');
    chineseText.className = 'chinese-text';

    const englishText = document.createElement('div');
    englishText.className = 'english-text';

    homeMessage.appendChild(chineseText);
    homeMessage.appendChild(englishText);
    fragment.appendChild(homeMessage);

    return { fragment, homeMessage, chineseText, englishText };
};

// 设置主页文本的初始动画状态
const setupHomeTextAnimation = (homeMessage, chineseText, englishText) => {
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
};

// 创建文字动画的时间线
const createHomeTextTimeline = (homeMessage, chineseText, englishText) => {
    const masterTimeline = gsap.timeline();

    masterTimeline.to(homeMessage, {
        opacity: 1,
        duration: animationConfig.duration.medium,
        ease: animationConfig.ease.outQuad
    });

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

    return masterTimeline;
};

// 创建字符元素
const createCharacterSpans = (chars) => {
    const fragment = document.createDocumentFragment();
    const spans = chars.split('').map(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.className = 'home-char';
        fragment.appendChild(charSpan);
        return charSpan;
    });
    return { fragment, spans };
};

// 设置中文字符动画
const setupChineseCharacterAnimation = (spans) => {
    spans.forEach((charSpan, index) => {
        const char = charSpan.textContent;
        if (char === '的') {
            gsap.set(charSpan, { y: -50, opacity: 0 });
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: 1.2,
                ease: "bounce.out"
            });
        } else {
            gsap.set(charSpan, { opacity: 0, x: -10 });
            gsap.to(charSpan, {
                opacity: 1,
                x: 0,
                duration: 0.2,
                delay: 0.5 + (index * 0.05),
                ease: "power1.out"
            });
        }
    });
};

// 设置英文字符动画
const setupEnglishCharacterAnimation = (spans) => {
    spans.forEach((charSpan, index) => {
        const char = charSpan.textContent;
        if (char === "'" || char === "s") {
            gsap.set(charSpan, { y: -50, opacity: 0 });
            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: char === "'" ? 1.5 : 1.7,
                ease: "bounce.out"
            });
        } else {
            gsap.set(charSpan, { opacity: 0, x: -10 });
            gsap.to(charSpan, {
                opacity: 1,
                x: 0,
                duration: 0.2,
                delay: 0.7 + (index * 0.04),
                ease: "power1.out"
            });
        }
    });
};

// 渲染主页
import { clearAllMessages } from './message.js';

const renderHome = () => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (!content || !breadcrumbs) return;

    // 清理分页控件
    try {
        resetSearchPagination();
    } catch (error) {
        console.error('清理分页控件失败:', error);
    }

    // 使用统一管理清理所有消息元素，保证环境干净
    clearAllMessages();

    const { fragment, homeMessage, chineseText, englishText } = createHomeStructure();

    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    const deviceType = getDeviceType();

    // 将主页消息添加到适当容器：移动端附加到 body 以实现覆盖层效果，桌面端放入 content 以随侧栏布局变化
    if (deviceType === 'mobile') {
        document.body.appendChild(fragment);
    } else {
        content.appendChild(fragment);
    }
    
    if (deviceType === 'mobile') {
        homeMessage.classList.add('mobile-home-message');
    }

    // 获取统一居中管理器并注册主页消息
    const centeringManager = getCenteringManager();

    // 确保管理器已初始化
    if (!centeringManager.isInitialized) {
        centeringManager.initialize();
    }

    // 注册主页消息到统一居中系统（使用预定义配置）
    // 主页消息配置已在ELEMENT_CONFIGS中预定义，这里只需要确保元素存在
    requestAnimationFrame(() => {
        // 强制更新主页消息位置
        centeringManager.updateSingleElement('home-message');
    });

    setupHomeTextAnimation(homeMessage, chineseText, englishText);
    createHomeTextTimeline(homeMessage, chineseText, englishText);

    requestAnimationFrame(() => {
        const { fragment: chineseFragment, spans: chineseSpans } = createCharacterSpans('初五的书签');
        chineseText.textContent = '';
        chineseText.appendChild(chineseFragment);
        setupChineseCharacterAnimation(chineseSpans);

        const { fragment: englishFragment, spans: englishSpans } = createCharacterSpans("Chuwu's Bookmarks");
        englishText.textContent = '';
        englishText.appendChild(englishFragment);
        setupEnglishCharacterAnimation(englishSpans);
    });
};

export { renderHome };
