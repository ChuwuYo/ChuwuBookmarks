class CustomScrollIndicator {
	constructor() {
		this.indicator = null;
		this.thumb = null;
		this.isScrolling = false;
		this.scrollTimeout = null;
		this.resizeTimeout = null;
		this.scrollFrame = null;
		this.isInitialized = false;
		this.isMobile = this.checkIsMobile();
		this.transformProperty = this.detectTransformProperty();

		this.handleScroll = this.handleScroll.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.updateThumbPosition = this.updateThumbPosition.bind(this);
	}

	checkIsMobile() {
		return window.innerWidth < 480;
	}

	detectTransformProperty() {
		const testElement = document.createElement("div");
		const transforms = [
			"transform",
			"webkitTransform",
			"MozTransform",
			"msTransform",
		];

		for (let i = 0; i < transforms.length; i++) {
			if (testElement.style[transforms[i]] !== undefined) {
				return transforms[i];
			}
		}
		return "";
	}

	init() {
		if (this.isInitialized || this.isMobile) return;

		this.createIndicator();
		this.attachEventListeners();
		this.updateThumbPosition();
		this.isInitialized = true;
	}

	createIndicator() {
		this.indicator = document.createElement("div");
		this.indicator.className = "custom-scroll-indicator";
		this.indicator.setAttribute("aria-hidden", "true");

		this.thumb = document.createElement("div");
		this.thumb.className = "custom-scroll-thumb";

		this.indicator.appendChild(this.thumb);
		document.body.appendChild(this.indicator);
	}

	attachEventListeners() {
		window.addEventListener("scroll", this.handleScroll, { passive: true });

		window.addEventListener("resize", this.handleResize);

		if (this.indicator) {
			this.indicator.addEventListener("mouseenter", () => {
				this.indicator.style.opacity = "1";
			});

			this.indicator.addEventListener("mouseleave", () => {
				if (!this.isScrolling) {
					this.indicator.style.opacity = "0";
				}
			});
		}
	}

	handleScroll() {
		if (!this.indicator || this.isMobile) return;

		if (!this.isScrolling) {
			this.isScrolling = true;
			document.body.classList.add("scrolling");
		}

		if (!this.scrollFrame) {
			this.scrollFrame = requestAnimationFrame(() => {
				this.scrollFrame = null;
				this.updateThumbPosition();
			});
		}

		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}

		this.scrollTimeout = setTimeout(() => {
			this.isScrolling = false;
			document.body.classList.remove("scrolling");
		}, 1000);
	}

	handleResize() {
		if (this.resizeTimeout) {
			cancelAnimationFrame(this.resizeTimeout);
		}

		this.resizeTimeout = requestAnimationFrame(() => {
			const wasMobile = this.isMobile;
			this.isMobile = this.checkIsMobile();

			if (!wasMobile && this.isMobile) {
				this.destroy();
			} else if (wasMobile && !this.isMobile && !this.isInitialized) {
				this.init();
			} else if (!this.isMobile) {
				this.updateThumbPosition();
			}
		});
	}

	updateThumbPosition() {
		if (!this.thumb || this.isMobile) return;

		try {
			const scrollTop =
				window.pageYOffset ||
				document.documentElement.scrollTop ||
				document.body.scrollTop ||
				0;

			const documentHeight = Math.max(
				document.body.scrollHeight,
				document.body.offsetHeight,
				document.documentElement.clientHeight,
				document.documentElement.scrollHeight,
				document.documentElement.offsetHeight,
			);
			const windowHeight =
				window.innerHeight || document.documentElement.clientHeight;

			const scrollableHeight = documentHeight - windowHeight;
			const scrollPercentage =
				scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;

			const thumbHeight = Math.max(
				20,
				(windowHeight / documentHeight) * windowHeight,
			);
			const thumbMaxTop = windowHeight - thumbHeight;
			const thumbTop = scrollPercentage * thumbMaxTop;

			this.thumb.style.height = `${thumbHeight}px`;

			if (this.transformProperty) {
				this.thumb.style[this.transformProperty] = `translateY(${thumbTop}px)`;
			} else {
				this.thumb.style.top = `${thumbTop}px`;
			}

			this.thumb.style.background =
				scrollPercentage >= 0.99
					? "var(--scroll-indicator-thumb-hover)"
					: "var(--scroll-indicator-thumb)";
		} catch (error) {
			console.warn("[ScrollIndicator] Update failed:", error);
		}
	}

	destroy() {
		if (!this.isInitialized) return;

		if (this.resizeTimeout) {
			cancelAnimationFrame(this.resizeTimeout);
			this.resizeTimeout = null;
		}

		if (this.scrollFrame) {
			cancelAnimationFrame(this.scrollFrame);
			this.scrollFrame = null;
		}

		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
			this.scrollTimeout = null;
		}

		window.removeEventListener("scroll", this.handleScroll, { passive: true });
		window.removeEventListener("resize", this.handleResize);

		if (this.indicator?.parentNode) {
			this.indicator.parentNode.removeChild(this.indicator);
		}

		document.body.classList.remove("scrolling");

		this.indicator = null;
		this.thumb = null;
		this.isScrolling = false;
		this.isInitialized = false;
	}

	show() {
		if (this.indicator) {
			this.indicator.style.opacity = "1";
		}
	}

	hide() {
		if (this.indicator) {
			this.indicator.style.opacity = "0";
		}
	}
}

const customScrollIndicator = new CustomScrollIndicator();

function initScrollIndicator() {
	if (window.innerWidth >= 480) {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				customScrollIndicator.init();
			});
		} else {
			customScrollIndicator.init();
		}
	}
}

export { CustomScrollIndicator, customScrollIndicator, initScrollIndicator };
