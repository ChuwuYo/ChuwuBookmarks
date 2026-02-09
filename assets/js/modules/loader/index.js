/**
 * 数据加载模块
 *
 * 支持两种加载模式：
 * 1. 懒加载模式：先加载 structure.json（轻量目录结构），后台异步加载完整数据
 * 2. 完整加载模式：直接加载 bookmarks.json（向后兼容）
 */
import { renderSidebar } from '../render/sidebar.js';
import { renderHome } from '../render/home.js';
import { clearWorkerCaches } from '../search/index.js';
import { getDeviceType } from '../render/device.js';
import { getCenteringManager } from '../utils/centering.js';
import { showLoadingMessage, showErrorMessage, clearAllMessages } from '../render/message.js';
import { getDataWorkerWrapper } from '../worker/index.js';

// 全局状态：存储完整的书签数据（用于懒加载文件夹时查找）
let fullBookmarksData = null;
let isFullDataLoaded = false;
let fullDataLoadPromise = null;

// 获取完整书签数据的方法（供其他模块使用）
const getFullBookmarksData = () => fullBookmarksData;
const isFullDataReady = () => isFullDataLoaded;

// 等待完整数据加载完成
const waitForFullData = () => {
    if (isFullDataLoaded) return Promise.resolve(fullBookmarksData);
    if (fullDataLoadPromise) return fullDataLoadPromise;
    return Promise.resolve(null);
};

// 显示加载指示器
const showLoadingIndicator = () => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!content || !breadcrumbs) return;
    showLoadingMessage(content, breadcrumbs);
};

/**
 * 加载书签数据 - 使用Web Worker优化
 *
 * 加载流程：
 * 1. 首先尝试从 localStorage 读取缓存数据进行即时渲染
 * 2. 尝试加载 structure.json（轻量目录结构）
 * 3. 如果 structure.json 存在，先用它渲染侧边栏，然后后台加载完整数据
 * 4. 如果 structure.json 不存在，回退到加载完整的 bookmarks.json
 */
const loadBookmarksData = async (renderMainContent) => {
    // 尝试从localStorage获取缓存数据进行即时渲染
    let hasCachedData = false;
    try {
        const cachedDataString = localStorage.getItem('bookmarksData');
        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            renderSidebar(cachedData, renderMainContent);
            renderHome();
            hasCachedData = true;
            
            // 如果缓存的是完整数据，保存到全局状态
            if (!cachedData[0]?._lazyLoad) {
                fullBookmarksData = cachedData;
                isFullDataLoaded = true;
            }
        }
    } catch (e) {
        console.error("Failed to parse cached data:", e);
        localStorage.removeItem('bookmarksData'); // 清除损坏的缓存
    }

    // 从统一的 Worker 管理模块获取 Worker 包装器
    const dataWorkerWrapper = getDataWorkerWrapper();
    
    // 定义消息处理器
    const messageHandler = (event) => {
        const { status, data, error, hash, structureVersion, generated, isFullData } = event.data;
        
        // 完整数据后台响应应仅由后台处理器处理
        if (isFullData) return;
        
        // 处理目录结构加载成功
        if (status === 'structure_loaded') {
            console.log('Structure loaded successfully, version:', structureVersion, 'generated:', generated);
            
            const cachedStructureHash = localStorage.getItem('structureHash');
            
            // 如果结构数据有更新或没有缓存
            if (hash !== cachedStructureHash || !hasCachedData) {
                try {
                    localStorage.setItem('bookmarksData', JSON.stringify(data));
                    localStorage.setItem('structureHash', hash);
                } catch (e) {
                    console.warn('Failed to cache structure data:', e);
                }
                
                renderSidebar(data, renderMainContent);
                renderHome();
            }
            
            // 后台异步加载完整数据
            loadFullDataInBackground(dataWorkerWrapper, renderMainContent, messageHandler);
            return;
        }
        
        // 处理目录结构不存在，回退到完整加载
        if (status === 'structure_not_found') {
            console.log('Structure not found, falling back to full load:', event.data.message);
            const success = dataWorkerWrapper.postMessage({ action: 'loadData' });
            if (!success) {
                console.warn('[Loader] Failed to send loadData message to worker');
            }
            return;
        }
        
        // 处理完整数据加载成功
        if (status === 'success') {
            handleFullDataLoaded(event.data, renderMainContent, hasCachedData);
            // 数据加载完成后移除监听器，但保持 Worker 活跃以供后续使用
            dataWorkerWrapper.removeMessageListener(messageHandler);
            dataWorkerWrapper.removeErrorListener(errorHandler);
        }
        
        // 处理加载错误
        if (status === 'error') {
            handleLoadError(error, hasCachedData);
            dataWorkerWrapper.removeMessageListener(messageHandler);
            dataWorkerWrapper.removeErrorListener(errorHandler);
        }
    };

    // 定义错误处理器（处理 Worker 运行时错误）
    const errorHandler = (error) => {
        console.error('Data Worker encountered an error:', error);
        // 只有在消息处理器还未处理过错误时才调用
        // 避免重复处理同一个错误
        handleLoadError(error.message || 'Web Worker加载失败', hasCachedData);
        dataWorkerWrapper.removeMessageListener(messageHandler);
        dataWorkerWrapper.removeErrorListener(errorHandler);
    };

    // 注册监听器
    dataWorkerWrapper.addMessageListener(messageHandler);
    dataWorkerWrapper.addErrorListener(errorHandler);
    
    // 首先尝试加载目录结构（懒加载模式）
    const success = dataWorkerWrapper.postMessage({ action: 'loadStructure' });
    if (!success) {
        console.warn('[Loader] Failed to send loadStructure message to worker');
        // 如果没有缓存数据，需要显示错误信息
        if (!hasCachedData) {
            handleLoadError('无法与数据工作线程通信', hasCachedData);
            dataWorkerWrapper.removeMessageListener(messageHandler);
            dataWorkerWrapper.removeErrorListener(errorHandler);
        }
    }
};

