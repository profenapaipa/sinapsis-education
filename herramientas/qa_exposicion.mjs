// qa_exposicion.mjs: recorre los ejemplos de la exposición guiada por el TUTORIAL GUIADO (js/tutorial.js), como lo haría alguien en la mesa,
// y comprueba que cada paso deja la plataforma donde la tarjeta dice. Uso: node herramientas/qa_exposicion.mjs http://localhost:8765
// Por qué cambió (9 nov 2026): el modo presentación y su barra del guion se reemplazaron por el tutorial (decisión del dueño). Antes se
// entraba con #/caso/N y se pulsaba «Siguiente» en el guion; ahora se entra con ?caso=N (lo que llevan los QR) y se recorren los cinco roles
// de cada ejemplo con la tarjeta del tutorial. Lo que mira: que ?caso=N abra el tutorial en ese ejemplo, que cada paso caiga en su pantalla
// y muestre lo que cuenta (el perfil, el ajuste en revisión, el aprobado, «A tu medida», el quiz, los logros, las respuestas de Niky), que
// no quede ninguna palabra «ValerIA» ni la barra del guion, que cada recorrido llegue al resumen final y que no haya errores de consola.
import { abrir } from './qa_cdp.mjs';

const base = process.argv[2] || 'http://localhost:8765';
const nav = await abrir({ puerto: 9471, ancho: 1280, alto: 800 });
const fallas = [];
const ok = (cond, msg) => { if (!cond) { fallas.push(msg); console.log('  FALLA:', msg); } };
const texto = () => nav.evaluar('document.body.innerText');
const panelTexto = () => nav.evaluar(`(document.getElementById('slot-ia') && !document.getElementById('slot-ia').hidden) ? document.getElementById('slot-ia').innerText : ''`);
const quiz = {
  1: { estudiante: '8A-03', ideas: 'Actividad de 20 minutos', ayuda: 'tercera persona', apoyo: 'Tiempo adicional del 50 %' },
  2: { estudiante: '8A-07', ideas: 'recetas y escalas', ayuda: 'razón', apoyo: 'Vocabulario de apoyo' },
  3: { estudiante: '8A-02', ideas: 'quién come a quién', ayuda: 'productores', apoyo: 'Descansos activos cada 15 minutos' },
  4: { estudiante: '8A-05', ideas: 'escribo un cuento', ayuda: 'inicio', apoyo: 'Evitar leer en voz alta frente al curso' },
  5: { estudiante: '8A-08', ideas: 'línea de tiempo', ayuda: '1819', apoyo: 'Apoyo visual junto al texto' },
};
const ROLES = ['docente', 'orientacion', 'familia', 'coordinacion', 'estudiante'];
// Entra con una dirección y espera a que el tutorial arranque. python -m http.server a veces rechaza una conexión en plena carga
// (ERR_CONNECTION_REFUSED en una hoja o un script) y la página queda a medias: eso es del servidor de prueba, no de la plataforma.
// Por eso se espera de verdad y, si no arrancó, se carga UNA vez más; la segunda vez tiene que funcionar.
async function entrar(url, caso) {
  for (let intento = 0; intento < 2; intento++) {
    await nav.ir(url, 1500);
    for (let k = 0; k < 16; k++) {
      if (await nav.evaluar('!!(window.MT && MT.tutorial && MT.tutorial.estado.activo && MT.tutorial.estado.caso === ' + caso + ' && document.readyState === "complete")')) return;
      await nav.esperar(500);
    }
  }
}
const total = await (async () => { await nav.ir(base + '/index.html?sin-intro=1', 2500); return nav.evaluar('MT.casos.lista.length'); })();

