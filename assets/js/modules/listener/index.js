import { initComponentListeners } from "./component-listener.js";
import { initTitleListeners } from "./title-listener.js";
import { initUIListeners } from "./ui-listener.js";

const initEventListeners = (debounceSearch) => {
	initTitleListeners();
	initComponentListeners(debounceSearch);
	initUIListeners();
};

export { initEventListeners };
