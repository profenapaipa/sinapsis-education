/* planes.js: formas de participar, formas de acompañamiento y el registro (lista de interés o conversación sobre un colegio).

   Voz: la del semillero. No se ofrecen productos: se cuentan maneras de acercarse y de caminar juntos. Nada aquí promete ni fija
   valores; lo que todavía no existe dice "próximamente". La guía completa de voz está en la carpeta privada del proyecto.

   Nota técnica: los valores internos del registro siguen siendo 'gratis' (lista de interés) y 'prueba' (conversación sobre un
   colegio), porque así los recibe el servidor. Solo cambia cómo se nombran en pantalla. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;
  const st = MT.store;

  const ETAPAS = [
    { id: 'demostracion', nombre: 'Demostración', etiqueta: 'Abierta hoy', sub: 'Sin registro', para: 'Conocer la plataforma tal como funciona hoy.',
      incluye: ['Los cinco roles y su flujo de trabajo', 'Actividades con DUA y quiz, ajustes con aprobación, notas', 'Archivos con permisos por rol', 'Ruta de Inglés de grado 8.° con quizes explicados', 'Kinesis y Wisfox dentro de la plataforma, y Niky con ejemplos'],
      accion: { texto: 'Entrar a la demostración', href: '#/guia' } },
    { id: 'lista', nombre: 'Lista de interés', etiqueta: 'Con tu correo', sub: 'Para seguirnos de cerca', para: 'Quienes quieren enterarse cuando haya novedades.',
      incluye: ['Todo lo de la demostración', 'Tu correo en una lista para avisarte cuando abramos el espacio compartido', 'Una primera conversación cuando haya un piloto'],
      accion: { texto: 'Dejar mi correo', href: '#/registro/lista', principal: true } },
    { id: 'compartido', nombre: 'Espacio compartido', etiqueta: 'En desarrollo', sub: 'Se construye con quienes lo van a vivir', para: 'Equipos que trabajan juntos.', proximo: true,
      incluye: ['Todo lo anterior', 'Trabajo compartido entre personas y dispositivos', 'Cuentas por rol con inicio de sesión único', 'Conexión de Niky a un modelo de lenguaje', 'Exportar el PIAR en el formato oficial', 'Reportes e historial'],
      accion: { texto: 'Conversar sobre esto', href: '#/registro/conversar' } },
    { id: 'colegio', nombre: 'Con un colegio', etiqueta: 'Con cada comunidad', sub: 'Se construye a la medida de cada una', para: 'Colegios que quieren recorrer el camino juntos.', proximo: true,
      incluye: ['El espacio compartido, para varios cursos', 'Implementación acompañada', 'Formación a docentes y familias', 'Asesoría pedagógica en DUA y PIAR', 'Acompañamiento del piloto', 'Apoyo continuo'],
      accion: { texto: 'Conversar con nosotros', href: '#/piloto' } },
  ];

  // [fila, demostración, lista de interés, espacio compartido, con un colegio]
  const TABLA = [
    ['Recorrer la plataforma con datos de ejemplo', 'ok', 'ok', 'ok', 'ok'],
    ['Los cinco roles y su flujo de trabajo', 'ok', 'ok', 'ok', 'ok'],
    ['Actividades con DUA y quiz editable', 'ok', 'ok', 'ok', 'ok'],
    ['Ajustes con aprobación de orientación', 'ok', 'ok', 'ok', 'ok'],
    ['Notas y archivos con permisos por rol', 'ok', 'ok', 'ok', 'ok'],
    ['Ruta de Inglés de grado 8.° con quizes explicados', 'ok', 'ok', 'ok', 'ok'],
    ['Kinesis y Wisfox dentro de la plataforma, con vista dividida', 'ok', 'ok', 'ok', 'ok'],
    ['Aviso de novedades y primera conversación', '-', 'ok', 'ok', 'ok'],
    ['Conexión de Niky a un modelo de lenguaje', '-', '-', 'pro', 'pro'],
    ['Trabajo compartido entre personas y dispositivos', '-', '-', 'pro', 'pro'],
    ['Cuentas por rol con inicio de sesión único', '-', '-', 'pro', 'pro'],
    ['Exportar el PIAR en el formato oficial', '-', '-', 'pro', 'pro'],
    ['Reportes del colegio e historial de quién hizo qué', '-', '-', 'pro', 'pro'],
    ['Varios cursos y varias materias', '-', '-', 'pro', 'serv'],
    ['Implementación acompañada', '-', '-', '-', 'serv'],
    ['Formación a docentes y familias', '-', '-', '-', 'serv'],
    ['Asesoría pedagógica en DUA y PIAR', '-', '-', '-', 'serv'],
    ['Acompañamiento y seguimiento del piloto', '-', '-', '-', 'serv'],
  ];
  const CELDA = { ok: ['Disponible', 'ok'], pro: ['Próximamente', 'pro'], serv: ['Acompañamiento', 'serv'], '-': ['No incluido', 'no'] };
  const icono = (k) => ({ ok: '✓', pro: '○', serv: '◆', '-': '–' }[k]);

  const SERVICIOS = [
    { id: 'implementacion', nombre: 'Implementación', para: 'Rectoría y coordinación', que: ['Configuración de cursos, categorías de apoyo y cuentas por rol', 'Carga inicial acordada con el colegio', 'Puesta en marcha con el equipo de orientación'], entrega: 'Remoto y en el colegio' },
    { id: 'asesoria', nombre: 'Asesoría pedagógica', para: 'Docentes y orientación', que: ['Cómo diseñar actividades con DUA', 'Cómo pensar un ajuste razonable y cuándo aprobarlo', 'Conversación sobre sus propios formatos de PIAR'], entrega: 'Sesiones por equipo' },
    { id: 'capacitacion', nombre: 'Capacitación', para: 'Docentes, familias y estudiantes', que: ['Talleres por rol con la guía de inicio rápido', 'Material para familias en lenguaje sencillo', 'Práctica guiada con la demostración'], entrega: 'Talleres presenciales o virtuales' },
    { id: 'acompanamiento', nombre: 'Acompañamiento del piloto', para: 'Colegio que prueba en un curso', que: ['Seguimiento semanal con el equipo', 'Indicadores: tiempo hasta el primer ajuste, ajustes aprobados, uso por rol', 'Una mirada final con aprendizajes y recomendaciones'], entrega: 'Un periodo académico' },
    { id: 'datos', nombre: 'Datos y seguridad', para: 'Rectoría y asesoría legal del colegio', que: ['Política de tratamiento de datos y autorizaciones de las familias', 'Revisión de seguridad y decisión de dónde viven los datos', 'Preparación para datos reales con apoyo jurídico'], entrega: 'Antes de usar datos reales' },
    { id: 'contenido', nombre: 'Contenido a la medida', para: 'Coordinación académica', que: ['Rutas de aprendizaje para otras materias, desde su malla', 'Quizes con explicación escritos con sus docentes'], entrega: 'Por materia y periodo' },
    { id: 'apoyo', nombre: 'Apoyo continuo', para: 'Todo el colegio', que: ['Un canal de ayuda para cada rol', 'Actualizaciones y correcciones'], entrega: 'Continuo' },
  ];

  const RUTAS = [
    { nombre: 'Un primer curso', para: 'Un curso de un colegio', incluye: ['Espacio compartido para ese curso', 'Implementación acompañada', 'Formación por rol', 'Acompañamiento del piloto', 'Datos y seguridad'], nota: 'Para probar con calma en un solo curso, durante un periodo académico, y decidir juntos con lo aprendido.' },
    { nombre: 'Todo el colegio', para: 'Varios cursos', incluye: ['Espacio compartido para todo el colegio', 'Implementación completa', 'Formación continua', 'Asesoría pedagógica en DUA y PIAR', 'Contenido a la medida', 'Apoyo continuo'], nota: 'Para colegios que ya recorrieron un primer curso y quieren extenderlo.' },
    { nombre: 'Redes de colegios', para: 'Varios colegios', incluye: ['Un programa para una red de colegios', 'Todas las formas de acompañamiento', 'Indicadores comparables entre colegios', 'Formación de formadores'], nota: 'Para secretarías, fundaciones y aliados que quieren acompañar a más comunidades.' },
  ];

  /* ---------------- Formas de participar y de acompañamiento ---------------- */
  function vistaPlanes(main, sub) {
    const c = pagina(main, { etiqueta: 'Participar', titulo: sub === 'acompanamiento' ? 'Formas de acompañamiento' : 'Formas de acercarte y de participar',
      descripcion: sub === 'acompanamiento' ? 'Implementar bien es tan importante como la herramienta. Esto es lo que podemos ofrecer a una comunidad para recorrer el camino juntos.'
        : 'La demostración ya funciona completa. Desde ahí hay varias maneras de acercarse, según lo que cada comunidad necesite: seguirnos de cerca, probar con un curso o conversar sobre un acompañamiento.' });
    c.append(MT.plan.avisoConstruccion());
    c.append(h('nav', { class: 'pestanas-pagina', 'aria-label': 'Participar' }, [['formas', 'Formas de participar'], ['acompanamiento', 'Acompañamiento']].map(([id, t]) => h('a', { href: '#/planes/' + id, 'aria-current': id === sub ? 'page' : null }, t))));
    if (sub === 'acompanamiento') return acompanamiento(c);

    c.append(h('div', { class: 'rejilla rejilla--4 planes' }, ETAPAS.map((p) => h('article', { class: 'tarjeta plan-tarjeta' + (p.proximo ? ' plan-tarjeta--pro' : ''), 'data-plan': p.id },
      h('p', { class: 'etiqueta' }, p.nombre), h('p', { class: 'plan-precio' }, p.etiqueta), h('p', { class: 'suave plan-sub' }, p.sub), h('p', null, p.para),
      h('ul', { class: 'plan-lista' }, p.incluye.map((x) => h('li', null, x))),
      h('a', { class: 'btn' + (p.accion.principal ? '' : ' btn--suave'), href: p.accion.href }, p.accion.texto)))));

    c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-comp' }, h('h2', { id: 'h-comp' }, 'Qué incluye cada forma'),
      h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla tabla-planes' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Función'), ETAPAS.map((p) => h('th', { scope: 'col' }, p.nombre)))),
        h('tbody', null, TABLA.map(([f, ...v]) => h('tr', null, h('th', { scope: 'row' }, f), v.map((k) => h('td', { class: 'celda-' + CELDA[k][1] }, h('span', { 'aria-hidden': 'true' }, icono(k)), h('span', { class: k === '-' ? 'solo-lectores' : 'celda-texto' }, ' ' + CELDA[k][0]))))))))));

    c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-faq' }, h('h2', { id: 'h-faq' }, 'Preguntas frecuentes'),
      h('div', { class: 'rejilla rejilla--2' }, [
        ['¿Qué puedo hacer hoy?', 'Recorrer la demostración completa con datos de ejemplo: los cinco roles, actividades, ajustes, archivos y la ruta de Inglés. Todo lo que ya funciona está abierto.'],
        ['¿Para qué dejar mi correo?', 'Para poder avisarte cuando abramos el espacio compartido y conversar contigo sobre un primer piloto. Solo pedimos tu correo, y puedes retirarlo cuando quieras.'],
        ['¿Cómo se sostiene el proyecto?', 'Lo estamos pensando con calma, junto a las comunidades educativas que quieran caminar con nosotros. Preferimos construirlo con ellas antes que definirlo solos.'],
        ['¿Se pueden usar datos reales de estudiantes?', 'Todavía no. Primero llegan las autorizaciones de las familias, los acuerdos con el colegio y una revisión de seguridad. Ese camino también se recorre juntos.'],
      ].map(([q, a]) => h('div', { class: 'tarjeta' }, h('h3', null, q), h('p', null, a))))));
    c.append(h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/registro/lista' }, 'Dejar mi correo'), h('a', { class: 'btn btn--suave', href: '#/registro/conversar' }, 'Conversar sobre mi colegio'), h('a', { class: 'btn btn--suave', href: '#/planes/acompanamiento' }, 'Ver formas de acompañamiento')));
  }

  function acompanamiento(c) {
    c.append(h('div', { class: 'rejilla rejilla--3 servicios' }, SERVICIOS.map((s) => h('article', { class: 'tarjeta servicio', id: 'serv-' + s.id },
      h('h2', null, s.nombre), h('p', { class: 'etiqueta' }, 'Para ' + s.para.toLowerCase()), h('ul', null, s.que.map((x) => h('li', null, x))), h('p', { class: 'suave' }, h('strong', null, 'Cómo se vive: '), s.entrega)))));
    c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-paq' }, h('h2', { id: 'h-paq' }, 'Rutas posibles'),
      h('p', { class: 'bajada' }, 'Las formas de acompañamiento se combinan según el tamaño del camino. Cada ruta se conversa y se construye con la comunidad que la recorre.'),
      h('div', { class: 'rejilla rejilla--3' }, RUTAS.map((p) => h('article', { class: 'tarjeta plan-tarjeta' }, h('p', { class: 'etiqueta' }, p.para), h('h3', null, p.nombre), h('ul', { class: 'plan-lista' }, p.incluye.map((x) => h('li', null, x))), h('p', { class: 'suave' }, p.nota), h('a', { class: 'btn', href: '#/piloto' }, 'Conversar')))),
      h('p', { class: 'suave', style: 'margin-top:1rem' }, '¿Prefieres empezar despacio? ', h('a', { href: '#/registro/lista' }, 'Deja tu correo'), ' y te escribimos cuando haya novedades.')));
  }

  /* ---------------- Registro ---------------- */
  function vistaRegistro(main, tipo) {
    const plan = tipo === 'conversar' ? 'prueba' : 'gratis';   // los valores que recibe el servidor
    const c = pagina(main, { etiqueta: 'Participar', titulo: tipo === 'conversar' ? 'Conversemos sobre tu colegio' : 'Deja tu correo',
      descripcion: tipo === 'conversar' ? 'Cuéntanos quién eres y qué necesitas. Te escribiremos cuando podamos acompañar un primer piloto.' : 'Solo te pedimos un correo. Te avisaremos cuando abramos el espacio compartido, y mientras tanto la demostración completa está abierta.' });
    c.append(MT.plan.avisoConstruccion());
    const correo = MT.dlg.campo({ id: 'correo', etiqueta: 'Tu correo', max: 120, valor: (MT.plan.cuenta() || {}).correo || '', ayuda: 'No pedimos tu nombre ni el de ningún estudiante.' });
    const rol = MT.dlg.campo({ id: 'rol', etiqueta: 'Tu rol', tipo: 'select', valor: st.obtener().rol || 'docente', opciones: [...MT.roles.lista.map((r) => ({ valor: r.id, texto: r.nombre })), { valor: 'directivo', texto: 'Rectoría o directivo' }, { valor: 'aliado', texto: 'Aliado, fundación o secretaría' }] });
    const inst = MT.dlg.campo({ id: 'institucion', etiqueta: 'Colegio u organización (opcional)', max: 100 });
    const msg = tipo === 'conversar' ? MT.dlg.campo({ id: 'mensaje', etiqueta: 'Qué te gustaría contarnos (opcional)', tipo: 'area', filas: 3, max: 500, ayuda: 'Por ejemplo: cuántos cursos, qué rol usaría la plataforma y qué te inquieta.' }) : null;
    const consent = h('label', { class: 'casilla casilla--consent' }, h('input', { type: 'checkbox', id: 'consentimiento' }),
      h('span', null, 'Autorizo el tratamiento de mi correo para que me contacten sobre Mosaico Telar. Puedo pedir que lo borren cuando quiera.'));
    const error = h('p', { class: 'aviso', role: 'alert', hidden: true });
    const boton = h('button', { class: 'btn', type: 'submit' }, tipo === 'conversar' ? 'Enviar' : 'Dejar mi correo');
    const f = h('form', { class: 'tarjeta formulario formulario--registro', novalidate: true },
      h('div', { class: 'campo campo--plan', role: 'group', 'aria-label': 'Qué quieres hacer' }, h('p', { class: 'campo__etiqueta' }, 'Qué quieres hacer'),
        h('a', { class: 'chip-plan' + (tipo === 'lista' ? ' chip-plan--on' : ''), href: '#/registro/lista', 'aria-current': tipo === 'lista' ? 'page' : null }, 'Dejar mi correo'),
        h('a', { class: 'chip-plan' + (tipo === 'conversar' ? ' chip-plan--on' : ''), href: '#/registro/conversar', 'aria-current': tipo === 'conversar' ? 'page' : null }, 'Conversar sobre mi colegio')),
      error, correo.el, rol.el, inst.el, msg ? msg.el : null, consent, boton,
      h('p', { class: 'suave' }, 'Tu correo se usa solo para escribirte sobre Mosaico Telar. No lo compartimos ni lo usamos para otra cosa.'));
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); error.hidden = true; boton.disabled = true;
      try {
        const r = await MT.plan.registrar({ correo: correo.leer(), rol: rol.leer(), institucion: inst.leer(), mensaje: msg ? msg.leer() : '', plan, consentimiento: consent.querySelector('input').checked });
        exito(c, f, r, tipo);
      } catch (err) { error.hidden = false; error.textContent = err.message; boton.disabled = false; }
    });
    c.append(f);
    c.append(h('p', { class: 'suave' }, 'Antes de escribirnos puedes ', h('a', { href: '#/planes' }, 'ver las formas de participar'), ' o ', h('a', { href: '#/guia' }, 'entrar a la demostración'), '.'));
  }

  function exito(c, f, r, tipo) {
    const tej = MT.tejido.logo({ animar: true });
    const contacto = MT.config.contacto;
    const cuerpo = `Correo: ${r.datos.correo}\nRol: ${r.datos.rol}\nInstitución: ${r.datos.institucion || '-'}\nMotivo: ${tipo === 'conversar' ? 'Conversar sobre un colegio' : 'Lista de interés'}\n${r.datos.mensaje || ''}`;
    const tarjeta = h('div', { class: 'tarjeta registro-exito', role: 'status' },
      h('div', { class: 'registro-exito__logo' }, tej.el),
      h('div', null,
        h('h2', null, tipo === 'conversar' ? 'Gracias, recibimos tu mensaje' : 'Gracias, tu correo quedó en la lista'),
        h('p', null, r.via === 'servidor' ? `Te escribiremos a ${r.datos.correo}.` : `Quedó guardado en este dispositivo para ${r.datos.correo}. Cuando abramos el espacio compartido te escribiremos.`),
        r.via === 'local' && contacto ? h('p', null, h('a', { class: 'btn btn--suave', href: `mailto:${contacto}?subject=${encodeURIComponent(tipo === 'conversar' ? 'Conversar sobre un colegio' : 'Lista de interés')}&body=${encodeURIComponent(cuerpo)}` }, 'Enviarlo también por correo')) : null,
        h('p', { class: 'suave' }, 'Mientras tanto, la demostración completa está abierta para ti.'),
        h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/guia' }, 'Entrar a la demostración'), h('a', { class: 'btn btn--suave', href: '#/planes' }, 'Ver las formas de participar'))));
    f.replaceWith(tarjeta);
  }

  MT.router.registrar({
    id: 'planes', titulo: 'Participar', espacio: '', subs: [{ id: 'formas' }, { id: 'acompanamiento' }],
    render(main, { sub }) { vistaPlanes(main, sub); },
  });
  MT.router.registrar({
    id: 'registro', titulo: 'Participar', espacio: '', subs: [{ id: 'lista' }, { id: 'conversar' }],
    render(main, { sub }) { vistaRegistro(main, sub); },
  });
})(window.MT = window.MT || {});