for (let n = 1; n <= total; n++) {
  console.log(`\nEjemplo ${n}`);
  const q = quiz[n];
  // Se entra como desde un QR impreso, con un navegador limpio de datos.
  await nav.evaluar('localStorage.clear(); 1');
  await entrar(base + '/index.html?caso=' + n, n);
  const e = JSON.parse(await nav.evaluar(`JSON.stringify({ a: MT.tutorial.estado.activo, r: MT.tutorial.estado.rol, c: MT.tutorial.estado.caso, g: !!document.getElementById('guion-mesa'), p: document.documentElement.dataset.presentacion || null, est: MT.store.obtener().vinculo })`));
  ok(e.a && e.c === n && e.r === 'docente', `?caso=${n} no abrió el tutorial en ese ejemplo como docente: ${JSON.stringify(e)}`);
  ok(!e.g && !e.p, `?caso=${n} encendió el modo presentación o su barra`);
  if (q) ok(e.est === q.estudiante, `el estudiante del ejemplo debería ser ${q.estudiante} y es ${e.est}`);

  for (const rol of ROLES) {
    await nav.evaluar(`MT.tutorial.iniciar({ rol: '${rol}', caso: ${n} }).then(() => 1)`); await nav.esperar(700);
    const pasos = JSON.parse(await nav.evaluar('JSON.stringify(MT.tutorial.estado.pasos.map((p) => ({ id: p.id, hash: p.hash, t: p.titulo })))'));
    for (let i = 0; i < pasos.length; i++) {
      if (i > 0) { await nav.evaluar(`document.querySelector('.tut__btn--principal').click(); 1`); await nav.esperar(1000); }
      const p = pasos[i]; const donde = `${rol} paso ${i + 1} (${p.id})`;
      const r = JSON.parse(await nav.evaluar(`JSON.stringify({ i: MT.tutorial.estado.i, hash: location.hash, meta: (document.querySelector('.tut__meta') || {}).textContent || '', g: !!document.getElementById('guion-mesa') })`));
      ok(r.i === i && r.hash === p.hash, `${donde}: debería estar en ${p.hash} y está en ${r.hash} (paso ${r.i + 1})`);
      ok(new RegExp(`Paso ${i + 1} de ${pasos.length}`).test(r.meta), `${donde}: la tarjeta no marca «Paso ${i + 1} de ${pasos.length}» (${r.meta})`);
      ok(!r.g, `${donde}: apareció la barra del guion`);
      const t = await texto(); const panel = await panelTexto();
      ok(!/ValerIA/.test(t + panel), `${donde}: todavía dice ValerIA`);
      if (!q) continue;   // Tecnología (6) no tiene la tabla de arriba; sus pasos se miden igual por ruta, rótulo y nombre
      if (p.id === 'perfil') ok(t.includes(q.estudiante) && t.includes(q.apoyo), `${donde}: no se ven ${q.estudiante} y su apoyo «${q.apoyo}»`);
      if (p.id === 'ajuste' || p.id === 'reenvio' || p.id === 'llega') ok(/En revisión/.test(t), `${donde}: el ajuste no quedó en revisión`);
      if (p.id === 'devuelve') ok(/Devuelto/.test(t) && /Nota:/.test(t), `${donde}: el ajuste no quedó devuelto con nota`);
      if (p.id === 'decidir') ok(/Aprobado/.test(t), `${donde}: el ajuste no quedó aprobado`);
      if (p.id === 'aprobado') ok(/Ajustes aprobados/.test(t), `${donde}: la familia no ve el ajuste aprobado`);
      if (p.id === 'medida') ok(/A tu medida/.test(t) && /Cambios para ti/.test(t), `${donde}: falta «A tu medida» y los cambios`);
      if (p.id === 'quiz') ok(/Pregunta 1 de 4/i.test(t), `${donde}: el quiz no tiene 4 preguntas`);
      if (p.id === 'logros') ok(/Quiz completo/.test(t) && /Actividad a mi medida/.test(t), `${donde}: no se ganaron el quiz y «Actividad a mi medida»`);
      if (p.id === 'ideas') ok(panel.includes('Actividad de 20 minutos') || panel.toLowerCase().includes(q.ideas.toLowerCase()), `${donde}: Niky no propuso la actividad del ejemplo`);
      if (p.id === 'ayuda') ok(panel.toLowerCase().includes(q.ayuda.toLowerCase()), `${donde}: Niky no explicó el tema del ejemplo`);
      if (p.id === 'niky') ok(panel.length > 0 && /Respuesta de ejemplo/.test(panel), `${donde}: Niky no respondió con un texto de ejemplo`);
    }
    await nav.evaluar(`document.querySelector('.tut__btn--principal').click(); 1`); await nav.esperar(700);   // «Terminar»
    const fin = await nav.evaluar(`(document.querySelector('.tut-final .tut-logros') || { children: [] }).children.length`);
    ok(fin === 3, `${rol}: el recorrido no llegó al resumen final con 3 logros`);
    console.log(`  ${rol}: ${pasos.length} pasos`);
  }
  const errores = await nav.evaluar('JSON.stringify(window.__errores || [])');
  ok(errores === '[]', 'errores de ejecución: ' + errores);
}

