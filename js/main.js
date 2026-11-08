/* main.js: arranque. Construye la navegación a partir de UNA lista (así el menú de escritorio y
   la barra del celular nunca se contradicen), conecta la apariencia y el botón de Niky, y
   registra cualquier error para que las pruebas automáticas puedan verlo. */
(function (MT) {
  'use strict';
  const { h, marca, icono } = MT.ui;

  // Errores de ejecución a la vista de herramientas/auditar.py. No se envía nada a ningún sitio.
  window.__errores = window.__errores || [];
  window.addEventListener('error', (e) => window.__errores.push(e.message));
  document.addEventListener('securitypolicyviolation', (e) => window.__errores.push('CSP: ' + e.violatedDirective + ' ' + e.blockedURI));
  window.addEventListener('unhandledrejection', (e) => window.__errores.push('promesa: ' + ((e.reason && e.reason.message) || e.reason)));

  // La lista única del riel. "abajo" son las páginas de la plataforma; el resto es donde se trabaja.
  const ESPACIOS = [
    { id: 'mi', hash: '#/mi', etiqueta: 'Mi espacio', cls: 'e-marca', icono: () => icono('inicio') },
    { id: 'mapa', hash: '#/mapa', etiqueta: 'Mapa', cls: 'e-marca', icono: () => icono('mapa') },
    { id: 'recorrido', hash: '#/recorrido', etiqueta: 'Roles', cls: 'e-marca', icono: () => icono('docente') },
    { id: 'planes', hash: '#/planes', etiqueta: 'Participar', cls: 'e-marca', icono: () => icono('logros'), abajo: true },
    { id: 'hoja', hash: '#/hoja', etiqueta: 'Hoja de ruta', cls: 'e-marca', icono: () => icono('estado'), abajo: true },
    { id: 'identidad', hash: '#/identidad', etiqueta: 'Identidad', cls: 'e-marca', icono: () => icono('identidad'), abajo: true },
  ];

  function construirNavegacion() {
    const enlace = (e) => h('a', { href: e.hash, class: e.cls, 'data-ruta': e.id }, e.icono(), e.etiqueta);
    // El botón de inicio es el único ícono del riel a color: los demás van en blanco y negro para que el logo tenga el protagonismo.
    const logoRiel = MT.tejido.logoColor('', { contorno: 'circulo' });
    logoRiel.setAttribute('viewBox', '2 2 60 60');   // recorta el lienzo al disco del logo para que llene el círculo del botón
    document.getElementById('riel-logo').append(logoRiel);
    document.getElementById('riel-items').append(...ESPACIOS.filter((e) => !e.abajo).map(enlace));
    document.getElementById('riel-abajo').append(...ESPACIOS.filter((e) => e.abajo).map(enlace));
    document.getElementById('logo-pie').replaceChildren(marca('mosaico'));
  }

  /* Apariencia (de Kinesis): modo claro, oscuro o del sistema, y texto más grande. Se guarda en
     este navegador y un script en <head> la aplica antes de pintar, para evitar el destello. */
  const CLAVE_APAR = 'mosaicotelar.apariencia';
  function leerApariencia() { try { return JSON.parse(localStorage.getItem(CLAVE_APAR) || '{}'); } catch (e) { return {}; } }
  // Los tres estilos de la página. Cada uno es una capa visual en css/estilo-<nombre>.css que se activa con html[data-estilo="<nombre>"].
  const ESTILOS = ['hilo', 'piezas', 'taller'];
  function aplicarApariencia(a) {
    const r = document.documentElement;
    if (a.tema === 'claro' || a.tema === 'oscuro') r.dataset.tema = a.tema; else delete r.dataset.tema;
    if (a.texto === 'grande') r.dataset.texto = 'grande'; else delete r.dataset.texto;
    // El nombre del atributo lo define animacion.css (marca); las reglas de reducción están allí y en css/calmado.css.
    if (a.movimiento === 'calmado') r.dataset.movimiento = 'calmado'; else delete r.dataset.movimiento;
    // Con la bandera apagada el atributo no existe, aunque haya quedado un valor guardado de una prueba anterior.
    if (MT.config.mostrarEstilos && ESTILOS.includes(a.estilo)) r.dataset.estilo = a.estilo; else delete r.dataset.estilo;
    try { localStorage.setItem(CLAVE_APAR, JSON.stringify(a)); } catch (e) { /* sin almacenamiento */ }
  }

  // Llena el menú de Apariencia. Aparte de construirApariencia para poder armarlo de nuevo en las pruebas (con la bandera de estilos encendida).
  function llenarMenu(menu, a) {
    const radio = (valor, texto) => h('label', { class: 'casilla' },
      h('input', { type: 'radio', name: 'tema', value: valor, checked: (a.tema || 'sistema') === valor,
        onchange: () => { a.tema = valor; aplicarApariencia(a); } }), texto);
    menu.append(
      h('fieldset', null, h('legend', null, 'Modo'), radio('sistema', 'Del sistema'), radio('claro', 'Claro'), radio('oscuro', 'Oscuro')),
      h('label', { class: 'casilla' }, h('input', { type: 'checkbox', checked: a.texto === 'grande',
        onchange: (e) => { a.texto = e.target.checked ? 'grande' : 'normal'; aplicarApariencia(a); } }), 'Texto más grande'),
      h('label', { class: 'casilla' }, h('input', { type: 'checkbox', id: 'opcion-calmado', 'aria-describedby': 'ayuda-calmado', checked: a.movimiento === 'calmado',
        onchange: (e) => { a.movimiento = e.target.checked ? 'calmado' : 'normal'; aplicarApariencia(a); } }), MT.mensajes.calmado.etiqueta),
      h('p', { class: 'suave menu-apariencia__ayuda', id: 'ayuda-calmado' }, MT.mensajes.calmado.ayuda,
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? ' ' + MT.mensajes.calmado.sistema : ''));
    if (MT.config.mostrarEstilos) {
      const E = MT.mensajes.estilos;
      const estilo = (valor, texto) => h('label', { class: 'casilla' },
        h('input', { type: 'radio', name: 'estilo', value: valor, checked: (ESTILOS.includes(a.estilo) ? a.estilo : '') === valor,
          onchange: () => { a.estilo = valor; aplicarApariencia(a); } }), texto);
      menu.append(h('fieldset', { id: 'opcion-estilo' }, h('legend', null, E.leyenda), estilo('', E.sitio), ESTILOS.map((e) => estilo(e, E[e]))));
    }
  }

  function construirApariencia() {
    const boton = document.getElementById('btn-apariencia');
    const menu = document.getElementById('menu-apariencia');
    llenarMenu(menu, leerApariencia());
    const cerrar = () => { menu.hidden = true; boton.setAttribute('aria-expanded', 'false'); };
    boton.addEventListener('click', () => { const abre = menu.hidden; menu.hidden = !abre; boton.setAttribute('aria-expanded', String(abre)); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { cerrar(); boton.focus(); } });
    document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && !boton.contains(e.target)) cerrar(); });
  }

  /* "Saltar al contenido" (QA-04). Con href="#app" el navegador cambiaba la dirección a "#app" y el enrutador, que no conoce esa ruta,
     pintaba la bienvenida: quien saltaba desde cualquier otra pantalla terminaba en otra página. Aquí se cancela el cambio de dirección
     y solo se mueve el foco al contenido, que es lo que promete el enlace. El href queda por si el script no corre (sin JS no hay enrutador). */
  function conectarSaltar() {
    const enlace = document.querySelector('.saltar'); const main = document.getElementById('app');
    if (!enlace || !main) return;
    enlace.addEventListener('click', (e) => { e.preventDefault(); main.focus({ preventScroll: true }); MT.movimiento.desplazar(main); });
  }

  MT.apariencia = { llenarMenu, aplicar: aplicarApariencia, leer: leerApariencia, ESTILOS };
  if (!MT.config.mostrarEstilos) delete document.documentElement.dataset.estilo;
  construirNavegacion();
  conectarSaltar();
  construirApariencia();
  MT.vivos.iniciar(document.getElementById('app'));
  MT.barra.construir();
  document.getElementById('btn-ia').addEventListener('click', () => MT.ia.panel.alternar());
  MT.ia.detectar();
  MT.router.iniciar();
  if (MT.presentacion && MT.presentacion.desdeUrl) MT.presentacion.desdeUrl();
})(window.MT = window.MT || {});
