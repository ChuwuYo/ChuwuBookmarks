import { initSearchListeners } from "./search-listener.js";
import { initTitleListeners } from "./title-listener.js";
import { initUIListeners } from "./ui-listener.js";

const initEventListeners = (debounceSearch) => {
	initTitleListeners();
	initSearchListeners(debounceSearch);
	initUIListeners();
};

export { initEventListeners };
