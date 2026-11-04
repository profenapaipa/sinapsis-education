// qa_saltar.mjs: prueba el enlace "Saltar al contenido" desde una página interna. Si el enlace cambia el hash a #app,
// el enrutador por hash podría tomarlo por una ruta desconocida y volver a pintar el inicio.
import { abrir } from './qa_cdp.mjs';
const nav = await abrir({ puerto: 9462 });
await nav.ir(process.argv[2] + '/index.html', 1500);
for (const h of ['#/hoja/propuesta', '#/planes/formas']) {
  await nav.evaluar(`location.hash='${h}'; 1`); await nav.esperar(700);
  await nav.evaluar(`document.querySelector('.saltar').focus(); 1`);
  await nav.tecla('Enter'); await nav.esperar(700);
  console.log(h, '=>', await nav.evaluar(`location.hash + ' | h1=' + ((document.querySelector('main h1')||{}).textContent||'') + ' | foco=' + document.activeElement.tagName + ' | titulo=' + document.title`));
}
nav.cerrar();
