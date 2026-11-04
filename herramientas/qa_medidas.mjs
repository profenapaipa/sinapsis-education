// qa_medidas.mjs: árbol de accesibilidad, títulos, movimiento, reflujo a 320 px, espaciado de texto (WCAG 1.4.12),
// texto grande, y qué guarda el sitio en el navegador. Todo medido en Chrome real.
// Uso: node herramientas/qa_medidas.mjs http://127.0.0.1:8765 <salida.json>
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';

const BASE = process.argv[2]; const SAL = process.argv[3];
const nav = await abrir({ ancho: 1280, alto: 800, puerto: 9471 });
const inf = { ax: [], movimiento: {}, reflujo: [], espaciado: [], textoGrande: [], titulos: [], almacenamiento: {} };
await nav.ir(BASE + '/index.html', 1500);
const rutas = JSON.parse(await nav.evaluar(`JSON.stringify(Object.keys(MT.router.rutas).map(function(k){ var d = MT.router.rutas[k]; var s = typeof d.subs === 'function' ? d.subs() : d.subs; return { id: k, subs: (s || []).map(function(x){ return x.id; }) }; }))`));
const hashes = rutas.flatMap((r) => (r.subs.length ? r.subs.map((s) => `#/${r.id}/${s}`) : [`#/${r.id}`]));

