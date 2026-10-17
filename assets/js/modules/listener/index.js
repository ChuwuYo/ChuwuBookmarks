import { initDeviceListeners } from "./device-listener.js";
import { initSearchListeners } from "./search-listener.js";
import { initTitleListeners } from "./title-listener.js";
import { initUIListeners } from "./ui-listener.js";

const initEventListeners = (debounceSearch) => {
	initDeviceListeners();
	initTitleListeners();
	initSearchListeners(debounceSearch);
	initUIListeners();
};

export { initEventListeners };
