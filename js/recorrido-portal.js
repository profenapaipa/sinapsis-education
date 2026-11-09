/* recorrido-portal.js: el tutorial guiado ocurre DENTRO de Kinesis y Wisfox, no fuera (decisión del dueño, 9 nov 2026).
   La plataforma ya no recorre sus propias pantallas: abre el portal del rol (Kinesis para docente, orientación, familia y coordinación;
   Wisfox para estudiante) y le pide que inicie SU recorrido guiado, que acompaña al rol por las secciones reales de cada app.

   Contrato con los portales (acordado con el equipo de Kinesis y Wisfox):
     plataforma → portal (iframe): { tipo: 'recorrido:iniciar', rol }   con destino https://profenapaipa.github.io
     portal → plataforma:          { tipo: 'recorrido:iniciado', portal, rol }
   El portal puede estar cargando: se reintenta cada 500 ms hasta 10 s. Si no confirma (todavía no tiene la entrada), se muestra una nota
   honesta para tocar «Recorrido guiado» dentro del portal. Nada de esto depende de que el portal responda para que la persona llegue a él.

   Todas las entradas pasan por aquí: tarjetas de la portada, «¿Quién eres?», el botón principal, «Tutorial guiado» de la franja,
   #/tutorial y #/tutorial/<rol>, ?caso=N y #/caso/N (los QR impresos) y el mensaje recorrido:abrir que envían los portales. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const ORIGEN = 'https://profenapaipa.github.io';
  const ROLES = ['docente', 'orientacion', 'familia', 'coordinacion', 'estudiante'];
  const portalDe = (rol) => (rol === 'estudiante' ? 'wisfox' : 'kinesis');
  const TEXTOS = {   // BORRADOR POR APROBAR
    elegirTitulo: '¿Con qué rol quieres recorrer?',
    elegirBajada: 'El recorrido guiado te acompaña dentro de Kinesis o Wisfox, por sus pantallas reales.',
    kinesis: 'En Kinesis, el colegio', wisfox: 'En Wisfox, el estudiante', cerrar: 'Cerrar',
    nota: (nombre) => 'Toca «Recorrido guiado» dentro de ' + nombre + ' para empezar.',
  };

  let pendiente = null;     // { rol, portal, t0, timer }
  let ultimo = null;        // { rol, portal, iniciado } para pruebas y para no repetir

  function marcoDe(portal) {
    const url = MT.config && MT.config.portales && MT.config.portales[portal];
    return url ? [...document.querySelectorAll('.vivos iframe')].find((f) => (f.getAttribute('src') || '').indexOf(url) === 0) : null;
  }
  function detener() { if (pendiente) clearInterval(pendiente.timer); pendiente = null; }
  function enviar() {
    if (!pendiente) return;
    const m = marcoDe(pendiente.portal);
    if (m && m.contentWindow) { try { m.contentWindow.postMessage({ tipo: 'recorrido:iniciar', rol: pendiente.rol }, ORIGEN); } catch (e) { /* aún sin documento */ } }
    if (Date.now() - pendiente.t0 > 10000) { mostrarNota(pendiente.portal); detener(); }
  }

  /* Abre el portal del rol y le pide su recorrido guiado. */
  function abrir(rol) {
    const r = ROLES.includes(rol) ? rol : 'docente';
    const portal = portalDe(r);
    cerrarElegir(); quitarNota(); detener();
    try { MT.store.cambiar((s) => { s.rol = r; }); } catch (e) { /* sin almacén: se sigue igual */ }
    ultimo = { rol: r, portal, iniciado: false };
    pendiente = { rol: r, portal, t0: Date.now(), timer: setInterval(enviar, 500) };
    if (location.hash !== '#/portales/' + portal) location.hash = '#/portales/' + portal;
    setTimeout(enviar, 60);
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGEN) return;
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.tipo === 'recorrido:iniciado' && ultimo && d.portal === ultimo.portal) { ultimo.iniciado = true; detener(); quitarNota(); }
  });

  /* Nota de respaldo, mientras el portal no tenga la entrada del recorrido. */
  let nota = null; let notaT = null;
  function mostrarNota(portal) {
    quitarNota();
    const nombre = portal === 'wisfox' ? 'Wisfox' : 'Kinesis';
    nota = h('div', { class: 'rp-nota', role: 'status', 'data-espacio': portal },
      h('p', null, TEXTOS.nota(nombre)), h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': TEXTOS.cerrar, onclick: quitarNota }, '×'));
    document.body.append(nota);
    notaT = setTimeout(quitarNota, 14000);
  }
  function quitarNota() { clearTimeout(notaT); if (nota) nota.remove(); nota = null; }

  /* Elegir rol cuando la entrada no trae uno (botón principal, franja, #/tutorial). Diálogo accesible: foco al primer rol, Escape cierra. */
  let dlg = null; let antes = null;
  function elegir() {
    cerrarElegir();
    antes = document.activeElement;
    const boton = (id) => { const r = MT.roles.por(id);
      return h('button', { class: 'rp-rol', type: 'button', 'data-rol': id, 'data-espacio': portalDe(id), onclick: () => abrir(id) },
        h('span', { class: 'rp-rol__icono', 'aria-hidden': 'true' }, MT.ui.icono(r.icono)), h('span', null, r.nombre)); };
    const grupo = (portal, ids) => h('div', { class: 'rp-grupo', role: 'group', 'aria-label': TEXTOS[portal] },
      h('p', { class: 'rp-grupo__t' }, h('span', { class: 'rp-grupo__logo', 'aria-hidden': 'true' }, MT.ui.marca(portal)), TEXTOS[portal]), h('div', { class: 'rp-roles' }, ids.map(boton)));
    dlg = h('div', { class: 'rp-fondo', onclick: (e) => { if (e.target === dlg) cerrarElegir(); } },
      h('div', { class: 'rp-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rp-t' },
        h('div', { class: 'rp-cab' }, h('h2', { id: 'rp-t' }, TEXTOS.elegirTitulo),
          h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: cerrarElegir }, TEXTOS.cerrar)),
        h('p', { class: 'suave' }, TEXTOS.elegirBajada),
        grupo('kinesis', ['docente', 'orientacion', 'familia', 'coordinacion']), grupo('wisfox', ['estudiante'])));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); cerrarElegir(); return; }
      if (e.key !== 'Tab') return;   // el foco no se escapa del diálogo mientras está abierto
      const f = [...dlg.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    document.body.append(dlg);
    const primero = dlg.querySelector('.rp-rol'); if (primero) primero.focus();
  }
  function cerrarElegir() {
    if (!dlg) return;
    dlg.remove(); dlg = null;
    if (antes && document.contains(antes)) { try { antes.focus(); } catch (e) { /* nada */ } }
  }

  MT.recorridoPortal = { abrir, elegir, cerrarElegir, portalDe, ROLES, TEXTOS, estado: () => (ultimo ? Object.assign({}, ultimo) : null), dialogo: () => dlg };
})(window.MT = window.MT || {});
