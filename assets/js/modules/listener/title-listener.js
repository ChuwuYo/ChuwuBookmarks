/**
 * 标题变更彩蛋事件监听模块
 */

/**
 * 初始化标题变更相关事件监听
 */
const initTitleListeners = () => {
	const originalTitle = document.title;
	const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

	// 鼠标离开页面时触发的事件
	document.addEventListener("mouseout", function handleMouseOut(e) {
		// 仅当鼠标离开窗口时进行处理
		if (e.relatedTarget === null) {
			document.title = newTitle;
		}
	});

	// 鼠标回到页面时触发的事件
	document.addEventListener("mouseover", function handleMouseOver() {
		document.title = originalTitle;
	});
};

export { initTitleListeners };
