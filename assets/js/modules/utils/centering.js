/**
 * 统一居中系统 - 管理所有需要响应式居中的UI元素
 * 
 * 该模块提供统一的居中管理API，支持移动端和桌面端的不同居中策略
 * 自动响应设备类型变化、侧栏状态变化和窗口大小变化
 */

// 导入管理器类
import { UniversalCenteringManager } from './centering/centering-manager.js';

// 创建单例实例
let centeringManagerInstance = null;

/**
 * 获取统一居中管理器单例
 * @returns {UniversalCenteringManager} 管理器实例
 */
export function getCenteringManager() {
    if (!centeringManagerInstance || centeringManagerInstance.isDestroyed) {
        centeringManagerInstance = new UniversalCenteringManager();
        centeringManagerInstance.initialize();
    }
    return centeringManagerInstance;
}
