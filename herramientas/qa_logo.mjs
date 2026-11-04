// qa_logo.mjs: la animación del logo de la bienvenida cuadro a cuadro, sin cambiar el tamaño de la ventana
// (cambiarlo reinicia la animación y falsea la medición). Uso: node herramientas/qa_logo.mjs <url> <carpeta> [calmado]
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';
const [, , BASE, CAP, modo] = process.argv;
fs.mkdirSync(CAP, { recursive: true });
const nav = await abrir({ puerto: 9621 });
if (process.env.ESQUEMA) await nav.medio({ features: [{ name: 'prefers-color-scheme', value: process.env.ESQUEMA }] });
await nav.ir(BASE + '/index.html', 300);
if (modo === 'calmado') { await nav.evaluar(`localStorage.setItem('mosaicotelar.apariencia', JSON.stringify({movimiento:'calmado'})); 1`); }
else await nav.evaluar(`localStorage.clear(); 1`);
await nav.enviar('Page.navigate', { url: BASE + '/index.html' });
const t0 = Date.now();
const sonda = `(function(){ var l = document.querySelector('#app .logo-tejido'); if (!l) return 'sin logo en #app'; var r = l.getBoundingClientRect();
  var piezas = [].slice.call(l.querySelectorAll('.pieza')).filter(function(p){ return getComputedStyle(p).opacity > 0.5; }).length;
  return 'clases=' + l.getAttribute('class') + ' | caja=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' | piezas visibles=' + piezas + ' | anim activas=' + document.getAnimations().filter(function(a){ return a.playState === 'running'; }).length; })()`;
for (const t of [200, 700, 1200, 1800, 2400, 3000, 3800, 5200]) {
  const falta = t - (Date.now() - t0); if (falta > 0) await nav.esperar(falta);
  const r = await nav.enviar('Page.captureScreenshot', { format: 'png', clip: { x: 84, y: 150, width: 560, height: 330, scale: 1 } });
  fs.writeFileSync(path.join(CAP, `logo-${modo || 'normal'}-${String(t).padStart(4, '0')}ms.png`), Buffer.from(r.result.data, 'base64'));
  console.log(t, 'ms (real', Date.now() - t0 + ')', await nav.evaluar(sonda));
}
nav.cerrar();
