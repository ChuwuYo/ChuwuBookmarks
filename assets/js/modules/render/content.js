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

const renderMainContent = async (
	folder,
	fromSidebar = false,
	renderHomeFn = null,
) => {
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

		if (folder._lazyLoad && folder.id) {
			showFolderLoading(content, folder.title);

			if (!isFullDataReady()) {
				await waitForFullData();
			}

			const fullData = getFullBookmarksData();
			const fullFolder = findFolderById(folder.id, fullData, folder.title);

			if (fullFolder) {
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
