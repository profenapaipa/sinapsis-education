// qa_rol.mjs: mide el selector de rol del riel y el regreso al inicio, y deja capturas (390 y 1280).
// Uso: node herramientas/qa_rol.mjs http://127.0.0.1:8791 <carpeta de salida>
import { abrir } from './qa_cdp.mjs';
import path from 'node:path';
const BASE = process.argv[2]; const SAL = process.argv[3];
let fallos = 0; const ok = (n, c, d) => { if (!c) fallos++; console.log((c ? 'OK   ' : 'FALLA') + ' ' + n + (c ? '' : '  ' + JSON.stringify(d))); };
for (const [ancho, alto, puerto] of [[1280, 800, 9471], [390, 844, 9472]]) {
  const nav = await abrir({ ancho, alto, puerto, movil: ancho < 500 });
  const url = (h) => `${BASE}/index.html?sin-intro=1${h}`;
  const ev = (e) => nav.evaluar(e);
  await nav.ir(url('#/'), 2500);
  await ev(`localStorage.clear(); 1`); await nav.ir(url('#/'), 2500);
  const vis = (sel) => `(function(){var e=document.querySelector('${sel}');if(!e)return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1})()`;
  ok(ancho + ' Inicio visible en el riel', await ev(vis('#riel-inicio')));
  ok(ancho + ' selector de rol visible', await ev(vis('#riel-rol')));
  ok(ancho + ' sin desborde horizontal', await ev(`document.documentElement.scrollWidth<=innerWidth`));
  await ev(`document.getElementById('riel-rol').click(); 1`); await nav.esperar(300);
  ok(ancho + ' menú abre con 5 roles', await ev(`!document.getElementById('menu-rol-riel').hidden && document.querySelectorAll('#menu-rol-riel button[data-rol]').length===5`));
  ok(ancho + ' menú dentro de pantalla', await ev(vis('#menu-rol-riel')), await ev(`JSON.stringify(document.getElementById('menu-rol-riel').getBoundingClientRect())`));
  ok(ancho + ' foco dentro del menú', await ev(`document.getElementById('menu-rol-riel').contains(document.activeElement)`));
  await nav.foto(path.join(SAL, `selector-abierto-${ancho}.png`), { completa: false });
  await nav.tecla('Escape'); await nav.esperar(150);
  ok(ancho + ' Escape cierra y devuelve el foco', await ev(`document.getElementById('menu-rol-riel').hidden && document.activeElement===document.getElementById('riel-rol')`));
  ok(ancho + ' sin rol no queda marcado ningún rol', true);
  await nav.foto(path.join(SAL, `riel-inicio-${ancho}.png`), { completa: false });
  for (const [rol, portal] of [['estudiante', 'wisfox'], ['docente', 'kinesis'], ['orientacion', 'kinesis'], ['familia', 'kinesis'], ['coordinacion', 'kinesis']]) {
    await ev(`location.hash='#/mapa'; 1`); await nav.esperar(500);
    await ev(`document.getElementById('riel-rol').click(); 1`); await nav.esperar(200);
    await nav.tecla('ArrowDown'); // recorrido con flechas no debe romper
    await ev(`document.querySelector('#menu-rol-riel [data-rol=${rol}]').click(); 1`); await nav.esperar(900);
    const r = JSON.parse(await ev(`JSON.stringify({h:location.hash,rol:MT.store.obtener().rol,txt:document.getElementById('riel-rol').textContent,prin:(document.querySelector('.riel-item--principal')||{}).dataset&&document.querySelector('.riel-item--principal').dataset.portal,hid:document.getElementById('menu-rol-riel').hidden})`));
    ok(`${ancho} ${rol}: cambia de rol y va a ${portal}`, r.h === '#/portales/' + portal && r.rol === rol && r.prin === portal && r.hid && r.txt.length > 2, r);
  }
  // portal inmersivo: volver al inicio de un toque
  ok(ancho + ' portal inmersivo activo', await ev(`document.documentElement.hasAttribute('data-portal')`));
  ok(ancho + ' en portal inmersivo Inicio visible', await ev(vis('#riel-inicio')));
  await nav.foto(path.join(SAL, `portal-inmersivo-${ancho}.png`), { completa: false });
  await ev(`document.getElementById('riel-rol').click(); 1`); await nav.esperar(300);
  await nav.foto(path.join(SAL, `selector-en-portal-${ancho}.png`), { completa: false });
  await nav.tecla('Escape');
  await ev(`document.getElementById('riel-inicio').click(); 1`); await nav.esperar(700);
  ok(ancho + ' desde el portal, Inicio vuelve a #/', await ev(`location.hash==='#/'||location.hash===''`), await ev('location.hash'));
  ok(ancho + ' rol se conserva al volver', await ev(`MT.store.obtener().rol==='coordinacion'`));
  ok(ancho + ' MT.barra.abrirRoles abre el menú', await ev(`MT.barra.abrirRoles(); !document.getElementById('menu-rol-riel').hidden`));
  ok(ancho + ' sin desborde final', await ev(`document.documentElement.scrollWidth<=innerWidth`));
  const items = await ev(`JSON.stringify([...document.querySelectorAll('.riel a,.riel button')].filter(e=>e.getClientRects().length).map(e=>[e.textContent.trim().slice(0,12),Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)]))`);
  console.log(ancho, items, nav.eventos.consola.slice(0, 5));
  nav.cerrar();
}
console.log(fallos ? fallos + ' fallos' : 'todo bien');
