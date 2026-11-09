/* mapa.js: el mapa interactivo. Responde, en una sola imagen, "¿qué es esto y cómo se conecta?".

   - Conexiones: tres columnas (los tres proyectos) con sus módulos, y flechas con lo que viaja
     entre ellos. Toca un módulo para ver qué hace, quién lo usa y qué recibe y entrega. Elige un rol
     para atenuar todo lo que ese rol no toca.

   Cada módulo declara su estado con la misma regla que el resto del sitio: funciona, en integración,
   simulado o viene. Nada se pinta como terminado si no lo está. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;
  const { pagina } = MT.comun;

  const ESTADOS = {
    funciona: ['Funciona hoy', 'ok'],
    integracion: ['En integración', 'e'],
    simulado: ['Respuestas de ejemplo', 'aviso'],
    viene: ['Viene', 'e'],
  };

  const HILOS = [
    { id: 'kinesis', nombre: 'Kinesis', dice: 'El aula: docentes, orientación, familias', orden: ['admin', 'perfiles', 'planeacion', 'ajustes', 'aprobacion', 'familia'] },
    { id: 'valeria', nombre: 'IA Niky', dice: 'La guía de los dos', orden: ['asistente', 'voz'] },
    { id: 'wisfox', nombre: 'Wisfox', dice: 'El estudiante: aprender a su ritmo', orden: ['tutora', 'notas', 'logros', 'quizes', 'rutas'] },
  ];

  const MODULOS = {
    admin: { hilo: 'kinesis', nombre: 'Administración', estado: 'funciona', roles: ['coordinacion'], ir: ['coordinacion', 'estudiantes'],
      que: 'Crea y edita usuarios, cursos, periodos, categorías de apoyo y vínculos con las familias. No ve el diagnóstico ni el PIAR completo.' },
    perfiles: { hilo: 'kinesis', nombre: 'Perfiles de apoyos', estado: 'funciona', roles: ['docente', 'orientacion', 'familia'], ir: ['orientacion', 'estudiantes'],
      que: 'Reúne, por estudiante, qué apoyos le sirven y qué fortalezas tiene, sin mostrar el diagnóstico. La información clínica queda aislada.' },
    planeacion: { hilo: 'kinesis', nombre: 'Planeación con DUA', estado: 'funciona', roles: ['docente', 'orientacion'], ir: ['docente', 'actividades'],
      que: 'El docente diseña la clase una vez, desde los tres principios del Diseño Universal para el Aprendizaje, y la cruza con los perfiles.' },
    ajustes: { hilo: 'kinesis', nombre: 'Ajustes individuales', estado: 'funciona', roles: ['docente', 'orientacion'], ir: ['docente', 'ajustes'],
      que: 'Convierte cada apoyo en un cambio concreto de la actividad, con su razón. Hoy lo hacen reglas sencillas y explicables; no genera el documento PIAR completo.' },
    aprobacion: { hilo: 'kinesis', nombre: 'Aprobación de orientación', estado: 'funciona', roles: ['orientacion'], ir: ['orientacion', 'ajustes'],
      que: 'Orientación valida el ajuste antes de que llegue a nadie más. Es la decisión que desbloquea todo lo siguiente.' },
    familia: { hilo: 'kinesis', nombre: 'Vista de familia', estado: 'funciona', roles: ['familia'], ir: ['familia', 'resumen'],
      que: 'La familia ve lo que se hace en clase por su hijo o hija y cómo acompañar desde casa, en lenguaje sencillo.' },
    asistente: { hilo: 'valeria', nombre: 'Asistente que propone', estado: 'simulado', roles: ['docente', 'estudiante'], ir: ['docente', 'actividades'],
      que: 'Propone una actividad con DUA al docente y explica dudas al estudiante. Propone; decide quien enseña. Hoy responde con textos de ejemplo.' },
    voz: { hilo: 'valeria', nombre: 'Voz y análisis de fuentes', estado: 'viene', roles: [], ir: null,
      que: 'La visión de Niky: hablar y leer las fuentes del colegio. Es un concepto todavía, y no se promete como si existiera.' },
    tutora: { hilo: 'wisfox', nombre: 'Tutora de IA', estado: 'simulado', roles: ['estudiante'], ir: ['estudiante', 'resumen'],
      que: 'El chat de apoyo del estudiante. Es la misma guía que ayuda al docente: Niky.' },
    notas: { hilo: 'wisfox', nombre: 'Notas y recursos', estado: 'funciona', roles: ['estudiante'], ir: ['docente', 'notas'],
      que: 'El estudiante guarda notas y encuentra recursos de estudio.' },
    logros: { hilo: 'wisfox', nombre: 'Logros, XP y misiones', estado: 'funciona', roles: ['estudiante'], ir: ['estudiante', 'logros'],
      que: 'Puntos, niveles, logros y misiones diarias que mantienen la motivación, con el zorro como compañía.' },
    quizes: { hilo: 'wisfox', nombre: 'Quizes y minijuegos', estado: 'funciona', roles: ['estudiante'], ir: ['estudiante', 'resumen'],
      que: 'Preguntas de opción múltiple y minijuegos (verdadero o falso, memoria, ordenar frases).' },
    rutas: { hilo: 'wisfox', nombre: 'Rutas de aprendizaje', estado: 'funciona', roles: ['estudiante'], ir: ['estudiante', 'ruta'],
      que: 'Caminos guiados paso a paso en cada materia. Aquí es donde llega la actividad ya aprobada y ajustada a la medida del estudiante.' },
  };

  // [de, a, lo que viaja]
  const ARISTAS = [
    ['admin', 'perfiles', 'cursos y vínculos'],
    ['perfiles', 'planeacion', 'apoyos del perfil'],
    ['planeacion', 'asistente', 'pide ideas'],
    ['asistente', 'planeacion', 'propuesta'],
    ['perfiles', 'ajustes', 'apoyos'],
    ['planeacion', 'ajustes', 'actividad'],
    ['ajustes', 'aprobacion', 'ajuste propuesto'],
    ['aprobacion', 'familia', 'novedad aprobada'],
    ['aprobacion', 'rutas', 'actividad a su medida'],
    ['rutas', 'quizes', 'actividad'],
    ['quizes', 'logros', 'puntos'],
    ['tutora', 'asistente', 'misma guía'],
  ];

  // Entra al portal del rol que usa el módulo (ya no hay un espacio aparte: se trabaja dentro de Kinesis o Wisfox).
  function abrirEn([rol]) {
    MT.store.cambiar((x) => { x.rol = rol; });
    location.hash = '#/portales/' + MT.roles.por(rol).marca;
  }

  function conexiones(c) {
    let rol = null;
    let sel = null;
    const botones = {};
    const nombreRol = (id) => (MT.roles.por(id) || {}).nombre || id;
    const detalle = h('div', { class: 'tarjeta mapa-detalle', 'aria-live': 'polite' });
    const svg = MT.ui.svg('<svg class="mapa-svg" aria-hidden="true" focusable="false"><defs><marker id="mt-flecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="punta" d="M1 1l8 4-8 4z"/></marker></defs></svg>');
    const cont = h('div', { class: 'mapa' });

    const usadoPorRol = (id) => !rol || MODULOS[id].roles.includes(rol);
    const aristaActiva = ([a, b]) => (sel ? (a === sel || b === sel) : (rol ? usadoPorRol(a) && usadoPorRol(b) : false));

    function dibujar() {
      if (window.getComputedStyle(svg).display === 'none') return;
      const r0 = cont.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
      const base = svg.querySelector('defs').outerHTML;
      const pos = (id) => { const b = botones[id].getBoundingClientRect(); return { x0: b.left - r0.left, x1: b.right - r0.left, y: b.top - r0.top + b.height / 2, cx: b.left - r0.left + b.width / 2 }; };
      let tramos = '';
      ARISTAS.forEach((ar, i) => {
        const [de, a, etiqueta] = ar;
        const p = pos(de); const q = pos(a);
        const activa = aristaActiva(ar);
        let d; let mx; let my;
        if (Math.abs(p.cx - q.cx) > 40) {
          const der = q.cx > p.cx;
          const x1 = der ? p.x1 : p.x0; const x2 = der ? q.x0 : q.x1; const dx = (x2 - x1) / 2;
          d = `M${x1} ${p.y}C${x1 + dx} ${p.y} ${x2 - dx} ${q.y} ${x2} ${q.y}`; mx = (x1 + x2) / 2; my = (p.y + q.y) / 2;
        } else {
          // Dos módulos de la misma columna: la flecha sale por la derecha y vuelve a entrar.
          const x = p.x1; const sale = 30 + (i % 3) * 8;
          d = `M${x} ${p.y}C${x + sale} ${p.y} ${x + sale} ${q.y} ${x} ${q.y}`; mx = x + sale * 0.75; my = (p.y + q.y) / 2;
        }
        tramos += `<path d="${d}" class="${activa ? 'activa' : ''}" marker-end="url(#mt-flecha)"/>`;
        if (activa) tramos += `<text x="${mx}" y="${my}" text-anchor="middle">${etiqueta}</text>`;
      });
      svg.innerHTML = base + tramos;
    }

    function pintarDetalle() {
      if (!sel) {
        detalle.replaceChildren(h('p', { class: 'etiqueta' }, 'Cómo se lee'), h('h2', { class: 'titulo-chico' }, 'Toca un módulo'),
          h('p', null, 'Verás qué hace, quién lo usa y qué recibe y entrega. Las flechas dicen qué viaja de un módulo a otro. Elige un rol arriba para atenuar lo que no toca.'));
        return;
      }
      const m = MODULOS[sel];
      const entra = ARISTAS.filter((a) => a[1] === sel).map((a) => `${MODULOS[a[0]].nombre}: ${a[2]}`);
      const sale = ARISTAS.filter((a) => a[0] === sel).map((a) => `${MODULOS[a[1]].nombre}: ${a[2]}`);
      const [txt, clase] = ESTADOS[m.estado];
      detalle.replaceChildren(
        h('p', { class: 'etiqueta' }, HILOS.find((x) => x.id === m.hilo).nombre), h('h2', { class: 'titulo-chico' }, m.nombre),
        h('span', { class: 'sello sello--' + clase }, txt), h('p', { style: 'margin-top:.6rem' }, m.que),
        h('div', { class: 'rejilla rejilla--3' },
          h('div', null, h('h3', null, 'Quién lo usa'), m.roles.length ? h('p', null, m.roles.map(nombreRol).join(', ')) : h('p', { class: 'suave' }, 'Nadie todavía.')),
          h('div', null, h('h3', null, 'Recibe'), entra.length ? h('ul', { class: 'mapa-conexiones' }, entra.map((t) => h('li', null, t))) : h('p', { class: 'suave' }, 'Nada de otros módulos.')),
          h('div', null, h('h3', null, 'Entrega'), sale.length ? h('ul', { class: 'mapa-conexiones' }, sale.map((t) => h('li', null, t))) : h('p', { class: 'suave' }, 'A nadie: es un final del camino.'))),
        m.ir ? h('div', { class: 'acciones' }, h('button', { class: 'btn btn--chico', type: 'button', onclick: () => abrirEn(m.ir) }, 'Abrir en la plataforma')) : null);
    }

    function actualizar() {
      Object.entries(botones).forEach(([id, b]) => {
        b.setAttribute('aria-pressed', String(sel === id));
        const conectado = sel && ARISTAS.some(([x, y]) => (x === sel && y === id) || (y === sel && x === id));
        const atenuar = sel ? !(id === sel || conectado) : !usadoPorRol(id);
        b.classList.toggle('atenuado', atenuar);
      });
      pintarDetalle(); dibujar();
    }

    const chips = h('div', { class: 'mapa-roles', role: 'group', 'aria-label': 'Ver el mapa como' }, h('b', null, 'Ver como:'),
      [{ id: null, nombre: 'Todos' }, ...MT.roles.lista].map((r) => h('button', { class: 'chip-rol', type: 'button', 'aria-pressed': String(r.id === rol),
        onclick: (e) => { rol = r.id; sel = null; chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false')); e.currentTarget.setAttribute('aria-pressed', 'true'); actualizar(); } }, r.nombre)));

    const columnas = HILOS.map((hilo) => h('section', { class: 'mapa-col', 'data-hilo': hilo.id, 'aria-label': hilo.nombre },
      h('div', { class: 'mapa-col-cab' }, marca(hilo.id, 'marca-col'), h('h2', { class: 'titulo-chico' }, hilo.nombre)), h('p', { class: 'suave' }, hilo.dice),
      h('ul', { class: 'modulos' }, hilo.orden.map((id) => {
        const m = MODULOS[id];
        const b = h('button', { class: 'modulo', type: 'button', 'aria-pressed': 'false', 'aria-label': `${m.nombre}. ${ESTADOS[m.estado][0]}`,
          onclick: () => { sel = sel === id ? null : id; actualizar(); } }, h('span', null, m.nombre), h('span', { class: 'punto punto--' + m.estado, 'aria-hidden': 'true' }));
        botones[id] = b;
        return h('li', null, b);
      }))));

    cont.append(svg, h('div', { class: 'mapa-cols' }, columnas));
    // La columna de Niky queda en el medio y centrada: es la guía que cruza a las otras dos.
    cont.querySelector('[data-hilo="valeria"]').style.alignSelf = 'center';

    const leyenda = h('div', { class: 'mapa-leyenda' }, Object.entries(ESTADOS).map(([k, [t]]) => h('span', null, h('i', { class: 'punto punto--' + k }), t)));
    // Plegado: el mapa se entiende tocándolo; la explicación queda a un clic para quien la necesite.
    c.append(h('details', { class: 'plegable', style: 'margin-bottom:1rem' }, h('summary', null, 'Cómo leer este mapa'),
      h('ol', { class: 'como-leer' },
        h('li', null, h('strong', null, 'Tres columnas, tres portales. '), 'Kinesis (el aula), Niky (la guía) y Wisfox (el estudiante) trabajan en paralelo. Cada recuadro es una función.'),
        h('li', null, h('strong', null, 'Las flechas son trabajo que pasa de una función a otra. '), 'Por ejemplo: el docente ajusta (Ajustes) y eso viaja a Aprobación; al aprobarse, viaja a la Familia y a las Rutas del estudiante.'),
        h('li', null, h('strong', null, 'Toca un recuadro '), 'para ver qué hace, quién lo usa y qué recibe y entrega, y ábrelo en la plataforma.'),
        h('li', null, h('strong', null, 'Elige un rol arriba '), 'y se atenúa lo que no usa: es la manera más rápida de ver tu parte.')),
      h('p', { class: 'suave' }, '¿Prefieres una lista paso a paso? Mira ', h('a', { href: '#/portales' }, 'los tres portales en paralelo'), ' o tu ', h('a', { href: '#/guia' }, 'guía de inicio rápido'), '.')));
    c.append(chips, cont, leyenda, detalle);
    pintarDetalle();
    requestAnimationFrame(dibujar);
    const alCambiar = () => dibujar();
    window.addEventListener('resize', alCambiar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dibujar);
    MT.router.alSalir(() => window.removeEventListener('resize', alCambiar));
  }

  /* Qué nos distingue. Es información importante para quien conoce la plataforma por primera vez, así que tiene su lugar propio.
     Se dice desde lo que la plataforma hace y cree, sin compararla con nadie. */
  const DISTINGUE = [
    ['Un camino compartido', 'El ajuste nace en el aula y viaja, con su razón, a orientación, a la familia y al estudiante. Cada paso se ve y se puede conversar.'],
    ['Para todos y para cada quien', 'El DUA es la base: la clase se piensa para todos desde el diseño, y el ajuste individual acompaña lo que el diseño no alcanza.'],
    ['Quien enseña decide', 'Las herramientas proponen y explican; la docencia y el equipo de orientación deciden. La tecnología media, no sustituye.'],
    ['Cuidado de la información', 'Lo clínico queda aparte y solo lo ve orientación. La inteligencia artificial nunca lo recibe, y cada rol ve únicamente lo que necesita.'],
    ['Tres portales, un tejido', 'Kinesis, Niky y Wisfox nacieron como proyectos de estudiantes y hoy se encuentran en una misma plataforma, con una identidad común. Que compartan también sus datos es parte de lo que estamos construyendo.'],
  ];
  const EN_CONSTRUCCION = ['Un servidor con cuentas, para compartir el trabajo entre personas y dispositivos', 'Conexión de Niky a un modelo de lenguaje', 'El documento del PIAR en el formato oficial', 'Más materias en la ruta del estudiante'];

  function distingue(c) {
    c.append(h('div', { class: 'rejilla rejilla--3 diferencial' }, DISTINGUE.map(([t, p]) => h('div', { class: 'tarjeta tarjeta--borde' }, h('h2', { class: 'h3' }, t), h('p', null, p)))));
    c.append(h('div', { class: 'tarjeta', style: 'margin-top:1rem' }, h('h2', null, 'Lo que todavía estamos construyendo'),
      h('p', { class: 'suave' }, 'Decirlo con claridad también es parte del cuidado: hay cosas que ya funcionan y otras que vienen.'),
      h('ul', null, EN_CONSTRUCCION.map((x) => h('li', null, x))),
      h('div', { class: 'acciones' }, h('a', { class: 'btn btn--suave', href: '#/hoja/etapas' }, 'Ver las etapas'))));
  }

  const TABS = [{ id: 'conexiones', etiqueta: 'Cómo se conecta todo' }, { id: 'distingue', etiqueta: 'Qué nos distingue' }];
  MT.router.registrar({
    id: 'mapa', titulo: 'Mapa', espacio: '', subs: TABS,
    render(main, { sub }) {
      const c = pagina(main, { etiqueta: 'Mapa interactivo', titulo: sub === 'distingue' ? 'Qué nos distingue' : 'Cómo se conecta todo',
        descripcion: sub === 'distingue' ? 'Lo que hace particular a esta manera de acompañar la diversidad en el aula.' : 'Los tres proyectos de estudiantes, sus módulos y lo que viaja entre ellos. Toca cualquier módulo.' });
      c.append(h('nav', { class: 'pestanas-pagina', 'aria-label': 'Secciones del mapa' },
        TABS.map((t) => h('a', { href: '#/mapa/' + t.id, 'aria-current': t.id === sub ? 'page' : null }, t.etiqueta))));
      (sub === 'distingue' ? distingue : conexiones)(c);
    },
  });
})(window.MT = window.MT || {});
