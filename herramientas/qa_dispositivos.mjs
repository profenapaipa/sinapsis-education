// qa_dispositivos.mjs: matriz de pantallas (proyector, portátil, tableta, celulares) en Chrome o Edge.
// Por cada tamaño y pantalla: captura de la ventana, desborde horizontal, espacio que se queda en barras fijas,
// altura que le queda a un portal, objetivos táctiles pequeños y texto de menos de 12 px.
// Uso: node herramientas/qa_dispositivos.mjs http://127.0.0.1:8765 <carpeta de capturas> <salida.json> [navegador]
import { abrir } from './qa_cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2]; const CAP = process.argv[3]; const SAL = process.argv[4]; const NAV = process.argv[5] || 'chrome';
fs.mkdirSync(CAP, { recursive: true });
const TAMANOS = [
  ['proyector-1280x720', 1280, 720, false], ['proyector-1920x1080', 1920, 1080, false], ['portatil-1366x768', 1366, 768, false],
  ['tableta-768x1024', 768, 1024, true], ['tableta-1024x768', 1024, 768, true],
  ['android-360x800', 360, 800, true], ['iphone-390x844', 390, 844, true], ['iphone-se-375x667', 375, 667, true],
];
const PANTALLAS = [['inicio', '#/inicio'], ['mi', '#/mi'], ['portal-kinesis', '#/portales/kinesis'], ['formas', '#/planes/formas'], ['hoja', '#/hoja/propuesta'], ['mapa', '#/mapa/conexiones']];
const inf = [];
let puerto = 9480;
for (const [nombre, w, h, movil] of TAMANOS) {
  const nav = await abrir({ ancho: w, alto: h, puerto: puerto++, navegador: NAV, movil });
  await nav.ir(BASE + '/index.html', 1200);
  await nav.evaluar(`localStorage.clear(); localStorage.setItem('mosaicotelar.v2', JSON.stringify({rol:'docente'})); location.reload(); 1`); await nav.esperar(1500);
  for (const [pn, hash] of PANTALLAS) {
    await nav.evaluar(`location.hash='${hash}'; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0); 1`); await nav.esperar(pn === 'portal-kinesis' ? 3500 : 1100);
    const m = JSON.parse(await nav.evaluar(`(function(){
      var d = document.documentElement; var f = document.querySelector('.franja'), b = document.getElementById('barra-portales'), r = document.querySelector('.riel');
      var fijo = function(e){ if (!e) return 0; var cs = getComputedStyle(e); return (cs.position === 'fixed' || cs.position === 'sticky') ? Math.round(e.getBoundingClientRect().height) : 0; };
      var rielAbajo = r && getComputedStyle(r).position === 'fixed' && r.getBoundingClientRect().top > innerHeight / 2 ? Math.round(r.getBoundingClientRect().height) : 0;
      var peq = [].slice.call(document.querySelectorAll('main a, main button, main select, main input, .franja button, .franja a, .barra-portales a, .barra-portales button, .riel a')).filter(function(e){ var q = e.getBoundingClientRect(); return q.width && q.height && (q.height < 44 || q.width < 44) && !e.closest('.solo-lectores'); });
      var peq24 = peq.filter(function(e){ var q = e.getBoundingClientRect(); return q.height < 24 || q.width < 24; });
      var marco = document.querySelector('.vivo-panel:not([hidden]) iframe'); var mq = marco && marco.getBoundingClientRect();
      var chico = 0; [].slice.call(document.querySelectorAll('main p, main li, main td, main span, main a, main button')).forEach(function(e){ if (e.children.length === 0 && e.textContent.trim() && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 12) chico++; });
      return JSON.stringify({ desborda: d.scrollWidth > innerWidth + 1, scrollW: d.scrollWidth, altoPagina: d.scrollHeight, fijoArriba: fijo(f) + fijo(b), fijoAbajo: rielAbajo, rielLateral: r && getComputedStyle(r).position !== 'static' && !rielAbajo ? Math.round(r.getBoundingClientRect().width) : 0,
        objetivosMenos44: peq.length, objetivosMenos24: peq24.length, ejemplosMenos44: peq.slice(0, 3).map(function(e){ return (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height); }),
        marcoAlto: mq ? Math.round(mq.height) : null, marcoAncho: mq ? Math.round(mq.width) : null, textoMenos12px: chico });
    })()`));
    m.pantalla = pn; m.tamano = nombre; m.viewportAlto = h;
    if (m.marcoAlto) m.marcoPctDeVentana = Math.round((m.marcoAlto / h) * 100);
    inf.push(m);
    const arch = path.join(CAP, `${NAV}-${nombre}-${pn}.png`);
    await nav.foto(arch, { completa: pn !== 'portal-kinesis' && !(w < 500 && pn === 'inicio') && !(w < 500 && pn === 'hoja'), maxAlto: 3000 });
  }
  nav.cerrar();
}
fs.writeFileSync(SAL, JSON.stringify(inf, null, 1));
console.log('listo', inf.length, 'casos');
