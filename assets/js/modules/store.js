/**
 * 书签数据的持久缓存（IndexedDB）。
 *
 * - 所有读写都是异步的，失败时静默回退（隐私模式、配额不足等不会影响页面）。
 * - 修改缓存结构时提升 CACHE_VERSION，旧数据会被整体丢弃。
 */

const DB_NAME = "chuwu-bookmarks";
const STORE = "cache";
const CACHE_VERSION = 2;

/** 旧版本使用的 localStorage 键，首次打开时清理以释放配额 */
const LEGACY_KEYS = [
	"bookmarksData",
	"bookmarksHash",
	"bookmarksIndex",
	"structureHash",
];

let dbPromise = null;

const promisify = (request) =>
	new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const openDb = () => {
	if (dbPromise) return dbPromise;
	const pending = new Promise((resolve, reject) => {
		if (!("indexedDB" in globalThis)) {
			reject(new Error("IndexedDB unavailable"));
			return;
		}
		let settled = false;
		const request = indexedDB.open(DB_NAME, CACHE_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
			db.createObjectStore(STORE);
		};
		request.onsuccess = () => {
			const db = request.result;
			// 已因阻塞放弃的请求稍后成功时，关闭这个无人使用的连接
			if (settled) {
				db.close();
				return;
			}
			settled = true;
			// 其他标签页升级版本时让出连接，下次读写重新打开
			db.onversionchange = () => {
				db.close();
				if (dbPromise === pending) dbPromise = null;
			};
			resolve(db);
		};
		request.onerror = () => {
			settled = true;
			reject(request.error);
		};
		request.onblocked = () => {
			settled = true;
			reject(new Error("IndexedDB blocked"));
		};
	});
	dbPromise = pending;
	// 打开失败不缓存，下次读写时重试
	pending.catch(() => {
		if (dbPromise === pending) dbPromise = null;
	});
	return pending;
};

const withStore = async (mode, fn) => {
	const db = await openDb();
	const tx = db.transaction(STORE, mode);
	const result = await promisify(fn(tx.objectStore(STORE)));
	await new Promise((resolve, reject) => {
		tx.oncomplete = resolve;
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
	return result;
};

/** 读取缓存，不存在或出错时返回 null */
export const readCache = async (key) => {
	try {
		return (await withStore("readonly", (s) => s.get(key))) ?? null;
	} catch {
		return null;
	}
};

/** 写入缓存，失败时返回 false */
export const writeCache = async (key, value) => {
	try {
		await withStore("readwrite", (s) => s.put(value, key));
		return true;
	} catch (e) {
		console.warn(`[store] Failed to cache "${key}":`, e);
		return false;
	}
};

/** 清理旧版 localStorage 缓存 */
export const removeLegacyCache = () => {
	try {
		for (const key of LEGACY_KEYS) localStorage.removeItem(key);
	} catch {
		// localStorage 不可用时无需处理
	}
};
