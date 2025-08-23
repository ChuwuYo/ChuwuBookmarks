/**
 * 分页控制器 - 处理分页状态计算和页码变更逻辑
 */

import { getResponsiveManager, initializeResponsiveSystem } from './responsive.js';

/**
 * 分页配置接口
 * @typedef {Object} PaginationConfig
 * @property {number} itemsPerPage - 每页项目数量，默认20
 * @property {number} maxVisiblePages - 最大可见页码数，默认5
 * @property {boolean} showFirstLast - 是否显示首页/末页按钮
 * @property {boolean} showPrevNext - 是否显示上一页/下一页按钮
 * @property {boolean} responsive - 是否启用响应式配置，默认true
 */

/**
 * 分页状态接口
 * @typedef {Object} PaginationState
 * @property {number} currentPage - 当前页码（从1开始）
 * @property {number} totalItems - 总项目数
 * @property {number} totalPages - 总页数
 * @property {number} startIndex - 当前页起始索引
 * @property {number} endIndex - 当前页结束索引
 * @property {number[]} visiblePages - 可见页码数组
 * @property {boolean} hasEllipsis - 是否显示省略号
 * @property {boolean} hasPrevious - 是否有上一页
 * @property {boolean} hasNext - 是否有下一页
 */

/**
 * 分页事件接口
 * @typedef {Object} PaginationEvents
 * @property {function(number): void} onPageChange - 页码变更回调
 * @property {function(number): void} [onPageSizeChange] - 页面大小变更回调
 */

/**
 * 分页控制器类
 */
export class PaginationController {
    /**
     * 构造函数
     * @param {PaginationConfig} config - 分页配置
     * @param {PaginationEvents} events - 事件回调
     */
    constructor(config = {}, events = {}) {
        // 默认配置
        this.config = {
            itemsPerPage: 20,
            maxVisiblePages: 5,
            showFirstLast: true,
            showPrevNext: true,
            responsive: true,
            ...config
        };
        
        this.events = events;
        this.state = this.initializeState();
        this.responsiveManager = null;
        
        // 初始化响应式系统
        if (this.config.responsive) {
            this.initializeResponsiveSupport();
        }
    }

    /**
     * 初始化分页状态
     * @returns {PaginationState}
     */
    initializeState() {
        return {
            currentPage: 1,
            totalItems: 0,
            totalPages: 0,
            startIndex: 0,
            endIndex: 0,
            visiblePages: [],
            hasEllipsis: false,
            hasPrevious: false,
            hasNext: false
        };
    }

    /**
     * 计算分页状态
     * @param {number} totalItems - 总项目数
     * @param {number} currentPage - 当前页码
     * @returns {PaginationState}
     */
    calculatePagination(totalItems, currentPage = 1) {
        // 验证输入参数
        if (totalItems < 0) {
            throw new Error('总项目数不能为负数');
        }
        
        if (currentPage < 1) {
            currentPage = 1;
        }

        const totalPages = Math.ceil(totalItems / this.config.itemsPerPage);
        
        // 确保当前页码在有效范围内
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * this.config.itemsPerPage;
        const endIndex = Math.min(startIndex + this.config.itemsPerPage, totalItems);
        
        // 计算可见页码范围
        const visiblePages = this.calculateVisiblePages(currentPage, totalPages);
        
        this.state = {
            currentPage,
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            visiblePages,
            hasEllipsis: totalPages > this.config.maxVisiblePages,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < totalPages
        };

        return this.state;
    }

