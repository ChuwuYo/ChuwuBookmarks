let current = 0;

const fill = (id, nodes) => {
	if (nodes) document.getElementById(id).replaceChildren(...nodes);
};

const nextView = () => {
	current += 1;
	document.getElementById("content").removeAttribute("data-page-changing");
	return current;
};

const showView = ({ content = [], breadcrumbs = [] } = {}) => {
	const view = nextView();
	fill("content", content);
	fill("breadcrumbs", breadcrumbs);
	return view;
};

const isCurrentView = (view) => view === current;

const updateView = (view, { content, breadcrumbs }) => {
	if (!isCurrentView(view)) return false;
	fill("content", content);
	fill("breadcrumbs", breadcrumbs);
	return true;
};

const leaveView = nextView;

export { isCurrentView, leaveView, showView, updateView };
