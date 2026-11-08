// qa_exposicion.mjs: recorre los cinco casos de la exposición guiada de principio a fin, como lo haría quien presenta, y comprueba
// que cada paso deja la plataforma donde el guion dice. Uso: node herramientas/qa_exposicion.mjs http://localhost:8765
// Lo que mira, en cada caso: que entre con #/caso/N, que cada paso muestre lo que cuenta (el perfil, la actividad, el ajuste en
// revisión, el ajuste aprobado, «A tu medida», los logros, las respuestas de Niky), que no quede ninguna palabra «ValerIA»
// y que no haya errores de consola. También prueba el selector de caso y que fuera del modo presentación nada cambie.
import { abrir } from './qa_cdp.mjs';

const base = process.argv[2] || 'http://localhost:8765';
const nav = await abrir({ puerto: 9471, ancho: 1280, alto: 800 });
const fallas = [];
const ok = (cond, msg) => { if (!cond) { fallas.push(msg); console.log('  FALLA:', msg); } };
const texto = () => nav.evaluar('document.body.innerText');
const quiz = {
  1: { estudiante: 'P-03', actividad: 'Mi rutina del día', ideas: 'Actividad de 20 minutos', ayuda: 'tercera persona', apoyo: 'Tiempo adicional del 50 %' },
  2: { estudiante: 'P-07', actividad: 'Recetas y escalas', ideas: 'recetas y escalas', ayuda: 'razón', apoyo: 'Vocabulario de apoyo' },
  3: { estudiante: 'P-02', actividad: 'cadenas alimentarias', ideas: 'quién come a quién', ayuda: 'productores', apoyo: 'Descansos activos cada 15 minutos' },
  4: { estudiante: 'P-05', actividad: 'Escribo un cuento corto', ideas: 'escribo un cuento', ayuda: 'inicio', apoyo: 'Evitar leer en voz alta frente al curso' },
  5: { estudiante: 'P-08', actividad: 'Línea de tiempo de la Independencia', ideas: 'línea de tiempo', ayuda: '1819', apoyo: 'Apoyo visual junto al texto' },
};

for (let n = 1; n <= 5; n++) {
  console.log(`\nCaso ${n}`);
  const q = quiz[n];
  // Se entra con la dirección, desde un navegador limpio de datos.
  await nav.ir(base + '/index.html', 800);
  await nav.evaluar('localStorage.clear(); 1');
  await nav.ir(base + '/index.html#/caso/' + n, 3500);
  const estado = await nav.evaluar(`JSON.stringify({ pres: document.documentElement.dataset.presentacion, caso: MT.casos.numero(), hash: location.hash, pasos: MT.casos.guion(MT.casos.actual()).length, total: MT.casos.total(MT.casos.guion(MT.casos.actual())), est: MT.store.obtener().vinculo })`);
  const e = JSON.parse(estado);
  ok(e.pres === 'activa', 'el modo presentación no se activó');
  ok(e.caso === n, 'no cargó el caso ' + n);
  ok(e.est === q.estudiante, `el estudiante del caso debería ser ${q.estudiante} y es ${e.est}`);
  console.log(`  ${e.pasos} pasos, ${Math.floor(e.total / 60)}:${String(e.total % 60).padStart(2, '0')} de exposición`);
  ok(e.total >= 480 && e.total <= 660, 'la exposición debería durar entre 8 y 11 minutos y dura ' + e.total + ' s');

  for (let i = 0; i < e.pasos; i++) {
    const info = JSON.parse(await nav.evaluar(`JSON.stringify({ t: MT.casos.guion(MT.casos.actual())[${i}].titulo, g: MT.casos.guion(MT.casos.actual())[${i}].grupo })`));
    if (i > 0) { await nav.evaluar(`document.querySelector('.guion__nav .btn:not(.btn--suave)').click(); 1`); await nav.esperar(900); }
    const t = await texto();
    const panel = await nav.evaluar(`(document.getElementById('slot-ia') && !document.getElementById('slot-ia').hidden) ? document.getElementById('slot-ia').innerText : ''`);
    const meta = await nav.evaluar(`document.querySelector('.guion__meta').textContent`);
    ok(/Habla:/.test(meta) && /\d+:\d\d de \d+:\d\d/.test(meta), `paso ${i + 1}: el rótulo no dice quién habla ni cuánto dura (${meta})`);
    ok(!/ValerIA/.test(t + panel), `paso ${i + 1} (${info.t}): todavía dice ValerIA`);
    if (/Orientación: el perfil/.test(info.t)) ok(t.includes(q.estudiante) && t.includes(q.apoyo), `perfil: no se ven ${q.estudiante} y su apoyo «${q.apoyo}»`);
    if (/planea con el DUA/.test(info.t)) ok(t.includes(q.actividad) || t.toLowerCase().includes(q.actividad.toLowerCase()), 'actividades: no se ve la actividad del caso');
    if (/El docente ajusta/.test(info.t)) ok(/En revisión/.test(t), 'ajustes: el ajuste no quedó en revisión');
    if (/devuelve el ajuste/.test(info.t)) ok(/Devuelto/.test(t) && /Nota:/.test(t), 'caso 5: el ajuste no quedó devuelto con nota');
    if (/corrige y vuelve a enviar/.test(info.t)) ok(/En revisión/.test(t) && /descansos|pausa activa/i.test(t), 'caso 5: el ajuste reenviado no incluye el apoyo que faltaba');
    if (/Orientación aprueba/.test(info.t)) ok(/Aprobado/.test(t), 'ajustes: el ajuste no quedó aprobado');
    if (/familia ve lo aprobado/.test(info.t)) ok(/Ajustes aprobados/.test(t) && !/Cuando orientación aprueb/.test(t), 'familia: no se ve el ajuste aprobado');
    if (/la actividad a su medida/.test(info.t)) ok(/A tu medida/.test(t) && /Cambios para ti/.test(t), 'estudiante: falta «A tu medida» y los cambios');
    if (/Practica y responde el quiz/.test(info.t)) ok(/Pregunta 1 de 4/i.test(t), 'estudiante: el quiz no tiene 4 preguntas');
    if (/Puntos y logros/.test(info.t)) ok(/Quiz completo/.test(t) && /Actividad a mi medida/.test(t), 'logros: no se ganaron el quiz y «Actividad a mi medida»');
    if (/ruta de Inglés/.test(info.t)) ok(/Ruta de Inglés/.test(t), 'estudiante: no se ve la ruta de Inglés');
    if (/Niky ayuda a la docencia/.test(info.t)) ok(panel.includes('Actividad de 20 minutos') || panel.toLowerCase().includes(q.ideas.toLowerCase()), 'Niky no propuso la actividad del caso');
    if (/Niky ayuda al estudiante/.test(info.t)) ok(panel.toLowerCase().includes(q.ayuda.toLowerCase()), 'Niky no explicó el tema del caso');
    if (/nunca recibe/.test(info.t)) ok(/Quién ve qué|Qué puede ver y hacer cada rol/.test(t) && /Información clínica/.test(t), 'no se ve la tabla de quién ve qué');
    if (/Tres portales/.test(info.t)) ok(/Niky/.test(t) && /Wisfox/.test(t), 'el cierre no muestra los tres portales');
  }
  const errores = await nav.evaluar('JSON.stringify(window.__errores || [])');
  ok(errores === '[]', 'errores de ejecución: ' + errores);
}

