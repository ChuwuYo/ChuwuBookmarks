// Minimal static file server for tests. Serves the repository root.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT || 4173);
const types = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".woff2": "font/woff2",
	".txt": "text/plain; charset=utf-8",
	".xml": "application/xml",
};

/** 解析请求路径；非法编码返回 null，越出站点根目录返回 false */
const resolvePath = (pathname) => {
	let decoded;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return null;
	}
	const path = resolve(root, `.${decoded}`);
	const rel = relative(root, path);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel))
		return false;
	return path;
};

createServer((req, res) => {
	const url = new URL(req.url, "http://localhost");
	let path = resolvePath(url.pathname);
	if (path === null) {
		res.writeHead(400).end("Bad request");
		return;
	}
	if (path === false) {
		res.writeHead(403).end();
		return;
	}
	try {
		if (statSync(path).isDirectory()) path = join(path, "index.html");
		statSync(path);
	} catch {
		res.writeHead(404).end("Not found");
		return;
	}
	res.writeHead(200, {
		"Content-Type": types[extname(path)] || "application/octet-stream",
		"Cache-Control": "no-store",
	});
	createReadStream(path).pipe(res);
}).listen(port, () =>
	console.log(`Serving ${root} on http://localhost:${port}`),
);
