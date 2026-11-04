// qa_movil.mjs <direccion-base> <carpeta-de-capturas> <prefijo>: mide la primera pantalla de la bienvenida y otras pantallas
// en cinco tamaños de celular, con emulación móvil de verdad (táctil, factor 2 o 3, ventana "mobile"). Guarda capturas del
// primer pliegue y escribe un resumen en JSON.
//
//   node herramientas/qa_movil.mjs http://127.0.0.1:8793/ reportes/capturas-movil antes
//
// Por qué existe: casi todas las visitas llegan escaneando el QR con un celular; los fallos de este sitio no se ven leyendo el
// código. Mide: ¿se ve el h1, el logo y UN botón principal sin desplazarse?, desborde horizontal, objetivos táctiles menores de
// 44 px, tamaño de letra del cuerpo y cuánto del alto se lleva la franja superior.
import fs from 'node:fs';
import path from 'node:path';
import { abrir } from './qa_cdp.mjs';

const base = process.argv[2] || 'http://127.0.0.1:8793/';
const salida = path.resolve(process.argv[3] || 'reportes/capturas-movil');
const prefijo = process.argv[4] || 'medida';
fs.mkdirSync(salida, { recursive: true });
const TAMANOS = [[320, 568, 2], [360, 640, 3], [375, 667, 2], [390, 844, 3], [412, 915, 2.625]];
const RUTAS = ['', '#/mi', '#/planes', '#/portales/kinesis', '#/portales/wisfox', '#/valeria', '#/mapa', '#/glosario', '#/piloto'];

const medida = `(() => {
  const vh = innerHeight, vw = innerWidth;
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const h1 = document.querySelector('main h1');
  const rh1 = h1 && h1.getBoundingClientRect();
  const btns = [...document.querySelectorAll('main a.btn, main button.btn')].filter(vis);
  const primerPliegue = btns.filter((b) => { const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= vh; }).map((b) => b.innerText.trim().slice(0, 40));
  const chicos = [...document.querySelectorAll('a, button, [role=button], input, select, textarea, summary')].filter(vis).filter((e) => {
    const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.right < 0) return false;
    if (e.matches('a') && e.closest('p, li') && getComputedStyle(e).display === 'inline') return false;
    return r.height < 43.5 || r.width < 43.5; }).map((e) => (e.id || e.className || e.tagName).toString().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  const franja = document.querySelector('.franja'); const rf = franja && franja.getBoundingClientRect();
  const p = document.querySelector('main p');
  return { vw, vh, scrollW: document.documentElement.scrollWidth, desborde: document.documentElement.scrollWidth > vw + 1,
    h1: h1 ? { top: Math.round(rh1.top), bottom: Math.round(rh1.bottom), texto: h1.innerText.slice(0, 50) } : null,
    botonesEnPliegue: primerPliegue, totalBotones: btns.length, franjaAlto: rf ? Math.round(rf.height) : 0,
    letraCuerpo: p ? getComputedStyle(p).fontSize : null, chicos: chicos.length, ejemplosChicos: chicos.slice(0, 8) };
})()`;

const resumen = [];
for (const [w, h, f] of TAMANOS) {
  const nav = await abrir({ ancho: w, alto: h, movil: true, factor: f, puerto: 9460 + (w % 50) });
  try {
    for (const ruta of RUTAS) {
      await nav.ir(base + 'index.html' + ruta, 1800);
      const m = await nav.evaluar(medida);
      const nombre = `${prefijo}-${w}x${h}-${ruta.replace(/[#/]/g, '') || 'inicio'}`;
      if (ruta === '' || ruta === '#/mi' || ruta === '#/portales/kinesis' || ruta === '#/planes') await nav.foto(path.join(salida, nombre + '.png'), { completa: false });
      resumen.push({ w, h, ruta: ruta || 'inicio', ...m });
    }
  } finally { nav.cerrar(); }
}
fs.writeFileSync(path.join(salida, prefijo + '.json'), JSON.stringify(resumen, null, 1));
for (const r of resumen) console.log(`${r.w}x${r.h} ${String(r.ruta).padEnd(14)} desborde=${r.desborde ? 'SI' : 'no'} h1=${r.h1 ? r.h1.top + '-' + r.h1.bottom : '-'} btnPliegue=${JSON.stringify(r.botonesEnPliegue)} franja=${r.franjaAlto} letra=${r.letraCuerpo} chicos=${r.chicos}`);
