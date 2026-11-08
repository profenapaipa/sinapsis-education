/* router.js: navegación por hash (#/kinesis/docente). Sin servidor, funciona igual abriendo el
   archivo, en GitHub Pages o dentro del servidor del piloto.

   Qué hace en cada cambio de pantalla: pinta la vista, fija el color del espacio, actualiza el
   título de la pestaña, marca el enlace activo y lleva el foco al título para que quien usa un
   lector de pantalla sepa dónde está. */
(function (MT) {
  'use strict';
  const rutas = {};
  let limpiezas = [];

  function registrar(def) { rutas[def.id] = def; }
  // Las vistas que abren suscripciones (el chat) registran aquí cómo cerrarlas al salir.
  function alSalir(fn) { limpiezas.push(fn); }

  function actual() {
    const partes = (window.location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    const id = rutas[partes[0]] ? partes[0] : 'inicio';
    const def = rutas[id];
    // Las secciones pueden depender del rol, por eso def.subs puede ser una función.
    const subs = typeof def.subs === 'function' ? def.subs() : def.subs;
    const sub = subs && subs.some((s) => s.id === partes[1]) ? partes[1] : (subs && subs.length ? subs[0].id : null);
    return { id, sub, def, subs };
  }

  function marcarNavegacion(id) {
    document.querySelectorAll('[data-ruta]').forEach((a) => {
      if (a.dataset.ruta === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* Título de la pestaña (QA-05, WCAG 2.4.2). Antes era solo el nombre de la sección, y cuatro portales o cinco guías compartían
     el mismo. Ahora se antepone el título de la pantalla (su h1), que ya es texto público de la página: no se inventa ninguna palabra,
     solo se repite lo que la persona ve. Si el h1 coincide con la sección, no se duplica. */
  function titulo(def, main) {
    if (def.titulo === 'Inicio') return MT.nombre;
    const t = main.querySelector('h1') || main.querySelector('.vivos:not([hidden]) [role="heading"]');
    const limpio = (x) => (x ? x.textContent.replace(/\s+/g, ' ').trim() : '');
    // Las guías por rol y las pestañas de página (Roles y datos, Mapa...) comparten h1: lo que las distingue es la pestaña activa.
    const pestana = limpio(main.querySelector('.pestanas-pagina [aria-current="page"]'));
    const partes = [pestana, limpio(t), def.titulo].filter((x, i, a) => x && a.indexOf(x) === i);
    return partes.join(' · ') + ' · ' + MT.nombre;
  }

  function render(opciones) {
    const op = Object.assign({ foco: true }, opciones);
    const { id, sub, def, subs } = actual();
    const main = document.getElementById('app');
    const y = window.scrollY;
    limpiezas.forEach((f) => { try { f(); } catch (e) { /* ya no importa */ } });
    limpiezas = [];
    if (MT.tejido) MT.tejido.progreso();
    main.dataset.espacio = (typeof def.espacio === 'function' ? def.espacio(sub) : def.espacio) || '';
    // Los portales vivos (iframes y chat) son persistentes: se les quita de vista pero no del documento, o se recargarían.
    [...main.children].forEach((x) => { if (!x.hasAttribute('data-persistente')) x.remove(); });
    if (MT.vivos) MT.vivos.ocultar();
    try {
      def.render(main, { sub, subs });
    } catch (e) {
      (window.__errores = window.__errores || []).push('vista ' + id + ': ' + e.message);
      console.error(e);
      [...main.children].forEach((x) => { if (!x.hasAttribute('data-persistente')) x.remove(); });
      main.append(MT.ui.h('div', { class: 'contenedor' }, MT.ui.h('p', { class: 'aviso' }, 'Esta pantalla tuvo un problema. Vuelve al inicio e inténtalo otra vez.')));
    }
    document.title = titulo(def, main);
    marcarNavegacion(id);
    if (MT.glosario) MT.glosario.marcar(main);
    if (MT.tejido) MT.tejido.revelar(main);
    if (MT.barra) MT.barra.actualizar();
    if (op.foco) {
      window.scrollTo(0, 0);
      const t = main.querySelector('h1') || main.querySelector('.vivos:not([hidden]) [role="heading"]');
      if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    } else {
      window.scrollTo(0, y);
    }
  }

  function iniciar() {
    window.addEventListener('hashchange', () => render({ foco: true }));
    render({ foco: false });
  }

  MT.router = { registrar, iniciar, actual, alSalir, recargar: () => render({ foco: false }), rutas };
})(window.MT = window.MT || {});
