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
    const enlace = (t) => h('a', { href: t.href || `#/${ruta}/${t.id}`, 'aria-current': t.id === sub ? 'page' : null },
      icono(t.icono), t.etiqueta, t.nuevo ? h('span', { class: 'nuevo' }, t.nuevo) : null);
    const proximo = (t) => h('button', { class: 'nav-pro', type: 'button', 'aria-label': `${t.etiqueta}: próximamente`, onclick: () => MT.plan.abrirPro(t.pro) }, icono(t.icono), t.etiqueta, MT.plan.candadoSvg(), MT.plan.etiquetaPro());
    // Lo que todavía no existe («próximamente») va plegado: la barra lateral muestra primero lo que ya se puede usar, y lo que viene
    // sigue a un clic, con el mismo aviso honesto de que está en desarrollo.
    const pronto = tabs.filter((t) => t.pro);
    const nav = h('nav', { class: 'nav-lateral', 'aria-label': 'Secciones de ' + nombre },
      tabs.filter((t) => !t.pro).map(enlace),
      pronto.length ? h('details', { class: 'nav-pronto' }, h('summary', null, 'Próximamente (' + pronto.length + ')'), pronto.map(proximo)) : null);
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
    // .companero-rol: sitio previsto para la mascota del rol (pulpo, zorro o venado). Llega con MT.mascotas.mascota(id, { tamano: 56 }) y, mientras
    // esté vacío, no ocupa lugar (:empty en css/layout.css). Lleva data-rol para que quien la monte sepa de qué rol es la vista.
    const rolId = MT.store.obtener().rol || '';
    return h('section', { class: 'hero' + (siguiente ? '' : ' hero--solo') },
      h('div', { class: 'hero__texto' }, h('div', { class: 'hero__cab' }, h('span', { class: 'rol' }, rol), h('div', { class: 'companero-rol', 'data-rol': rolId })), h('p', { class: 'fecha' }, fechaHoy()), h('h1', null, titulo), h('p', null, texto)),
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
