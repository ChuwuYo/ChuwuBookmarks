/**
 * 条目元素工厂：侧边栏、主内容区与搜索结果共用 <bm-card>
 */

import { createCard } from "../../../components/bm-card/bm-card.js";

/**
 * 创建文件夹或书签条目
 * @param {'folder'|'bookmark'} type 元素类型
 * @param {Object} item 书签或文件夹数据
 * @param {Function|null} onOpen 打开文件夹时调用，参数为触发的原始事件
 * @returns {HTMLElement}
 */
const createElement = (type, item, onOpen) => {
	const card = createCard(type, item);
	if (onOpen) {
		card.addEventListener("bm-open-folder", (event) =>
			onOpen(event.detail.originalEvent),
		);
	}
	return card;
};

export { createElement };
