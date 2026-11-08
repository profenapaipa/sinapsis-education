/* estado.js: la hoja de ruta, en tres lecturas para quien decide si apoyar, probar o comprar:
   - Propuesta: el objetivo, a quién sirve, cómo se sostiene y cómo sabremos si funciona.
   - Arquitectura: qué corre en el navegador, qué corre en un servidor y qué falta.
   - Etapas: qué hay hoy y qué viene.
   Nada aquí es una promesa sin fecha ni una cifra inventada: lo que no está validado se dice "por validar". */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  const TABS = [{ id: 'propuesta', etiqueta: 'Propuesta' }, { id: 'arquitectura', etiqueta: 'Arquitectura' }, { id: 'etapas', etiqueta: 'Etapas' }];
  // La cuadrícula "Cómo lo construimos" sigue oculta hasta que el dueño apruebe sus textos (MT.config.mostrarConstruccion = true).
  const tabs = () => (MT.config && MT.config.mostrarConstruccion ? TABS.concat({ id: 'construccion', etiqueta: 'Cómo lo construimos' }) : TABS);
  
  const tarjeta = (t, ...hijos) => h('div', { class: 'tarjeta' }, h('h2', null, t), ...hijos);
  const lista = (l) => h('ul', null, l.map((x) => h('li', null, x)));

  function propuesta(c) {
    c.append(MT.plan.avisoConstruccion());
    c.append(h('section', { class: 'siguiente-banner' }, h('div', null, h('p', { class: 'etiqueta' }, 'Nuestro sentido'),
      h('h2', null, 'Poner la tecnología al servicio de la diversidad de formas de aprender, acompañando la labor docente.'),
      h('p', null, MT.nombre + ' reúne herramientas para que docentes, orientación, familias y estudiantes se encuentren y atiendan, juntos y con claridad, las distintas maneras de percibir y de vivir el mundo que hay en cada aula.'))));
    c.append(h('div', { class: 'rejilla rejilla--2', style: 'margin-top:1rem' },
      tarjeta('Lo que vemos en las aulas', h('p', null, 'Cada aula reúne estudiantes que aprenden, perciben y viven el mundo de maneras distintas, y la docencia las acompaña con dedicación. Queremos aportarle herramientas que hagan más sencillo conocer, planear y ajustar.'),
        h('p', null, 'Cada estudiante tiene una experiencia y una realidad de vida diferentes. Por eso el aprendizaje se personaliza, en un entorno inclusivo donde las distintas formas de desarrollarse y de aprender encuentran su lugar.'),
        h('p', { class: 'suave' }, 'La normatividad de educación inclusiva sigue evolucionando hacia una mirada más humana y empática. ' + MT.nombre + ' la toma como punto de partida, no como meta.')),
      tarjeta('Para quién es', h('p', null, h('strong', null, 'Quienes la usan: '), 'docentes, orientación, familias, coordinación y estudiantes.'),
        h('p', null, h('strong', null, 'Con quienes la construimos: '), 'rectorías, coordinaciones académicas y entidades del sector educativo.'),
        h('p', { class: 'suave' }, 'El modelo de sostenibilidad está por definir con ellos.'))));
    // Plegado (sinergia de contenido, sección 4): valor, sostenibilidad y riesgos son tema de conversación y el pitch ya los dice; siguen aquí, a un clic.
    const mas = h('details', { class: 'plegable' }, h('summary', null, 'Saber más: valor, sostenibilidad y riesgos'));
    mas.append(h('div', { class: 'rejilla rejilla--3' },
      tarjeta('Valor para el colegio', lista(['Un registro claro del proceso, que acompaña al equipo', 'Menos trabajo repetido entre docente y orientación, y más tiempo para el encuentro', 'Un lenguaje común para hablar de los apoyos de cada estudiante'])),
      tarjeta('Valor para la familia', lista(['Ve el proceso mientras ocurre', 'Entiende qué cambió y por qué', 'Sabe cómo acompañar en casa'])),
      tarjeta('Valor para un aliado', lista(['Una necesidad real de las aulas, con respaldo en la normatividad', 'Un producto construido por estudiantes y docentes, con sentido pedagógico', 'Aprendizajes de un piloto antes de crecer']))));
    mas.append(h('div', { class: 'rejilla rejilla--2', style: 'margin-top:1rem' },
      tarjeta('Cómo podría sostenerse (por definir)', lista(['El sentido pedagógico va primero; la sostenibilidad es lo que permite seguir', 'Un piloto acompañado en un curso, sin costo', 'Luego, un modelo que se definirá con los primeros colegios', 'Aliados que apoyen el servidor, la revisión de seguridad y el contenido'])),
      tarjeta('Cómo sabremos que funciona', lista(['Cuánto tiempo gana el equipo para el encuentro con los estudiantes', 'Porcentaje de ajustes propuestos que orientación aprueba', 'Uso por rol (docentes, familias, estudiantes)', 'Percepción de docentes, familias y estudiantes, con una encuesta corta']))));
    mas.append(h('div', { class: 'rejilla rejilla--2', style: 'margin-top:1rem' },
      tarjeta('Riesgos y cómo se manejan', lista(['Datos de menores: ningún dato real hasta que todo esté en regla', 'La IA se equivoca: solo propone, decide quien enseña, y nunca ve información clínica', 'Que se sienta como una carga más: se conversa con el equipo y se ajusta; la herramienta debe acompañar, no sumar tareas', 'Que no se adopte: guía de inicio rápido por rol y un piloto con acompañamiento'])),
      tarjeta('Qué necesitamos', lista(['Un colegio piloto y un curso', 'Revisión legal de protección de datos (Ley 1581)', 'Las autorizaciones de familias, colegio y demás entidades', 'Definir el modelo de empresa', 'Un servidor y su mantenimiento']),
        h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/piloto' }, 'Conversar sobre un piloto')))));
    c.append(mas);
  }

  const CAPAS = [
    ['Interfaz', 'Se ejecuta en el navegador: HTML, CSS y JavaScript. Funciona sin instalar nada.', 'Aplicación instalable en el celular, que sigue funcionando sin internet.', 'ok'],
    ['Portales Kinesis y Wisfox', 'Aplicaciones de sus equipos, con sus propios datos. “Mi espacio” reúne el trabajo de los tres en una pantalla.', 'Compartir un solo modelo de datos y un solo inicio de sesión entre los tres.', 'aviso'],
    ['Servidor (backend)', 'No hay. Lo creado se guarda en el navegador de quien lo crea.', 'API con cuentas, roles y registro de quién hizo qué.', 'e'],
    ['Base de datos', 'El navegador (localStorage).', 'Base de datos con copia de seguridad y cifrado, una por colegio.', 'e'],
    ['Archivos', 'El navegador (IndexedDB), con validación de formato y de contenido.', 'Almacenamiento con permisos, revisión de virus y vencimiento.', 'e'],
    ['Niky (IA)', 'Textos de ejemplo. El agente está definido (personalidad, límites y voz) y corre en un servicio aparte.', 'Un servicio intermedio que guarda la clave, filtra los datos y limita el uso.', 'aviso'],
    ['Seguridad y privacidad', 'Los permisos por rol se aplican en pantalla.', 'Los permisos se hacen cumplir en el servidor, que es el único lugar donde de verdad se garantizan.', 'e'],
  ];
  const ETIQ = { ok: 'Disponible', aviso: 'Parcial', e: 'Por construir' };

  function arquitectura(c) {
    c.append(h('div', { class: 'tarjeta' }, h('h2', null, 'Frontend y backend, capa por capa'),
      h('p', { class: 'suave' }, 'Hoy la plataforma es un frontend completo. Para usarse con datos reales entre varias personas necesita su backend: esa es la siguiente etapa.'),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla' },
        h('thead', null, h('tr', null, ['Capa', 'Hoy', 'Siguiente', 'Estado'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', null, CAPAS.map(([a, b, d, k]) => h('tr', null, h('th', { scope: 'row' }, a), h('td', null, b), h('td', null, d), h('td', null, h('span', { class: 'sello sello--' + k }, ETIQ[k])))))))));
    c.append(h('div', { class: 'aviso', style: 'margin-top:1rem' }, 'Por qué importa: mientras no haya servidor, un usuario con conocimientos técnicos podría ver o cambiar lo que su propio navegador guarda. Con datos de ejemplo no hay riesgo; con datos reales sí, y por eso no se usan hasta tener backend.'));
  }

  const ETAPAS = [
    ['Disponible hoy', 'ok', 'Cinco espacios por rol con crear, editar y borrar: estudiantes, actividades con DUA y quiz, ajustes con aprobación, notas, cursos y categorías. Archivos con permisos por rol. Ruta de Inglés de grado 8.° con quizes explicados. Progreso, puntos y logros. Guía de inicio rápido por rol y acceso a los tres portales.'],
    ['Con respuestas de ejemplo', 'aviso', 'Niky ya tiene su lugar en cada espacio y responde con textos preparados. Se conecta a un modelo de lenguaje sin cambiar nada más.'],
    ['En desarrollo', 'e', 'Servidor con cuentas y base de datos para compartir entre dispositivos y personas. Un solo inicio de sesión para los tres portales. Documento PIAR en el formato oficial. Más materias en la ruta del estudiante.'],
    ['Antes de usar datos reales', 'e', 'Política de tratamiento de datos, autorización de las familias, contrato con el colegio, cifrado y revisión de seguridad independiente.'],
  ];
  function etapas(c) {
    c.append(h('div', { class: 'tarjeta' }, h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Etapa'), h('th', { scope: 'col' }, 'Qué incluye'))),
      h('tbody', null, ETAPAS.map(([e, k, t]) => h('tr', null, h('td', null, h('span', { class: 'sello sello--' + k }, e)), h('td', null, t))))))),
      h('div', { class: 'aviso', style: 'margin-top:1rem' }, 'No diagnosticamos, no reemplazamos al equipo interdisciplinario del colegio y no decidimos por el docente. Los datos de partida son de ejemplo.'));
  }

  MT.router.registrar({
    id: 'hoja', titulo: 'Hoja de ruta', espacio: '', subs: tabs,
    render(main, { sub }) {
      const c = pagina(main, { etiqueta: 'Hoja de ruta', titulo: { propuesta: 'Nuestro sentido y cómo podría sostenerse', arquitectura: 'Cómo está construida y qué falta', etapas: 'Qué hay hoy y qué viene' }[sub],
        descripcion: 'La mirada de quien decide si probar, apoyar o llevarla a su colegio.' });
      c.append(h('nav', { class: 'pestanas-pagina', 'aria-label': 'Secciones de la hoja de ruta' }, tabs().map((t) => h('a', { href: '#/hoja/' + t.id, 'aria-current': t.id === sub ? 'page' : null }, t.etiqueta))));
      ({ propuesta, arquitectura, etapas, construccion: (x) => MT.construccion.cuadricula(x) })[sub](c);
    },
  });
})(window.MT = window.MT || {});
