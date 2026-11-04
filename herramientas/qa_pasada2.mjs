// qa_pasada2.mjs: comprobaciones de la pasada 2 parcial (31 oct a 4 nov): sin conexión (service worker), portales caídos,
// versión calmada, texto pequeño, solicitud a /api/estado, y capturas del logo y del favicon.
// Uso: node herramientas/qa_pasada2.mjs http://127.0.0.1:8768 <carpeta de capturas> <salida.json>
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2]; const CAP = process.argv[3]; const SAL = process.argv[4];
fs.mkdirSync(CAP, { recursive: true });
const inf = {};
let nav = await abrir({ ancho: 1280, alto: 800, puerto: 9601 });

// ---- QA-03: sin conexión ----
await nav.ir(BASE + '/index.html', 6000);
inf.sw = JSON.parse(await nav.evaluar(`(async function(){ var r = await navigator.serviceWorker.getRegistration(); var n = await caches.keys(); var c = n.length ? (await (await caches.open(n[0])).keys()).length : 0;
  return JSON.stringify({ registrado: !!r, activo: !!(r && r.active), controla: !!navigator.serviceWorker.controller, caches: n, archivosGuardados: c, manifiesto: !!document.querySelector('link[rel=manifest]') }); })()`));
inf.referenciadosPorIndex = JSON.parse(await nav.evaluar(`JSON.stringify([].slice.call(document.querySelectorAll('script[src],link[href]')).map(function(e){ return e.getAttribute('src') || e.getAttribute('href'); }).filter(function(x){ return !/^https?:/.test(x); }))`));
await nav.red({ offline: true });
await nav.enviar('Page.reload'); await nav.esperar(3000);
inf.sinRed = { titulo: await nav.evaluar('document.title'), h1: await nav.evaluar(`(document.querySelector('#app h1')||{}).textContent`), aviso: await nav.evaluar(`(document.querySelector('.aviso-conexion')||{}).textContent || '(sin aviso)'`), errores: await nav.evaluar('JSON.stringify(window.__errores)') };
await nav.foto(path.join(CAP, 'p2-sin-red-inicio.png'), { completa: false });
const rutas = ['#/mi', '#/planes/formas', '#/hoja/arquitectura', '#/glosario', '#/mapa/conexiones', '#/identidad', '#/valeria/chat'];
inf.sinRedRutas = [];
for (const h of rutas) { await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(500); inf.sinRedRutas.push([h, await nav.evaluar(`(document.querySelector('#app h1')||document.querySelector('#app [role=heading]')||{}).textContent || '(vacío)'`)]); }
// sesión con rol, creación de una actividad sin red (la plataforma debe poder crear datos locales)
await nav.evaluar(`localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='#/portales/kinesis'; location.reload(); 1`); await nav.esperar(3000);
await nav.evaluar(`location.hash='#/portales/kinesis'; 1`); await nav.esperar(2500);
inf.portalSinRed = await nav.evaluar(`(function(){ var r = document.querySelector('.vivo-panel:not([hidden]) .vivo-respaldo'); return r && !r.hidden ? 'respaldo visible: ' + r.querySelector('h2').textContent + ' | botones: ' + [].slice.call(r.querySelectorAll('button,a')).map(function(b){ return b.textContent.trim(); }).join(' / ') + ' | iframe en documento: ' + !!document.querySelector('.vivo-panel:not([hidden]) iframe') : 'SIN respaldo; estado: ' + ((document.querySelector('.vivo-panel:not([hidden]) .vivo-estado')||{}).textContent||'(ninguno)'); })()`);
await nav.foto(path.join(CAP, 'p2-portal-sin-red.png'), { completa: false });
// el botón "Ver Kinesis en Mi espacio" con teclado
await nav.evaluar(`document.querySelector('.vivo-panel:not([hidden]) .vivo-respaldo .btn').focus(); 1`); await nav.tecla('Enter'); await nav.esperar(700);
inf.alPulsarVerEnMiEspacio = await nav.evaluar('location.hash + " | h1=" + ((document.querySelector("#app h1")||{}).textContent||"")');
// vuelve la conexión: ¿el portal se reintenta solo?
await nav.evaluar(`location.hash='#/portales/kinesis'; 1`); await nav.esperar(500);
await nav.red({ offline: false }); await nav.esperar(5000);
inf.portalAlVolver = await nav.evaluar(`(function(){ var r = document.querySelector('.vivo-panel:not([hidden]) .vivo-respaldo'); return (r && !r.hidden ? 'sigue el respaldo' : 'respaldo oculto') + ' | iframe: ' + !!document.querySelector('.vivo-panel:not([hidden]) iframe') + ' | aviso: ' + ((document.querySelector('.aviso-conexion')||{}).textContent||'(ninguno)'); })()`);

