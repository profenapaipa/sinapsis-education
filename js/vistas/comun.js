/* comun.js: lo que repiten los espacios y las páginas, para que se comporten igual aunque se vean distintos.

   cabecera():  la cabecera única de TODAS las pantallas (mascota, dónde estoy, volver, título, una línea y una acción).
   subnav():    la subnavegación de cualquier espacio (pestañas bajo la cabecera, el mismo patrón en todos).
   espacio():   una pantalla de Mi espacio: cabecera + subnavegación + contenido, en el mismo ancho que las páginas.
   pagina():    una página del colectivo (mapa, planes, hoja de ruta...): la misma cabecera y el mismo ancho.
   hero() y panelCifras(): el encabezado de bienvenida de cada rol (ahora vive en la cabecera) y el panel de cifras. */
(function (MT) {
  'use strict';
  const { h, icono } = MT.ui;

  /* ---------------------------------------------------------------------------------------------------------------------------
     LA CABECERA ÚNICA (.cab-pantalla). Todas las pantallas empiezan igual: la mascota del rol a 56 px, «dónde estoy» (un recorrido
     corto) y un único «Volver», el título, una línea de qué hacer aquí y UNA acción principal a la derecha.

     Por qué: el dueño veía «dos o tres aplicaciones dentro de una sola». Cada pantalla arrancaba distinta (hero, tarjeta con h1, barra
     de portal, cabecera de página). Con una sola pieza, saber dónde estás y qué hacer ahí es siempre lo mismo y está en el mismo sitio.

     cabecera(opciones) devuelve { el, poner(opciones) }: poner() cambia solo lo que cambió, sin rehacer la pieza (las vistas se repintan
     al cambiar los datos y no deben perder el foco ni parpadear).
       ruta:      [{ t, href? }]  el último es el lugar actual
       volver:    { href | onclick, texto? } | null
       titulo, linea
       accion:    nodo (el botón principal) | null
       siguiente: { etiqueta?, titulo, texto, boton:{texto,onclick} }  el siguiente paso de Mi espacio (comparte el lugar de la acción)
       mascota:   id de mascota ('kinesis', 'wisfox', 'niky', 'sinapso'); sin él se deduce del portal o del rol
       emocion:   'contento' por defecto; 'pensando' y 'duda' en los estados del portal
       voz:       'rol:<id>' o 'portal:<id>' para pedirle una línea a MT.narrativa (si no hay línea, no se pinta nada)
       extra:     nodo opcional bajo la línea (por ejemplo «qué te toca aquí» en los portales) */
  const MASCOTA_DE_PORTAL = { kinesis: 'kinesis', wisfox: 'wisfox', valeria: 'niky' };
  const mascotaPara = (o) => o.mascota || (o.portal ? MASCOTA_DE_PORTAL[o.portal] : null)
    || (o.rolId && MT.mascotas && MT.mascotas.paraRol ? MT.mascotas.paraRol(o.rolId) : 'sinapso');

  function cabecera(inicial) {
    const masc = h('div', { class: 'cab-pantalla__masc companero-rol' });
    const ruta = h('nav', { class: 'cab-pantalla__ruta', 'aria-label': 'Dónde estoy' });
    const volver = h('span', { class: 'cab-pantalla__volver' });
    const h1 = h('h1', null);
    const linea = h('p', { class: 'cab-pantalla__linea' });
    const extra = h('div', { class: 'cab-pantalla__extra' });
    const accion = h('div', { class: 'cab-pantalla__accion' });
    const el = h('header', { class: 'cab-pantalla' }, masc,
      h('div', { class: 'cab-pantalla__texto' }, h('div', { class: 'cab-pantalla__fila' }, ruta, volver), h1, linea, extra), accion);
    const e = {};
    const pintarMascota = (emocion) => { if (MT.mascotas) masc.replaceChildren(MT.mascotas.mascota(mascotaPara(e), { tamano: 56, emocion: emocion || e.emocion || 'contento' })); };
    function poner(o) {
      Object.assign(e, o);
      masc.dataset.rol = e.rolId || '';
      if ('mascota' in o || 'rolId' in o || 'portal' in o || 'emocion' in o || !masc.firstChild) pintarMascota();
      if ('ruta' in o) {
        const partes = [];
        e.ruta.forEach((x, i) => {
          if (i === e.ruta.length - 1) partes.push(h('span', { class: 'cab-pantalla__aqui', 'aria-current': 'page' }, x.t));
          else partes.push(x.href ? h('a', { href: x.href }, x.t) : h('span', null, x.t), h('span', { class: 'cab-pantalla__sep', 'aria-hidden': 'true' }, '›'));
        });
        ruta.replaceChildren(...partes);
      }
      if ('volver' in o) {
        const v = e.volver;
        volver.replaceChildren(...(v ? [v.href
          ? h('a', { class: 'cab-pantalla__volver-enlace', href: v.href }, '‹ ' + (v.texto || 'Volver'))
          : h('button', { class: 'enlace-boton cab-pantalla__volver-enlace', type: 'button', onclick: v.onclick }, '‹ ' + (v.texto || 'Volver'))] : []));
      }
      if ('titulo' in o) h1.textContent = e.titulo;
      if ('linea' in o || 'voz' in o) {
        // La línea de la narrativa (cuando otro módulo la completó) manda; si no hay, queda la línea propia de la pantalla.
        const n = e.voz && MT.narrativa && MT.narrativa.linea ? MT.narrativa.linea(e.voz) : null;
        linea.textContent = (n && n.texto) || e.linea || '';
        linea.hidden = !linea.textContent;
        if (n && n.emocion && !e.emocion) pintarMascota(n.emocion);
      }
      if ('extra' in o) { extra.replaceChildren(...(e.extra ? [e.extra] : [])); extra.hidden = !e.extra; }
      if ('accion' in o || 'siguiente' in o) {
        const s = e.siguiente;
        accion.replaceChildren(...[
          s ? h('div', { class: 'cab-pantalla__sig' }, h('p', { class: 'etiqueta' }, s.etiqueta || 'Siguiente paso'), h('h2', null, s.titulo), h('p', null, s.texto),
            s.boton ? h('button', { class: 'btn btn--chico', type: 'button', onclick: s.boton.onclick }, s.boton.texto) : null) : null,
          e.accion || null,
        ].filter(Boolean));
        accion.hidden = !accion.childElementCount;
      }
    }
    poner(Object.assign({ ruta: [], volver: null, titulo: '', linea: '', accion: null, extra: null, siguiente: null }, inicial));
    return { el, poner };
  }

  /* La subnavegación: el mismo patrón en todos los espacios (pestañas bajo la cabecera). Lo que todavía no existe («próximamente») va
     plegado al final, con el mismo aviso honesto de que está en desarrollo. */
  function subnav({ nombre, tabs, sub, ruta, pronto }) {
    const enlace = (t) => h('a', { href: t.href || `#/${ruta}/${t.id}`, 'aria-current': t.id === sub ? 'page' : null }, t.etiqueta, t.nuevo ? h('span', { class: 'nuevo' }, t.nuevo) : null);
    const proximo = (t) => h('button', { class: 'nav-pro', type: 'button', 'aria-label': `${t.etiqueta}: próximamente`, onclick: () => MT.plan.abrirPro(t.pro) }, icono(t.icono), t.etiqueta, MT.plan.candadoSvg(), MT.plan.etiquetaPro());
    return h('nav', { class: 'pestanas-pagina subnav', 'aria-label': 'Secciones de ' + nombre },
      tabs.map(enlace),
      pronto && pronto.length ? h('details', { class: 'nav-pronto' }, h('summary', null, 'Próximamente (' + pronto.length + ')'), h('div', { class: 'nav-pronto__lista' }, pronto.map(proximo))) : null);
  }

  /* Una pantalla de Mi espacio: la misma plantilla que las páginas (cabecera, subnavegación, contenido) y el mismo ancho. Ya no hay una
     barra lateral propia: era el rasgo que hacía que Mi espacio pareciera otra aplicación. */
  function espacio(main, { nombre, descripcion, ruta, tabs, sub, rolId }) {
    const pronto = tabs.filter((t) => t.pro);
    const normales = tabs.filter((t) => !t.pro);
    const actual = normales.find((t) => t.id === sub) || {};
    const cab = cabecera({ rolId, ruta: [{ t: nombre, href: '#/' + ruta }, { t: descripcion }, { t: actual.etiqueta || nombre }],
      volver: normales[0] && sub !== normales[0].id ? { href: '#/' + ruta, texto: 'Volver al inicio' } : null, titulo: actual.etiqueta || nombre });
    const contenido = h('div', { class: 'contenido' });
    main.append(h('div', { class: 'contenedor pantalla pantalla--espacio' }, cab.el, subnav({ nombre, tabs: normales, sub, ruta, pronto }), contenido));
    MT.comun.cabActual = cab;
    return contenido;
  }

  function pagina(main, { etiqueta, titulo, descripcion, rol, accion, volver, ruta, mascota, voz }) {
    const rolId = rol || MT.store.obtener().rol || '';
    const cab = cabecera({ rolId, mascota, voz, ruta: ruta || [{ t: MT.nombre, href: '#/' }, { t: etiqueta || titulo }],
      volver: volver === undefined ? { href: '#/', texto: 'Volver al inicio' } : volver, titulo, linea: descripcion || '', accion: accion || null });
    const c = h('div', { class: 'contenedor pantalla' }, cab.el);
    main.append(c);
    MT.comun.cabActual = cab;
    return c;
  }

  const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // El encabezado de bienvenida de cada rol ya no es una pieza aparte: pone su contenido en la cabecera única de la pantalla.
  // siguiente: { etiqueta, titulo, texto, boton: { texto, onclick } } (opcional)
  function hero({ titulo, texto, siguiente }) {
    const cab = MT.comun.cabActual; if (!cab) return;
    const rol = MT.store.obtener().rol;
    cab.poner({ titulo, linea: texto, siguiente: siguiente || null, voz: rol ? 'rol:' + rol : null });
  }

  function panelCifras(cifras) {
    return h('section', { class: 'panel-cifras', 'aria-label': 'Resumen' },
      cifras.map((c) => h('div', null, h('strong', null, c.valor), h('span', null, c.etiqueta), h('small', null, c.detalle))));
  }

  MT.comun = { espacio, pagina, hero, panelCifras, hora, cabecera, subnav, cabActual: null };
})(window.MT = window.MT || {});
