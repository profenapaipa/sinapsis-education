// qa_chicos.mjs: lista qué controles miden menos de 24 px (WCAG 2.5.8) y qué textos miden menos de 12 px, en una pantalla.
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ ancho: Number(process.argv[3] || 1280), alto: 800, puerto: 9490 });
await nav.ir(process.argv[2] + '/index.html', 1200);
const medir = `(function(){
  var ctrl = [];
  [].slice.call(document.querySelectorAll('main a, main button, main select, main input')).forEach(function(e){
    var q = e.getBoundingClientRect();
    if (q.width && q.height && (q.height < 24 || q.width < 24)) ctrl.push(e.tagName + ' ' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 26) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + ' en ' + (e.parentElement.className || e.parentElement.tagName));
  });
  var t = {};
  [].slice.call(document.querySelectorAll('main *')).forEach(function(e){
    if (e.children.length === 0 && e.textContent.trim() && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 12) {
      var k = e.tagName + '.' + (typeof e.className === 'string' ? e.className : '') + ' ' + getComputedStyle(e).fontSize + ' ' + e.textContent.trim().slice(0, 20);
      t[k] = (t[k] || 0) + 1;
    }
  });
  return JSON.stringify({ ctrl: ctrl, texto: Object.entries(t).slice(0, 6) });
})()`;
for (const h of ['#/inicio', '#/mapa/conexiones', '#/planes/formas']) {
  await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(900);
  console.log(h, await nav.evaluar(medir));
}
nav.cerrar();