    /**
     * 计算可见页码数组
     * @param {number} currentPage - 当前页码
     * @param {number} totalPages - 总页数
     * @returns {number[]}
     */
    calculateVisiblePages(currentPage, totalPages) {
        const maxVisible = this.config.maxVisiblePages;
        
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        // 调整起始位置确保显示足够的页码
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    /**
     * 获取当前页数据
     * @param {Array} allData - 所有数据
     * @returns {Array}
     */
    getCurrentPageData(allData) {
        if (!Array.isArray(allData)) {
            throw new Error('数据必须是数组类型');
        }
        
        return allData.slice(this.state.startIndex, this.state.endIndex);
    }

    /**
     * 处理页码变更
     * @param {number} newPage - 新页码
     * @returns {boolean} 是否成功变更
     */
    handlePageChange(newPage) {
        if (newPage < 1 || newPage > this.state.totalPages) {
            return false;
        }
        
        if (newPage === this.state.currentPage) {
            return false;
        }
        
        // 重新计算分页状态
        this.calculatePagination(this.state.totalItems, newPage);
        
        // 触发页码变更事件
        if (this.events.onPageChange) {
            this.events.onPageChange(newPage);
        } else {
            console.error('没有页码变更事件处理器');
        }
        
        return true;
    }

    /**
     * 跳转到上一页
     * @returns {boolean}
     */
    goToPreviousPage() {
        return this.handlePageChange(this.state.currentPage - 1);
    }

    /**
     * 跳转到下一页
     * @returns {boolean}
     */
    goToNextPage() {
        return this.handlePageChange(this.state.currentPage + 1);
    }

    /**
     * 跳转到首页
     * @returns {boolean}
     */
    goToFirstPage() {
        return this.handlePageChange(1);
    }

    /**
     * 跳转到末页
     * @returns {boolean}
     */
    goToLastPage() {
        return this.handlePageChange(this.state.totalPages);
    }

    /**
     * 重置分页状态
     */
    reset() {
        this.state = this.initializeState();
    }

    /**
     * 获取当前分页状态
     * @returns {PaginationState}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 初始化响应式支持
     */
    initializeResponsiveSupport() {
        const { responsiveManager } = initializeResponsiveSystem();
        this.responsiveManager = responsiveManager;
        
        // 保存监听器函数引用以便清理
        this.responsiveConfigListener = (responsiveConfig) => {
            this.handleResponsiveConfigChange(responsiveConfig);
        };
        
        // 监听响应式配置变化
        this.responsiveManager.addListener(this.responsiveConfigListener);
        
        // 应用初始响应式配置
        const currentResponsiveConfig = this.responsiveManager.getCurrentConfig();
        this.applyResponsiveConfig(currentResponsiveConfig);
    }

    /**
     * 处理响应式配置变化
     * @param {Object} responsiveConfig - 新的响应式配置
     */
    handleResponsiveConfigChange(responsiveConfig) {
        this.applyResponsiveConfig(responsiveConfig);
        
        // 重新计算分页状态
        if (this.state.totalItems > 0) {
            this.calculatePagination(this.state.totalItems, this.state.currentPage);
        }
        
        // 触发配置变更事件
        if (this.events.onConfigChange) {
            this.events.onConfigChange(this.config, responsiveConfig);
        }
    }

    /**
     * 应用响应式配置
     * @param {Object} responsiveConfig - 响应式配置
     */
    applyResponsiveConfig(responsiveConfig) {
        if (!responsiveConfig) return;
        
        // 更新分页配置
        this.config.maxVisiblePages = responsiveConfig.maxVisiblePages;
        this.config.itemsPerPage = responsiveConfig.itemsPerPage;
        
        // 根据设备类型调整显示选项
        if (responsiveConfig.type === 'mobile') {
            // 移动端可能需要简化显示
            this.config.showLabels = responsiveConfig.showLabels;
        }
    }

    /**
     * 获取当前响应式配置
     * @returns {Object|null}
     */
    getCurrentResponsiveConfig() {
        return this.responsiveManager ? this.responsiveManager.getCurrentConfig() : null;
    }

    /**
     * 更新配置
     * @param {Partial<PaginationConfig>} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // 重新计算当前状态
        if (this.state.totalItems > 0) {
            this.calculatePagination(this.state.totalItems, this.state.currentPage);
        }
    }

    /**
     * 销毁分页控制器
     */
    destroy() {
        if (this.responsiveManager && this.responsiveConfigListener) {
            // 移除响应式配置监听器
            this.responsiveManager.removeListener(this.responsiveConfigListener);
        }
        
        // 清理所有引用，帮助垃圾回收
        this.responsiveManager = null;
        this.responsiveConfigListener = null;
        this.events = {};
        this.state = this.initializeState();
        this.config = null;
    }

    /**
     * 获取内存使用情况（调试用）
     * @returns {Object} 内存使用统计
     */
    getMemoryUsage() {
        return {
            stateSize: JSON.stringify(this.state).length,
            configSize: JSON.stringify(this.config).length,
            eventsCount: Object.keys(this.events).length,
            hasResponsiveManager: !!this.responsiveManager
        };
    }
}

/**
 * 分页计算工具函数
 */
export const PaginationUtils = {
    /**
     * 计算分页状态（独立函数版本）
     * @param {number} totalItems - 总项目数
     * @param {number} currentPage - 当前页码
     * @param {number} itemsPerPage - 每页项目数
     * @param {number} maxVisiblePages - 最大可见页码数
     * @returns {PaginationState}
     */
    calculatePaginationState(totalItems, currentPage, itemsPerPage = 20, maxVisiblePages = 5) {
        if (totalItems < 0) {
            throw new Error('总项目数不能为负数');
        }
        
        if (currentPage < 1) {
            currentPage = 1;
        }

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        
        const visiblePages = this.calculateVisiblePages(currentPage, totalPages, maxVisiblePages);
        
        return {
            currentPage,
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            visiblePages,
            hasEllipsis: totalPages > maxVisiblePages,
            hasPrevious: currentPage > 1,
            hasNext: currentPage < totalPages
        };
    },

    /**
     * 计算可见页码数组（独立函数版本）
     * @param {number} currentPage - 当前页码
     * @param {number} totalPages - 总页数
     * @param {number} maxVisible - 最大可见页码数
     * @returns {number[]}
     */
    calculateVisiblePages(currentPage, totalPages, maxVisible = 5) {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
};