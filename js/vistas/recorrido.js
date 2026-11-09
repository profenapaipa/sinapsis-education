/* recorrido.js: "cómo funciona", en tres lecturas que responden tres preguntas distintas.

   - Mi camino:   ¿qué hago yo ahora?            (el ajuste de punta a punta, marcado según lo que hiciste)
   - Quién ve qué: ¿qué puede ver y hacer cada rol? (la matriz de roles)
   - Cómo viaja:  ¿por dónde va la información?  (el flujo de datos y lo que nunca sale de su lugar)

   Están separadas a propósito: una sola página con todo abrumaría. Cada persona lee la que necesita. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;
  const { pagina } = MT.comun;
  const st = MT.store;

  const TABS = [{ id: 'camino', etiqueta: 'El camino de un ajuste' }, { id: 'roles', etiqueta: 'Quién ve qué' }, { id: 'datos', etiqueta: 'Cómo viaja la información' }];

  // Cada paso se marca solo, según lo que haya en los datos: no hay nada que "marcar a mano".
  const PASOS = [
    { rol: 'Orientación', rolId: 'orientacion', titulo: 'Se registran los apoyos de un estudiante', texto: 'Orientación marca qué le sirve, sin diagnóstico.', ir: 'estudiantes', hecho: (s) => s.estudiantes.some((e) => e.apoyos.length) },
    { rol: 'Docente', rolId: 'docente', titulo: 'El docente publica una actividad', texto: 'Planeada con los tres principios del DUA y con su quiz.', ir: 'actividades', hecho: (s) => s.actividades.some((a) => a.estado === 'publicada') },
    { rol: 'Docente', rolId: 'docente', titulo: 'Pide ideas a Niky', texto: 'La guía propone; decide quien enseña.', ir: 'actividades', hecho: (s) => MT.ia.sesiones.hayMensajes(s) },
    { rol: 'Docente', rolId: 'docente', titulo: 'Se ajusta al perfil', texto: 'Cada apoyo se vuelve un cambio concreto, con su razón.', ir: 'ajustes', hecho: (s) => s.ajustes.length > 0 },
    { rol: 'Orientación', rolId: 'orientacion', titulo: 'Orientación aprueba', texto: 'Nada llega al estudiante ni a la familia sin esta decisión.', ir: 'ajustes', hecho: (s) => s.ajustes.some((a) => a.estado === 'aprobado') },
    { rol: 'Familia', rolId: 'familia', titulo: 'La familia ve el proceso', texto: 'Se entera mientras ocurre, no en la entrega de notas.', ir: 'resumen', hecho: (s) => s.eventos.some((e) => e.familia && /aprob/i.test(e.texto)) },
    { rol: 'Estudiante', rolId: 'estudiante', titulo: 'El estudiante la resuelve', texto: 'Recibe la actividad a su medida y completa el quiz.', ir: 'resumen', hecho: (s) => Object.values(s.progreso).some((p) => Object.keys(p.quiz).length) },
  ];
  const irA = (x) => { st.cambiar((s) => { s.rol = x.rolId; }); location.hash = '#/portales/' + MT.roles.por(x.rolId).marca; };

  function camino(c) {
    const s = st.obtener();
    const hechos = PASOS.filter((x) => x.hecho(s));
    const sig = PASOS.find((x) => !x.hecho(s));
    c.append(sig
      ? h('section', { class: 'siguiente-banner' }, h('div', null, h('p', { class: 'etiqueta' }, 'Lo que sigue · ' + sig.rol), h('h2', null, sig.titulo), h('p', null, sig.texto)),
        h('button', { class: 'btn', type: 'button', onclick: () => irA(sig) }, 'Hacerlo ahora'))
      : h('section', { class: 'siguiente-banner' }, h('div', null, h('p', { class: 'etiqueta' }, 'Camino completo'), h('h2', null, 'Un ajuste recorrió todo el camino'), h('p', null, 'Del docente a orientación, a la familia y al estudiante.'))));
    c.append(h('div', { class: 'tarjeta tarjeta--borde', style: 'margin-top:1rem' },
      h('p', { class: 'etiqueta' }, 'El camino de un ajuste'), h('h2', null, `${hechos.length} de ${PASOS.length} pasos`),
      h('div', { class: 'medidor medidor--hilo', role: 'img', 'aria-label': `${hechos.length} de ${PASOS.length} pasos hechos` }, h('span', { style: `width:${(hechos.length / PASOS.length) * 100}%` })),
      h('p', { class: 'suave', style: 'margin-top:.6rem' }, 'Cada paso se marca solo cuando ocurre en la plataforma. Puedes hacerlos en tu propio orden cambiando de rol.'),
      h('ol', { class: 'recorrido' }, PASOS.map((x, i) => { const ok = x.hecho(s); return h('li', { class: ok ? 'hecho' : '', 'data-espacio': x.rolId === 'estudiante' ? 'wisfox' : 'kinesis' },
        h('span', { class: 'n', 'aria-hidden': 'true' }, ok ? '✓' : String(i + 1)),
        h('div', { class: 'cuerpo' }, h('p', { class: 'etiqueta' }, x.rol), h('h3', null, x.titulo, ok ? h('span', { class: 'solo-lectores' }, ' (hecho)') : null), h('p', null, x.texto)),
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => irA(x) }, ok ? 'Ver' : 'Ir')); })),
      h('div', { class: 'acciones' }, h('button', { class: 'btn btn--suave', type: 'button', onclick: async () => { if (await MT.dlg.confirmar('Se borrarán todo lo que creaste en este navegador (actividades, ajustes, notas y archivos) y volverán los datos de ejemplo.', 'Sí, empezar de nuevo')) { await MT.archivos.vaciar(); st.reiniciar(); MT.router.recargar(); } } }, 'Volver a los datos de ejemplo'))));
  }

  function roles(c) {
    const col = MT.roles.COLUMNAS;
    c.append(h('div', { class: 'tarjeta' },
      h('h2', null, 'Qué puede ver y hacer cada rol'),
      h('p', { class: 'suave' }, 'Es la regla de la plataforma. Los datos de partida son ficticios y no incluyen información clínica de nadie.'),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla tabla--matriz' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Dato'), col.map((n) => h('th', { scope: 'col' }, n)))),
        h('tbody', null, MT.roles.MATRIZ.map((f) => h('tr', null, h('th', { scope: 'row' }, f.dato, h('small', null, f.nota)),
          f.celdas.map((t) => h('td', null, h('span', { class: 'sello ' + (/^No|Nunca/.test(t) ? 'sello--aviso' : 'sello--ok') }, t))))))))));
    c.append(h('h2', { style: 'margin-top:1.6rem' }, 'Y en concreto, para cada rol'),
      h('div', { class: 'acordeon' }, MT.roles.lista.map((r) => h('details', { class: 'tarjeta', 'data-espacio': r.marca },
        h('summary', null, marca(r.marca, 'resumen-marca'), h('strong', null, r.nombre), h('span', { class: 'suave' }, ' · ' + r.espacio)),
        h('div', { class: 'rejilla rejilla--2' },
          h('div', null, h('h3', null, 'Puedes'), h('ul', null, r.haces.map((x) => h('li', null, x)))),
          h('div', null, h('h3', null, 'No puedes'), h('ul', null, r.noHaces.map((x) => h('li', null, x))))),
        h('p', null, h('strong', null, 'Recibes: '), r.recibes), h('p', null, h('strong', null, 'Entregas: '), r.entregas),
        h('button', { class: 'btn btn--chico', type: 'button', onclick: () => { st.cambiar((s) => { s.rol = r.id; }); location.hash = '#/portales/' + r.marca; } }, r.boton)))));
  }

  function datos(c) {
    const NODOS = [
      { quien: 'Docente', marca: 'kinesis', accion: 'Planea la clase con DUA y elige a un estudiante', entrega: 'Actividad + tema' },
      { quien: 'Niky', marca: 'valeria', accion: 'Propone una actividad y ideas de ajuste', entrega: 'Propuesta (texto)' },
      { quien: 'Docente', marca: 'kinesis', accion: 'Ajusta la actividad a los apoyos del perfil', entrega: 'Ajuste con su razón' },
      { quien: 'Orientación', marca: 'kinesis', accion: 'Revisa y aprueba, o devuelve con una nota', entrega: 'Aprobación' },
      { quien: 'Familia', marca: 'kinesis', accion: 'Ve lo que se hace, ya aprobado', entrega: 'Novedad en lenguaje sencillo' },
      { quien: 'Estudiante', marca: 'wisfox', accion: 'Recibe la actividad a su medida y la resuelve', entrega: 'Progreso: XP, quiz, logros' },
    ];
    c.append(h('div', { class: 'tarjeta' },
      h('h2', null, 'Por dónde va la información'),
      h('p', { class: 'suave' }, 'Un ajuste nace en el aula, pasa por orientación y solo entonces llega a la familia y al estudiante. Cada flecha dice qué viaja.'),
      h('ol', { class: 'flujo' }, NODOS.map((n, i) => h('li', { 'data-espacio': n.marca },
        h('div', { class: 'flujo-nodo' }, marca(n.marca, 'flujo-marca'), h('div', null, h('strong', null, n.quien), h('p', null, n.accion))),
        h('div', { class: 'flujo-flecha' }, icono('flecha'), h('span', { class: 'sello sello--e' }, n.entrega)))))));
    c.append(h('div', { class: 'rejilla rejilla--3', style: 'margin-top:1rem' },
      [['Nunca sale de su lugar', 'La información clínica solo la ven orientación y el docente asignado al curso; nunca la familia, el estudiante ni la administración, y la IA no la recibe jamás.'],
       ['A la IA solo llega un perfil anónimo', 'Lo que se envía tiene tope de longitud y nunca incluye el perfil de un estudiante.'],
       ['Las claves no viajan', 'Viven solo en el servidor. La página que abres no contiene ninguna.']]
        .map(([t, p]) => h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, t), h('p', null, p)))));
  }

  MT.router.registrar({
    id: 'recorrido', titulo: 'Roles y datos', espacio: '', subs: TABS,
    render(main, { sub }) {
      const c = pagina(main, { etiqueta: 'Roles y datos', titulo: 'Qué hacer, quién ve qué y por dónde viaja la información',
        descripcion: 'Tres lecturas cortas. Elige la que necesitas: no hace falta leerlas todas.' });
      c.append(h('nav', { class: 'pestanas-pagina', 'aria-label': 'Secciones de Roles y datos' },
        TABS.map((t) => h('a', { href: '#/recorrido/' + t.id, 'aria-current': t.id === sub ? 'page' : null }, t.etiqueta))));
      ({ camino, roles, datos })[sub](c);
    },
  });
})(window.MT = window.MT || {});
