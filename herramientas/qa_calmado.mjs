// qa_calmado.mjs: con la versión calmada activada, ¿qué sigue moviéndose? (desplazamiento suave, animaciones, revelado, barra de hilos)
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ puerto: 9611 });
await nav.ir(process.argv[2] + '/index.html', 1200);
await nav.evaluar(`localStorage.setItem('mosaicotelar.apariencia', JSON.stringify({movimiento:'calmado'})); location.reload(); 1`); await nav.esperar(2500);
console.log('atributo:', await nav.evaluar('document.documentElement.dataset.movimiento'));
console.log('scroll-behavior de html:', await nav.evaluar(`getComputedStyle(document.documentElement).scrollBehavior`));
console.log('animaciones largas activas:', await nav.evaluar(`document.getAnimations().filter(function(a){ var t = a.effect.getComputedTiming(); return a.playState === 'running' && t.endTime > 50; }).length`));
console.log('revela no visibles:', await nav.evaluar(`[].slice.call(document.querySelectorAll('.revela')).filter(function(e){ return getComputedStyle(e).opacity !== '1'; }).length + ' de ' + document.querySelectorAll('.revela').length`));
console.log('barra de hilos:', await nav.evaluar(`(document.getElementById('progreso-hilos') ? getComputedStyle(document.getElementById('progreso-hilos')).display : 'no existe')`));
console.log('hover de tarjeta eleva:', await nav.evaluar(`(function(){ var t = document.querySelector('.rol-tarjeta'); return t ? getComputedStyle(t).transitionDuration : 'sin tarjeta'; })()`));
// salto de ancla con scrollIntoView / scrollTo: ¿es suave?
await nav.evaluar(`window.scrollTo({ top: 1500, behavior: 'smooth' }); 1`); await nav.esperar(120);
console.log('scrollY 120 ms despues de pedir un desplazamiento suave a 1500:', await nav.evaluar('Math.round(window.scrollY)'));
await nav.esperar(1500);
console.log('scrollY final:', await nav.evaluar('Math.round(window.scrollY)'));
nav.cerrar();
