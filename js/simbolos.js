/* simbolos.js: el sistema de símbolos de Mosaico Telar (la pieza y el hilo) y el diagrama del flujo entre los tres portales.

   Qué hay aquí:
   - flujo(): el diagrama. Wisfox se centra en el estudiante (material didáctico interactivo que parte de las mallas curriculares de
     la institución); Kinesis, en el docente, que media la personalización del aprendizaje; Niky es un agente que interactúa con
     todo el ecosistema y entrega la información a las personas, que la procesan y deciden. La IA es una herramienta de agentividad:
     ninguna flecha termina en ella. Su hilo azul cruza por encima de un hilo y por debajo de otro, como los hilos del logo.
   - separador(), vacio(portal) y pieza(portal): los motivos para separar secciones, para estados vacíos y para tarjetas de portal.
     Cada portal conserva su tesela (cuadrado Kinesis, hexágono Wisfox, círculo Niky) y su hilo.

   Los textos del diagrama viven aparte, en TEXTOS_FLUJO, para poder cambiarlos sin tocar el dibujo. Los que dicen "[borrador]"
   esperan la redacción aprobada. Lo que existe hoy va en trazo continuo y lo que es dirección del proyecto, punteado; además cada
   caso lleva una leyenda escrita, para que nunca dependa solo del estilo del trazo ni del color.
   Sin animación: el diagrama es quieto, para no sumar carga sensorial. */
