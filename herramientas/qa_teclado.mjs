// qa_teclado.mjs: recorre con Tab (teclado real, no clics) las pantallas principales de cada rol y mide:
// foco visible, foco que queda fuera de la vista o tapado, orden, trampas, controles que solo funcionan con ratón,
// el enlace "Saltar al contenido", diálogos (foco dentro, Escape, retorno) y menús.
// Uso: node herramientas/qa_teclado.mjs http://127.0.0.1:8765 <salida.json> [navegador]
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';

const BASE = process.argv[2]; const SAL = process.argv[3]; const NAV = process.argv[4] || 'chrome';
const nav = await abrir({ ancho: 1280, alto: 800, puerto: 9461, navegador: NAV });
const informe = { navegador: NAV, recorridos: [], dialogos: [], menus: [], soloRaton: [] };

const estadoFoco = `(function(){
  var e = document.activeElement; if (!e || e === document.body) return JSON.stringify({ cuerpo: true });
  var cs = getComputedStyle(e); var r = e.getBoundingClientRect();
  var nombre = (e.getAttribute('aria-label') || e.innerText || e.value || e.getAttribute('title') || e.alt || '').replace(/\\s+/g,' ').trim().slice(0, 50);
  // ¿hay algo encima del centro del elemento?
  var cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
  var tope = document.elementFromPoint(cx, cy); var tapado = tope && !(e.contains(tope) || tope.contains(e));
  var cont = e.closest('.riel') ? 'riel' : e.closest('.franja') ? 'franja' : e.closest('.barra-portales') ? 'pestanas' : e.closest('main') ? 'main' : e.closest('.pie') ? 'pie' : e.closest('dialog') ? 'dialogo' : e.closest('.panel-ia') ? 'panel-ia' : 'otro';
  var anillo = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none');
  return JSON.stringify({ tag: e.tagName.toLowerCase(), rol: e.getAttribute('role') || '', nombre: nombre, cont: cont, anillo: !!anillo, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
    visible: r.width > 0 && r.height > 0, fuera: r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth, tapado: !!tapado, tapadoPor: tapado ? (tope.className || tope.tagName) : '', w: Math.round(r.width), h: Math.round(r.height), id: e.id || '' });
})()`;

async function recorrer(nombre, hash, maxPasos = 140) {
  await nav.evaluar(`location.hash='${hash}'; document.documentElement.style.scrollBehavior='auto'; 1`); await nav.esperar(700);
  await nav.evaluar(`document.activeElement && document.activeElement.blur(); window.scrollTo(0,0); 1`);
  await nav.tecla('Tab', { shift: true }); await nav.evaluar(`window.scrollTo(0,0); 1`);
  const pasos = []; const vistos = new Map(); let ciclo = false;
  for (let i = 0; i < maxPasos; i++) {
    await nav.tecla('Tab'); await nav.esperar(120);
    const s = JSON.parse(await nav.evaluar(estadoFoco));
    if (s.cuerpo) { pasos.push({ cuerpo: true }); if (pasos.filter((p) => p.cuerpo).length > 2) break; continue; }
    const clave = s.tag + '|' + s.nombre + '|' + s.cont + '|' + s.id;
    if (vistos.has(clave) && vistos.get(clave) > 1) { ciclo = true; break; }
    vistos.set(clave, (vistos.get(clave) || 0) + 1);
    pasos.push(s);
  }
  const reales = pasos.filter((p) => !p.cuerpo);
  const res = {
    nombre, hash, paradas: reales.length, ciclo,
    sinAnillo: reales.filter((p) => !p.anillo).map((p) => `${p.tag} "${p.nombre}" (${p.cont})`),
    sinNombre: reales.filter((p) => !p.nombre && p.tag !== 'iframe').map((p) => `${p.tag} (${p.cont}) ${p.id}`),
    fueraDeVista: reales.filter((p) => p.fuera || !p.visible).map((p) => `${p.tag} "${p.nombre}" (${p.cont})`),
    tapados: reales.filter((p) => p.tapado).map((p) => `${p.tag} "${p.nombre}" tapado por ${p.tapadoPor}`),
    porZona: reales.reduce((a, p) => { a[p.cont] = (a[p.cont] || 0) + 1; return a; }, {}),
    primeras: reales.slice(0, 4).map((p) => `${p.tag} "${p.nombre}"`),
  };
  informe.recorridos.push(res);
  return res;
}

await nav.ir(BASE + '/index.html', 1500);

// 1. Enlace "Saltar al contenido": ¿es lo primero y manda el foco al contenido?
await nav.evaluar(`localStorage.clear(); location.reload(); 1`); await nav.esperar(1500);
await nav.tecla('Tab');
const primero = JSON.parse(await nav.evaluar(estadoFoco));
await nav.tecla('Enter'); await nav.esperar(300);
const trasSaltar = await nav.evaluar(`document.activeElement.id + '|' + document.activeElement.tagName + '|' + location.hash`);
informe.saltar = { primerFoco: primero.nombre, visibleAlEnfocar: !primero.fuera && primero.visible, trasEnter: trasSaltar };

// 1b. El enlace "Saltar al contenido" desde una página interna: ¿cambia la ruta?
await nav.evaluar(`location.hash='#/hoja/propuesta'; 1`); await nav.esperar(700);
await nav.evaluar(`document.activeElement.blur(); 1`); await nav.tecla('Tab'); await nav.tecla('Enter'); await nav.esperar(600);
informe.saltarDesdeHoja = await nav.evaluar(`location.hash + ' | h1=' + ((document.querySelector('main h1')||{}).textContent||'') + ' | foco=' + document.activeElement.tagName`);

