/**
 * 主内容区渲染模块
 */

import "../../../components/bm-breadcrumbs/bm-breadcrumbs.js";
import {
	getFullBookmarksData,
	isFullDataReady,
	waitForFullData,
} from "../loader/index.js";
import {
	getDeviceType,
	shouldCollapseSidebar,
	updateSidebarState,
} from "./device.js";
import { createElement } from "./elements.js";
import { loadIconsForElements } from "./icon-loader.js";

// 避免循环依赖，renderHome 将通过参数传递

/**
 * 从完整数据中查找指定ID的文件夹
 * @param {string} folderId - 要查找的文件夹ID
 * @param {Array} data - 完整书签数据
 * @returns {Object|null} - 找到的文件夹或null
 */
/**
 * structure.json 的文件夹 id 是层级下标路径（如 "0_1_0"），而 bookmarks.json
 * 的节点通常没有 id：先按 id 查找，找不到时按路径在文件夹中定位，并核对标题。
 */
const findFolderByPath = (folderId, title, data) => {
	if (!/^\d+(?:_\d+)*$/.test(folderId)) return null;
	const path = folderId.split("_").map(Number);
	const walk = (pick) => {
		let nodes = data;
		let node = null;
		let parent = null;
		for (const index of path) {
			const candidates = pick(nodes ?? []);
			if (!candidates[index]) return null;
			parent = node;
			node = candidates[index];
			nodes = node.children;
		}
		if (title !== undefined && node.title !== title) return null;
		node.parent = parent;
		return node;
	};
	const foldersOnly = (nodes) => nodes.filter((n) => n.type === "folder");
	return walk(foldersOnly) ?? walk((nodes) => nodes);
};

const findFolderById = (folderId, data, title) => {
	if (!data || !folderId) return null;

	const search = (nodes, parent = null) => {
		for (const node of nodes) {
			if (node.id === folderId) {
				// 保持父引用
				node.parent = parent;
				return node;
			}
			if (node.children) {
				const found = search(node.children, node);
				if (found) return found;
			}
		}
		return null;
	};

	return search(data) ?? findFolderByPath(folderId, title, data);
};

/**
 * 显示加载中状态
 */
const showFolderLoading = (content, folderTitle) => {
	const wrapper = document.createElement("div");
	wrapper.className = "folder-loading";

	const spinner = document.createElement("div");
	spinner.className = "loading-spinner folder-loading-spinner";

	const text = document.createElement("p");
	text.className = "folder-loading-text";
	text.textContent = `正在加载「${folderTitle}」...`;

	wrapper.append(spinner, text);
	content.innerHTML = "";
	content.appendChild(wrapper);
};

// 渲染主内容区
const renderMainContent = async (
	folder,
	fromSidebar = false,
	renderHomeFn = null,
) => {
	// 无论.home-message在哪里，渲染新内容前都必须移除它
	const existingHomeMessage = document.querySelector(".home-message");
	if (existingHomeMessage) {
		existingHomeMessage.remove();
	}

	const content = document.getElementById("content");
	const breadcrumbs = document.getElementById("breadcrumbs");
	if (!content || !breadcrumbs) return;

	content.innerHTML = breadcrumbs.innerHTML = "";

	if (fromSidebar && shouldCollapseSidebar()) {
		updateSidebarState(document.querySelector(".sidebar"), true);
	}

	requestAnimationFrame(async () => {
		const breadcrumbPath = [];
		let current = folder;
		while (current) {
			breadcrumbPath.unshift(current);
			current = current.parent;
		}

		const crumbs = document.createElement("bm-breadcrumbs");
		crumbs.path = breadcrumbPath;
		crumbs.addEventListener("bm-navigate", ({ detail: { index } }) => {
			if (index < 0) renderHomeFn?.();
			else renderMainContent(breadcrumbPath[index], true, renderHomeFn);
		});
		breadcrumbs.replaceChildren(crumbs);

		// 检查是否是懒加载文件夹（只有目录结构，没有完整内容）
		if (folder._lazyLoad && folder.id) {
			// 显示加载中状态
			showFolderLoading(content, folder.title);

			// 等待完整数据加载
			if (!isFullDataReady()) {
				await waitForFullData();
			}

			// 从完整数据中获取文件夹
			const fullData = getFullBookmarksData();
			const fullFolder = findFolderById(folder.id, fullData, folder.title);

			if (fullFolder) {
				// 用完整数据替换懒加载文件夹
				Object.assign(folder, fullFolder);
				folder._lazyLoad = false;
			} else {
				const errorWrapper = document.createElement("div");
				errorWrapper.className = "folder-error";

				const errorText = document.createElement("p");
				errorText.className = "folder-error-text";
				errorText.textContent = `无法加载「${folder.title}」的内容`;

				errorWrapper.appendChild(errorText);
				content.innerHTML = "";
				content.appendChild(errorWrapper);
				return;
			}
		}

		if (folder.children && folder.children.length > 0) {
			const folderItems = [];
			const bookmarkItems = [];

			folder.children.forEach((item, index) => {
				if (item.type === "folder") {
					folderItems.push({ item, index });
				} else {
					bookmarkItems.push({ item, index });
				}
			});

			const contentFragment = document.createDocumentFragment();

			folderItems.forEach(({ item, index }) => {
				const element = createElement("folder", item, () =>
					renderMainContent(item, false, renderHomeFn),
				);

				element.style.setProperty("--item-index", index);
				contentFragment.appendChild(element);
			});

			const bookmarkElements = [];
			bookmarkItems.forEach(({ item, index }) => {
				const element = createElement("bookmark", item, null);
				element.style.setProperty("--item-index", index);
				contentFragment.appendChild(element);
				bookmarkElements.push(element);
			});

			content.appendChild(contentFragment);

			// 在元素添加到 DOM 后，立即加载图标
			loadIconsForElements(bookmarkElements);

			const deviceType = getDeviceType();
			if (deviceType === "mobile") {
				content.classList.add("mobile-content-layout");
			} else {
				content.classList.remove("mobile-content-layout");
			}
		}
	});
};

export { renderMainContent };
