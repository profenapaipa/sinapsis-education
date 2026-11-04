// qa_logo2.mjs: durante la animación del logo, ¿qué valores toman las piezas y los hilos? (opacidad, transformación, retraso de cada animación)
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ puerto: 9631 });
await nav.ir(process.argv[2] + '/index.html', 100);
await nav.evaluar('localStorage.clear(); 1');
await nav.enviar('Page.navigate', { url: process.argv[2] + '/index.html' });
await nav.esperar(700);
console.log(await nav.evaluar(`(function(){ var l = document.querySelector('#app .logo-tejido'); return JSON.stringify(document.getAnimations().map(function(a){ var t = a.effect.getComputedTiming(); var e = a.effect.target; return (e && (e.getAttribute('class') || e.tagName)) + ' d' + Math.round(t.delay) + ' dur' + Math.round(t.duration) + ' fin' + Math.round(t.endTime) + ' ' + JSON.stringify(a.effect.getKeyframes().map(function(k){ return { o: k.offset, op: k.opacity, tr: k.transform }; })); })); })()`));
for (const t of [600, 1500, 2500]) {
  await nav.esperar(t === 600 ? 450 : 1000);
  console.log(t, await nav.evaluar(`(function(){ var l = document.querySelector('#app .logo-tejido'); var f = function(s){ return [].slice.call(l.querySelectorAll(s)).map(function(e){ var c = getComputedStyle(e); return (c.display === 'none' ? 'x' : (+c.opacity).toFixed(1)); }).join(','); };
    return 'piezas ' + f('.pieza') + ' | hilos ' + f('.hilo') + ' | tela-unica ' + f('.tela-unica') + ' | punta ' + f('.punta') + ' | currentTime ' + Math.round(document.getAnimations()[0] ? document.getAnimations()[0].currentTime : -1); })()`));
}
nav.cerrar();
