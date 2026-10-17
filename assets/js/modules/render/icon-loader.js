const displayLoadedIcon = (img, icon) => {
	if (img.naturalWidth > 1 && img.naturalHeight > 1) {
		icon.classList.add("bookmark-icon--img-loaded");
		img.classList.add("is-loaded");
		return true;
	}
	return false;
};

const handleIconLoadError = (img, icon, retryCount = 0) => {
	const MAX_RETRIES = 10;

	if (retryCount > MAX_RETRIES) {
		icon.classList.remove("bookmark-icon--img-loaded");
		img.remove();
		return;
	}

	const iconUrlsJson = img.dataset.iconUrls;

	if (!iconUrlsJson) {
		icon.classList.remove("bookmark-icon--img-loaded");
		img.remove();
		return;
	}

	try {
		const iconUrls = JSON.parse(iconUrlsJson);
		const currentIndex = parseInt(img.dataset.currentIndex || "0", 10);
		const nextIndex = currentIndex + 1;

		if (nextIndex < iconUrls.length) {
			img.dataset.currentIndex = nextIndex.toString();

			const handleLoad = function () {
				if (!displayLoadedIcon(this, icon)) {
					// 使用 setTimeout 打破同步递归链，防止栈溢出
					setTimeout(() => handleIconLoadError(this, icon, retryCount + 1), 0);
				}
			};

			img.addEventListener("load", handleLoad, { once: true });
			img.addEventListener(
				"error",
				() => {
					setTimeout(() => handleIconLoadError(img, icon, retryCount + 1), 0);
				},
				{ once: true },
			);

			icon.classList.remove("bookmark-icon--img-loaded");
			img.classList.remove("is-loaded");
			img.src = iconUrls[nextIndex];

			if (img.complete) {
				if (img.naturalHeight === 0) {
					setTimeout(() => handleIconLoadError(img, icon, retryCount + 1), 0);
				} else {
					handleLoad.call(img);
				}
			}
		} else {
			icon.classList.remove("bookmark-icon--img-loaded");
			img.remove();
		}
	} catch (_error) {
		icon.classList.remove("bookmark-icon--img-loaded");
		img.remove();
	}
};

// Google S2 在中国无法访问，favicon.im 排在前面
const getSortedIconUrls = (img) => {
	const iconUrlsJson = img.dataset.iconUrls;
	let iconUrls = [];

	if (iconUrlsJson) {
		try {
			iconUrls = JSON.parse(iconUrlsJson);
		} catch (_e) {
			iconUrls = [img.src];
		}
	} else {
		iconUrls = [img.src];
	}

	return iconUrls.sort((a, b) => {
		const aIsFavicon = a.includes("favicon.im");
		const bIsFavicon = b.includes("favicon.im");
		if (aIsFavicon && !bIsFavicon) return -1;
		if (!aIsFavicon && bIsFavicon) return 1;
		return 0;
	});
};

const loadIcon = (img, icon) => {
	if (!img?.src) return;

	const iconUrls = getSortedIconUrls(img);
	img.dataset.iconUrls = JSON.stringify(iconUrls);
	img.dataset.currentIndex = "0";
	icon.classList.remove("bookmark-icon--img-loaded");
	img.classList.remove("is-loaded");

	const handleLoad = function () {
		if (!displayLoadedIcon(this, icon)) {
			// 使用 setTimeout 打破同步递归链，防止栈溢出
			setTimeout(() => handleIconLoadError(this, icon, 0), 0);
		}
	};

	img.addEventListener("load", handleLoad, { once: true });
	img.addEventListener(
		"error",
		() => {
			setTimeout(() => handleIconLoadError(img, icon, 0), 0);
		},
		{ once: true },
	);

	img.src = iconUrls[0];

	if (img.complete) {
		if (img.naturalHeight === 0) {
			setTimeout(() => handleIconLoadError(img, icon, 0), 0);
		} else {
			handleLoad.call(img);
		}
	}
};

const loadIconsForElements = (bookmarkElements) => {
	bookmarkElements.forEach((element) => {
		const iconContainer = element.querySelector(".bookmark-icon");
		const img = iconContainer?.querySelector("img.bookmark-icon-img");
		if (iconContainer && img) {
			loadIcon(img, iconContainer);
		}
	});
};

export { loadIcon, loadIconsForElements };
