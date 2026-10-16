/**
 * 工具函数模块
 */

const debounce = (fn, delay) => {
	let timeout;
	const debounced = (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
	debounced.cancel = () => clearTimeout(timeout);
	return debounced;
};

export { debounce };
