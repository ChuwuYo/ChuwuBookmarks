const WORKER_PATHS = Object.freeze({
	SEARCH: "assets/js/search-worker.js",
	DATA: "assets/js/data-worker.js",
});

const WorkerState = Object.freeze({
	IDLE: "idle",
	ERROR: "error",
});

class WorkerWrapper {
	constructor(path, name) {
		this._path = path;
		this._name = name;
		this._worker = null;
		this._state = WorkerState.IDLE;
		this._messageListeners = new Set();
		this._errorListeners = new Set();
	}

	getInstance() {
		if (typeof Worker === "undefined") return null;
		if (this._state === WorkerState.ERROR || !this._worker) {
			this._createWorker();
		}

		return this._worker;
	}

	postMessage(message) {
		const worker = this.getInstance();
		if (!worker) return false;

		try {
			worker.postMessage(message);
			return true;
		} catch (error) {
			console.error(`[WorkerManager] ${this._name} postMessage 失败:`, error);
			this._state = WorkerState.ERROR;

			if (this._worker) {
				try {
					this._worker.terminate();
				} catch (e) {
					console.warn(`[WorkerManager] Failed to terminate ${this._name}:`, e);
				}
				this._worker = null;
			}

			return false;
		}
	}

	addMessageListener(listener) {
		if (typeof listener !== "function") return;
		this._messageListeners.add(listener);

		if (this._worker) {
			this._worker.addEventListener("message", listener);
		}
	}

	removeMessageListener(listener) {
		this._messageListeners.delete(listener);
		if (this._worker) {
			this._worker.removeEventListener("message", listener);
		}
	}

	addErrorListener(listener) {
		if (typeof listener !== "function") return;
		this._errorListeners.add(listener);

		if (this._worker) {
			this._worker.addEventListener("error", listener);
		}
	}

	removeErrorListener(listener) {
		this._errorListeners.delete(listener);
		if (this._worker) {
			this._worker.removeEventListener("error", listener);
		}
	}

	_createWorker() {
		try {
			this._worker = new Worker(this._path);
			this._state = WorkerState.IDLE;

			this._messageListeners.forEach((listener) => {
				this._worker.addEventListener("message", listener);
			});

			this._errorListeners.forEach((listener) => {
				this._worker.addEventListener("error", listener);
			});

			this._worker.addEventListener("error", (error) => {
				console.error(`[WorkerManager] ${this._name} 发生错误:`, error);
				this._state = WorkerState.ERROR;

				this._worker = null;
			});
		} catch (error) {
			console.error(`[WorkerManager] 创建 ${this._name} 失败:`, error);
			this._worker = null;
			this._state = WorkerState.ERROR;
		}
	}
}

const workers = {
	search: new WorkerWrapper(WORKER_PATHS.SEARCH, "SearchWorker"),
	data: new WorkerWrapper(WORKER_PATHS.DATA, "DataWorker"),
};

const getSearchWorkerWrapper = () => workers.search;

const getDataWorkerWrapper = () => workers.data;

export { getDataWorkerWrapper, getSearchWorkerWrapper };
