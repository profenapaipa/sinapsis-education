/* plan.js: qué incluye cada plan, qué está bloqueado en la demo y el registro de cuentas.

   Regla de honestidad: en la demostración está abierto TODO lo que ya funciona. Lo que aparece como "próximamente" es lo que
   todavía no está construido o depende del servidor, y dice "En desarrollo". Nada de eso esconde algo que ya existe.

   Registro: sin servidor activo, la cuenta se reserva en este dispositivo (y se puede enviar por correo si hay contacto
   configurado). Con `MT.config.api`, el registro viaja al servidor privado. Solo se pide un correo: sin nombres. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const st = MT.store;

  /* Funciones Pro: lo que se ve bloqueado en la demo. */
  const PRO = {
    piar: { titulo: 'Exportar el PIAR en el formato oficial', que: 'Genera el documento del Plan Individual de Ajustes Razonables con los datos del perfil y los ajustes aprobados, listo para imprimir o firmar.', desde: 'Llegará con el espacio compartido' },
    valeria: { titulo: 'Niky con un modelo de lenguaje real', que: 'Respuestas generadas por un modelo, ajustadas a tu actividad y a tu grado, sin que la IA reciba nunca información clínica.', desde: 'Llegará con el espacio compartido' },
    nube: { titulo: 'Trabajo compartido en la nube', que: 'Lo que creas se guarda en un servidor y lo ven tu equipo y las familias desde cualquier dispositivo, sin perder nada al cambiar de equipo.', desde: 'Llegará con el espacio compartido' },
    cuentas: { titulo: 'Cuentas por rol con inicio de sesión único', que: 'Cada persona entra con su cuenta, ve solo lo suyo y la misma sesión sirve en Kinesis, Niky y Wisfox.', desde: 'Llegará con el espacio compartido' },
    reportes: { titulo: 'Reportes del colegio', que: 'Cuántos ajustes hay en cada estado, cuánto tarda un ajuste en llegar al aula y cómo usa la plataforma cada curso, sin ver datos de estudiantes.', desde: 'Llegará con el espacio compartido' },
    auditoria: { titulo: 'Historial de quién hizo qué', que: 'Un registro de las acciones importantes (aprobaciones, cambios de perfil, archivos) para rendir cuentas ante el colegio.', desde: 'Llegará con el espacio compartido' },
    avisos: { titulo: 'Avisos por correo a las familias', que: 'Cuando orientación aprueba un ajuste, la familia recibe un mensaje sencillo con lo que cambió y por qué.', desde: 'Llegará con el espacio compartido' },
    materias: { titulo: 'Más materias en la ruta del estudiante', que: 'Rutas de aprendizaje para otras materias, escritas con el equipo pedagógico del colegio a partir de su malla.', desde: 'Llegará con el acompañamiento a cada colegio' },
  };

  const PRO_NAV = {
    docente: [{ pro: 'piar', etiqueta: 'Exportar PIAR', icono: 'libro' }, { pro: 'nube', etiqueta: 'Compartir con el equipo', icono: 'mapa' }],
    orientacion: [{ pro: 'piar', etiqueta: 'Exportar PIAR', icono: 'libro' }, { pro: 'auditoria', etiqueta: 'Historial', icono: 'estado' }],
    familia: [{ pro: 'avisos', etiqueta: 'Avisos al correo', icono: 'chat' }],
    coordinacion: [{ pro: 'reportes', etiqueta: 'Reportes', icono: 'estado' }, { pro: 'cuentas', etiqueta: 'Cuentas y usuarios', icono: 'coordinacion' }, { pro: 'auditoria', etiqueta: 'Historial', icono: 'recorrido' }],
    estudiante: [{ pro: 'materias', etiqueta: 'Más materias', icono: 'libro' }],
  };

  // Una brotecito: lo que todavía está creciendo. (Antes era un candado: sugería algo cerrado, y no es eso.)
  const candadoSvg = () => MT.ui.svg('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9"/><path d="M12 12c0-4 3-6.5 7.5-6.5 0 4-3 6.5-7.5 6.5z"/><path d="M12 15c0-3-2-5-6-5 0 3 2 5 6 5z"/></svg>');
  const etiquetaPro = () => h('span', { class: 'pro-etiqueta' }, 'Próximamente');

  function abrirPro(clave) {
    const f = PRO[clave];
    MT.dlg.abrir({ titulo: f.titulo, cuerpo: h('div', null,
      h('p', null, f.que),
      h('p', null, h('span', { class: 'sello sello--e' }, 'En desarrollo'), ' ', h('span', { class: 'suave' }, f.desde + '.')),
      h('p', { class: 'suave' }, 'Lo que ves abierto en la demostración ya funciona. Esto llega con el servidor: deja tu correo y te avisamos cuando esté listo.')),
    acciones: [{ texto: 'Quiero que me avisen', onclick: (c) => { c(); location.hash = '#/registro/lista'; } }, { texto: 'Ver las formas de participar', suave: true, onclick: (c) => { c(); location.hash = '#/planes'; } }] });
  }

  // Un botón con candado: se ve, se entiende qué es y abre la explicación en vez de hacer algo.
  const candado = (clave, texto) => h('button', { class: 'btn btn--chico btn--suave pro-candado', type: 'button', 'aria-label': `${texto || PRO[clave].titulo}: próximamente`, onclick: () => abrirPro(clave) }, candadoSvg(), texto || PRO[clave].titulo, etiquetaPro());

  /* ---------------- Cuenta y registro ---------------- */
  const cuenta = () => st.obtener().cuenta || null;
  const valido = (c) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(c) && c.length <= 254;

  async function registrar(d) {
    const datos = { correo: String(d.correo || '').trim().toLowerCase(), rol: d.rol, institucion: String(d.institucion || '').trim().slice(0, 100), plan: d.plan === 'prueba' ? 'prueba' : 'gratis', mensaje: String(d.mensaje || '').trim().slice(0, 500), consentimiento: true };
    if (!valido(datos.correo)) throw new Error('Escribe un correo válido, por ejemplo nombre@colegio.edu.co.');
    if (!d.consentimiento) throw new Error('Para registrarte debes aceptar el tratamiento de tu correo.');
    let via = 'local';
    const api = MT.config.api;
    if (api) {
      let r;
      try { r = await fetch(api.replace(/\/$/, '') + '/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: AbortSignal.timeout(10000) }); }
      catch (e) { throw new Error('No pudimos comunicarnos con el servidor. Inténtalo de nuevo en un momento.'); }
      if (!r.ok) { const m = await r.json().catch(() => ({})); throw new Error(m.detail || 'No pudimos registrarte. Revisa los datos.'); }
      via = 'servidor';
    }
    st.cambiar((s) => { s.cuenta = { correo: datos.correo, rol: datos.rol, institucion: datos.institucion, plan: datos.plan, fecha: new Date().toISOString(), via }; if (datos.rol && MT.roles.por(datos.rol)) s.rol = datos.rol; });
    return { via, datos };
  }

  /* Mientras el modelo de empresa y las autorizaciones (familias, colegios y demás entidades) se coordinan, las páginas que
     hablan de planes, registro y pilotos lo dicen con claridad: no se promete ni se cobra nada que todavía no esté respaldado. */
  const avisoConstruccion = () => h('p', { class: 'aviso aviso--construccion', role: 'note' },
    h('strong', null, 'Un proyecto que crece en comunidad. '),
    'Es un proyecto del Semillero Maker de Tecnología con Sentido que crece con el acompañamiento de las comunidades educativas; cada paso se construye con su autorización y su voz.');

  const etiquetaPlan = () => { const c = cuenta(); return c ? (c.plan === 'prueba' ? 'Conversación solicitada' : 'En lista de interés') : 'Participa'; };

  MT.plan = { avisoConstruccion, PRO, PRO_NAV, abrirPro, candado, etiquetaPro, candadoSvg, cuenta, registrar, valido, etiquetaPlan };
})(window.MT = window.MT || {});
