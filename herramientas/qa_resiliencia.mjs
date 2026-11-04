// qa_resiliencia.mjs: impresión, conexión lenta, sin conexión, portales caídos, solicitudes a terceros y errores de consola.
// Uso: node herramientas/qa_resiliencia.mjs http://127.0.0.1:8765 <carpeta de capturas> <salida.json>
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2]; const CAP = process.argv[3]; const SAL = process.argv[4];
fs.mkdirSync(CAP, { recursive: true });
const inf = {};
let nav = await abrir({ ancho: 1280, alto: 800, puerto: 9501 });
await nav.ir(BASE + '/index.html', 1500);

// 1. Impresión: ¿las secciones que aún no se desplazaron a la vista salen en blanco?
for (const [n, h] of [['hoja', '#/hoja/propuesta'], ['piloto', '#/piloto'], ['formas', '#/planes/formas']]) {
  await nav.evaluar(`location.hash='${h}'; window.scrollTo(0,0); 1`); await nav.esperar(900);
  await nav.medio({ media: 'print' });
  const m = JSON.parse(await nav.evaluar(`JSON.stringify({ revela: document.querySelectorAll('.revela').length, invisibles: [].slice.call(document.querySelectorAll('.revela')).filter(function(e){ return getComputedStyle(e).opacity < 0.1; }).length, visibleRiel: getComputedStyle(document.querySelector('.riel')).display })`));
  const bytes = await nav.pdf(path.join(CAP, `impresion-${n}.pdf`));
  await nav.foto(path.join(CAP, `impresion-${n}.png`), { completa: true, maxAlto: 3500 });
  await nav.medio({ media: '' });
  inf['impresion-' + n] = Object.assign(m, { pdfBytes: bytes });
}

// 2. Qué solicitudes hace el sitio y a quién, y errores de consola, recorriendo varias pantallas
nav.eventos.red.length = 0; nav.eventos.consola.length = 0;
await nav.evaluar(`localStorage.clear(); location.hash='#/'; location.reload(); 1`); await nav.esperar(2000);
for (const h of ['#/inicio', '#/mi', '#/valeria/chat', '#/planes/formas', '#/hoja/arquitectura', '#/identidad']) { await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(600); }
const origen = new URL(BASE).origin;
const ext = [...new Set(nav.eventos.red.map((r) => r.url).filter((u) => /^https?:/.test(u) && !u.startsWith(origen)))];
inf.terceros = ext;
inf.sinEstado404 = nav.eventos.red.filter((r) => r.estado && r.estado >= 400).map((r) => r.estado + ' ' + r.url);
inf.consola = [...new Set(nav.eventos.consola)];
inf.errores = await nav.evaluar(`JSON.stringify(window.__errores)`);

// 3. Peso y tiempo de carga: normal y con red lenta (3G rápida: 1,6 Mb/s, 150 ms)
async function carga(etiqueta, cond) {
  nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9502 + Object.keys(inf).length });
  await nav.red(cond);
  await nav.enviar('Network.setCacheDisabled', { cacheDisabled: true });
  nav.eventos.red.length = 0;
  const t0 = Date.now();
  await nav.enviar('Page.navigate', { url: BASE + '/index.html' });
  let listo = false; let primerContenido = null;
  for (let i = 0; i < 240 && !listo; i++) {
    await nav.esperar(250);
    const e = await nav.evaluar(`(window.MT && MT.router && document.querySelector('#app h1') ? 1 : 0) + '|' + document.readyState`);
    if (primerContenido === null && String(e).startsWith('1')) primerContenido = Date.now() - t0;
    if (String(e) === '1|complete') listo = true;
  }
  const bytes = await nav.evaluar(`performance.getEntriesByType('resource').reduce(function(a, r){ return a + (r.transferSize || r.encodedBodySize || 0); }, 0)`);
  inf['carga-' + etiqueta] = { primerContenidoMs: primerContenido, completaMs: Date.now() - t0, bytesRecursos: bytes, recursos: await nav.evaluar('performance.getEntriesByType("resource").length') };
}
await carga('normal', {});
await carga('3g-rapida', { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await carga('3g-lenta', { latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });

// 4. Sin conexión: se abre, se desconecta y se recarga; ¿hay respaldo (service worker / caché)?
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9520 });
await nav.ir(BASE + '/index.html', 2500);
inf.sinConexion = { serviceWorker: await nav.evaluar(`('serviceWorker' in navigator) ? (navigator.serviceWorker.controller ? 'activo' : 'registrado: no') : 'no soportado'`), manifiesto: await nav.evaluar(`!!document.querySelector('link[rel=manifest]')` ) };
await nav.red({ offline: true });
await nav.enviar('Page.reload');
await nav.esperar(2500);
inf.sinConexion.recargaSinRed = await nav.evaluar(`document.title + ' | h1=' + ((document.querySelector('#app h1')||{}).textContent||'(sin contenido)')`);
await nav.foto(path.join(CAP, 'sin-conexion-recarga.png'), { completa: false });
await nav.red({ offline: false });

// 5. Portales caídos: se bloquean las direcciones de Kinesis y Wisfox y se mira qué ve la persona
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9521 });
await nav.ir(BASE + '/index.html', 1500);
await nav.evaluar(`localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); 1`);
await nav.bloquear(['https://profenapaipa.github.io/Kinesis/*', 'https://profenapaipa.github.io/wisfox/*']);
for (const portal of ['kinesis', 'wisfox']) {
  await nav.evaluar(`location.hash='#/portales/${portal}'; 1`); await nav.esperar(1500);
  const a = await nav.evaluar(`(document.querySelector('.vivo-panel:not([hidden]) .vivo-estado') || {}).textContent || '(sin mensaje de estado)'`);
  await nav.foto(path.join(CAP, `portal-caido-${portal}-2s.png`), { completa: false });
  await nav.esperar(9500);
  const b = await nav.evaluar(`(document.querySelector('.vivo-panel:not([hidden]) .vivo-estado') || {}).textContent || '(sin mensaje de estado)'`);
  await nav.foto(path.join(CAP, `portal-caido-${portal}-11s.png`), { completa: false });
  inf['portal-caido-' + portal] = { a2s: a, a11s: b };
}

// 6. Seguridad del navegador: política, marcos y qué comparte el origen con los portales
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9522 });
await nav.ir(BASE + '/index.html', 1500);
inf.seguridad = JSON.parse(await nav.evaluar(`JSON.stringify({ csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]').content, referrer: (document.querySelector('meta[name=referrer]')||{}).content, scriptsEnLinea: document.querySelectorAll('script:not([src])').length, estilosEnLinea: document.querySelectorAll('[style]').length, manejadoresEnLinea: document.querySelectorAll('[onclick],[onload],[onerror]').length,
  enlacesBlankSinNoopener: [].slice.call(document.querySelectorAll('a[target=_blank]')).filter(function(a){ return !/noopener/.test(a.rel); }).length, config: MT.config })`));
await nav.evaluar(`localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='#/portales/kinesis'; 1`); await nav.esperar(3000);
inf.seguridad.marcos = JSON.parse(await nav.evaluar(`JSON.stringify([].slice.call(document.querySelectorAll('iframe')).map(function(f){ return { src: f.src, sandbox: f.getAttribute('sandbox'), referrerpolicy: f.referrerPolicy, allow: f.getAttribute('allow') }; }))`));
fs.writeFileSync(SAL, JSON.stringify(inf, null, 1));
console.log('listo');
nav.cerrar();
