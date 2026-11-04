// qa_impresion_portal.mjs: (1) impresión con tema claro y oscuro, y con la página recién abierta sin desplazarse;
// (2) qué ve la persona cuando el portal responde con una página de error (la carga "termina" aunque el portal esté caído).
// Uso: node herramientas/qa_impresion_portal.mjs http://127.0.0.1:8765 <carpeta de capturas>
import { abrir } from './qa_cdp.mjs';
import path from 'node:path';
const BASE = process.argv[2]; const CAP = process.argv[3];
const nav = await abrir({ ancho: 1280, alto: 800, puerto: 9531 });
await nav.ir(BASE + '/index.html', 1500);

for (const esquema of ['light', 'dark']) {
  for (const [n, h] of [['inicio', '#/inicio'], ['formas', '#/planes/formas'], ['hoja', '#/hoja/propuesta'], ['piloto', '#/piloto']]) {
    await nav.medio({ media: '', features: [{ name: 'prefers-color-scheme', value: esquema }] });
    await nav.evaluar(`location.hash='${h}'; window.scrollTo(0,0); 1`); await nav.esperar(900);
    await nav.medio({ media: 'print', features: [{ name: 'prefers-color-scheme', value: esquema }] });
    const m = await nav.evaluar(`JSON.stringify({ revela: document.querySelectorAll('.revela:not(.visto)').length, fondoTarjeta: (document.querySelector('.tarjeta') ? getComputedStyle(document.querySelector('.tarjeta')).backgroundColor + ' / texto ' + getComputedStyle(document.querySelector('.tarjeta')).color : '-') })`);
    console.log(esquema, n, m);
    await nav.foto(path.join(CAP, `impresion-${esquema}-${n}.png`), { completa: true, maxAlto: 3500 });
  }
}
await nav.medio({ media: '', features: [{ name: 'prefers-color-scheme', value: 'light' }] });

// Portal caído: se apunta el portal a una dirección que responde 404 (misma máquina de GitHub Pages)
await nav.evaluar(`MT.config.portales.kinesis = 'https://profenapaipa.github.io/no-existe-qa/'; localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.hash='#/portales/kinesis'; 1`);
await nav.esperar(3500);
console.log('portal con 404, estado visible:', await nav.evaluar(`(document.querySelector('.vivo-panel:not([hidden]) .vivo-estado') || {}).textContent || '(sin mensaje: el aviso desapareció)'`));
await nav.foto(path.join(CAP, 'portal-404.png'), { completa: false });
nav.cerrar();
