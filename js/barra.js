/* barra.js: lo que está siempre a la vista arriba, en cualquier pantalla.

   1. La barra de portales: pestañas horizontales (Mi espacio, Kinesis, Niky, Wisfox) en el orden del flujo de trabajo.
      Cada portal tiene una lista desplegable con lo que le toca hacer a tu rol ahí y las secciones de Mi espacio donde
      puedes trabajarlo ahora mismo. Los portales que ya abriste quedan marcados y siguen vivos al cambiar de pestaña.
   2. El selector de rol, que cambia de rol sin perder el lugar, y la opción de empezar de nuevo.
   Es teclado-primero: Enter abre, Escape cierra y devuelve el foco, y solo hay un menú abierto a la vez. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;
  const { PORTALES, ORDEN } = MT.guias;
  const st = MT.store;
  let abierto = null; // { boton, menu }

  const rolActual = () => st.obtener().rol;

  function cerrar(devolverFoco) {
    if (!abierto) return;
    abierto.menu.hidden = true; abierto.boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) abierto.boton.focus();
    abierto = null;
  }
  /* La barra de pestañas se desplaza si no cabe, y eso recortaría un menú que se posiciona dentro de ella. Por eso el menú de un
     portal va con posición fija, colocado justo debajo de su pestaña. En el celular lo coloca el CSS. */
  function posicionar(boton, menu) {
    const pestana = boton.closest('.pestana');
    if (!pestana || window.matchMedia('(max-width: 860px)').matches) return;
    const r = pestana.getBoundingClientRect();
    menu.style.top = r.bottom + 2 + 'px';
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  }
  function alternar(boton, menu, alAbrir) {
    const abre = menu.hidden;
    cerrar(false);
    if (abre) {
      if (alAbrir) alAbrir();
      menu.hidden = false; boton.setAttribute('aria-expanded', 'true'); abierto = { boton, menu };
      posicionar(boton, menu);
    }
  }

  /* ---------------- Barra de portales ---------------- */
  function contenidoMenu(id) {
    const p = PORTALES[id]; const rol = rolActual(); const r = rol ? MT.roles.por(rol) : null;
    const pasos = rol ? MT.guias.pasosEn(rol, id) : [];
    const secciones = rol ? MT.guias.seccionesEn(rol, id) : [];
    const alLado = MT.vivos.activo() && MT.vivos.activo() !== id;
    const sal = (f) => () => { cerrar(false); f(); };
    return [
      h('p', { class: 'menu-portal__que' }, p.que),
      r ? h('div', null, h('p', { class: 'etiqueta' }, 'Para tu rol: ' + r.nombre),
        pasos.length
          ? h('ol', { class: 'menu-portal__pasos' }, pasos.map((s) => h('li', null, h('span', null, s.t), s.aqui ? h('button', { class: 'enlace-boton', type: 'button', onclick: sal(() => MT.guias.irAqui(rol, s.aqui)) }, 'Hacerlo en Mi espacio') : null)))
          : h('p', { class: 'suave' }, 'Aquí no tienes pasos propios. Tu guía te dice dónde trabajas.'))
        : h('div', null, h('p', { class: 'suave' }, 'Elige tu rol para ver qué te toca hacer aquí.'), h('button', { class: 'btn btn--chico', type: 'button', onclick: sal(() => document.getElementById('rol-actual').click()) }, 'Elegir mi rol')),
      secciones.length ? h('div', null, h('p', { class: 'etiqueta' }, 'En Mi espacio'),
        h('ul', { class: 'menu-portal__secciones' }, secciones.map((s) => h('li', null, h('a', { href: '#/mi/' + s.id, onclick: () => { cerrar(false); } }, icono(s.icono), s.etiqueta))))) : null,
      h('div', { class: 'acciones' },
        h('a', { class: 'btn btn--chico', href: '#/portales/' + id, onclick: () => cerrar(false) }, 'Ir a ' + p.nombre),
        alLado ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: sal(() => MT.vivos.dividir(id)) }, 'Abrir al lado') : null,
        h('a', { class: 'btn btn--chico btn--suave', href: '#/guia' + (rol ? '/' + rol : ''), onclick: () => cerrar(false) }, 'Mi guía')),
    ];
  }

  function construirBarra() {
    const nav = document.getElementById('barra-portales');
    const pestanas = ORDEN.map((id) => {
      const p = PORTALES[id];
      const boton = h('button', { class: 'pestana__abrir', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'menu-portal-' + id, 'aria-label': `Qué puedes hacer en ${p.nombre}` }, MT.ui.svg('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'));
      const menu = h('div', { class: 'menu-portal', id: 'menu-portal-' + id, hidden: true, role: 'group', 'aria-label': `Lo que puedes hacer en ${p.nombre}` });
      boton.addEventListener('click', (e) => { e.stopPropagation(); alternar(boton, menu, () => menu.replaceChildren(...contenidoMenu(id))); });
      return h('li', { class: 'pestana', 'data-espacio': id, 'data-portal': id },
        h('a', { class: 'pestana__ir', href: '#/portales/' + id }, marca(id, 'pestana__marca'), h('span', { class: 'pestana__texto' }, h('strong', null, p.nombre), h('small', null, p.rotulo)), h('i', { class: 'pestana__vivo', 'aria-hidden': 'true', title: 'Abierto: conserva lo que estabas haciendo' })),
        boton, menu);
    });
    nav.replaceChildren(h('ul', { class: 'pestanas' },
      h('li', { class: 'pestana pestana--mi' }, h('a', { class: 'pestana__ir', id: 'tab-mi', href: '#/mi' }, icono('inicio'), h('span', { class: 'pestana__texto' }, h('strong', null, 'Mi espacio'), h('small', null, 'Tu trabajo')))),
      ...pestanas),
      h('a', { class: 'barra-portales__ayuda', href: '#/portales' }, 'Qué hace cada portal'));
    document.addEventListener('click', (e) => { if (abierto && !abierto.menu.contains(e.target)) cerrar(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) cerrar(true); });
    window.addEventListener('resize', () => cerrar(false));
  }

  /* ---------------- Selector de rol ---------------- */
  function cambiarRol(id) {
    const { id: ruta, sub } = MT.router.actual();
    st.cambiar((s) => { s.rol = id; });
    if (ruta === 'mi') { const hay = (MT.secciones[id] || []).some((x) => x.id === sub); location.hash = '#/mi/' + (hay ? sub : 'resumen'); }
    else if (ruta === 'guia') location.hash = '#/guia/' + id;
    MT.router.recargar();
  }

  /* Devuelve true si se reinició. `confirmar: false` lo usa el modo presentación: en la mesa el reinicio es de un solo clic, porque
     los datos son de ejemplo y quienes se turnan necesitan dejar todo limpio para la siguiente persona. */
  async function empezarDeNuevo(opciones) {
    const confirmar = !opciones || opciones.confirmar !== false;
    if (confirmar && !(await MT.dlg.confirmar('Se borrará todo lo que creaste en este dispositivo (actividades, ajustes, notas y archivos) y volverán los datos de ejemplo.', 'Sí, empezar de nuevo'))) return false;
    // Si el navegador no deja usar IndexedDB (modo privado, sin conexión a disco), los datos de ejemplo vuelven de todos modos.
    try { await MT.archivos.vaciar(); } catch (e) { console.error(e); }
    // Los portales abiertos también vuelven a empezar: sin esto el chat de Niky conservaría su conversación.
    // y se borra lo que Kinesis y Wisfox guardaron en este navegador (ver vivos.js).
    if (MT.vivos && MT.vivos.reiniciar) await MT.vivos.reiniciar();
    st.reiniciar(); location.hash = '#/'; MT.router.recargar();
    return true;
  }

  function construirRol() {
    const boton = document.getElementById('rol-actual'); const menu = document.getElementById('menu-rol');
    const pintar = () => {
      const r = MT.roles.por(rolActual());
      boton.textContent = r ? 'Rol: ' + r.nombre : 'Elegir mi rol';
      boton.append(' ▾');
      menu.replaceChildren(h('p', { class: 'etiqueta' }, 'Ver la plataforma como'),
        h('ul', { class: 'menu-rol__lista' }, MT.roles.lista.map((x) => h('li', null, h('button', { type: 'button', 'aria-pressed': String(x.id === rolActual()), onclick: () => { cerrar(true); cambiarRol(x.id); } }, icono(x.icono), h('span', null, h('strong', null, x.nombre), h('small', null, x.lema)))))),
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { cerrar(false); empezarDeNuevo(); } }, 'Empezar de nuevo'),
        h('p', { class: 'suave menu-rol__nota' }, 'Cambiar de rol no borra nada: solo cambia lo que ves.'));
    };
    boton.addEventListener('click', (e) => { e.stopPropagation(); alternar(boton, menu, pintar); });
    st.suscribir(() => { if (menu.hidden) pintarEtiqueta(); });
    function pintarEtiqueta() { const r = MT.roles.por(rolActual()); boton.textContent = r ? 'Rol: ' + r.nombre : 'Elegir mi rol'; boton.append(' ▾'); }
    pintarEtiqueta();
  }

  /* ---------------- Estado: qué pestaña está activa y cuáles portales están abiertos ---------------- */
  function actualizar() {
    const nav = document.getElementById('barra-portales'); if (!nav) return;
    const { id } = MT.router.actual(); const activo = MT.vivos.activo(); const abiertos = MT.vivos.abiertos(); const lado = MT.vivos.lado();
    nav.querySelectorAll('.pestana').forEach((li) => {
      const portal = li.dataset.portal; const ir = li.querySelector('.pestana__ir');
      const actual = portal ? portal === activo : id === 'mi';
      if (actual) ir.setAttribute('aria-current', 'page'); else ir.removeAttribute('aria-current');
      li.classList.toggle('pestana--lado', !!portal && portal === lado);
      li.classList.toggle('pestana--abierta', !!portal && abiertos.includes(portal));
    });
  }

  function pintarPlan() { const a = document.getElementById('plan-chip'); if (a) a.textContent = MT.plan.etiquetaPro ? MT.plan.etiquetaPlan() : ''; }
  function construir() { construirBarra(); construirRol(); pintarPlan(); st.suscribir(pintarPlan); actualizar(); }
  MT.barra = { construir, actualizar, cerrar, empezarDeNuevo };
})(window.MT = window.MT || {});
