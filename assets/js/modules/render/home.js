/**
 * 主页渲染模块
 */

import { animationConfig } from './theme.js';
import { getDeviceType, adjustSearchContainerPosition, adjustHomeMessagePosition } from './device.js';

// 创建主页基础DOM结构
const createHomeStructure = () => {
    const fragment = document.createDocumentFragment();
    const homeMessage = document.createElement('div');
    homeMessage.className = 'home-message';
    
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
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
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
const renderHome = () => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    
    if (!content || !breadcrumbs) return;
    
    const { fragment, homeMessage, chineseText, englishText } = createHomeStructure();
    
    content.innerHTML = '';
    content.appendChild(fragment);
    breadcrumbs.innerHTML = '';
    
    homeMessage.style.cssText = '';
    
    const deviceType = getDeviceType();
    if (deviceType === 'mobile' || deviceType === 'tablet') {
        Object.assign(homeMessage.style, {
            left: '50%',
            transform: 'translate(-50%, -50%)',
            top: '45%',
            width: '90%',
            maxWidth: deviceType === 'mobile' ? '400px' : '600px'
        });
    } else {
        const isCollapsed = document.querySelector('.sidebar')?.classList.contains('collapsed');
        adjustHomeMessagePosition(isCollapsed);
    }
    
    adjustSearchContainerPosition();

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