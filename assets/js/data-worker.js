const ACTIONS = {
	LOAD_DATA: "loadData",
	LOAD_STRUCTURE: "loadStructure",
	LOAD_FULL_DATA: "loadFullData",
};

function fnv1aHash(str) {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return `00000000${(h >>> 0).toString(16)}`.slice(-8);
}

function convertStructureToBookmarks(structure) {
	if (!structure?.folders) {
		return null;
	}

	function convertFolder(folder) {
		const result = {
			type: "folder",
			title: folder.title,
			id: folder.id,
			_lazyLoad: true,
			_hasChildren: folder.hasChildren,
			_linkCount: folder.linkCount || 0,
			children: [],
		};

		if (folder.children && folder.children.length > 0) {
			result.children = folder.children.map(convertFolder);
		}

		return result;
	}

	return structure.folders.map(convertFolder);
}

function _mergeFullDataIntoStructure(structureData, fullData) {
	const fullDataMap = new Map();

	function buildMap(nodes) {
		nodes.forEach((node) => {
			if (node.id) {
				fullDataMap.set(node.id, node);
			}
			if (node.children) {
				buildMap(node.children);
			}
		});
	}
	buildMap(fullData);

	function fillChildren(nodes) {
		nodes.forEach((node) => {
			if (node._lazyLoad && node.id) {
				const fullNode = fullDataMap.get(node.id);
				if (fullNode?.children) {
					node.children = fullNode.children;
					node._lazyLoad = false;
				}
			}
			if (node.children) {
				fillChildren(node.children);
			}
		});
	}
	fillChildren(structureData);

	return structureData;
}

self.onmessage = async (event) => {
	const { action } = event.data;

	if (action === ACTIONS.LOAD_STRUCTURE) {
		const structureUrl = new URL("../../structure.json", self.location.href)
			.href;
		try {
			const response = await fetch(structureUrl);
			if (!response.ok) {
				self.postMessage({
					status: "structure_not_found",
					message: "structure.json not found, fallback to full load",
				});
				return;
			}
			const structure = await response.json();
			const bookmarksData = convertStructureToBookmarks(structure);

			if (!bookmarksData) {
				self.postMessage({
					status: "structure_not_found",
					message: "Invalid structure.json format",
				});
				return;
			}

			const hash = fnv1aHash(JSON.stringify(structure));

			self.postMessage({
				status: "structure_loaded",
				data: bookmarksData,
				structureVersion: structure.version || 1,
				generated: structure.generated,
				hash: hash,
			});
		} catch (error) {
			self.postMessage({
				status: "structure_not_found",
				message: `Failed to load structure.json: ${error.message}`,
			});
		}
	}

	if (action === ACTIONS.LOAD_FULL_DATA || action === ACTIONS.LOAD_DATA) {
		const bookmarksUrl = new URL("../../bookmarks.json", self.location.href)
			.href;
		try {
			const response = await fetch(bookmarksUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const bookmarks = await response.json();

			const dataString = JSON.stringify(bookmarks);
			const hash = fnv1aHash(dataString);

			self.postMessage({
				status: "success",
				data: bookmarks,
				hash: hash,
				isFullData: action === ACTIONS.LOAD_FULL_DATA,
			});
		} catch (error) {
			self.postMessage({
				status: "error",
				error: `Failed to load or parse bookmarks from ${bookmarksUrl}: ${error.message}`,
				isFullData: action === ACTIONS.LOAD_FULL_DATA,
			});
		}
	}
};
