let current = 0;

const fill = (id, nodes) => {
	if (nodes) document.getElementById(id)?.replaceChildren(...nodes);
};

const showView = ({ content = [], breadcrumbs = [] } = {}) => {
	current += 1;
	document.getElementById("content")?.removeAttribute("data-page-changing");
	fill("content", content);
	fill("breadcrumbs", breadcrumbs);
	return current;
};

const isCurrentView = (view) => view === current;

const updateView = (view, { content, breadcrumbs }) => {
	if (!isCurrentView(view)) return false;
	fill("content", content);
	fill("breadcrumbs", breadcrumbs);
	return true;
};

const leaveView = () => {
	current += 1;
};

export { isCurrentView, leaveView, showView, updateView };
