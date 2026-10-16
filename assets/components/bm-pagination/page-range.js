/**
 * 分页页码计算（纯函数，可在 Node 中单测）
 */

/** @typedef {number | "ellipsis"} PageItem */

/**
 * 计算要显示的页码序列。
 * 以当前页为中心显示 `windowSize` 个连续页码（靠近首尾时整体平移），
 * 并始终显示首页和末页；中间缺页用 "ellipsis" 表示。
 *
 * @param {number} current 当前页（从 1 开始）
 * @param {number} total 总页数
 * @param {number} [windowSize=3] 连续页码数量
 * @returns {PageItem[]}
 */
export const getPageRange = (current, total, windowSize = 3) => {
	if (!Number.isFinite(total) || total < 1) return [];
	const page = Math.min(Math.max(1, Math.trunc(current) || 1), total);
	const size = Math.min(Math.max(1, windowSize), total);

	let start = Math.max(1, page - Math.floor((size - 1) / 2));
	const end = Math.min(total, start + size - 1);
	start = Math.max(1, end - size + 1);

	const items = [];
	if (start > 1) {
		items.push(1);
		if (start > 2) items.push("ellipsis");
	}
	for (let i = start; i <= end; i++) items.push(i);
	if (end < total) {
		if (end < total - 1) items.push("ellipsis");
		items.push(total);
	}
	return items;
};
