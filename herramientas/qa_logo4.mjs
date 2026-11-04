// qa_logo4.mjs: la animación del logo al cargar frente a "Ver otra vez": ¿en cuál de los dos casos se ven las piezas durante la animación?
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ puerto: 9651 });
const sonda = `(function(){ var l = document.querySelector('#app .logo-tejido'); var op = [].slice.call(l.querySelectorAll('.pieza')).map(function(p){ return (+getComputedStyle(p).opacity).toFixed(1); }).join(','); return 'piezas ' + op + ' | animaciones en el logo: ' + l.getAnimations({ subtree: true }).length + ' | clases ' + l.getAttribute('class'); })()`;
await nav.ir(process.argv[2] + '/index.html', 100);
await nav.evaluar('localStorage.clear(); 1');
await nav.enviar('Page.navigate', { url: process.argv[2] + '/index.html' });
await nav.esperar(1200);
console.log('al cargar, 1,2 s:', await nav.evaluar(sonda));
await nav.esperar(3500);
console.log('al cargar, 4,7 s:', await nav.evaluar(sonda));
await nav.evaluar(`[].slice.call(document.querySelectorAll('#app button')).find(function(b){ return /Ver otra vez/.test(b.textContent); }).click(); 1`);
await nav.esperar(1200);
console.log('Ver otra vez, 1,2 s:', await nav.evaluar(sonda));
nav.cerrar();