(function (MT) {
  'use strict';
  const { svg, marca } = MT.ui;

  const TEXTOS_FLUJO = {
    malla: ['[borrador] Malla curricular', 'de la institución'],
    wisfox: ['[borrador] Estudiante', 'Material interactivo'],
    kinesis: ['[borrador] Docente', 'Media la personalización'],
    valeria: ['[borrador] Niky: agente', 'Herramienta de agentividad', 'Propone; la persona decide'],
    personas: ['[borrador] Personas', 'procesan y deciden'],
    leyendaHoy: '[borrador] Existe hoy',
    leyendaCamino: '[borrador] En desarrollo',
    alt: '[borrador] Diagrama del flujo entre los tres portales. La malla curricular de la institución alimenta a Wisfox, centrado en el estudiante. Kinesis se centra en el docente, que media la personalización del aprendizaje. El hilo de Niky cruza el tejido y lleva la información a las personas, que la procesan y deciden.',
    // La lista equivalente para lectores de pantalla: el mismo recorrido, paso a paso.
    lista: [
      '[borrador] La malla curricular de la institución es el punto de partida y alimenta a Wisfox. Existe hoy, con una malla cargada.',
      '[borrador] Wisfox se centra en el estudiante: material didáctico interactivo. Existe hoy como demostración.',
      '[borrador] Kinesis se centra en el docente, que media toda la personalización del aprendizaje. Existe hoy como demostración.',
      '[borrador] Niky es el agente que interactúa con la plataforma, las personas y la información. Hoy responde con ejemplos.',
      '[borrador] La información llega a las personas, que la procesan y deciden. En desarrollo: el servidor aún no está conectado.',
    ],
  };

  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // Un texto de varias líneas, centrado (o con otro anclaje) en x; cada línea baja 15 unidades.
  const lineas = (arr, x, y, clase, ancla) => `<text class="${clase || ''}" text-anchor="${ancla || 'middle'}" x="${x}" y="${y}">${arr.map((l, i) => `<tspan x="${x}" dy="${i ? 15 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  // La tesela de un portal (la misma de la marca), colocada en un dibujo más grande y con el color de su hilo.
  const tesela = (id, cx, cy, lado) => `<g style="color:var(--hilo-${id});--logo-fondo:var(--flujo-fondo,var(--papel))">${marca(id).outerHTML.replace('<svg ', `<svg x="${cx - lado / 2}" y="${cy - lado / 2}" width="${lado}" height="${lado}" `)}</g>`;

  /* El diagrama. opciones: { textos: TEXTOS_FLUJO (para reemplazar), clase: '' }. Devuelve un <figure> con el dibujo y la lista equivalente. */
  function flujo(op) {
    const o = Object.assign({ textos: TEXTOS_FLUJO, clase: '' }, op);
    const T = Object.assign({}, TEXTOS_FLUJO, o.textos);
    const funda = (d) => `<path class="flujo__funda" d="${d}"/>`;   // un halo del color del fondo: así un hilo pasa "por encima" de otro
    const dibujo = `<svg viewBox="0 0 360 492" role="img" aria-labelledby="flujo-t" focusable="false">
      <title id="flujo-t">${esc(T.alt)}</title>
      <!-- Lo que llega a las personas y de dónde parte todo -->
      <rect class="flujo__caja" x="4" y="14" width="168" height="62" rx="12"/>${lineas(T.malla, 88, 40, 'flujo__texto')}
      <rect class="flujo__caja" x="188" y="14" width="168" height="62" rx="12"/>${lineas(T.personas, 272, 40, 'flujo__texto')}
      <!-- La malla alimenta a Wisfox -->
      <path class="flujo__guia" d="M88 78V138"/><path class="flujo__punta" d="M80 138h16l-8 12z"/>
      ${tesela('wisfox', 89, 190, 68)}${lineas(T.wisfox, 89, 242, 'flujo__texto')}
      ${tesela('kinesis', 271, 190, 68)}${lineas(T.kinesis, 271, 242, 'flujo__texto')}
      <!-- Wisfox y Kinesis se tejen entre sí: dos hilos, el del estudiante y el del docente -->
      <path class="flujo__hilo flujo__hilo--wisfox" d="M126 184H236"/>
      <!-- El hilo de Niky pasa por encima del hilo ámbar y por debajo del verde, como en el logo -->
      ${funda('M180 300V176')}<path class="flujo__hilo flujo__hilo--valeria" d="M180 300V176"/>
      ${funda('M126 198H236')}<path class="flujo__hilo flujo__hilo--kinesis" d="M126 198H236"/>
      <!-- La información sube hacia las personas, en trazo punteado: es la dirección del proyecto -->
      <path class="flujo__hilo flujo__hilo--valeria flujo__hilo--camino" d="M180 176V130C180 104 272 124 272 102"/><path class="flujo__punta flujo__punta--valeria" d="M264 102h16l-8-14z"/>
      ${tesela('valeria', 180, 334, 68)}${lineas(T.valeria, 180, 388, 'flujo__texto')}
      <!-- Leyenda: el trazo nunca es lo único que dice si algo existe -->
      <path class="flujo__hilo flujo__hilo--leyenda" d="M24 436H84"/>${lineas([T.leyendaHoy], 96, 441, 'flujo__texto flujo__texto--leyenda', 'start')}
      <path class="flujo__hilo flujo__hilo--leyenda flujo__hilo--camino" d="M24 464H84"/>${lineas([T.leyendaCamino], 96, 469, 'flujo__texto flujo__texto--leyenda', 'start')}
    </svg>`;
    const fig = document.createElement('figure');
    // El nombre de la clase raíz no puede ser "flujo": ol.flujo ya la usa la página Roles y datos.
    fig.className = ('flujo-portales ' + o.clase).trim();
    const dibujoEl = svg(dibujo);
    const lista = document.createElement('ol'); lista.className = 'solo-lectores';
    T.lista.forEach((t) => { const li = document.createElement('li'); li.textContent = t; lista.append(li); });
    // El dibujo ya trae su descripción en el título; la lista da el recorrido paso a paso, sin repetir lo que dice el dibujo.
    fig.append(dibujoEl, lista);
    return fig;
  }

  // Cuatro hilos que se cruzan, en pequeño: para separar secciones sin recargar la pantalla.
  function separador() {
    return svg(`<svg class="separador-hilos" viewBox="0 0 120 12" aria-hidden="true" focusable="false">
      <path d="M2 3H44M52 3H118" stroke="var(--hilo-kinesis)"/><path d="M2 6H20M28 6H92M100 6H118" stroke="var(--hilo-valeria)"/>
      <path d="M2 9H60M68 9H118" stroke="var(--hilo-wisfox)"/><path d="M36 3H44M76 6H84M20 9H28" stroke="var(--hilo-mosaico)"/></svg>`);
  }

  // La forma de la tesela de cada portal, en un cuadro de 64: cuadrado, hexágono o círculo.
  const FORMA = {
    kinesis: '<rect x="8" y="8" width="48" height="48" rx="12"/>',
    wisfox: '<path d="M32 6l22 13v26L32 58 10 45V19z"/>',
    valeria: '<circle cx="32" cy="32" r="26"/>',
  };
  // La pieza de un portal: su tesela con una lengüeta que se ofrece a la vecina (la que encaja). Sirve en tarjetas de portal.
  function pieza(id, clase) {
    return svg(`<svg class="pieza-portal ${clase || ''}" viewBox="0 0 76 64" aria-hidden="true" focusable="false" style="color:var(--hilo-${id})"><g fill="currentColor">${FORMA[id]}<path d="M52 28h12v8H52z"/><circle cx="67" cy="32" r="7"/></g></svg>`);
  }
  // Estado vacío: la tesela del portal en trazo punteado y un hilo que espera su pieza (no hay nada cargado, y se dice con el texto de al lado).
  function vacio(id, clase) {
    return svg(`<svg class="vacio-portal ${clase || ''}" viewBox="0 0 120 96" aria-hidden="true" focusable="false" style="color:var(--hilo-${id})">
      <g transform="translate(18 8)" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round" stroke-linejoin="round">${FORMA[id]}</g>
      <path d="M76 44C92 44 96 62 84 70S64 84 78 90" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="90" r="4" fill="currentColor"/></svg>`);
  }

  MT.simbolos = { flujo, separador, pieza, vacio, TEXTOS_FLUJO };
})(window.MT = window.MT || {});
