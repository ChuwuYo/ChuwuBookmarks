import { createElement } from "./elements.js";

const setParentReferences = (items, parent) => {
	items.forEach((item) => {
		if (item.type === "folder") {
			item.parent = parent;
			if (item.children) setParentReferences(item.children, item);
		}
	});
};

const renderSidebar = (data, renderMainContent) => {
	const sidebar = document.getElementById("sidebar-folders");
	if (!sidebar) return;

	sidebar.innerHTML = "";
	const fragment = document.createDocumentFragment();

	const possibleRootNames = [
		"书签栏",
		"Bookmarks Bar",
		"收藏夹栏",
		"Bookmarks Toolbar",
		"其他收藏夹",
		"移动收藏夹",
	];
	const matchedRootFolders = data.filter(
		(item) => item.type === "folder" && possibleRootNames.includes(item.title),
	);

	if (matchedRootFolders.length === 1) {
		const rootFolder = matchedRootFolders[0];
		const folders = rootFolder.children.filter(
			(item) => item.type === "folder",
		);

		folders.forEach((item) => {
			item.parent = rootFolder;
			if (item.children) setParentReferences(item.children, item);
		});

		const folderElements = folders.map((item) => {
			const folderElement = createElement("folder", item, (e) => {
				e.stopPropagation();
				renderMainContent(item, true);
			});

			return folderElement;
		});

		folderElements.forEach((element) => {
			fragment.appendChild(element);
		});
	} else if (matchedRootFolders.length > 1) {
		matchedRootFolders.forEach((rootItem) => {
			if (rootItem.children) setParentReferences(rootItem.children, rootItem);

			const folderElement = createElement("folder", rootItem, (e) => {
				e.stopPropagation();
				renderMainContent(rootItem, true);
			});

			fragment.appendChild(folderElement);
		});
	}

	sidebar.appendChild(fragment);
};

export { createElement, renderSidebar, setParentReferences };