/**
 * 缓存书签数据到 localStorage
 * @param {Array} data - 书签数据
 * @param {string} hash - 数据哈希值
 * @param {Array} index - 书签索引
 */
const cacheBookmarksData = (data, hash, index) => {
    try {
        localStorage.setItem('bookmarksData', JSON.stringify(data));
        localStorage.setItem('bookmarksHash', hash);
        
        if (index) {
            localStorage.setItem('bookmarksIndex', JSON.stringify(index));
        }
    } catch (e) {
        console.warn('Failed to cache bookmarks data:', e);
    }
};

/**
 * 后台加载完整数据
 * @param {WorkerWrapper} workerWrapper - Worker 包装器实例
 * @param {Function} renderMainContent - 渲染主内容的回调函数
 * @param {Function} originalHandler - 原始消息处理器（用于移除）
 */
const loadFullDataInBackground = (workerWrapper, renderMainContent, originalHandler) => {
    // 如果已有正在进行的加载，直接返回现有 Promise，避免竞态条件
    if (fullDataLoadPromise && !isFullDataLoaded) {
        return fullDataLoadPromise;
    }
    
    // 创建一个 Promise 供其他模块等待
    fullDataLoadPromise = new Promise((resolve) => {
        // 定义后台加载的消息处理器
        const backgroundHandler = (event) => {
            const { status, data, index, hash, isFullData } = event.data;
            
            if (status === 'success' && isFullData) {
                console.log('Full data loaded in background');
                
                // 保存完整数据到全局状态
                fullBookmarksData = data;
                isFullDataLoaded = true;
                
                // 缓存数据
                cacheBookmarksData(data, hash, index);
                
                // 清除搜索缓存，因为数据已更新
                clearWorkerCaches();
                
                // 重新渲染侧边栏（现在有完整数据了）
                renderSidebar(data, renderMainContent);
                
                // 移除监听器，保持 Worker 活跃
                workerWrapper.removeMessageListener(originalHandler);
                workerWrapper.removeMessageListener(backgroundHandler);
                
                resolve(data);
                return;
            }
            
            // 确保后台加载失败时不会无限等待
            if (status === 'error' && isFullData) {
                console.warn('Full data background load failed:', data);
                workerWrapper.removeMessageListener(backgroundHandler);
                resolve(null);
            }
        };
        
        // 注册后台加载监听器
        workerWrapper.addMessageListener(backgroundHandler);
        
        // 请求加载完整数据
        const success = workerWrapper.postMessage({ action: 'loadFullData' });
        if (!success) {
            console.warn('[Loader] Failed to request full data loading from worker');
            workerWrapper.removeMessageListener(backgroundHandler);
            resolve(null);
        }
    });
};

/**
 * 处理完整数据加载成功
 */
const handleFullDataLoaded = (eventData, renderMainContent, hasCachedData) => {
    const { data, index, hash } = eventData;
    
    // 保存完整数据到全局状态
    fullBookmarksData = data;
    isFullDataLoaded = true;
    
    const cachedHash = localStorage.getItem('bookmarksHash');
    
    // 仅当数据有变化时才更新视图和缓存
    if (hash !== cachedHash) {
        cacheBookmarksData(data, hash, index);
        clearWorkerCaches();
        renderSidebar(data, renderMainContent);
        renderHome();
    } else if (!hasCachedData) {
        // 没有缓存数据时，即使哈希相同也要渲染
        renderSidebar(data, renderMainContent);
        renderHome();
    }
};

/**
 * 处理加载错误
 */
const handleLoadError = (error, hasCachedData) => {
    console.error('Worker failed to load data:', error);
    
    // 只有在没有缓存数据可显示时才显示错误信息
    if (!hasCachedData && !localStorage.getItem('bookmarksData')) {
        setTimeout(() => {
            showErrorMessage(new Error(error));
            const centeringManager = getCenteringManager();
            centeringManager.updateSingleElement('error-message');
        }, 10);
    } else {
        // 如果有缓存数据，仍然渲染主页
        renderHome();
    }
};

export {
    showLoadingIndicator,
    showErrorMessage,
    loadBookmarksData,
    getFullBookmarksData,
    isFullDataReady,
    waitForFullData
};