import { createCard } from "../../../components/bm-card/bm-card.js";
import { waitForFullData } from "../loader/index.js";
import { isSidebarOverlay } from "../utils/viewport.js";
import { folderErrorMessage, loadingMessage } from "./message.js";
import { updateSidebarState } from "./sidebar-state.js";
import { showView, updateView } from "./view.js";

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

const folderCards = (folder) => {
	const children = folder.children ?? [];
	const cards = (type) =>
		children.flatMap((item, index) => {
			if ((item.type === "folder") !== (type === "folder")) return [];
			const card = createCard(type, item);
			card.style.setProperty("--item-index", index);
			return [card];
		});
	return [...cards("folder"), ...cards("bookmark")];
};

const renderMainContent = (folder, fromSidebar = false) => {
	const view = showView();

	if (fromSidebar && isSidebarOverlay()) {
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

		if (!folder._lazyLoad || !folder.id) {
			updateView(view, { content: folderCards(folder), breadcrumbs: [crumbs] });
			return;
		}

		const loading = loadingMessage(`正在加载「${folder.title}」...`);
		if (!updateView(view, { content: [loading], breadcrumbs: [crumbs] }))
			return;

		const fullFolder = findFolderById(
			folder.id,
			await waitForFullData(),
			folder.title,
		);
		if (fullFolder) {
			Object.assign(folder, fullFolder);
			folder._lazyLoad = false;
		}
		updateView(view, {
			content: fullFolder
				? folderCards(folder)
				: [folderErrorMessage(folder.title)],
		});
	});
};

export { renderMainContent };
