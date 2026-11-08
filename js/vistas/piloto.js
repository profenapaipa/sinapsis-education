/* piloto.js: la página para colegios, familias y aliados que quieren probar la plataforma.

   Sin servidor, "enviar" abre el correo de quien escribe con el mensaje ya redactado (mailto), así que nada
   pasa por un tercero. El correo de destino sale de js/config.js; si está vacío se muestra solo la información. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  const FASES = [
    ['1. Conversación', 'Entendemos el colegio, sus cursos y su manera de trabajar el PIAR.'],
    ['2. Piloto con datos de ejemplo', 'El equipo prueba la plataforma sin ningún dato real y decide si sirve.'],
    ['3. Requisitos de protección de datos', 'Política de tratamiento, autorización de las familias, contrato y revisión de seguridad.'],
    ['4. Piloto con un curso', 'Un solo curso, con acompañamiento y revisión semanal del equipo.'],
  ];

  function formulario(c) {
    const destino = MT.config && MT.config.contacto;
    if (!destino) {
      c.append(h('div', { class: 'tarjeta' }, h('h2', null, 'Hablemos'),
        h('p', null, 'El canal de contacto se abrirá cuando el modelo de empresa y las autorizaciones estén listos. Mientras tanto, la demostración completa está abierta.')));
      return;
    }
    const campos = [
      { id: 'org', etiqueta: 'Colegio u organización', autocompletar: 'organization', max: 100, requerido: true },
      { id: 'quien', etiqueta: 'Tu rol (rectoría, coordinación, orientación, docente, familia, aliado)', max: 80, requerido: true },
      { id: 'texto', etiqueta: 'Cuéntanos qué necesitan', tipo: 'area', filas: 4, max: 800, requerido: true },
    ].map(MT.dlg.campo);
    const error = h('p', { class: 'aviso', role: 'alert', hidden: true });
    const f = h('form', { class: 'tarjeta formulario', novalidate: true }, h('h2', null, 'Cuéntanos de tu colegio'), error, campos.map((x) => x.el),
      h('p', { class: 'suave' }, 'Al enviar se abre tu programa de correo con el mensaje ya escrito. No escribas datos de estudiantes.'),
      h('button', { class: 'btn', type: 'submit' }, 'Preparar mi mensaje'));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = {}; for (const x of campos) { v[x.def.id] = x.leer(); if (!v[x.def.id]) { error.hidden = false; error.textContent = 'Falta: ' + x.def.etiqueta + '.'; return; } }
      error.hidden = true;
      const cuerpo = `Colegio u organización: ${v.org}\nRol: ${v.quien}\n\n${v.texto}`;
      location.href = `mailto:${destino}?subject=${encodeURIComponent('Piloto de ' + MT.nombre)}&body=${encodeURIComponent(cuerpo)}`;
    });
    c.append(f);
  }

  MT.router.registrar({
    id: 'piloto', titulo: 'Piloto', espacio: '',
    render(main) {
      const c = pagina(main, { etiqueta: 'Piloto', titulo: 'Conversemos sobre tu colegio', descripcion: 'Un piloto acompañado, paso a paso, y sin datos reales hasta que todo esté en regla.' });
      c.append(h('div', { class: 'tarjeta' }, h('h2', null, 'Cómo trabajamos'),
        h('ol', { class: 'pasos-piloto' }, FASES.map(([t, d]) => h('li', null, h('strong', null, t), h('p', null, d))))), h('div', { style: 'margin-top:1rem' }));
      c.append(MT.plan.avisoConstruccion());
      formulario(c);
    },
  });
})(window.MT = window.MT || {});
