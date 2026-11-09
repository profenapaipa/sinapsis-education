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
  // «Guía» solo informa: todo lo que se hace se hace dentro de Kinesis y Wisfox, así que sus botones llevan al portal.
  const botonPortal = (id, clase) => h('button', { class: 'btn ' + (clase || ''), type: 'button', onclick: () => irPortal(id) }, 'Abrir ' + PORTALES[id].nombre);
  const pestanasRol = (rol) => h('nav', { class: 'pestanas-pagina', 'aria-label': 'Pasos por rol' }, h('a', { href: '#/guia', 'aria-current': !rol ? 'page' : null }, 'Los portales'),
    MT.roles.lista.map((x) => h('a', { href: '#/guia/' + x.id, 'aria-current': x.id === rol ? 'page' : null }, x.nombre)));

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
    const c = pagina(main, { etiqueta: 'Guía', titulo: 'Cómo se usa ' + MT.nombre,
      descripcion: 'Kinesis y Wisfox son los dos portales donde se trabaja; Niky es la ayuda con IA, el botón flotante. Esta guía solo explica: no guarda nada ni pide datos.' });
    c.append(pestanasRol(null));

    c.append(h('div', { class: 'rejilla rejilla--3 portales' }, ORDEN.map((id) => { const p = PORTALES[id]; return h('article', { class: 'tarjeta portal', 'data-espacio': id },
      h('div', { class: 'proyecto-cab' }, marca(id), h('div', null, h('h2', null, p.nombre), h('small', null, p.rotulo))),
      h('span', { class: 'sello sello--' + p.estado[1] }, p.estado[0]),
      h('p', null, p.que),
      h('p', { class: 'etiqueta' }, 'Para quién'), h('p', null, p.paraQuien),
      // Plegado (sinergia de contenido): cada tarjeta dice primero qué es y para quién; lo que se hace ahí queda a un clic.
      h('details', { class: 'plegable plegable--tarjeta' }, h('summary', null, 'Qué haces ahí'), h('ul', null, p.haces.map((x) => h('li', null, x)))),
      h('p', { class: 'portal__entrega' }, p.entrega),
      h('div', { class: 'acciones' }, id === 'valeria' ? null : botonPortal(id), id === 'valeria' ? null : h('a', { class: 'btn btn--suave', href: id === 'kinesis' ? '#/guia/docente' : '#/guia/estudiante' }, 'Cómo usarlo'))); })));

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
      h('p', { class: 'aviso', style: 'margin-top:1rem' }, 'Kinesis y Wisfox siguen siendo aplicaciones de sus equipos, con sus propios datos: compartir los datos entre ellas es el trabajo del servidor central de la hoja de ruta.'),
      h('div', { class: 'acciones' }, h('a', { class: 'btn btn--suave', href: '#/mapa/conexiones' }, 'Ver el mapa de módulos'))));
    // Preguntas frecuentes, plegadas y con lo que la plataforma ya dice en otros sitios (no se repiten textos: se reusan).
    c.append(h('details', { class: 'plegable', id: 'h-faq' }, h('summary', null, 'Preguntas frecuentes'),
      h('h3', null, '¿Qué es un ajuste?'), MT.guias.notaAjuste(),
      h('h3', null, '¿Quién ve qué?'), h('p', null, 'Cada rol ve solo lo suyo. ', h('a', { href: '#/recorrido' }, 'Roles y datos')),
      h('h3', null, '¿Qué significa cada sigla?'), h('p', null, h('a', { href: '#/glosario' }, 'Glosario'))));
  }

  /* ---------------- Guía de inicio rápido por rol ---------------- */
  function vistaGuia(main, { sub }) {
    const rol = sub; const r = MT.roles.por(rol); const g = GUIA[rol];
    const c = pagina(main, { etiqueta: 'Guía', titulo: 'Tu guía de inicio rápido', descripcion: 'Elige tu rol y mira los pasos. Cada paso dice en qué portal ocurre; para hacerlo, abre ese portal.', rol,
      ruta: [{ t: MT.nombre, href: '#/' }, { t: 'Guía', href: '#/guia' }, { t: r.nombre }], volver: { href: '#/guia', texto: 'Volver a la guía' } });
    // La mascota del rol acompaña la guía (una fila pequeña sobre el título). La entrada de js/entrada.js la dibuja; aquí solo se le da sitio.
    // Además de la mascota de la cabecera, la frase de acompañamiento de la entrada («Te acompaña …») va bajo la línea, igual que antes.
    if (MT.entrada && MT.comun.cabActual) MT.comun.cabActual.poner({ extra: MT.entrada.companera(rol) });
    c.append(pestanasRol(rol));
    c.append(h('section', { class: 'siguiente-banner' },
      h('div', null, h('p', { class: 'etiqueta' }, 'Tu meta como ' + r.nombre.toLowerCase()), h('h2', null, g.meta), h('p', null, 'Tu portal principal es ' + PORTALES[g.principal].nombre + '.')),
      h('div', { class: 'acciones' }, botonPortal(g.principal))));
    c.append(MT.guias.notaAjuste());
    c.append(h('ol', { class: 'guia-pasos' }, g.pasos.map((p, i) => h('li', { class: 'tarjeta guia-paso', 'data-espacio': p.portal },
      h('span', { class: 'n', 'aria-hidden': 'true' }, String(i + 1)),
      h('div', { class: 'guia-paso__texto' }, h('p', { class: 'etiqueta' }, 'En ' + PORTALES[p.portal].nombre), h('h3', null, p.t), h('p', null, p.d)),
      h('div', { class: 'acciones' },
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Abrir ' + PORTALES[p.portal].nombre + ', paso ' + (i + 1), onclick: () => irPortal(p.portal) }, 'Abrir ' + PORTALES[p.portal].nombre))))));
    c.append(h('p', { class: 'suave' }, '“Abrir” muestra el portal aquí mismo, dentro de la plataforma. ', h('a', { href: '#/guia' }, 'Ver qué hace cada portal')));
  }

  /* #/portales (general) quedó como #/guia: la página informativa es una sola. Los portales siguen en #/portales/<id>. */
  const TABS = [{ id: 'general' }, { id: 'kinesis' }, { id: 'valeria' }, { id: 'wisfox' }];
  MT.router.registrar({
    id: 'portales', titulo: 'Portales', subs: TABS,
    espacio: (sub) => (ORDEN.includes(sub) ? sub : ''),
    render(main, { sub }) { if (sub === 'general') { location.replace('#/guia'); return; } MT.vivos.mostrar(sub); },
  });
  // #/guia es la página informativa (los portales y cómo se conectan); #/guia/<rol> son los pasos de cada rol, también solo de lectura.
  MT.router.registrar({
    id: 'guia', titulo: 'Guía', espacio: '',
    subs: () => [{ id: 'general' }, ...MT.roles.lista.map((x) => ({ id: x.id }))],
    render(main, { sub }) { if (sub === 'general') vistaPortales(main); else vistaGuia(main, { sub }); },
  });
})(window.MT = window.MT || {});
