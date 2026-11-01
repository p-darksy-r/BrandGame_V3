import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../src/web/', import.meta.url)));
const port = Number(process.argv[2] || 8765);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const requested = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
        const target = await realpath(requested);
        if (!target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
        const content = await readFile(target);
        response.writeHead(200, { 'Content-Type': `${mime[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' }).end(content);
    } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`BrandGame web: http://127.0.0.1:${port}`));
