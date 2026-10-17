import { createCard } from "../../../components/bm-card/bm-card.js";

const createElement = (type, item, onOpen) => {
	const card = createCard(type, item);
	if (onOpen) {
		card.addEventListener("bm-open-folder", (event) =>
			onOpen(event.detail.originalEvent),
		);
	}
	return card;
};

export { createElement };
