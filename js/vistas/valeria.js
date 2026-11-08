/* valeria.js: el espacio de la IA, aparte de los otros dos y con su propio lugar fijo.

   Hoy responde con textos de ejemplo y lo dice en pantalla. Cuando haya un servidor con un modelo,
   este mismo chat (y el panel que se abre desde cualquier espacio) se llenarán con respuestas
   reales sin tocar nada más: ver js/ia-config.js.

   Dos secciones: "Conversar" (el chat) y "Conexión" (en qué estado está y cómo se conecta), para
   que quien entre sepa siempre si lo que lee es real o un ejemplo. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { espacio } = MT.comun;

  const TABS = [
    { id: 'chat', etiqueta: 'Conversar', icono: 'chat' },
    { id: 'conexion', etiqueta: 'Conexión', icono: 'estado' },
  ];

  function chat(c) {
    const caja = h('div', { class: 'tarjeta tarjeta--chat' });
    c.append(h('header', { class: 'saludo' }, h('div', null, h('h1', null, 'Conversa con Niky'),
      h('p', null, 'La guía de la plataforma: ayuda al docente a diseñar y al estudiante a resolver sus dudas. Propone; decide quien enseña.'))),
      caja,
      h('p', { class: 'suave' }, 'También puedes abrirla desde cualquier espacio con el botón “Niky” del menú, y la conversación es la misma.'));
    const ch = MT.ia.montarChat(caja, MT.ia.panel.sugerenciasPara());
    MT.router.alSalir(() => ch.destruir());
  }

  function conexion(c) {
    const estado = h('div', { class: 'tarjeta tarjeta--borde' });
    const pintar = () => estado.replaceChildren(h('p', { class: 'etiqueta' }, 'Estado de la conexión'), MT.ia.chipModo(),
      h('p', { style: 'margin-top:.6rem' }, MT.ia.info.modo === 'servidor'
        ? 'Con conexión a un servidor con un modelo de lenguaje.'
        : 'Hoy responde con textos de ejemplo. Todavía no tiene conexión con un modelo de lenguaje.'));
    pintar();
    window.addEventListener('mt-ia-modo', pintar, { once: true });
    c.append(h('header', { class: 'saludo' }, h('div', null, h('h1', null, 'Conexión de Niky'), h('p', null, 'Qué responde hoy y qué cambia cuando se conecte un modelo.'))),
      h('div', { class: 'rejilla rejilla--2' }, estado,
        h('div', { class: 'tarjeta' }, h('p', { class: 'etiqueta' }, 'Dónde se muestra'),
          h('p', null, 'En su propio espacio y en un panel que se abre desde cualquier pantalla, para el docente y para el estudiante. Comparten la misma conversación.'))),
      h('details', { class: 'plegable', style: 'margin-top:1rem' }, h('summary', null, 'Cómo se protege'),   // plegado: en el chat basta el sello de ejemplo
        h('ul', null,
          h('li', null, 'Niky propone y no decide: lo que responde se muestra como texto y nunca se ejecuta.'),
          h('li', null, 'No recibe información clínica ni el perfil de ningún estudiante.'),
          h('li', null, 'La clave del modelo vive solo en el servidor, nunca en esta página.'))));
  }

  MT.router.registrar({
    id: 'valeria', titulo: 'IA Niky', espacio: 'valeria', subs: TABS,
    render(main, { sub }) {
      const c = espacio(main, { marca: 'valeria', nombre: 'Niky', descripcion: 'La guía de la plataforma', ruta: 'valeria', tabs: TABS, sub,
        usuario: { iniciales: 'NI', nombre: 'Niky', rol: MT.ia.info.modo === 'servidor' ? 'En vivo' : 'Modo de ejemplo' } });
      ({ chat, conexion })[sub](c);
    },
  });
})(window.MT = window.MT || {});
