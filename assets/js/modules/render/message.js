const centeredMessage = (className) => {
	const message = document.createElement("div");
	message.className = `centered-message ${className} centered-element vertical-center`;
	return message;
};

const line = (className, text) => {
	const el = document.createElement("div");
	el.className = className;
	el.textContent = text;
	return el;
};

const loadingMessage = (text) => {
	const loading = document.createElement("div");
	loading.className = "loading";
	loading.setAttribute("role", "status");

	const spinner = document.createElement("div");
	spinner.className = "loading-spinner";
	spinner.setAttribute("aria-hidden", "true");

	const label = document.createElement("p");
	label.className = "loading-text";
	label.textContent = text;

	loading.append(spinner, label);
	return loading;
};

const dataErrorMessage = (error) => {
	const message = centeredMessage("error-message");
	message.setAttribute("role", "alert");
	message.setAttribute("aria-live", "assertive");
	message.append(
		line("chinese-text message-title", "加载书签数据失败"),
		line(
			"english-text message-subtitle",
			"请确保 bookmarks.json 文件存在且格式正确",
		),
		line(
			"english-text message-detail",
			`错误详情: ${error?.message || error || "未知错误"}`,
		),
	);
	return message;
};

const searchUnavailableMessage = () => {
	const message = centeredMessage("error-message");
	message.setAttribute("role", "alert");
	message.textContent = "无法启动搜索线程，搜索不可用";
	return message;
};

const noResultsMessage = () => {
	const message = centeredMessage("no-results");
	message.textContent = "未找到匹配的书签";
	return message;
};

const folderErrorMessage = (title) => {
	const wrapper = document.createElement("div");
	wrapper.className = "folder-error";
	wrapper.setAttribute("role", "alert");
	const text = document.createElement("p");
	text.className = "folder-error-text";
	text.textContent = `无法加载「${title}」的内容`;
	wrapper.append(text);
	return wrapper;
};

export {
	dataErrorMessage,
	folderErrorMessage,
	loadingMessage,
	noResultsMessage,
	searchUnavailableMessage,
};
