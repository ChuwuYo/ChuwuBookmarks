import { createCard } from "../../../components/bm-card/bm-card.js";

const setParentReferences = (items, parent) => {
	items.forEach((item) => {
		if (item.type === "folder") {
			item.parent = parent;
			if (item.children) setParentReferences(item.children, item);
		}
	});
};

const renderSidebar = (data) => {
	const sidebar = document.getElementById("sidebar-folders");
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

		for (const item of folders)
			fragment.appendChild(createCard("folder", item));
	} else if (matchedRootFolders.length > 1) {
		matchedRootFolders.forEach((rootItem) => {
			if (rootItem.children) setParentReferences(rootItem.children, rootItem);

			fragment.appendChild(createCard("folder", rootItem));
		});
	}

	[...fragment.children].forEach((card, index) => {
		card.style.setProperty("--item-index", index);
	});
	sidebar.replaceChildren(fragment);
};

export { renderSidebar };