// #/caso/N (la otra forma de entrar) y ?rol= también abren el tutorial.
console.log('\nOtras entradas');
await nav.evaluar('localStorage.clear(); 1');
await entrar(base + '/index.html?caso=4&rol=familia', 4);
let r = JSON.parse(await nav.evaluar(`JSON.stringify({ a: MT.tutorial.estado.activo, r: MT.tutorial.estado.rol, c: MT.tutorial.estado.caso })`));
ok(r.a && r.r === 'familia' && r.c === 4, '?caso=4&rol=familia no abrió el ejemplo 4 como familia: ' + JSON.stringify(r));
await entrar(base + '/index.html#/caso/2', 2);
r = JSON.parse(await nav.evaluar(`JSON.stringify({ a: MT.tutorial.estado.activo, r: MT.tutorial.estado.rol, c: MT.tutorial.estado.caso })`));
ok(r.a && r.r === 'docente' && r.c === 2, '#/caso/2 no abrió el ejemplo 2: ' + JSON.stringify(r));

// Un estado guardado del modo presentación (de quien ensayó antes) no vuelve a encender la barra, y sin ?caso la plataforma es la de siempre.
console.log('\nEstado antiguo y fuera del tutorial');
await nav.evaluar(`localStorage.clear(); localStorage.setItem('mosaicotelar.presentacion', JSON.stringify({ activo: true, paso: 2 })); 1`);
await nav.ir(base + '/index.html?sin-intro=1', 2500);
r = JSON.parse(await nav.evaluar(`JSON.stringify({ pres: document.documentElement.dataset.presentacion || null, g: !!document.getElementById('guion-mesa'), b: !!document.getElementById('btn-presentacion'), guardado: localStorage.getItem('mosaicotelar.presentacion'), act: MT.casos.activo(), tut: MT.tutorial.estado.activo, disenar: MT.datos.respuestasIA.disenar.slice(0, 30) })`));
ok(r.pres === null && !r.g && !r.b && r.guardado === null, 'el estado antiguo del modo presentación volvió a encender algo: ' + JSON.stringify(r));
ok(r.act === null && !r.tut && /Actividad de 20 minutos/.test(r.disenar), 'sin ?caso la plataforma debería comportarse como siempre: ' + JSON.stringify(r));

// /api/estado solo da 404 en un servidor local sin servidor del piloto; en GitHub Pages la plataforma ni lo pregunta (QA-22).
const consola = nav.eventos.consola.filter((x) => !/favicon|manifest|api\/estado/i.test(x));
ok(consola.length === 0, 'mensajes de consola: ' + consola.slice(0, 3).join(' | '));
nav.cerrar();
console.log(fallas.length ? `\n${fallas.length} fallas` : '\nTodo bien: los ejemplos recorren el tutorial completo en los cinco roles.');
process.exit(fallas.length ? 1 : 0);