// ---- QA-02: portal caído sin cortar la red del navegador ----
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9602 });
await nav.ir(BASE + '/index.html', 1500);
await nav.evaluar(`localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); 1`);
const estadoPortal = `(function(){ var r = document.querySelector('.vivo-panel:not([hidden]) .vivo-respaldo'); var e = document.querySelector('.vivo-panel:not([hidden]) .vivo-estado'); return (r && !r.hidden ? 'RESPALDO' : 'sin respaldo') + ' | estado: ' + ((e && !e.hidden && e.textContent) || '(oculto)') + ' | iframe: ' + !!document.querySelector('.vivo-panel:not([hidden]) iframe'); })()`;
await nav.bloquear(['https://profenapaipa.github.io/Kinesis/*']);
await nav.evaluar(`location.hash='#/portales/kinesis'; 1`); await nav.esperar(3500);
inf.portalBloqueado = await nav.evaluar(estadoPortal);
await nav.foto(path.join(CAP, 'p2-portal-bloqueado.png'), { completa: false });
await nav.bloquear([]);
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9603 });
await nav.ir(BASE + '/index.html', 1500);
await nav.evaluar(`MT.config.portales.kinesis = 'https://profenapaipa.github.io/no-existe-qa/'; localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='#/portales/kinesis'; 1`); await nav.esperar(4000);
inf.portal404 = await nav.evaluar(estadoPortal);
await nav.foto(path.join(CAP, 'p2-portal-404.png'), { completa: false });
await nav.evaluar(`MT.config.portales.kinesis = 'https://profenapaipa.github.io/Kinesis/'; 1`);

// ---- QA-22: solicitud a /api/estado ----
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9604 });
nav.eventos.red.length = 0; nav.eventos.consola.length = 0;
await nav.ir(BASE + '/index.html', 3000);
inf.apiEstado = { solicitudes404: nav.eventos.red.filter((r) => r.estado >= 400).map((r) => r.estado + ' ' + r.url), consola: [...new Set(nav.eventos.consola)] };

// ---- QA-08: versión calmada ----
await nav.evaluar(`localStorage.clear(); location.reload(); 1`); await nav.esperar(1500);
await nav.evaluar(`document.getElementById('btn-apariencia').focus(); 1`); await nav.tecla('Enter'); await nav.esperar(300);
const cal = JSON.parse(await nav.evaluar(`(function(){ var i = document.getElementById('opcion-calmado'); var l = i && i.closest('label'); var d = i && document.getElementById(i.getAttribute('aria-describedby'));
  return JSON.stringify({ existe: !!i, etiqueta: l && l.textContent.trim(), ayuda: d && d.textContent.trim(), tam: i && Math.round(i.getBoundingClientRect().height) + 'x' + Math.round(i.getBoundingClientRect().width), alturaEtiqueta: l && Math.round(l.getBoundingClientRect().height) }); })()`));
