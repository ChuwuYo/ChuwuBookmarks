/**
 * 分页模块入口文件
 */

export { PaginationController, PaginationUtils } from './controller.js';
export { PaginationRenderer, PaginationRenderUtils } from './renderer.js';
export { PaginationError, ERROR_CODES, ErrorHandler } from './errors.js';
export { 
    ResponsiveConfigManager, 
    SidebarStateMonitor, 
    PaginationCenteringCalculator, 
    TouchOptimizer,
    initializeResponsiveSystem,
    getResponsiveManager,
    getSidebarMonitor,
    cleanupResponsiveSystem,
    RESPONSIVE_BREAKPOINTS
} from './responsive.js';