// 2. Recorridos por rol
for (const rol of ['', 'docente', 'familia', 'estudiante']) {
  await nav.evaluar(`localStorage.clear(); ${rol ? `localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'${rol}'}));` : ''} location.hash='#/'; location.reload(); 1`);
  await nav.esperar(1500);
  const pantallas = rol ? ['#/inicio', '#/guia/' + rol, '#/mi', '#/portales/general', '#/planes/formas'] : ['#/inicio', '#/planes/formas', '#/hoja/propuesta', '#/glosario'];
  for (const h of pantallas) await recorrer((rol || 'sinrol') + ' ' + h, h);
}

// 3. Controles que solo se pueden usar con ratón: algo con cursor:pointer o con oyente de clic que no se alcanza con Tab
informe.soloRaton = JSON.parse(await nav.evaluar(`(function(){
  var fallos = [];
  [].slice.call(document.querySelectorAll('body *')).forEach(function(e){
    if (!e.getClientRects().length) return;
    var cs = getComputedStyle(e); if (cs.cursor !== 'pointer') return;
    var natural = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL|OPTION)$/.test(e.tagName) || e.hasAttribute('tabindex') || e.closest('a,button,summary,label');
    if (!natural) fallos.push(e.tagName + '.' + (e.className && e.className.baseVal === undefined ? e.className : '') + ' "' + (e.textContent||'').trim().slice(0,30) + '"');
  });
  return JSON.stringify(fallos.slice(0, 20));
})()`));

// 4. Diálogo: abrir uno desde Mi espacio (docente), comprobar foco dentro, trampa, Escape y retorno
await nav.evaluar(`localStorage.clear(); localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='#/mi'; location.reload(); 1`); await nav.esperar(1500);
for (const sec of ['actividades', 'estudiantes', 'ajustes']) {
  await nav.evaluar(`location.hash='#/mi/${sec}'; 1`); await nav.esperar(700);
  const abre = await nav.evaluar(`(function(){ var b = [].slice.call(document.querySelectorAll('main button, main a.btn')).find(function(x){ return /^(Nueva|Nuevo|Agregar|Crear|Proponer)/i.test(x.textContent.trim()); }); if (!b) return ''; b.focus(); return b.textContent.trim(); })()`);
  if (!abre) { informe.dialogos.push({ sec, sinBoton: true }); continue; }
  await nav.tecla('Enter'); await nav.esperar(500);
  const d = JSON.parse(await nav.evaluar(`(function(){ var d = document.querySelector('dialog[open]'); if (!d) return JSON.stringify({ abierto: false }); var a = document.activeElement;
    return JSON.stringify({ abierto: true, focoDentro: d.contains(a), focoEn: (a.tagName + ' ' + (a.getAttribute('aria-label') || a.id || a.textContent || '').trim().slice(0, 30)), titulo: (d.querySelector('h2') || {}).textContent, modal: !!d.matches(':modal'), nombreAccesible: d.getAttribute('aria-labelledby') ? 'sí' : 'no' }); })()`));
  // 25 Tabs: ¿el foco se escapa del diálogo?
  let escapa = false;
  for (let i = 0; i < 25; i++) { await nav.tecla('Tab'); const ok = await nav.evaluar(`document.activeElement === document.body || !!document.activeElement.closest('dialog[open]')`); if (!ok) { escapa = true; break; } }
  // Enter dentro de un campo de texto: ¿envía el formulario?
  const antes = await nav.evaluar(`document.querySelectorAll('dialog[open]').length`);
  await nav.evaluar(`(function(){ var i = document.querySelector('dialog[open] input[type=text]'); if (i) { i.focus(); i.value = 'Prueba QA'; } return 1; })()`);
  await nav.tecla('Enter'); await nav.esperar(300);
  const trasEnter = await nav.evaluar(`document.querySelectorAll('dialog[open]').length`);
  await nav.tecla('Escape'); await nav.esperar(300);
  const tras = JSON.parse(await nav.evaluar(`JSON.stringify({ cerrado: !document.querySelector('dialog[open]'), foco: document.activeElement.tagName + ' ' + document.activeElement.textContent.trim().slice(0, 30) })`));
  informe.dialogos.push(Object.assign({ sec, abrioCon: abre, escapaDelDialogo: escapa, dialogosAntesDeEnter: antes, dialogosTrasEnterEnCampo: trasEnter }, d, { trasEscape: tras }));
}

// 5. Menús: rol y apariencia con teclado
for (const [id, menu] of [['rol-actual', 'menu-rol'], ['btn-apariencia', 'menu-apariencia'], ['btn-ia', 'slot-ia']]) {
  await nav.evaluar(`location.hash='#/inicio'; 1`); await nav.esperar(500);
  await nav.evaluar(`document.getElementById('${id}').focus(); 1`);
  await nav.tecla('Enter'); await nav.esperar(400);
  const abierto = await nav.evaluar(`!document.getElementById('${menu}').hidden`);
  const foco1 = await nav.evaluar(`(document.activeElement.id || document.activeElement.tagName) + ' dentro=' + document.getElementById('${menu}').contains(document.activeElement)`);
  await nav.tecla('Escape'); await nav.esperar(300);
  const cerrado = await nav.evaluar(`document.getElementById('${menu}').hidden`);
  const foco2 = await nav.evaluar(`document.activeElement.id || document.activeElement.tagName`);
  informe.menus.push({ boton: id, abreConEnter: abierto, focoTrasAbrir: foco1, cierraConEscape: cerrado, focoTrasCerrar: foco2, ariaExpandedCoherente: await nav.evaluar(`document.getElementById('${id}').getAttribute('aria-expanded')`) });
}

fs.writeFileSync(SAL, JSON.stringify(informe, null, 1));
console.log('listo', SAL, 'recorridos:', informe.recorridos.length);
nav.cerrar();
