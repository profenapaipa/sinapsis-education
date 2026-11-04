// qa_cdp.mjs: cliente mínimo del protocolo de depuración de Chrome o Edge para la revisión independiente (QA).
// Sin dependencias (Node 22+ trae WebSocket). A diferencia de cdp.mjs, esta versión también recoge la red y
// los errores de consola, simula teclado, conexión lenta o ausente, movimiento reducido y emulación de impresión,
// que son lo que la revisión de accesibilidad y resiliencia necesita medir.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const NAVEGADORES = {
  chrome: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  edge: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrir({ ancho = 1280, alto = 800, puerto = 9444, navegador = 'chrome', movil = false, factor = 1 } = {}) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-'));
  const proc = spawn(NAVEGADORES[navegador], [...(process.env.QA_CON_PANTALLA ? [] : ['--headless=new', '--disable-gpu', '--hide-scrollbars']), `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 80 && !ws; i++) {
    try { const t = (await (await fetch(`http://127.0.0.1:${puerto}/json`)).json()).find((x) => x.type === 'page'); ws = t && t.webSocketDebuggerUrl; } catch { /* aún no */ }
    if (!ws) await espera(250);
  }
  if (!ws) throw new Error('El navegador no abrió el puerto de depuración');
  const sock = new WebSocket(ws);
  await new Promise((r) => { sock.onopen = r; });
  let id = 0; const pend = new Map();
  const eventos = { red: [], consola: [], fallos: [] };
  sock.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); return; }
    if (d.method === 'Network.requestWillBeSent') eventos.red.push({ url: d.params.request.url, tipo: d.params.type, t: Date.now() });
    if (d.method === 'Network.loadingFailed') eventos.fallos.push({ id: d.params.requestId, error: d.params.errorText, tipo: d.params.type });
    if (d.method === 'Network.responseReceived') eventos.red.push({ url: d.params.response.url, estado: d.params.response.status, tipo: d.params.type });
    if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(d.params.type)) eventos.consola.push(d.params.type + ': ' + d.params.args.map((a) => a.value || a.description || '').join(' '));
    if (d.method === 'Runtime.exceptionThrown') eventos.consola.push('excepción: ' + (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text));
    if (d.method === 'Log.entryAdded') eventos.consola.push(d.params.entry.level + ': ' + d.params.entry.text + ' ' + (d.params.entry.url || ''));
  };
  const enviar = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); sock.send(JSON.stringify({ id: i, method, params })); });
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable', 'DOM.enable', 'Accessibility.enable']) await enviar(m);
  const fijar = (a, h) => enviar('Emulation.setDeviceMetricsOverride', { width: a, height: h, deviceScaleFactor: factor, mobile: movil });
  await fijar(ancho, alto);
  if (movil) await enviar('Emulation.setTouchEmulationEnabled', { enabled: true });
  let alt = alto;
  const api = {
    enviar, eventos,
    async ir(url, ms = 2000) { await enviar('Page.navigate', { url }); await espera(ms); },
    async evaluar(expr) { const r = await enviar('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) return { __error: r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description }; return r.result && r.result.result && r.result.result.value; },
    esperar: espera,
    async tamano(a, h = 800) { alt = h; await fijar(a, h); await espera(400); },
    medio(features) { return enviar('Emulation.setEmulatedMedia', { media: features.media || '', features: features.features || [] }); },
    red(opts) { return enviar('Network.emulateNetworkConditions', Object.assign({ offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }, opts)); },
    bloquear(urls) { return enviar('Network.setBlockedURLs', { urls }); },
    async foto(ruta, { completa = true, maxAlto = 6000 } = {}) {
      let h = alt;
      if (completa) { const x = await api.evaluar('Math.min(document.documentElement.scrollHeight,' + maxAlto + ')'); h = Math.max(alt, x || alt); }
      const w = await api.evaluar('window.innerWidth');
      await fijar(w, h); await espera(250);
      const r = await enviar('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(ruta, Buffer.from(r.result.data, 'base64'));
      await fijar(w, alt);
    },
    async pdf(ruta, opts = {}) {
      const r = await enviar('Page.printToPDF', Object.assign({ printBackground: true, preferCSSPageSize: false }, opts));
      fs.writeFileSync(ruta, Buffer.from(r.result.data, 'base64'));
      return Buffer.from(r.result.data, 'base64').length;
    },
    // Teclado real: Tab, Shift+Tab, Enter, Espacio, Escape, flechas.
    async tecla(key, { shift = false } = {}) {
      const codigos = { Tab: 9, Enter: 13, Escape: 27, ' ': 32, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39 };
      const base = { key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: codigos[key] || key.toUpperCase().charCodeAt(0), modifiers: shift ? 8 : 0 };
      await enviar('Input.dispatchKeyEvent', Object.assign({ type: 'rawKeyDown' }, base, key === 'Enter' ? { text: '\r' } : {}));
      if (key === 'Enter' || key === ' ') await enviar('Input.dispatchKeyEvent', Object.assign({ type: 'char', text: key === 'Enter' ? '\r' : ' ' }, base));
      await enviar('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, base));
      await espera(60);
    },
    async arbolAX() { const r = await enviar('Accessibility.getFullAXTree'); return (r.result && r.result.nodes) || []; },
    cerrar() { try { sock.close(); } catch { /* ya cerrado */ } proc.kill(); },
  };
  return api;
}