await nav.evaluar(`document.getElementById('opcion-calmado').focus(); 1`); await nav.tecla(' '); await nav.esperar(400);
cal.activadoConEspacio = await nav.evaluar(`document.documentElement.dataset.movimiento`);
cal.persiste = await nav.evaluar(`localStorage.getItem('mosaicotelar.apariencia')`);
await nav.tecla('Escape');
inf.calmado = cal;
// ¿ya está aplicado en el primer pintado (tema.js)? Se recarga y se mira de inmediato
await nav.enviar('Page.reload');
inf.calmado.alRecargar = await nav.evaluar(`document.documentElement.dataset.movimiento + ' | animaciones corriendo: ' + document.getAnimations().filter(function(a){ return a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime) && a.effect.getComputedTiming().endTime > 50; }).length`);
await nav.esperar(2500);
inf.calmado.infinitas = await nav.evaluar(`document.getAnimations().filter(function(a){ return a.effect.getComputedTiming().iterations === Infinity; }).length`);
inf.calmado.transformRevela = await nav.evaluar(`[].slice.call(document.querySelectorAll('.revela')).filter(function(e){ return getComputedStyle(e).opacity !== '1'; }).length`);
inf.calmado.scrollSuave = await nav.evaluar(`getComputedStyle(document.documentElement).scrollBehavior`);
await nav.foto(path.join(CAP, 'p2-calmado-inicio.png'), { completa: false });
// la animación del logo en calmado: ¿se ve el logo final enseguida?
inf.calmado.logoClases = await nav.evaluar(`document.querySelector('.logo-tejido') ? document.querySelector('.logo-tejido').getAttribute('class') : '(sin logo)'`);

// ---- QA-07: texto pequeño ----
await nav.evaluar(`localStorage.clear(); 1`);
await nav.enviar('Page.reload'); await nav.esperar(1200);
inf.textoChico = {};
for (const h of ['#/inicio', '#/planes/formas', '#/hoja/propuesta', '#/mapa/conexiones', '#/glosario']) {
  await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(700);
  inf.textoChico[h] = JSON.parse(await nav.evaluar(`(function(){ var t = {}; var n = 0; [].slice.call(document.querySelectorAll('main *')).forEach(function(e){ if (e.children.length === 0 && e.textContent.trim() && e.getClientRects().length) { var f = parseFloat(getComputedStyle(e).fontSize); if (f < 13) { n++; var k = e.tagName + '.' + (typeof e.className === 'string' ? e.className : '') + ' ' + f + 'px'; t[k] = (t[k]||0) + 1; } } }); return JSON.stringify({ total: n, tipos: Object.entries(t).slice(0, 5) }); })()`));
}

// ---- Logo y favicon ----
nav.cerrar(); nav = await abrir({ ancho: 1280, alto: 800, puerto: 9605 });
await nav.ir(BASE + '/index.html', 100);
for (const t of [400, 1400, 2800]) { await nav.esperar(t === 400 ? 300 : 1000); await nav.foto(path.join(CAP, `p2-logo-${t}ms.png`), { completa: false }); }
await nav.esperar(3000); await nav.foto(path.join(CAP, 'p2-logo-final.png'), { completa: false });
// favicon a 16, 32 y 64 px sobre claro y oscuro, y el riel
await nav.evaluar(`(function(){ var d = document.createElement('div'); d.id = 'qa-fav'; d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;grid-template-columns:1fr 1fr;'; ['#ffffff', '#202124'].forEach(function(bg){ var c = document.createElement('div'); c.style.cssText = 'background:' + bg + ';display:flex;gap:24px;align-items:center;justify-content:center'; [16, 32, 64, 128].forEach(function(s){ var i = document.createElement('img'); i.src = 'assets/favicon.svg'; i.width = s; i.height = s; c.append(i); }); d.append(c); }); document.body.append(d); return 1; })()`);
await nav.esperar(600); await nav.foto(path.join(CAP, 'p2-favicon-claro-oscuro.png'), { completa: false });
inf.favicon = fs.readFileSync(path.resolve('assets/favicon.svg'), 'utf8').slice(0, 900);

fs.writeFileSync(SAL, JSON.stringify(inf, null, 1));
console.log('listo');
nav.cerrar();
