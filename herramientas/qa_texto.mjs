// qa_texto.mjs: vuelca el texto visible de cada pantalla (por rol) y su estructura de títulos, para leer el sitio
// como docente, familia, estudiante o alguien que no conoce el proyecto, y para buscar palabras que la guía de voz evita.
// Uso: node herramientas/qa_texto.mjs http://127.0.0.1:8765 <carpeta de salida>
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2]; const SAL = process.argv[3];
fs.mkdirSync(SAL, { recursive: true });
const nav = await abrir({ ancho: 1280, alto: 800, puerto: 9451 });
await nav.ir(BASE + '/index.html', 1500);

const rutas = JSON.parse(await nav.evaluar(`JSON.stringify(Object.keys(MT.router.rutas).map(function(k){ var d = MT.router.rutas[k]; var s = typeof d.subs === 'function' ? d.subs() : d.subs; return { id: k, titulo: d.titulo, subs: (s || []).map(function(x){ return x.id; }) }; }))`));
fs.writeFileSync(path.join(SAL, 'rutas.json'), JSON.stringify(rutas, null, 1));

const extraer = `(function(){
  var main = document.getElementById('app');
  var vis = function(e){ return e.getClientRects().length > 0; };
  var heads = [].slice.call(main.querySelectorAll('h1,h2,h3,h4,[role=heading]')).filter(vis).map(function(e){ return (e.getAttribute('aria-level') || e.tagName.slice(1)) + ': ' + e.textContent.trim().slice(0, 80); });
  var t = main.innerText;
  return JSON.stringify({ hash: location.hash, titulo: document.title, rol: MT.store.obtener().rol, heads: heads, texto: t });
})()`;

const roles = ['', 'docente', 'orientacion', 'familia', 'coordinacion', 'estudiante'];
let total = 0;
for (const rol of roles) {
  await nav.evaluar(`localStorage.clear(); ${rol ? `localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'${rol}'}));` : ''} location.hash='#/'; location.reload(); 1`);
  await nav.esperar(1500);
  for (const r of rutas) {
    const hs = r.subs.length ? r.subs.map((s) => `#/${r.id}/${s}`) : [`#/${r.id}`];
    for (const h of hs) {
      await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(450);
      const d = JSON.parse(await nav.evaluar(extraer));
      const nombre = `${rol || 'sinrol'}__${h.replace(/[#/]+/g, '_')}`;
      fs.writeFileSync(path.join(SAL, nombre + '.txt'), `HASH ${d.hash}\nTITLE ${d.titulo}\nROL ${d.rol}\nHEADINGS\n${d.heads.join('\n')}\n\n---\n${d.texto}\n`);
      total++;
    }
  }
}
console.log('pantallas volcadas:', total);
nav.cerrar();