// El selector de caso cambia de caso desde el panel, y «Empezar de nuevo» vuelve al principio del caso elegido.
console.log('\nSelector de caso y empezar de nuevo');
await nav.evaluar(`(() => { const s = document.getElementById('guion-caso'); s.value = '4'; s.dispatchEvent(new Event('change')); return 1; })()`);
await nav.esperar(3500);
let r = JSON.parse(await nav.evaluar(`JSON.stringify({ caso: MT.casos.numero(), est: MT.store.obtener().vinculo, paso: MT.presentacion.paso(), sel: document.getElementById('guion-caso').value })`));
ok(r.caso === 4 && r.est === 'P-05' && r.paso === 0 && r.sel === '4', 'el selector no cargó el caso 4: ' + JSON.stringify(r));
await nav.evaluar(`document.getElementById('btn-reiniciar-mesa').click(); 1`);
await nav.esperar(3500);
r = JSON.parse(await nav.evaluar(`JSON.stringify({ caso: MT.casos.numero(), ajustes: MT.store.obtener().ajustes.length, est: MT.store.obtener().vinculo })`));
ok(r.caso === 4 && r.ajustes === 0 && r.est === 'P-05', 'empezar de nuevo no volvió al principio del caso 4: ' + JSON.stringify(r));

// Fuera del modo presentación la plataforma no cambia: Niky responde lo de siempre y el selector no existe.
console.log('\nFuera del modo presentación');
await nav.evaluar(`localStorage.clear(); 1`);
await nav.ir(base + '/index.html', 2500);
r = JSON.parse(await nav.evaluar(`JSON.stringify({ pres: document.documentElement.dataset.presentacion || null, act: MT.casos.activo(), disenar: MT.datos.respuestasIA.disenar.slice(0, 30) })`));
ok(r.pres === null && r.act === null && /Actividad de 20 minutos/.test(r.disenar), 'sin presentación debería comportarse como siempre: ' + JSON.stringify(r));

// /api/estado solo da 404 en un servidor local sin servidor del piloto; en GitHub Pages la plataforma ni lo pregunta (QA-22).
const consola = nav.eventos.consola.filter((x) => !/favicon|manifest|api\/estado/i.test(x));
ok(consola.length === 0, 'mensajes de consola: ' + consola.slice(0, 3).join(' | '));
nav.cerrar();
console.log(fallas.length ? `\n${fallas.length} fallas` : '\nTodo bien: los cinco casos recorren su guion completo.');
process.exit(fallas.length ? 1 : 0);
