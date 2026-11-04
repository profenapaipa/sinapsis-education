/* comun.js: lo que repiten los espacios y las páginas, para que se comporten igual aunque
   se vean distintos.

   espacio():  la barra lateral propia de cada hilo + su zona de contenido (como ya la tenían).
   pagina():   la cabecera simple de las páginas del colectivo (recorrido, estado, identidad).
   hero() y panelCifras(): el encabezado de bienvenida con degradado y el panel de cifras montado
               encima, que es lo más reconocible de Kinesis. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;

  function espacio(main, { marca: nombreMarca, nombre, descripcion, ruta, tabs, sub, usuario }) {
    const nav = h('nav', { class: 'nav-lateral', 'aria-label': 'Secciones de ' + nombre },
      tabs.map((t) => (t.pro
        ? h('button', { class: 'nav-pro', type: 'button', 'aria-label': `${t.etiqueta}: próximamente`, onclick: () => MT.plan.abrirPro(t.pro) }, icono(t.icono), t.etiqueta, MT.plan.candadoSvg(), MT.plan.etiquetaPro())
        : h('a', { href: t.href || `#/${ruta}/${t.id}`, 'aria-current': t.id === sub ? 'page' : null },
          icono(t.icono), t.etiqueta, t.nuevo ? h('span', { class: 'nuevo' }, t.nuevo) : null))));
    const lateral = h('aside', { class: 'lateral', 'aria-label': nombre }, h('div', { class: 'lateral-panel' },
      h('a', { class: 'lockup', href: '#/' + ruta, 'aria-label': nombre + ', inicio' }, marca(nombreMarca),
        h('span', null, h('b', null, nombre), h('small', null, descripcion))),
      nav,
      usuario ? h('div', { class: 'usuario' }, h('span', { class: 'avatar', 'aria-hidden': 'true' }, usuario.iniciales),
        h('span', null, h('b', null, usuario.nombre), h('small', null, usuario.rol))) : null));
    const contenido = h('div', { class: 'contenido' });
    main.append(h('div', { class: 'espacio' }, lateral, contenido));
    return contenido;
  }

  function pagina(main, { etiqueta, titulo, descripcion }) {
    const c = h('div', { class: 'contenedor' }, h('header', { class: 'pagina-cab' },
      etiqueta ? h('p', { class: 'etiqueta' }, etiqueta) : null, h('h1', null, titulo), descripcion ? h('p', null, descripcion) : null));
    main.append(c);
    return c;
  }

  const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const fechaHoy = () => new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();

  // siguiente: { etiqueta, titulo, texto, boton: { texto, onclick } } (opcional)
  function hero({ rol, titulo, texto, siguiente }) {
    return h('section', { class: 'hero' + (siguiente ? '' : ' hero--solo') },
      h('div', null, h('span', { class: 'rol' }, rol), h('p', { class: 'fecha' }, fechaHoy()), h('h1', null, titulo), h('p', null, texto)),
      siguiente ? h('div', { class: 'paso-siguiente' },
        h('p', { class: 'etiqueta' }, siguiente.etiqueta || 'Siguiente paso'), h('h2', null, siguiente.titulo), h('p', null, siguiente.texto),
        siguiente.boton ? h('button', { class: 'btn btn--chico', type: 'button', onclick: siguiente.boton.onclick }, siguiente.boton.texto) : null) : null);
  }

  function panelCifras(cifras) {
    return h('section', { class: 'panel-cifras', 'aria-label': 'Resumen' },
      cifras.map((c) => h('div', null, h('strong', null, c.valor), h('span', null, c.etiqueta), h('small', null, c.detalle))));
  }

  MT.comun = { espacio, pagina, hero, panelCifras, hora };
})(window.MT = window.MT || {});
