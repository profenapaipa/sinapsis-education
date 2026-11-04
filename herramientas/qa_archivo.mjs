// qa_archivo.mjs: abre la plataforma desde el disco (file://), como se haría con la copia de respaldo en una USB, y anota qué falla.
import { abrir } from './qa_cdp.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const nav = await abrir({ puerto: 9541 });
await nav.ir(pathToFileURL(path.resolve('index.html')).href, 2500);
console.log('titulo:', await nav.evaluar('document.title'), '| h1:', await nav.evaluar(`(document.querySelector('#app h1')||{}).textContent`));
console.log('errores de la plataforma:', await nav.evaluar('JSON.stringify(window.__errores)'));
console.log('consola:', JSON.stringify([...new Set(nav.eventos.consola)]).slice(0, 600));
console.log('fallos de red:', JSON.stringify(nav.eventos.fallos.slice(0, 6)));
console.log('fuente Nunito cargada:', await nav.evaluar(`document.fonts.check('16px Nunito')`));
await nav.evaluar(`localStorage.setItem('x','1'); 1`);
console.log('localStorage en file://:', await nav.evaluar(`localStorage.getItem('x')`));
await nav.evaluar(`location.hash='#/portales/kinesis'; 1`); await nav.esperar(3000);
console.log('portal en file:', await nav.evaluar(`(document.querySelector('.vivo-panel:not([hidden]) iframe')||{}).src + ' | estado: ' + ((document.querySelector('.vivo-panel:not([hidden]) .vivo-estado')||{}).textContent||'(sin aviso)')`));
nav.cerrar();
