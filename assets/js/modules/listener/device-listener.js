import { handleDeviceView } from "../render/device.js";
import { DEBOUNCE_THROTTLE_CONSTANTS } from "../utils/constants.js";
import { debounce } from "../utils/index.js";

const initDeviceListeners = () => {
	const handleResize = debounce(() => {
		requestAnimationFrame(() => {
			handleDeviceView();
		});
	}, DEBOUNCE_THROTTLE_CONSTANTS.WINDOW_RESIZE_DEBOUNCE_MS);

	window.addEventListener("resize", handleResize);

	handleResize();
};

export { initDeviceListeners };
