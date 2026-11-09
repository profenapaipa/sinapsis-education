/* portales.js: la vista general de los tres portales y la guía de inicio rápido de cada rol.

   Los portales en sí (Kinesis, Niky, Wisfox) se abren desde el riel (el de tu rol) y viven en js/vivos.js: aquí solo está la página
   que los explica en paralelo y la guía paso a paso. Los datos de qué hace cada portal y cada rol están en js/guias.js. */
(function (MT) {
  'use strict';
  const { h, marca } = MT.ui;
  const { pagina } = MT.comun;
  const { PORTALES, ORDEN, GUIA } = MT.guias;
  const st = MT.store;

  const irPortal = (id) => { location.hash = '#/portales/' + id; };
  const botonPortal = (id, clase) => h('button', { class: 'btn ' + (clase || ''), type: 'button', onclick: () => irPortal(id) }, 'Ir a ' + PORTALES[id].nombre);

  // Un ajuste recorriendo los tres portales: cada paso cae en el carril donde ocurre.
  const FLUJO = [
    ['kinesis', 'Orientación', 'Registra los apoyos del perfil de cada estudiante.'],
    ['kinesis', 'Docente', 'Planea la clase con DUA y crea la actividad.'],
    ['valeria', 'Docente', 'Pide ideas y ayuda a redactar. Propone; decide quien enseña.'],
    ['kinesis', 'Docente', 'Ajusta la actividad al perfil y la envía a orientación.'],
    ['kinesis', 'Orientación', 'Revisa y aprueba, o devuelve con una nota.'],
    ['kinesis', 'Familia', 'Ve la novedad ya aprobada, con su razón.'],
    ['wisfox', 'Estudiante', 'Recibe la actividad a su medida, hace el quiz y gana logros.'],
    ['valeria', 'Estudiante', 'Resuelve sus dudas mientras practica.'],
    ['kinesis', 'Docente', 'Ve el progreso del estudiante y decide el siguiente paso.'],
  ];

  function vistaPortales(main) {
    const c = pagina(main, { etiqueta: 'Portales', titulo: 'Tres portales, una sola plataforma',
      descripcion: 'Kinesis, Niky y Wisfox trabajan en paralelo y se pasan el trabajo entre sí. Desde el menú lateral entras al portal de tu rol; aquí están los tres, y puedes tener varios abiertos y volver a cada uno sin perder lo que hacías.' });

    c.append(h('div', { class: 'rejilla rejilla--3 portales' }, ORDEN.map((id) => { const p = PORTALES[id]; return h('article', { class: 'tarjeta portal', 'data-espacio': id },
      h('div', { class: 'proyecto-cab' }, marca(id), h('div', null, h('h2', null, p.nombre), h('small', null, p.rotulo))),
      h('span', { class: 'sello sello--' + p.estado[1] }, p.estado[0]),
      h('p', null, p.que),
      h('p', { class: 'etiqueta' }, 'Para quién'), h('p', null, p.paraQuien),
      // Plegado (sinergia de contenido): cada tarjeta dice primero qué es y para quién; lo que se hace ahí queda a un clic.
      h('details', { class: 'plegable plegable--tarjeta' }, h('summary', null, 'Qué haces ahí'), h('ul', null, p.haces.map((x) => h('li', null, x)))),
      h('p', { class: 'portal__entrega' }, p.entrega),
      h('div', { class: 'acciones' }, botonPortal(id), id === 'valeria' ? null : h('a', { class: 'btn btn--suave', href: id === 'kinesis' ? '#/guia' : '#/guia/estudiante' }, 'Cómo usarlo'))); })));

    // Plegado: la pantalla ofrece primero los tres portales; el recorrido paso a paso queda a un clic.
    c.append(h('details', { class: 'plegable', id: 'h-flujo' },
      h('summary', null, 'Un ajuste recorre los tres portales'),
      h('p', { class: 'bajada' }, 'Cada fila es un paso, en el portal donde ocurre. Lee de arriba hacia abajo: el trabajo baja de un portal al siguiente.'),
      MT.guias.notaAjuste(),
      h('div', { class: 'carriles-cab', 'aria-hidden': 'true' }, ORDEN.map((id) => h('div', { 'data-espacio': id }, marca(id, 'carril-marca'), h('strong', null, PORTALES[id].nombre)))),
      h('ol', { class: 'carriles' }, FLUJO.map(([id, quien, texto], i) => h('li', { class: 'carril-paso' },
        ORDEN.map((c2) => (c2 === id
          ? h('div', { class: 'carril-celda carril-celda--activa', 'data-espacio': id },
            h('span', { class: 'carril-n' }, String(i + 1)), h('p', { class: 'etiqueta' }, quien + ' · ' + PORTALES[id].nombre), h('p', null, texto))
          : h('div', { class: 'carril-celda', 'aria-hidden': 'true' }))))))));

    c.append(h('details', { class: 'plegable', id: 'h-une' },
      h('summary', null, 'Qué los une'),
      h('div', { class: 'rejilla rejilla--4' }, [
        ['Un rol, un camino', 'Eliges quién eres una vez y cada portal te muestra lo tuyo.'],
        ['Los mismos datos', 'Un ajuste aprobado en Kinesis es el que ve el estudiante en Wisfox.'],
        ['Una guía común', 'Niky ayuda en los dos portales y nunca recibe información clínica.'],
        ['Una sola identidad', 'Mismo diseño, mismas reglas de privacidad y mismo lenguaje.'],
      ].map(([t, p]) => h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, t), h('p', null, p)))),
      h('p', { class: 'aviso', style: 'margin-top:1rem' }, 'Hoy, “Mi espacio” reúne el trabajo de los tres portales en una sola pantalla, con todo conectado. Kinesis y Wisfox originales siguen siendo aplicaciones de sus equipos, con sus propios datos: compartir los datos entre ellas es el trabajo del servidor central de la hoja de ruta.'),
      h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/guia' }, 'Mi guía de inicio rápido'), h('a', { class: 'btn btn--suave', href: '#/mapa/conexiones' }, 'Ver el mapa de módulos'))));
  }

  /* ---------------- Guía de inicio rápido por rol ---------------- */
  function vistaGuia(main, { sub }) {
    const rol = sub; const r = MT.roles.por(rol); const g = GUIA[rol];
    const c = pagina(main, { etiqueta: 'Inicio rápido', titulo: 'Tu guía de inicio rápido', descripcion: 'Elige tu rol y sigue los pasos. Cada paso dice en qué portal ocurre y te lleva a él.', rol });
    // La mascota del rol acompaña la guía (una fila pequeña sobre el título). La entrada de js/entrada.js la dibuja; aquí solo se le da sitio.
    // La mascota del rol ya está en la cabecera única (comun.js); no hace falta una compañera aparte.
    c.append(h('nav', { class: 'pestanas-pagina', 'aria-label': 'Elige tu rol' }, MT.roles.lista.map((x) => h('a', { href: '#/guia/' + x.id, 'aria-current': x.id === rol ? 'page' : null }, x.nombre))));
    c.append(h('section', { class: 'siguiente-banner' },
      h('div', null, h('p', { class: 'etiqueta' }, 'Tu meta como ' + r.nombre.toLowerCase()), h('h2', null, g.meta), h('p', null, 'Tu portal principal es ' + PORTALES[g.principal].nombre + '.')),
      h('div', { class: 'acciones' }, botonPortal(g.principal), h('button', { class: 'btn btn--suave', type: 'button', onclick: () => MT.guias.irAqui(rol, 'resumen') }, 'Trabajar en Mi espacio'))));
    c.append(MT.guias.notaAjuste());
    c.append(h('ol', { class: 'guia-pasos' }, g.pasos.map((p, i) => h('li', { class: 'tarjeta guia-paso', 'data-espacio': p.portal },
      h('span', { class: 'n', 'aria-hidden': 'true' }, String(i + 1)),
      h('div', { class: 'guia-paso__texto' }, h('p', { class: 'etiqueta' }, 'En ' + PORTALES[p.portal].nombre), h('h3', null, p.t), h('p', null, p.d)),
      h('div', { class: 'acciones' },
        p.aqui ? h('button', { class: 'btn btn--chico', type: 'button', onclick: () => MT.guias.irAqui(rol, p.aqui) }, 'Hacerlo aquí') : null,
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Ir a ' + PORTALES[p.portal].nombre + ', paso ' + (i + 1), onclick: () => irPortal(p.portal) }, 'Ir a ' + PORTALES[p.portal].nombre))))));
    c.append(h('p', { class: 'suave' }, '“Ir a” muestra el portal aquí mismo, dentro de la plataforma. “Hacerlo aquí” lo hace en Mi espacio, la versión que reúne los tres. ', h('a', { href: '#/portales' }, 'Ver qué hace cada portal')));
  }

  const TABS = [{ id: 'general' }, { id: 'kinesis' }, { id: 'valeria' }, { id: 'wisfox' }];
  MT.router.registrar({
    id: 'portales', titulo: 'Portales', subs: TABS,
    espacio: (sub) => (ORDEN.includes(sub) ? sub : ''),
    render(main, { sub }) { if (sub === 'general') vistaPortales(main); else MT.vivos.mostrar(sub); },
  });
  MT.router.registrar({
    id: 'guia', titulo: 'Inicio rápido', espacio: '',
    // La guía abre en el rol de quien la lee; los demás quedan a un clic.
    subs: () => { const a = st.obtener().rol; const l = MT.roles.lista.map((x) => ({ id: x.id })); return a ? [l.find((x) => x.id === a), ...l.filter((x) => x.id !== a)] : l; },
    render: vistaGuia,
  });
})(window.MT = window.MT || {});
