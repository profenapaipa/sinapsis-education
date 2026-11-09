/* presentacion.js: el modo presentación, para proyectar la plataforma y para que cinco estudiantes se turnen en la mesa.

   Qué cambia cuando está activo (el CSS está en css/presentacion.css y todo cuelga de html[data-presentacion="activa"]):
   letra y controles más grandes, menos navegación, y un "guion de la mesa": una barra discreta abajo que recorre los cinco roles
   siguiendo un ajuste de principio a fin. Cada paso lleva al rol y a la pantalla donde ocurre, así quien presenta solo pulsa
   "Siguiente". "Empezar de nuevo" restablece los datos de ejemplo y el rol con un solo clic, sin pedir confirmación: en la mesa
   los datos son ficticios y lo que se necesita es dejar todo limpio para la siguiente persona.

   Es opcional y no cambia nada si nadie lo activa. Se activa con el botón de la franja o con Alt+P (con modificador, para no
   chocar con quien escribe en un campo). El texto del guion vive en js/mensajes.js y es un borrador por aprobar.

   Se recuerda en este navegador (activo, paso y si el guion está oculto), así recargar la página no saca del modo. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const M = MT.mensajes.presentacion;
  const G = MT.mensajes.guion;
  // El guion sale del caso elegido (js/casos.js). Si ese módulo no está, se usa el guion genérico de mensajes.js.
  const pasos = () => (MT.casos ? MT.casos.guion(MT.casos.actual()) : G.pasos);
  const CLAVE = 'mosaicotelar.presentacion';
  const raiz = document.documentElement;

  function leer() {
    try { const d = JSON.parse(localStorage.getItem(CLAVE) || '{}'); return { activo: !!d.activo, paso: Math.max(0, Math.min(pasos().length - 1, Number(d.paso) || 0)), oculto: !!d.oculto }; } catch (e) { return { activo: false, paso: 0, oculto: false }; }
  }
  const estado = leer();
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } }

  let panel = null; let boton = null; let observador = null;
  const refs = {};

  /* ---------------- Ir a un paso del guion ---------------- */
  function ir(i, volverA) {
    estado.paso = Math.max(0, Math.min(pasos().length - 1, i)); guardar();
    const p = pasos()[estado.paso];
    MT.store.cambiar((s) => { s.rol = p.rol; });
    // Cada paso deja la plataforma en el estado que cuenta (por ejemplo, el ajuste ya aprobado): quien presenta solo señala.
    if (MT.casos) { MT.casos.cerrarPanel(); MT.casos.accion(p.accion); }
    pintar();
    if (location.hash === p.hash) MT.router.recargar(); else location.hash = p.hash;
    // El router lleva el foco al título de la pantalla nueva; quien presenta con el teclado necesita seguir en su botón.
    if (volverA) setTimeout(() => enfocar(volverA), 60);
  }
  // En el primer o el último paso uno de los dos botones queda desactivado y no puede recibir el foco: se usa el otro.
  function enfocar(el) { (el && !el.disabled ? el : (refs.siguiente.disabled ? refs.anterior : refs.siguiente)).focus(); }

  async function reiniciar() {
    if (MT.casos) await MT.casos.cargar(MT.casos.numero()); else await MT.barra.empezarDeNuevo({ confirmar: false });
    estado.paso = 0; guardar(); pintar();
    MT.dlg.toast(M.reiniciado);
  }

  async function cambiarCaso(n) {
    await MT.casos.cargar(n);
    estado.paso = 0; guardar(); pintar();
    MT.dlg.toast(M.casoListo(n));
  }

  /* ---------------- La barra del guion ---------------- */
  function construirPanel() {
    refs.meta = h('span', { class: 'guion__meta' });
    refs.titulo = h('h2', { class: 'guion__titulo' });
    refs.texto = h('p', { class: 'guion__texto' });
    refs.puntos = h('ol', { class: 'guion__puntos', 'aria-label': M.guion });
    refs.anterior = h('button', { class: 'btn btn--suave', type: 'button', onclick: () => ir(estado.paso - 1, refs.anterior) }, M.anterior);
    refs.siguiente = h('button', { class: 'btn', type: 'button', onclick: () => ir(estado.paso + 1, refs.siguiente) }, M.siguiente);
    const completa = document.fullscreenEnabled
      ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else raiz.requestFullscreen().catch(() => {}); } }, M.pantallaCompleta) : null;
    refs.caso = MT.casos ? h('select', { id: 'guion-caso', onchange: (e) => cambiarCaso(Number(e.target.value)) },
      MT.casos.lista.map((c) => h('option', { value: String(c.n), title: c.etiqueta }, `${c.n}. ${c.asignatura}`))) : null;
    const selector = refs.caso ? h('label', { class: 'guion__caso', for: 'guion-caso' }, M.caso, ' ', refs.caso) : null;
    const cuerpo = h('div', { class: 'guion__cuerpo', id: 'guion-cuerpo' },
      h('div', { class: 'guion__texto-caja' },
        h('p', { class: 'guion__etiqueta' }, refs.meta),   // honestidad: sin «Guion de la mesa [por aprobar]» a la vista; el nombre queda para lectores de pantalla
        refs.titulo, refs.texto),
      // Los botones de uso ocasional que no caben junto a los puntos se sientan debajo de Anterior y Siguiente: la barra queda baja.
      h('div', { class: 'guion__nav' }, h('div', { class: 'guion__nav-par' }, refs.anterior, refs.siguiente),
        h('div', { class: 'guion__nav-extra' }, completa,
          h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => alternar(false) }, M.salir))),
      h('div', { class: 'guion__pie' },
        refs.puntos,
        h('div', { class: 'guion__utiles' },
          selector,
          h('button', { class: 'btn btn--chico btn--suave', type: 'button', id: 'btn-reiniciar-mesa', onclick: reiniciar }, M.empezarDeNuevo),
          h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => ocultar(true) }, M.ocultar))),
      h('p', { class: 'solo-lectores' }, M.atajos));
    refs.mostrar = h('button', { class: 'btn btn--chico guion__mostrar', type: 'button', 'aria-controls': 'guion-cuerpo', onclick: () => ocultar(false) }, M.mostrar);
    panel = h('aside', { class: 'guion', id: 'guion-mesa', 'aria-label': M.guion }, cuerpo, refs.mostrar);
    // Las flechas cambian de paso solo con el foco dentro del guion: así no le quitan las flechas a nadie más.
    panel.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(estado.paso + 1, document.activeElement); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(estado.paso - 1, document.activeElement); }
    });
    pintarPuntos();
    document.body.append(panel);
    // El resto de la página deja sitio a la barra: se mide para no adivinar su altura.
    if (window.ResizeObserver) { observador = new ResizeObserver(medir); observador.observe(panel); }
  }

  function pintarPuntos() {
    refs.puntos.replaceChildren(...pasos().map((p, i) => h('li', null, h('button', { type: 'button', class: 'guion__punto',
      'aria-label': `${M.paso(i + 1, pasos().length)}: ${p.titulo}`, onclick: (e) => ir(i, e.currentTarget) }))));
  }

  function medir() { raiz.style.setProperty('--guion-alto', (panel && estado.activo && !estado.oculto ? panel.offsetHeight : 0) + 'px'); }

  function pintar() {
    if (!panel) return;
    const p = pasos()[estado.paso]; const r = p.rol ? MT.roles.por(p.rol) : null;
    estado.paso = Math.min(estado.paso, pasos().length - 1);
    const g = pasos()[estado.paso];
    const sobre = g.grupo ? ` · ${M.habla(g.grupo)}` : '';
    const tiempo = g.seg && MT.casos ? ` · ${M.tiempo(g.seg, MT.casos.total(pasos()))}` : '';
    // Cuando habla todo el grupo ya lo dice «Habla: todas y todos»: no se repite «Para todo el grupo».
    const turno = r ? ` · ${M.turno(r.nombre)}` : (g.grupo ? '' : ` · ${M.turnoGeneral}`);
    refs.meta.textContent = `${M.paso(estado.paso + 1, pasos().length)}${sobre}${turno}${tiempo}`;
    pintarPuntos();
    if (refs.caso) refs.caso.value = String(MT.casos.numero());
    refs.titulo.textContent = p.titulo;
    refs.texto.textContent = p.texto;
    refs.anterior.disabled = estado.paso === 0;
    refs.siguiente.disabled = estado.paso === pasos().length - 1;
    [...refs.puntos.children].forEach((li, i) => { const b = li.firstChild; if (i === estado.paso) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    panel.dataset.oculto = estado.oculto ? 'si' : 'no';
    panel.querySelector('.guion__cuerpo').hidden = estado.oculto;
    refs.mostrar.hidden = !estado.oculto;
    medir();
  }

  function ocultar(si) {
    estado.oculto = si; guardar(); pintar();
    if (si) refs.mostrar.focus(); else enfocar(refs.siguiente);
  }

  /* ---------------- Activar y desactivar ---------------- */
  function alternar(activar, avisar) {
    estado.activo = activar === undefined ? !estado.activo : !!activar;
    guardar();
    if (MT.casos) MT.casos.sincronizar();
    if (estado.activo) { raiz.dataset.presentacion = 'activa'; if (!panel) construirPanel(); panel.hidden = false; pintar(); }
    else { delete raiz.dataset.presentacion; if (panel) panel.hidden = true; raiz.style.removeProperty('--guion-alto'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }
    if (boton) boton.setAttribute('aria-pressed', String(estado.activo));
    if (avisar !== false && MT.dlg) MT.dlg.toast(estado.activo ? 'Modo presentación activado.' : 'Modo presentación desactivado.');
    // El tamaño de la letra cambia la altura de la franja y de la barra de portales, de las que depende la altura de los portales.
    window.dispatchEvent(new Event('resize'));
  }

  function iniciar() {
    boton = h('button', { class: 'btn btn--chico btn--suave', id: 'btn-presentacion', type: 'button', 'aria-pressed': 'false', 'aria-keyshortcuts': 'Alt+P', title: M.ayudaBoton, onclick: () => alternar() }, M.activar);
    const acciones = document.querySelector('.franja-acciones');
    if (acciones) acciones.insertBefore(boton, document.getElementById('btn-apariencia'));
    document.addEventListener('keydown', (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.code === 'KeyP') { e.preventDefault(); alternar(); }
      else if (e.code === 'KeyG' && estado.activo) { e.preventDefault(); if (estado.oculto) ocultar(false); else enfocar(refs.siguiente); }
    });
    if (estado.activo) alternar(true, false);
  }

  /* Entrar directo a un caso: la dirección termina en #/caso/3 (también vale ?caso=3). Se usa el hash porque no viaja al servidor y no
     depende de la caché del service worker: así funciona igual sin internet. Activa el modo presentación y empieza el caso limpio. */
  async function desdeUrl() {
    if (!MT.casos) return;
    const m = /^#\/caso\/(\d+)\/?$/.exec(location.hash) || /[?&]caso=(\d+)/.exec(location.search);
    const n = m ? Number(m[1]) : 0;
    if (!(n >= 1 && n <= MT.casos.lista.length)) return;
    history.replaceState(null, '', location.pathname + '#/');
    estado.paso = 0; guardar();
    if (!estado.activo) alternar(true, false);
    await MT.casos.cargar(n);
    pintar();
  }

  // Escribir #/caso/3 con la página ya abierta también funciona (no recarga la página, solo cambia el hash).
  window.addEventListener('hashchange', () => { if (/^#\/caso\/\d+\/?$/.test(location.hash)) desdeUrl(); });

  iniciar();
  MT.presentacion = { desdeUrl,  iniciar, alternar, activo: () => estado.activo, paso: () => estado.paso, ir, reiniciar };
})(window.MT = window.MT || {});