// 1. Árbol de accesibilidad de las pantallas clave: puntos de referencia, controles sin nombre, imágenes, orden de títulos
for (const rol of ['', 'docente']) {
  await nav.evaluar(`localStorage.clear(); ${rol ? `localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'${rol}'}));` : ''} location.hash='#/'; location.reload(); 1`); await nav.esperar(1500);
  for (const h of ['#/inicio', '#/mi', '#/portales/kinesis', '#/planes/formas', '#/hoja/arquitectura', '#/mapa/conexiones', '#/identidad', '#/valeria/chat']) {
    await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(700);
    const nodos = await nav.arbolAX();
    const val = (n, k) => n[k] && n[k].value;
    const vivos = nodos.filter((n) => !n.ignored);
    const interactivos = vivos.filter((n) => ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio', 'tab', 'menuitem', 'switch', 'slider', 'spinbutton', 'searchbox'].includes(val(n, 'role')));
    const sinNombre = interactivos.filter((n) => !(val(n, 'name') || '').trim()).map((n) => val(n, 'role') + ' ' + (n.properties || []).length);
    const refs = {}; vivos.forEach((n) => { const r = val(n, 'role'); if (['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'region', 'form', 'search'].includes(r)) refs[r] = (refs[r] || []).concat([val(n, 'name') || '(sin nombre)']); });
    const heads = vivos.filter((n) => val(n, 'role') === 'heading').map((n) => { const l = (n.properties || []).find((p) => p.name === 'level'); return { nivel: l ? l.value.value : '?', texto: (val(n, 'name') || '').slice(0, 50) }; });
    const saltos = []; let prev = 0; heads.forEach((x) => { if (prev && x.nivel > prev + 1) saltos.push(`${prev}→${x.nivel} "${x.texto}"`); prev = x.nivel; });
    const imgs = vivos.filter((n) => val(n, 'role') === 'img'); const imgSinNombre = imgs.filter((n) => !(val(n, 'name') || '').trim()).length;
    const h1s = heads.filter((x) => x.nivel === 1).length;
    inf.ax.push({ rol: rol || 'sinrol', hash: h, interactivos: interactivos.length, sinNombre, refs, h1s, saltosDeNivel: saltos, imgs: imgs.length, imgSinNombre, titulos: heads.length });
  }
}

// 2. Título de la pestaña por pantalla (WCAG 2.4.2): ¿se distinguen?
await nav.evaluar(`localStorage.clear(); location.hash='#/'; location.reload(); 1`); await nav.esperar(1500);
for (const h of hashes) { await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(300); inf.titulos.push([h, await nav.evaluar('document.title')]); }

// 3. Movimiento: animaciones activas en la bienvenida, duración total, y qué queda con "reducir movimiento"
async function animaciones(etiqueta) {
  await nav.evaluar(`localStorage.clear(); location.hash='#/'; location.reload(); 1`); await nav.esperar(250);
  const m = [];
  for (const t of [250, 1000, 2000, 3000, 4500, 6000]) {
    await nav.esperar(t === 250 ? 0 : 750);
    m.push(await nav.evaluar(`(function(){ var a = document.getAnimations(); var inf = a.filter(function(x){ var t = x.effect && x.effect.getComputedTiming(); return t && t.iterations === Infinity; }).length;
      return JSON.stringify({ corriendo: a.filter(function(x){ return x.playState === 'running'; }).length, infinitas: inf }); })()`));
  }
  const dur = await nav.evaluar(`(function(){ var max = 0; document.getAnimations().forEach(function(x){ var t = x.effect.getComputedTiming(); if (isFinite(t.endTime)) max = Math.max(max, t.endTime); }); return max; })()`);
  inf.movimiento[etiqueta] = { lineaDeTiempo: m.map((x) => JSON.parse(x)), mayorDuracionMs: dur };
}
await animaciones('predeterminado');
await nav.medio({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await animaciones('reducir-movimiento');
inf.movimiento.revelado = JSON.parse(await nav.evaluar(`JSON.stringify({ revela: document.querySelectorAll('.revela').length, ocultos: [].slice.call(document.querySelectorAll('.revela')).filter(function(e){ return getComputedStyle(e).opacity === '0'; }).length })`));
inf.movimiento.interruptorCalmado = await nav.evaluar(`!!document.querySelector('[data-movimiento]') || /calmad/i.test(document.getElementById('menu-apariencia').textContent)`);
await nav.medio({ features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
// pulso del cargador de portales (infinito) y duración de la bienvenida
await nav.evaluar(`location.hash='#/portales/kinesis'; 1`); await nav.esperar(600);
inf.movimiento.cargadorPortal = JSON.parse(await nav.evaluar(`JSON.stringify({ infinitas: document.getAnimations().filter(function(x){ return x.effect.getComputedTiming().iterations === Infinity; }).length })`));

// 4. Reflujo a 320 px (equivale a 400 % de ampliación en 1280) y espaciado de texto
await nav.tamano(320, 640);
for (const h of hashes) {
  await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(350);
  const r = JSON.parse(await nav.evaluar(`(function(){ var d = document.documentElement; var cul = []; [].slice.call(document.querySelectorAll('main *')).forEach(function(e){ var r = e.getBoundingClientRect(); if (r.width && r.right > innerWidth + 1 && !e.closest('table,.tabla-scroll,pre,svg,.mapa-svg,.vivos')) cul.push(e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')); });
    return JSON.stringify({ desborda: d.scrollWidth > innerWidth + 1, ancho: d.scrollWidth, culpables: cul.slice(0, 4) }); })()`));
  if (r.desborda) inf.reflujo.push(Object.assign({ hash: h }, r));
}
await nav.tamano(1280, 800);
// WCAG 1.4.12: se impone el espaciado mínimo y se busca texto recortado
await nav.evaluar(`(function(){ var s = document.createElement('style'); s.id = 'qa-espaciado'; s.textContent = '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}'; document.head.append(s); return 1; })()`);
for (const h of ['#/inicio', '#/mi', '#/planes/formas', '#/hoja/propuesta', '#/portales/general', '#/glosario']) {
  await nav.evaluar(`localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='${h}'; 1`); await nav.esperar(500);
  inf.espaciado.push([h, JSON.parse(await nav.evaluar(`(function(){ var rec = []; [].slice.call(document.querySelectorAll('body *')).forEach(function(e){ var cs = getComputedStyle(e); if (!e.getClientRects().length) return; if ((cs.overflow === 'hidden' || cs.overflowY === 'hidden') && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && e.tagName !== 'BODY' && e.tagName !== 'HTML') rec.push(e.tagName + '.' + (typeof e.className === 'string' ? e.className : '')); });
    return JSON.stringify({ recortes: rec.slice(0, 5), desborda: document.documentElement.scrollWidth > innerWidth + 1 }); })()`))]);
}
await nav.evaluar(`document.getElementById('qa-espaciado').remove(); 1`);

// 5. Texto grande (112,5 %) a 390 px: desbordes
await nav.evaluar(`localStorage.setItem('mosaicotelar.apariencia', JSON.stringify({texto:'grande'})); location.reload(); 1`); await nav.esperar(1200);
await nav.tamano(390, 800);
for (const h of ['#/inicio', '#/mi', '#/planes/formas', '#/hoja/arquitectura', '#/mapa/conexiones', '#/glosario']) {
  await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(450);
  inf.textoGrande.push([h, await nav.evaluar(`document.documentElement.scrollWidth > innerWidth + 1 ? 'desborda ' + document.documentElement.scrollWidth : 'ok'`)]);
}
await nav.tamano(1280, 800);

// 6. Qué se guarda en el navegador tras usar la plataforma (y si hay correo en claro)
await nav.evaluar(`localStorage.clear(); location.hash='#/registro/lista'; location.reload(); 1`); await nav.esperar(1500);
await nav.evaluar(`(function(){ var i = document.querySelector('main input[type=email], main input[type=text]'); return i ? i.type + ' ' + i.name + ' ' + i.autocomplete : 'sin campo'; })()`).then((x) => { inf.almacenamiento.campoCorreo = x; });
inf.almacenamiento.claves = await nav.evaluar(`JSON.stringify(Object.keys(localStorage))`);
inf.almacenamiento.cookies = await nav.evaluar(`document.cookie`);

fs.writeFileSync(SAL, JSON.stringify(inf, null, 1));
console.log('listo');
nav.cerrar();
