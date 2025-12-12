/**
 * 统一的 Web Worker 管理模块
 * 
 * - 单例模式管理 Worker 实例
 * - Worker 状态追踪
 * - 消息监听器的注册/注销机制
 * - 错误处理和自动重建
 */

// Worker 路径常量
const WORKER_PATHS = Object.freeze({
    SEARCH: 'assets/js/search-worker.js',
    DATA: 'assets/js/data-worker.js'
});

// Worker 状态枚举
const WorkerState = Object.freeze({
    IDLE: 'idle',
    RUNNING: 'running',
    TERMINATED: 'terminated',
    ERROR: 'error'
});

/**
 * Worker 包装器类
 * 提供对原生 Worker 的增强管理
 */
class WorkerWrapper {
    constructor(path, name) {
        this._path = path;
        this._name = name;
        this._worker = null;
        this._state = WorkerState.IDLE;
        this._messageListeners = new Set();
        this._errorListeners = new Set();
    }

    /**
     * 获取 Worker 实例，如果不存在则创建
     * @returns {Worker|null}
     */
    getInstance() {
        if (!this._isWorkerSupported()) {
            console.warn(`[WorkerManager] 浏览器不支持 Web Worker`);
            return null;
        }

        if (this._state === WorkerState.TERMINATED || !this._worker) {
            this._createWorker();
        }

        return this._worker;
    }

    /**
     * 发送消息到 Worker
     * @param {*} message - 要发送的消息
     * @returns {boolean} - 是否发送成功
     */
    postMessage(message) {
        const worker = this.getInstance();
        if (!worker) return false;
        
        try {
            worker.postMessage(message);
            this._state = WorkerState.RUNNING;
            return true;
        } catch (error) {
            console.error(`[WorkerManager] ${this._name} postMessage 失败:`, error);
            this._state = WorkerState.ERROR;
            return false;
        }
    }

    /**
     * 添加消息监听器
     * @param {Function} listener - 监听器函数
     */
    addMessageListener(listener) {
        if (typeof listener !== 'function') return;
        this._messageListeners.add(listener);
        
        // 如果 Worker 已存在，立即绑定
        if (this._worker) {
            this._worker.addEventListener('message', listener);
        }
    }

    /**
     * 移除消息监听器
     * @param {Function} listener - 监听器函数
     */
    removeMessageListener(listener) {
        this._messageListeners.delete(listener);
        if (this._worker) {
            this._worker.removeEventListener('message', listener);
        }
    }

    /**
     * 添加错误监听器
     * @param {Function} listener - 监听器函数
     */
    addErrorListener(listener) {
        if (typeof listener !== 'function') return;
        this._errorListeners.add(listener);
        
        if (this._worker) {
            this._worker.addEventListener('error', listener);
        }
    }

    /**
     * 移除错误监听器
     * @param {Function} listener - 监听器函数
     */
    removeErrorListener(listener) {
        this._errorListeners.delete(listener);
        if (this._worker) {
            this._worker.removeEventListener('error', listener);
        }
    }

    /**
     * 终止 Worker
     */
    terminate() {
        if (this._worker) {
            this._worker.terminate();
            this._worker = null;
            this._state = WorkerState.TERMINATED;
        }
    }

    /**
     * 重启 Worker（终止后重新创建）
     * @returns {Worker|null}
     */
    restart() {
        this.terminate();
        return this.getInstance();
    }

    /**
     * 获取当前状态
     * @returns {string}
     */
    getState() {
        return this._state;
    }

    /**
     * 检查 Worker 是否可用
     * @returns {boolean}
     */
    isAvailable() {
        return this._worker !== null && this._state !== WorkerState.TERMINATED;
    }

    // ========== 私有方法 ==========

    _isWorkerSupported() {
        return typeof Worker !== 'undefined';
    }

    _createWorker() {
        try {
            this._worker = new Worker(this._path);
            this._state = WorkerState.IDLE;
            
            // 重新绑定所有已注册的监听器
            this._messageListeners.forEach(listener => {
                this._worker.addEventListener('message', listener);
            });
            
            this._errorListeners.forEach(listener => {
                this._worker.addEventListener('error', listener);
            });

            // 添加默认错误处理
            this._worker.addEventListener('error', (error) => {
                console.error(`[WorkerManager] ${this._name} 发生错误:`, error);
                this._state = WorkerState.ERROR;
            });

        } catch (error) {
            console.error(`[WorkerManager] 创建 ${this._name} 失败:`, error);
            this._worker = null;
            this._state = WorkerState.ERROR;
        }
    }
}

// ========== Worker 实例管理 ==========

const workers = {
    search: new WorkerWrapper(WORKER_PATHS.SEARCH, 'SearchWorker'),
    data: new WorkerWrapper(WORKER_PATHS.DATA, 'DataWorker')
};

// ========== 公共 API ==========

/**
 * 获取搜索 Worker 实例
 * @returns {Worker|null}
 */
const getSearchWorker = () => workers.search.getInstance();

/**
 * 获取数据处理 Worker 实例
 * @returns {Worker|null}
 */
const getDataWorker = () => workers.data.getInstance();

/**
 * 获取搜索 Worker 包装器（用于高级操作）
 * @returns {WorkerWrapper}
 */
const getSearchWorkerWrapper = () => workers.search;

/**
 * 获取数据 Worker 包装器（用于高级操作）
 * @returns {WorkerWrapper}
 */
const getDataWorkerWrapper = () => workers.data;

/**
 * 终止搜索 Worker
 */
const terminateSearchWorker = () => workers.search.terminate();

/**
 * 终止数据处理 Worker
 */
const terminateDataWorker = () => workers.data.terminate();

/**
 * 终止所有 Worker
 */
const terminateAllWorkers = () => {
    workers.search.terminate();
    workers.data.terminate();
};

/**
 * 重启所有 Worker
 */
const restartAllWorkers = () => {
    workers.search.restart();
    workers.data.restart();
};

/**
 * 检查 Worker 支持情况
 * @returns {boolean}
 */
const isWorkerSupported = () => typeof Worker !== 'undefined';

export {
    // Worker 实例获取
    getSearchWorker,
    getDataWorker,
    
    // Worker 包装器获取（高级用法）
    getSearchWorkerWrapper,
    getDataWorkerWrapper,
    
    // 生命周期管理
    terminateSearchWorker,
    terminateDataWorker,
    terminateAllWorkers,
    restartAllWorkers,
    
    // 工具函数
    isWorkerSupported,
    
    // 常量导出
    WorkerState,
    WORKER_PATHS
};
