const initTitleListeners = () => {
	const originalTitle = document.title;
	const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

	document.addEventListener("mouseout", function handleMouseOut(e) {
		if (e.relatedTarget === null) {
			document.title = newTitle;
		}
	});

	document.addEventListener("mouseover", function handleMouseOver() {
		document.title = originalTitle;
	});
};

export { initTitleListeners };
