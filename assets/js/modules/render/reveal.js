const LOADING_CLASS = "app-loading";
const ENTERING_CLASS = "app-entering";
const ENTER_DURATION = 200;

let revealed = false;

const revealApp = () => {
	if (revealed) return;
	revealed = true;
	const root = document.documentElement;
	if (!root.classList.contains(LOADING_CLASS)) return;
	requestAnimationFrame(() => {
		root.classList.add(ENTERING_CLASS);
		root.classList.remove(LOADING_CLASS);
		setTimeout(
			() => root.classList.remove(ENTERING_CLASS),
			ENTER_DURATION + 50,
		);
	});
};

export { revealApp };
