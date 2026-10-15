/**
 * 主内容区渲染模块
 */

import {
	getFullBookmarksData,
	isFullDataReady,
	waitForFullData,
} from "../loader/index.js";
import { RENDER_CONSTANTS } from "../utils/constants.js";
import {
	checkBreadcrumbsScroll,
	getDeviceType,
	shouldCollapseSidebar,
	updateSidebarState,
} from "./device.js";
import { createElement } from "./elements.js";
import { loadIconsForElements } from "./icon-loader.js";

// 避免循环依赖，renderHome 将通过参数传递

let breadcrumbsScrollHandler = null;

/**
 * 从完整数据中查找指定ID的文件夹
 * @param {string} folderId - 要查找的文件夹ID
 * @param {Array} data - 完整书签数据
 * @returns {Object|null} - 找到的文件夹或null
 */
const findFolderById = (folderId, data) => {
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

	return search(data);
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

		// 在新的多根文件夹模式下，不过滤根文件夹，让它们显示在面包屑中
		const filteredBreadcrumbs = breadcrumbPath;

		const breadcrumbFragment = document.createDocumentFragment();

		const breadIcon = document.createElement("span");
		breadIcon.textContent = "🍞";
		breadIcon.className = "breadcrumb-icon";

		const homeLink = document.createElement("button");
		homeLink.type = "button";
		homeLink.className = "breadcrumb-item";
		homeLink.textContent = "主页";
		homeLink.setAttribute("tabindex", "0");
		homeLink.setAttribute("role", "button");
		homeLink.setAttribute("aria-label", "返回主页");

		const homeLinkHandler = (e) => {
			if (
				e.type === "click" ||
				(e.type === "keydown" && (e.key === "Enter" || e.key === " "))
			) {
				e.preventDefault();
				e.stopPropagation();
				if (renderHomeFn) renderHomeFn();
			}
		};

		homeLink.addEventListener("click", homeLinkHandler);
		homeLink.addEventListener("keydown", homeLinkHandler);

		// 先添加🍞图标，再添加主页按钮
		breadcrumbFragment.appendChild(breadIcon);
		breadcrumbFragment.appendChild(homeLink);

		if (filteredBreadcrumbs.length > 0) {
			const breadcrumbElements = filteredBreadcrumbs.map(
				(crumb, index, arr) => {
					const fragment = document.createDocumentFragment();

					const separator = document.createElement("span");
					separator.textContent = " > ";
					separator.className = "breadcrumb-separator";
					fragment.appendChild(separator);

					const crumbElement = document.createElement("button");
					crumbElement.textContent = crumb.title;
					crumbElement.className = "breadcrumb-item";
					crumbElement.type = "button";

					if (index < arr.length - 1) {
						crumbElement.setAttribute("tabindex", "0");
						crumbElement.setAttribute("role", "button");
						crumbElement.setAttribute("aria-label", `导航到${crumb.title}`);

						const crumbHandler = (e) => {
							if (
								e.type === "click" ||
								(e.type === "keydown" && (e.key === "Enter" || e.key === " "))
							) {
								e.preventDefault();
								e.stopPropagation();
								renderMainContent(crumb, true, renderHomeFn);
							}
						};

						crumbElement.addEventListener("click", crumbHandler);
						crumbElement.addEventListener("keydown", crumbHandler);
					}

					fragment.appendChild(crumbElement);
					return fragment;
				},
			);

			breadcrumbElements.forEach((element) => {
				breadcrumbFragment.appendChild(element);
			});
		}

		breadcrumbs.appendChild(breadcrumbFragment);
		checkBreadcrumbsScroll();

		if (breadcrumbsScrollHandler) {
			breadcrumbs.removeEventListener("scroll", breadcrumbsScrollHandler);
		}

		// 用于 requestAnimationFrame 的 ID
		let breadcrumbRafId = null;

		breadcrumbsScrollHandler = () => {
			// 使用 requestAnimationFrame 优化滚动 UI 更新
			if (breadcrumbRafId) return;
			breadcrumbRafId = requestAnimationFrame(() => {
				breadcrumbRafId = null;

				const scrollLeft = breadcrumbs.scrollLeft;
				const maxScroll = breadcrumbs.scrollWidth - breadcrumbs.clientWidth;
				if (maxScroll <= 0) {
					breadcrumbs.style.maskImage = "";
					breadcrumbs.classList.remove("at-end");
					breadcrumbs.classList.remove("at-start");
					return;
				}

				const maskValue = `linear-gradient(to right,
                    transparent,
                    black ${Math.min(scrollLeft + RENDER_CONSTANTS.BREADCRUMB_MASK_OFFSET, RENDER_CONSTANTS.BREADCRUMB_MASK_OFFSET)}px,
                    black calc(100% - ${Math.max(RENDER_CONSTANTS.BREADCRUMB_MASK_OFFSET - (maxScroll - scrollLeft), 0)}px),
                    transparent
                )`;
				breadcrumbs.style.maskImage = maskValue;

				breadcrumbs.classList.toggle(
					"at-end",
					scrollLeft >=
						maxScroll - RENDER_CONSTANTS.BREADCRUMB_SCROLL_THRESHOLD,
				);
				breadcrumbs.classList.toggle(
					"at-start",
					scrollLeft <= RENDER_CONSTANTS.BREADCRUMB_SCROLL_THRESHOLD,
				);
			});
		};

		breadcrumbs.addEventListener("scroll", breadcrumbsScrollHandler, {
			passive: true,
		});
		breadcrumbsScrollHandler();

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
			const fullFolder = findFolderById(folder.id, fullData);

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

				element.setAttribute("tabindex", "0");
				element.setAttribute("role", "button");
				element.setAttribute("aria-label", `文件夹: ${item.title}`);

				element.addEventListener("keydown", (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						renderMainContent(item, false, renderHomeFn);
					}
				});

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
