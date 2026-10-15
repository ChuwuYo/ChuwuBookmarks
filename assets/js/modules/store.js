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
	dbPromise = new Promise((resolve, reject) => {
		if (!("indexedDB" in globalThis)) {
			reject(new Error("IndexedDB unavailable"));
			return;
		}
		const request = indexedDB.open(DB_NAME, CACHE_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
			db.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => reject(new Error("IndexedDB blocked"));
	});
	dbPromise.catch(() => {});
	return dbPromise;
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
