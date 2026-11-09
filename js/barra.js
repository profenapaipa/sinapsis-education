/* barra.js: la única navegación de la plataforma y el selector de rol.

   Por qué una sola. Antes había dos navegaciones a la vez (la barra de portales bajo la franja y el riel lateral con seis ítems), y cada
   portal traía además su lista desplegable. Quien llegaba por el QR del pendón veía diez destinos a la vez y no sabía por cuál empezar.
   Ahora el riel (a la izquierda en pantalla grande, abajo en el celular) es lo único, y cambia con el rol:
     - siempre: Kinesis, Wisfox y «Guía» (informativa); el portal del rol (estudiante, Wisfox; el resto, Kinesis) va primero y marcado;
     - Niky es el botón flotante (js/niky.js); un único «Más».
   Máximo cuatro ítems, que es lo que cabe en la barra del celular con objetivos de 44 px o más.
   «Más» reúne todo lo secundario (mapa, roles y datos, hoja de ruta, glosario, participar, piloto, identidad, créditos) y lo de uso
   ocasional (modo presentación, apariencia). No se borró ninguna ruta: los enlaces profundos, las pruebas y los casos de la exposición
   guiada siguen llegando a donde llegaban; solo dejaron de competir por la atención en cada pantalla.
   Es teclado-primero: Enter abre, Escape cierra y devuelve el foco, y solo hay un menú abierto a la vez. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;
  const { PORTALES } = MT.guias;
  const st = MT.store;
  let abierto = null; // { boton, menu }

  const rolActual = () => st.obtener().rol;
  // El portal de cada rol: el estudiante trabaja en Wisfox; el resto del equipo adulto, en Kinesis. Es la misma regla de roles.js (campo marca).
  const portalDe = (rol) => { const r = rol ? MT.roles.por(rol) : null; return r ? r.marca : null; };

  function cerrar(devolverFoco) {
    if (!abierto) return;
    abierto.menu.hidden = true; abierto.boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) abierto.boton.focus();
    abierto = null;
  }
  function alternar(boton, menu, alAbrir, enfocarAlAbrir) {
    const abre = menu.hidden;
    cerrar(false);
    if (abre) {
      if (alAbrir) alAbrir();
      menu.hidden = false; boton.setAttribute('aria-expanded', 'true'); abierto = { boton, menu };
      // El menú «Más» está al final del documento: sin mover el foco, el teclado tendría que recorrer toda la página para llegar a él.
      if (enfocarAlAbrir) { const primero = menu.querySelector('a, button'); if (primero) primero.focus(); }
    }
  }

  /* ---------------- La navegación: riel y barra inferior ---------------- */
  // Las páginas secundarias, en el orden en que se necesitan. Cada una conserva su ruta de siempre.
  const PAGINAS_MAS = [
    { ruta: 'inicio', hash: '#/', etiqueta: 'Inicio', icono: 'inicio' },
    { ruta: 'mapa', hash: '#/mapa', etiqueta: 'Mapa', icono: 'mapa' },
    { ruta: 'recorrido', hash: '#/recorrido', etiqueta: 'Roles y datos', icono: 'docente' },
    { ruta: 'planes', hash: '#/planes', etiqueta: 'Participa', icono: 'logros', id: 'plan-chip' },
    { ruta: 'hoja', hash: '#/hoja', etiqueta: 'Hoja de ruta', icono: 'estado' },
    { ruta: 'glosario', hash: '#/glosario', etiqueta: 'Glosario', icono: 'libro' },
    { ruta: 'piloto', hash: '#/piloto', etiqueta: 'Solicitar un piloto', icono: 'coordinacion' },
    { ruta: 'identidad', hash: '#/identidad', etiqueta: 'Identidad', icono: 'identidad' },
    { ruta: 'creditos', hash: '#/creditos', etiqueta: 'Créditos', icono: 'familia' },
  ];
  // Las rutas que viven bajo «Más»: cuando se está en una, el botón «Más» se marca como actual.
  const RUTAS_MAS = ['mapa', 'recorrido', 'planes', 'registro', 'hoja', 'glosario', 'piloto', 'identidad', 'creditos'];

  let dinamico; let botonMas; let menuMas;

  /* El riel lleva SIEMPRE lo mismo: Kinesis, Wisfox y «Guía» (la página informativa). Decisión del dueño: no hay un tercer espacio («Mi espacio»)
     que le quite la interactividad a los dos portales; lo que se necesita hacer se hace dentro de Kinesis y Wisfox, y la IA es el botón flotante.
     Con rol elegido, el portal de su rol va primero y queda marcado como «tu portal»; el otro sigue disponible. Se vuelve a pintar solo cuando
     cambia el rol (no en cada cambio de datos, para no quitarle el foco a nadie). */
  function itemsDelRol() {
    const principal = portalDe(rolActual());
    const orden = principal === 'wisfox' ? ['wisfox', 'kinesis'] : ['kinesis', 'wisfox'];
    return [
      ...orden.map((portal) => h('a', Object.assign({ href: '#/portales/' + portal, class: 'riel-item' + (portal === principal ? ' riel-item--principal' : ''), 'data-portal': portal, 'data-espacio': portal },
        portal === principal ? { title: 'Tu portal' } : {}),
        marca(portal), PORTALES[portal].nombre, portal === principal ? h('span', { class: 'solo-lectores' }, ' (tu portal)') : null, h('i', { class: 'riel-vivo', 'aria-hidden': 'true' }))),
      h('a', { href: '#/guia', class: 'riel-item', 'data-ruta': 'guia' }, icono('libro'), 'Guía'),
    ];
  }
  let rolPintado;
  function pintarNavegacion() {
    const rol = rolActual() || null;
    if (rol === rolPintado && dinamico.childElementCount) return;
    rolPintado = rol;
    dinamico.replaceChildren(...itemsDelRol());
    actualizar();
  }

  function construirNavegacion() {
    const items = document.getElementById('riel-items'); const abajo = document.getElementById('riel-abajo');
    dinamico = h('span', { class: 'riel-dinamico' });
    // Niky: un único botón, siempre el mismo. Abre el panel lateral de la IA (el lugar fijo de Niky), que se trabaja aparte.
    const niky = h('button', { class: 'riel-ia', id: 'btn-ia', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'slot-ia', 'data-espacio': 'valeria' }, marca('valeria'), 'Niky');
    niky.addEventListener('click', () => MT.ia.panel.alternar());
    items.append(dinamico, niky);
    menuMas = document.getElementById('menu-mas');
    botonMas = h('button', { class: 'riel-item', id: 'btn-mas', type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': 'menu-mas' },
      MT.ui.svg('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>'), 'Más');
    abajo.append(botonMas);
    document.getElementById('mas-paginas').replaceChildren(...PAGINAS_MAS.map((p) => h('li', null,
      h('a', Object.assign({ href: p.hash, 'data-ruta': p.ruta }, p.id ? { id: p.id } : {}), icono(p.icono), h('span', { class: 'mas-texto' }, p.etiqueta)))));
    botonMas.addEventListener('click', (e) => { e.stopPropagation(); alternar(botonMas, menuMas, null, true); });
    // Elegir una página o activar el modo presentación cierra el menú: ya hizo lo que había que hacer.
    menuMas.addEventListener('click', (e) => { if (e.target.closest('a, #btn-presentacion')) cerrar(false); });
    // Si el foco sale del menú (Tab hacia afuera), se cierra: no queda abierto tapando la página sin que se vea.
    menuMas.addEventListener('focusout', (e) => { if (abierto && abierto.menu === menuMas && e.relatedTarget && !menuMas.contains(e.relatedTarget) && e.relatedTarget !== botonMas) cerrar(false); });
    document.addEventListener('click', (e) => { if (abierto && !abierto.menu.contains(e.target) && !abierto.boton.contains(e.target)) cerrar(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) cerrar(true); });
    window.addEventListener('resize', () => cerrar(false));
    pintarNavegacion();
    st.suscribir(pintarNavegacion);
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
      pintarEtiqueta();
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

  /* ---------------- Estado: qué ítem es el actual y cuáles portales están abiertos ---------------- */
  function actualizar() {
    const riel = document.getElementById('riel'); if (!riel) return;
    const { id } = MT.router.actual(); const activo = MT.vivos.activo(); const abiertos = MT.vivos.abiertos();
    // Los ítems del rol que son páginas (Inicio, Mi espacio) se marcan aquí; los de «Más» los marca el router en cada pantalla.
    riel.querySelectorAll('[data-ruta]').forEach((a) => { if (a.dataset.ruta === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    riel.querySelectorAll('[data-portal]').forEach((a) => {
      const portal = a.dataset.portal;
      if (portal === activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      a.classList.toggle('riel-item--abierto', abiertos.includes(portal));
    });
    // Niky solo se marca como actual cuando es el portal que se está viendo (el panel lateral lleva su propio estado).
    const niky = document.getElementById('btn-ia'); if (niky) niky.classList.toggle('riel-item--actual', activo === 'valeria');
    if (botonMas) botonMas.classList.toggle('riel-item--actual', RUTAS_MAS.includes(id) && !activo);
  }

  function pintarPlan() { const a = document.getElementById('plan-chip'); const t = a && a.querySelector('.mas-texto'); if (t) t.textContent = MT.plan.etiquetaPro ? MT.plan.etiquetaPlan() : ''; }
  function construir() { construirNavegacion(); construirRol(); pintarPlan(); st.suscribir(pintarPlan); actualizar(); }
  MT.barra = { construir, actualizar, cerrar, empezarDeNuevo };
})(window.MT = window.MT || {});
