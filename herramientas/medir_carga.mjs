// medir_carga.mjs <carpeta>: cuántas solicitudes, cuántos bytes y cuánto tarda el primer contenido, sin red limitada y con 3G rápida y lenta.
//
//   node herramientas/medir_carga.mjs .          # el sitio de la raíz (archivos sueltos)
//   node herramientas/medir_carga.mjs dist       # la copia hecha con herramientas/empaquetar.py
//
// Por qué existe: el tiempo de carga de este sitio (QA-12) depende del número de solicitudes, no solo de los bytes; esto lo mide igual
// antes y después de empaquetar. Sirve la carpeta con gzip, como GitHub Pages. Necesita Chrome y Node 22+ (sin dependencias).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const RAIZ = path.resolve(process.argv[2] || '.');
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((r) => fs.existsSync(r));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const GZ = new Set(['.html', '.js', '.css', '.svg', '.webmanifest', '.json']);
const servidor = http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const archivo = path.join(RAIZ, ruta.endsWith('/') ? ruta + 'index.html' : ruta);
  if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  let dato = fs.readFileSync(archivo); const ext = path.extname(archivo);
  const h = { 'Content-Type': TIPOS[ext] || 'application/octet-stream', 'Cache-Control': 'max-age=600' };
  if (GZ.has(ext)) { dato = zlib.gzipSync(dato); h['Content-Encoding'] = 'gzip'; }
  res.writeHead(200, h); res.end(dato);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${servidor.address().port}/`;

async function corrida(red) {
  const PUERTO = 9700 + Math.floor(Math.random() * 200);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-med-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 80 && !ws; i++) { try { const t = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((x) => x.type === 'page'); ws = t && t.webSocketDebuggerUrl; } catch { /* aún no */ } if (!ws) await espera(250); }
  const sock = new WebSocket(ws); await new Promise((r) => { sock.onopen = r; });
  let nid = 0; const pend = new Map(); let n = 0, bytes = 0;
  sock.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else if (d.method === 'Network.requestWillBeSent') n++; else if (d.method === 'Network.loadingFinished') bytes += d.params.encodedDataLength; };
  const cdp = (method, params = {}) => new Promise((res) => { const i = ++nid; pend.set(i, res); sock.send(JSON.stringify({ id: i, method, params })); });
  const evaluar = async (e) => (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await cdp('Network.enable'); await cdp('Page.enable'); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  if (red) await cdp('Network.emulateNetworkConditions', { offline: false, latency: red.lat, downloadThroughput: red.bps, uploadThroughput: red.bps / 2 });
  const t0 = Date.now();
  await cdp('Page.navigate', { url: BASE + 'index.html' });
  let tPrimer = null, tCarga = null;
  for (let i = 0; i < 1200 && tPrimer === null; i++) { await espera(50); if (await evaluar("!!document.querySelector('main h1')")) tPrimer = Date.now() - t0; }
  for (let i = 0; i < 1200; i++) { if (await evaluar("document.readyState === 'complete'")) { tCarga = Date.now() - t0; break; } await espera(50); }
  await espera(1500);
  const errores = await evaluar('JSON.stringify(window.__errores || [])');
  proc.kill(); sock.close();
  return { solicitudes: n, bytesTransferidos: bytes, primerContenidoMs: tPrimer, cargaCompletaMs: tCarga, errores: JSON.parse(errores) };
}
const salida = {};
salida.local = await corrida(null);
salida['3g_rapida'] = await corrida({ lat: 150, bps: 1.6 * 1024 * 1024 / 8 });
salida['3g_lenta'] = await corrida({ lat: 400, bps: 400 * 1024 / 8 });
console.log(JSON.stringify(salida, null, 1));
servidor.close(); process.exit(0);
