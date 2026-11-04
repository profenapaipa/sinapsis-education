// qa_logo3.mjs: ¿por qué la pieza del logo tiene opacidad 0 durante la animación en tiempo real? Se mira su lista de animaciones.
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ puerto: 9641 });
await nav.ir(process.argv[2] + '/index.html', 100);
await nav.evaluar('localStorage.clear(); 1');
await nav.enviar('Page.navigate', { url: process.argv[2] + '/index.html' });
await nav.esperar(1300);
console.log(await nav.evaluar(`(function(){ var l = document.querySelector('#app .logo-tejido'); var p = l.querySelector('.pieza'); var c = getComputedStyle(p); var g = l.querySelector('.piezas');
  return JSON.stringify({ clases: l.getAttribute('class'), conectado: l.isConnected, piezaOpacity: c.opacity, piezaDisplay: c.display, piezasDisplay: getComputedStyle(g).display, piezasOpacity: getComputedStyle(g).opacity, piezaAnim: p.getAnimations().map(function(a){ var t = a.effect.getComputedTiming(); return a.playState + ' prog=' + t.progress + ' delay=' + t.delay + ' fill=' + t.fill + ' curr=' + Math.round(a.currentTime); }), lienzoAnim: l.querySelector('.lienzo').getAnimations().map(function(a){ return a.playState + ' curr=' + Math.round(a.currentTime); }), tela: getComputedStyle(l.querySelector('.tela-unica')).opacity + '/' + getComputedStyle(l.querySelector('.tela-unica')).display }); })()`));
nav.cerrar();
