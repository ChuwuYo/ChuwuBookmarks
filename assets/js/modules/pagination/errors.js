/**
 * 分页错误处理模块
 */

import { PAGINATION_CONSTANTS } from "../utils/constants.js";

/**
 * 分页错误类
 */
export class PaginationError extends Error {
	/**
	 * 构造函数
	 * @param {string} message - 错误消息
	 * @param {string} code - 错误代码
	 */
	constructor(message, code) {
		super(message);
		this.name = "PaginationError";
		this.code = code;
	}
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
	INVALID_PAGE: "INVALID_PAGE",
	INVALID_PAGE_SIZE: "INVALID_PAGE_SIZE",
	INVALID_TOTAL_ITEMS: "INVALID_TOTAL_ITEMS",
	RENDER_FAILED: "RENDER_FAILED",
	EVENT_BINDING_FAILED: "EVENT_BINDING_FAILED",
	DATA_TYPE_ERROR: "DATA_TYPE_ERROR",
	DOM_NOT_FOUND: "DOM_NOT_FOUND",
	CONTROLLER_NOT_INITIALIZED: "CONTROLLER_NOT_INITIALIZED",
};

/**
 * 错误处理工具函数
 */
export const ErrorHandler = {
	/**
	 * 验证页码
	 * @param {number} page - 页码
	 * @param {number} totalPages - 总页数
	 * @throws {PaginationError}
	 */
	validatePage(page, totalPages) {
		if (typeof page !== "number" || !Number.isInteger(page)) {
			throw new PaginationError("页码必须是整数", ERROR_CODES.INVALID_PAGE);
		}

		if (page < 1) {
			throw new PaginationError("页码不能小于1", ERROR_CODES.INVALID_PAGE);
		}

		if (totalPages > 0 && page > totalPages) {
			throw new PaginationError(
				`页码不能大于总页数${totalPages}`,
				ERROR_CODES.INVALID_PAGE,
			);
		}
	},

	/**
	 * 验证每页项目数
	 * @param {number} pageSize - 每页项目数
	 * @throws {PaginationError}
	 */
	validatePageSize(pageSize) {
		if (typeof pageSize !== "number" || !Number.isInteger(pageSize)) {
			throw new PaginationError(
				"每页项目数必须是整数",
				ERROR_CODES.INVALID_PAGE_SIZE,
			);
		}

		if (pageSize < 1) {
			throw new PaginationError(
				"每页项目数不能小于1",
				ERROR_CODES.INVALID_PAGE_SIZE,
			);
		}

		if (pageSize > PAGINATION_CONSTANTS.MAX_PAGE_SIZE) {
			throw new PaginationError(
				`每页项目数不能大于${PAGINATION_CONSTANTS.MAX_PAGE_SIZE}`,
				ERROR_CODES.INVALID_PAGE_SIZE,
			);
		}
	},

	/**
	 * 验证总项目数
	 * @param {number} totalItems - 总项目数
	 * @throws {PaginationError}
	 */
	validateTotalItems(totalItems) {
		if (typeof totalItems !== "number" || !Number.isInteger(totalItems)) {
			throw new PaginationError(
				"总项目数必须是整数",
				ERROR_CODES.INVALID_TOTAL_ITEMS,
			);
		}

		if (totalItems < 0) {
			throw new PaginationError(
				"总项目数不能为负数",
				ERROR_CODES.INVALID_TOTAL_ITEMS,
			);
		}
	},

	/**
	 * 验证数据数组
	 * @param {Array} data - 数据数组
	 * @throws {PaginationError}
	 */
	validateDataArray(data) {
		if (!Array.isArray(data)) {
			throw new PaginationError(
				"数据必须是数组类型",
				ERROR_CODES.DATA_TYPE_ERROR,
			);
		}
	},

	/**
	 * 验证DOM元素
	 * @param {HTMLElement} element - DOM元素
	 * @param {string} elementName - 元素名称（用于错误消息）
	 * @throws {PaginationError}
	 */
	validateDOMElement(element, elementName = "元素") {
		if (!element || !(element instanceof HTMLElement)) {
			throw new PaginationError(
				`${elementName}必须是有效的HTML元素`,
				ERROR_CODES.DOM_NOT_FOUND,
			);
		}
	},

	/**
	 * 验证控制器实例
	 * @param {Object} controller - 控制器实例
	 * @throws {PaginationError}
	 */
	validateController(controller) {
		if (!controller || typeof controller !== "object") {
			throw new PaginationError(
				"分页控制器不能为空",
				ERROR_CODES.CONTROLLER_NOT_INITIALIZED,
			);
		}

		if (typeof controller.calculatePagination !== "function") {
			throw new PaginationError(
				"控制器缺少必要的方法",
				ERROR_CODES.CONTROLLER_NOT_INITIALIZED,
			);
		}
	},

	/**
	 * 安全执行函数，捕获并处理错误
	 * @param {Function} fn - 要执行的函数
	 * @param {*} defaultValue - 出错时的默认返回值
	 * @param {string} context - 执行上下文（用于日志）
	 * @returns {*}
	 */
	safeExecute(fn, defaultValue = null, context = "分页操作") {
		try {
			return fn();
		} catch (error) {
			console.error(`${context}出错:`, error);

			// 记录错误到性能监控（如果可用）
			if (window.globalPerformanceMonitor) {
				window.globalPerformanceMonitor.recordError(error, context);
			}

			return defaultValue;
		}
	},

	/**
	 * 创建错误恢复函数
	 * @param {Function} primaryFn - 主要执行函数
	 * @param {Function} fallbackFn - 降级函数
	 * @param {string} context - 执行上下文
	 * @returns {Function}
	 */
	createRecoveryFunction(primaryFn, fallbackFn, context = "操作") {
		return (...args) => {
			try {
				return primaryFn(...args);
			} catch (error) {
				console.warn(`${context}主函数执行失败，尝试降级方案:`, error);

				try {
					return fallbackFn(...args);
				} catch (fallbackError) {
					console.error(`${context}降级方案也失败:`, fallbackError);
					return null;
				}
			}
		};
	},

	/**
	 * 批量验证参数
	 * @param {Array} validations - 验证配置数组
	 * @throws {PaginationError}
	 */
	batchValidate(validations) {
		const errors = [];

		validations.forEach(({ value, validator, name }) => {
			try {
				validator(value);
			} catch (error) {
				errors.push(`${name}: ${error.message}`);
			}
		});

		if (errors.length > 0) {
			throw new PaginationError(
				`参数验证失败: ${errors.join(", ")}`,
				ERROR_CODES.DATA_TYPE_ERROR,
			);
		}
	},

};
