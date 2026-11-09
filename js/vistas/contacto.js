/* contacto.js: página «Contacto». El formulario envía el mensaje por correo con FormSubmit (formsubmit.co), un servicio externo
   gratuito que no necesita servidor propio. Portado de la página de Contacto de DiverSeña (misma lógica, en JS sin React).
   Decisión del dueño (confirmada directamente, 9 nov 2026): el correo es profenapaipa@gmail.com, se muestra como alternativa y el
   mensaje pasa por FormSubmit. La CSP lo permite solo en connect-src (el envío es por fetch, así que form-action sigue en 'none').
   Sin cookies ni rastreadores. Todo el texto está en TEXTOS (BORRADOR POR APROBAR). */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  const CORREO = 'profenapaipa@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + CORREO;
  const LIMITES = { nombre: 80, contacto: 120, mensaje: 1200 };
  const ESPERA_MS = 30000;                       // entre envíos desde este navegador: frena el abuso sin pedir cuentas
  const CLAVE = 'sinapsis.contacto.ultimo';      // clave propia de localStorage (solo guarda la hora del último envío)
  const MOTIVOS = [
    { id: 'participar', etiqueta: 'Quiero participar' },
    { id: 'informacion', etiqueta: 'Quiero más información' },
    { id: 'pqr', etiqueta: 'Petición, queja o reclamo' },
    { id: 'felicitacion', etiqueta: 'Felicitación' },
    { id: 'otro', etiqueta: 'Otro tema' },
  ];

  const TEXTOS = {
    etiqueta: 'Contacto', titulo: 'Contacto',
    bajada: 'Escríbenos para participar, pedir información o dejarnos una petición, queja, reclamo o felicitación. Te respondemos por correo.',
    motivo: 'Sobre qué nos escribes', nombre: 'Tu nombre', contacto: 'Correo o teléfono para responderte', mensaje: 'Tu mensaje',
    ayudaMensaje: 'Cuéntanos con tus palabras. No escribas datos de estudiantes ni de menores.',
    acepto: 'Acepto que mi mensaje pase por FormSubmit, un servicio externo, para llegar al correo del semillero. Se usa solo para responderme.',
    privacidad: 'Qué se guarda y para qué: lo que escribes aquí llega al correo del semillero para poder responderte. Este sitio no usa cookies ni rastreadores y solo recuerda en tu navegador la hora del último envío. Tratamiento de datos según la Ley 1581 de 2012 (texto por confirmar).',
    enviar: 'Enviar mensaje', enviando: 'Enviando…',
    alternativa: 'Si prefieres, escríbenos directamente a ',
    ok: 'Mensaje enviado. Gracias por escribirnos: te respondemos por correo.',
    errores: {
      nombre: 'Escribe tu nombre.', contacto: 'Escribe un correo o un teléfono para poder responderte.', mensaje: 'Cuéntanos un poco más en el mensaje.',
      largo: 'El mensaje puede tener hasta ' + LIMITES.mensaje + ' caracteres.', acepto: 'Marca la casilla para poder enviar.',
      espera: (s) => 'Espera ' + s + ' segundos antes de enviar otro mensaje.',
      red: 'No pudimos enviar el mensaje. Revisa tu conexión o escríbenos al correo.',
      rechazado: 'El servicio no aceptó el mensaje. Inténtalo más tarde o escríbenos al correo.',
      activacion: 'El envío por formulario todavía se está activando. Escríbenos directamente al correo mientras tanto.',
    },
  };

  const parece = (v) => { const t = String(v || '').trim(); return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) || t.replace(/[^\d]/g, '').length >= 7; };
  function validar(m) {
    const E = TEXTOS.errores;
    if (String(m.nombre || '').trim().length < 2) return E.nombre;
    if (!parece(m.contacto)) return E.contacto;
    if (String(m.mensaje || '').trim().length < 10) return E.mensaje;
    if (String(m.mensaje).length > LIMITES.mensaje) return E.largo;
    return null;
  }

  /* Envía el mensaje. Devuelve { ok } o { ok:false, motivo } sin lanzar: la pantalla decide qué decir. `fetchImpl` permite probarlo sin red.
     Ojo (defecto del original, corregido): si FormSubmit responde «needs Activation», NO es un fallo del envío sino un paso pendiente de quien
     administra el sitio; se detecta ANTES de decidir si falló y se dice aparte. */
  async function enviar(m, fetchImpl) {
    if (m.trampa) return { ok: true };           // un robot cree que funcionó y no llega nada
    if (validar(m)) return { ok: false, motivo: 'invalido' };
    const motivo = (MOTIVOS.find((x) => x.id === m.motivo) || { etiqueta: 'Otro tema' }).etiqueta;
    const cuerpo = {
      _subject: 'Sinapsis Education: ' + motivo, _template: 'table', _captcha: 'false',
      Motivo: motivo, Nombre: m.nombre.trim().slice(0, LIMITES.nombre), 'Correo o teléfono': m.contacto.trim().slice(0, LIMITES.contacto), Mensaje: m.mensaje.trim(),
      ...(m.contacto.includes('@') ? { _replyto: m.contacto.trim() } : {}),
    };
    try {
      const r = await (fetchImpl || window.fetch.bind(window))(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(cuerpo) });
      const d = await r.json().catch(() => ({}));
      if (/activat/i.test(d.message || '')) return { ok: false, motivo: 'activacion' };
      if (!r.ok || !(d.success === true || d.success === 'true')) return { ok: false, motivo: 'rechazado' };
      return { ok: true };
    } catch (e) { return { ok: false, motivo: 'red' }; }
  }

  const ultimo = () => { try { return Number(localStorage.getItem(CLAVE)) || 0; } catch (e) { return 0; } };
  const marcar = () => { try { localStorage.setItem(CLAVE, String(Date.now())); } catch (e) { /* sin almacenamiento: no se limita */ } };

  function render(main) {
    const c = pagina(main, { etiqueta: TEXTOS.etiqueta, titulo: TEXTOS.titulo, descripcion: TEXTOS.bajada });
    c.classList.add('contacto');
    const estado = h('p', { class: 'contacto__estado', role: 'status', 'aria-live': 'polite' });
    const etiq = (id, texto) => h('label', { for: 'ct-' + id }, texto);
    const motivo = h('select', { id: 'ct-motivo', name: 'motivo' }, MOTIVOS.map((x) => h('option', { value: x.id }, x.etiqueta)));
    const nombre = h('input', { id: 'ct-nombre', name: 'nombre', type: 'text', maxlength: String(LIMITES.nombre), autocomplete: 'name', 'aria-describedby': 'ct-error' });
    const contacto = h('input', { id: 'ct-contacto', name: 'contacto', type: 'text', maxlength: String(LIMITES.contacto), autocomplete: 'email', 'aria-describedby': 'ct-error' });
    const mensaje = h('textarea', { id: 'ct-mensaje', name: 'mensaje', rows: '5', maxlength: String(LIMITES.mensaje), 'aria-describedby': 'ct-error' });
    const trampa = h('input', { type: 'text', name: 'sitio_web', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    const acepto = h('input', { type: 'checkbox', id: 'ct-acepto', name: 'acepto' });
    const boton = h('button', { class: 'btn', type: 'submit' }, TEXTOS.enviar);
    const error = h('p', { class: 'aviso', id: 'ct-error', role: 'alert', hidden: true });
    const f = h('form', { class: 'tarjeta contacto__form', novalidate: true },
      h('div', { class: 'contacto__campo' }, etiq('motivo', TEXTOS.motivo), motivo),
      h('div', { class: 'contacto__campo' }, etiq('nombre', TEXTOS.nombre), nombre),
      h('div', { class: 'contacto__campo' }, etiq('contacto', TEXTOS.contacto), contacto),
      h('div', { class: 'contacto__campo' }, etiq('mensaje', TEXTOS.mensaje), mensaje, h('small', { class: 'suave' }, TEXTOS.ayudaMensaje)),
      h('div', { class: 'contacto__trampa', 'aria-hidden': 'true' }, trampa),
      h('label', { class: 'contacto__acepto', for: 'ct-acepto' }, acepto, h('span', null, TEXTOS.acepto)),
      error, boton);
    const mostrar = (t) => { error.hidden = !t; error.textContent = t || ''; };
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); estado.textContent = '';
      const m = { motivo: motivo.value, nombre: nombre.value, contacto: contacto.value, mensaje: mensaje.value, trampa: trampa.value };
      const falta = validar(m); if (falta && !m.trampa) { mostrar(falta); return; }
      if (!acepto.checked && !m.trampa) { mostrar(TEXTOS.errores.acepto); return; }
      const resto = Math.ceil((ESPERA_MS - (Date.now() - ultimo())) / 1000);
      if (resto > 0 && !m.trampa) { mostrar(TEXTOS.errores.espera(resto)); return; }
      mostrar(''); boton.disabled = true; boton.textContent = TEXTOS.enviando;
      const r = await enviar(m);
      boton.disabled = false; boton.textContent = TEXTOS.enviar;
      if (r.ok) { marcar(); f.reset(); estado.textContent = TEXTOS.ok; return; }
      mostrar(TEXTOS.errores[r.motivo === 'red' ? 'red' : r.motivo === 'activacion' ? 'activacion' : 'rechazado']);
    });
    c.append(f, estado,
      h('p', { class: 'contacto__alt' }, TEXTOS.alternativa, h('a', { href: 'mailto:' + CORREO }, CORREO), '.'),
      h('p', { class: 'suave contacto__privacidad' }, TEXTOS.privacidad));
  }

  MT.router.registrar({ id: 'contacto', titulo: 'Contacto', espacio: '', render });
  MT.contacto = { TEXTOS, MOTIVOS, CORREO, ENDPOINT, LIMITES, ESPERA_MS, CLAVE, validar, enviar };
})(window.MT = window.MT || {});
