/* vivos.js: los portales "vivos", para trabajar con varios a la vez.

   Los portales (Kinesis y Wisfox son aplicaciones completas; Niky es un chat) viven en un contenedor que el router
   NUNCA destruye. Cambiar de pestaña solo muestra u oculta: lo que hiciste en Kinesis sigue ahí cuando vuelves de
   Wisfox, el chat de Niky conserva su conversación, y puedes ver dos portales lado a lado (vista dividida).

   Por qué se ve así: un iframe se recarga si se le cambia de lugar en el documento, por eso el contenedor es fijo y
   solo se alterna su visibilidad. */
(function (MT) {
  'use strict';
  const { h, marca } = MT.ui;
  const { PORTALES, ORDEN } = MT.guias;
  const st = MT.store;

  let raiz; let marcos; let encabezado; let rescate; const paneles = {};
  let activo = null; let lado = null;
  const TARDA = 8000;

  function iniciar(main) {
    encabezado = h('div', { class: 'vivo-barra' });
    marcos = h('div', { class: 'vivo-marcos' });
    rescate = h('p', { class: 'vivo-rescate', hidden: true });
    raiz = h('section', { class: 'vivos', 'data-persistente': '', hidden: true, 'aria-label': 'Portales abiertos' }, encabezado, rescate, marcos);
    main.prepend(raiz);
  }

  function crearPanel(id) {
    const p = PORTALES[id];
    const el = h('div', { class: 'vivo-panel', 'data-espacio': id, hidden: true, 'data-portal': id });
    if (id === 'valeria') {
      const caja = h('div', { class: 'tarjeta tarjeta--chat' });
      el.append(h('p', { class: 'vivo-panel__nombre' }, marca(id), 'Niky · la guía'), h('p', { class: 'pro-fila' }, h('span', null, 'Hoy responde con ejemplos preparados. '), MT.plan.candado('valeria', 'Modelo de lenguaje real')), caja);
      MT.ia.montarChat(caja, MT.ia.panel.sugerenciasPara()); // vive mientras la página: su conversación no se pierde al cambiar de pestaña
    } else {
      el.append(h('p', { class: 'vivo-panel__nombre' }, marca(id), `${p.nombre} · ${p.rotulo.toLowerCase()}`));
      montarPortal(el, id);
    }
    marcos.append(el);
    paneles[id] = el;
    return el;
  }

  /* Un portal externo (Kinesis, Wisfox): el marco, el aviso de "cargando" y el respaldo para cuando no abre.

     Por qué hay respaldo: estos dos portales viven en otra dirección y sin internet no cargan. Un recuadro blanco o la página de error
     del navegador, delante de un público, no dicen nada. En su lugar se muestra un panel que explica qué pasa, qué sigue funcionando y
     lleva a la versión equivalente de Mi espacio, que no necesita red.

     Cómo se decide: el marco empieza a cargar enseguida (como siempre) y, en paralelo, se sondea la dirección (MT.conexion.sondear).
     Si el sondeo falla, o ya se sabe que no hay conexión, el marco se quita del documento (así deja de intentar cargar y no aparece la
     página de error del navegador) y se muestra el respaldo. Al volver la conexión, o con "Intentar de nuevo", se vuelve a intentar. */
  function montarPortal(el, id) {
    const p = PORTALES[id]; const url = (MT.config.portales || {})[id];
    const estado = h('p', { class: 'vivo-estado', role: 'status' });
    const respaldo = h('div', { class: 'vivo-respaldo', 'data-espacio': id, hidden: true });
    let marco = null; let espera = null; let intento = 0; let cargado = false; let sondeoBien = false; let enRespaldo = false;

    const pintarEstado = (texto, tarda) => { estado.replaceChildren(...(tarda ? [texto] : [MT.tejido.cargador(), texto])); estado.classList.toggle('vivo-estado--tarda', !!tarda); estado.hidden = false; };
    const terminar = () => { if (cargado && sondeoBien) { clearTimeout(espera); estado.hidden = true; } };

    function abrir() {
      const n = ++intento; cargado = false; sondeoBien = false; enRespaldo = false; clearTimeout(espera);
      respaldo.hidden = true;
      if (marco) marco.remove();
      marco = h('iframe', { class: 'portal-marco', src: url, title: `${p.nombre}, ${p.rotulo.toLowerCase()}`, referrerpolicy: 'no-referrer',
        allow: 'clipboard-write; fullscreen', sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads' });
      marco.addEventListener('load', () => { if (n === intento && !enRespaldo) { cargado = true; terminar(); } });
      el.append(marco);
      pintarEstado(`Cargando ${p.nombre}…`);
      espera = setTimeout(() => pintarEstado(`${p.nombre} está tardando. Revisa tu conexión o ábrelo en una pestaña aparte con el enlace de arriba.`, true), TARDA);
      MT.conexion.sondear(url).then((ok) => {
        if (n !== intento) return;
        if (ok) { sondeoBien = true; terminar(); } else mostrarRespaldo();
      });
    }

    function mostrarRespaldo() {
      enRespaldo = true; intento++; clearTimeout(espera);
      if (marco) { marco.remove(); marco = null; }
      estado.hidden = true;
      // replaceChildren nativo convertiría un null en el texto "null": solo se pasan nodos reales.
      respaldo.replaceChildren(...contenidoRespaldo(id, url, reintentar).filter(Boolean));
      respaldo.hidden = false;
    }

    // Se comprueba primero la conexión, sin tocar el respaldo: así el mensaje de resultado sigue en pantalla y el foco no se pierde.
    async function reintentar(resultado) {
      resultado.textContent = MT.mensajes.respaldo.reintentando;
      if (await MT.conexion.sondear(url)) abrir(); else resultado.textContent = MT.mensajes.respaldo.sigueSinConexion;
    }

    el.append(estado, respaldo);
    // Si la conexión vuelve mientras se ve el respaldo, se intenta abrir el portal sin que nadie tenga que pedirlo.
    el.soltar = MT.conexion.alCambiar((enLinea) => { if (enLinea && enRespaldo) abrir(); });
    abrir();
  }

  // A dónde lleva "Ver X en Mi espacio": si la persona ya eligió rol, a la sección donde ese rol hace lo que haría en el portal;
  // si no eligió, a la sección principal del rol que corresponde al portal (Kinesis, docencia; Wisfox, estudiante).
  function destinoEnMiEspacio(id) {
    const rol = st.obtener().rol; const nombrePortal = id === 'wisfox' ? 'estudiante' : 'docente';
    if (rol) {
      const paso = MT.guias.pasosEn(rol, id).find((x) => x.aqui);
      const secciones = MT.guias.seccionesEn(rol, id);
      return { ir: () => { location.hash = '#/mi' + (paso ? '/' + paso.aqui : secciones.length ? '/' + secciones[0].id : ''); }, supuesto: null };
    }
    return { ir: () => MT.guias.irAqui(nombrePortal, 'resumen'), supuesto: MT.roles.por(nombrePortal).nombre };
  }

  function contenidoRespaldo(id, url, reintentar) {
    const R = MT.mensajes.respaldo; const p = PORTALES[id]; const d = destinoEnMiEspacio(id);
    const resultado = h('p', { class: 'suave', role: 'status' });
    return [
      h('div', { class: 'vivo-respaldo__cab' }, marca(id, 'vivo-respaldo__marca'), h('h2', null, R.titulo(p.nombre))),
      h('p', null, R.explicacion(p.nombre)),
      h('p', { class: 'etiqueta' }, R.siguePuesto),
      h('ul', null, R.sigue(p.nombre).map((x) => h('li', null, x))),
      h('div', { class: 'acciones' },
        h('button', { class: 'btn', type: 'button', onclick: d.ir }, R.verEnMiEspacio(p.nombre)),
        h('button', { class: 'btn btn--suave', type: 'button', onclick: () => reintentar(resultado) }, R.reintentar),
        url ? h('a', { class: 'btn btn--suave', href: url, target: '_blank', rel: 'noopener' }, R.abrirAparte) : null),
      d.supuesto ? h('p', { class: 'suave' }, R.comoRol(d.supuesto)) : null,
      resultado,
    ];
  }

  function pintarEncabezado() {
    const p = PORTALES[activo]; const rol = st.obtener().rol; const r = rol ? MT.roles.por(rol) : null;
    const pasos = rol ? MT.guias.pasosEn(rol, activo) : [];
    const otros = ORDEN.filter((x) => x !== activo);
    const url = (MT.config.portales || {})[activo];
    const aviso = `${p.nombre} es una aplicación de su equipo, con sus propios datos y su propio inicio de sesión. Lo que hagas aquí todavía no aparece en Mi espacio.`;
    // La explicación va en un desplegable: el portal necesita todo el espacio.
    const ayuda = h('details', { class: 'vivo-ayuda' },
      h('summary', { class: 'btn btn--chico btn--suave' }, r ? `Tu rol: ${r.nombre} · qué te toca aquí` : 'Qué te toca aquí'),
      h('div', { class: 'vivo-ayuda__cuerpo' },
        h('p', null, p.que),
        r ? h('p', null, h('strong', null, `Tu rol: ${r.nombre}. `), pasos.length ? `En ${p.nombre} te toca:` : `En ${p.nombre} no tienes pasos propios; mira tu guía para ver dónde trabajas.`)
          : h('p', null, h('strong', null, 'Elige tu rol '), `para ver qué te toca hacer en ${p.nombre}.`),
        pasos.length ? h('ol', null, pasos.map((x) => h('li', null, h('span', null, x.t), x.aqui ? h('button', { class: 'enlace-boton', type: 'button', onclick: () => MT.guias.irAqui(rol, x.aqui) }, 'Hacerlo en Mi espacio') : null))) : null,
        activo !== 'valeria' ? h('p', { class: 'suave' }, aviso) : null));
    // replaceChildren (nativo) convertiría un null en el texto "null": por eso solo se pasan nodos reales.
    encabezado.replaceChildren(...[
      h('div', { class: 'vivo-barra__titulo', 'data-espacio': activo },
        marca(activo, 'vivo-cab__marca'),
        h('p', { class: 'vivo-titulo', role: 'heading', 'aria-level': '1' }, `${p.nombre}: ${p.rotulo.toLowerCase()}`)),
      ayuda,
      activo !== 'valeria' ? h('span', { class: 'vivo-badge', title: aviso }, 'Aplicación aparte') : null,
      h('div', { class: 'vivo-barra__acciones' },
        lado
          ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { lado = null; refrescar(); } }, 'Quitar vista dividida')
          : h('span', { class: 'dividir' }, h('label', { for: 'dividir-con' }, 'Ver al lado'),
            h('select', { id: 'dividir-con', onchange: (e) => { if (e.target.value) { lado = e.target.value; refrescar(); } } },
              h('option', { value: '' }, 'Elegir portal…'), otros.map((o) => h('option', { value: o }, PORTALES[o].nombre)))),
        document.fullscreenEnabled ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else marcos.requestFullscreen().catch(() => {}); } }, 'Pantalla completa') : null,
        url && activo !== 'valeria' ? h('a', { class: 'btn btn--chico btn--suave', href: url, target: '_blank', rel: 'noopener' }, 'Abrir aparte') : null),
    ].filter(Boolean));
  }

  // La altura del portal es "todo lo que queda bajo la franja y la barra de pestañas": se mide para no adivinar.
  function medirCabeza() {
    if (!raiz) return;
    const f = document.querySelector('.franja'); const b = document.getElementById('barra-portales');
    raiz.style.setProperty('--cabeza', ((f ? f.offsetHeight : 0) + (b ? b.offsetHeight : 0)) + 'px');
  }

  function refrescar() {
    if (!activo) return;
    const visibles = [activo, lado].filter(Boolean);
    visibles.forEach((id) => { if (!paneles[id]) crearPanel(id); });
    Object.entries(paneles).forEach(([id, el]) => { el.hidden = !visibles.includes(id); });
    marcos.className = 'vivo-marcos' + (visibles.length > 1 ? ' vivo-marcos--2' : '');
    pintarEncabezado();
    pintarRescate();
    if (MT.barra) MT.barra.actualizar();
  }

  /* Una línea fija bajo la barra de cada portal externo. Los avisos de "cargando" y de respaldo salen cuando el portal tarda o no responde,
     pero un portal que contesta con un error (404, 5xx) o que carga en blanco podría no avisar nada: esta línea siempre deja la salida. */
  function pintarRescate() {
    const R = MT.mensajes.rescate; const url = (MT.config.portales || {})[activo];
    rescate.hidden = activo === 'valeria' || !url;
    if (rescate.hidden) return;
    rescate.replaceChildren(...[R.pregunta, ' ',
      h('a', { href: url, target: '_blank', rel: 'noopener' }, R.aparte), R.o,
      h('button', { class: 'enlace-boton', type: 'button', onclick: () => destinoEnMiEspacio(activo).ir() }, R.miEspacio),
      R.aprobado ? null : h('span', { class: 'vivo-rescate__borrador' }, ' ' + R.borrador)].filter(Boolean));
  }

  function mostrar(id) {
    if (!raiz) iniciar(document.getElementById('app'));
    activo = id; if (lado === id) lado = null;
    raiz.hidden = false;
    medirCabeza();
    refrescar();
  }
  function ocultar() { if (raiz) raiz.hidden = true; if (MT.barra) MT.barra.actualizar(); }

  window.addEventListener('resize', medirCabeza);
  // El desplegable de "qué te toca" se cierra al tocar fuera o con Escape.
  document.addEventListener('click', (e) => { document.querySelectorAll('.vivo-ayuda[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.vivo-ayuda[open]').forEach((d) => d.removeAttribute('open')); });

  /* Quita todos los portales abiertos (y la vista dividida): al empezar de nuevo, el chat de Niky pierde su conversación y los marcos
     se vuelven a cargar limpios. Lo que Kinesis y Wisfox guardan en su propia aplicación es de sus equipos y no se toca. */
  function reiniciar() {
    lado = null;
    Object.entries(paneles).forEach(([id, el]) => { if (el.soltar) el.soltar(); el.remove(); delete paneles[id]; });
    if (MT.barra) MT.barra.actualizar();
    return limpiarAlmacenAjeno();
  }

  /* Lo que Kinesis y Wisfox guardan en este navegador. Comparten dominio con la plataforma (profenapaipa.github.io), así que desde aquí
     se puede ver y borrar sin tocar su código. Se borra solo lo que tiene el rastro de cada uno, y NADA de "mosaicotelar.": ni los datos
     de ejemplo, ni la apariencia, ni el modo presentación.
       - Wisfox: sus claves empiezan por "wisfo" (wisfoState, wisfoPerfil, wisfoxModo…) y usa Firebase, que deja la sesión en
         localStorage ("firebase:") y en tres bases de IndexedDB.
       - Kinesis: la versión publicada es una demostración sin datos propios; solo guarda su apariencia ("kinesis-apariencia").
     Si más adelante esas aplicaciones guardan otra cosa con otros nombres, hay que sumarlos aquí. Si QA-13 quita allow-same-origin de los
     marcos, sus datos quedan aislados y esto solo limpia lo que se haya abierto "aparte". */
  const PREFIJOS_AJENOS = ['wisfo', 'firebase:', 'kinesis-'];
  const BASES_AJENAS = ['firebaseLocalStorageDb', 'firebase-heartbeat-database', 'firebase-installations-database', 'firebase-app-check-database', 'firebase_remote_config'];
  async function limpiarAlmacenAjeno() {
    const borradas = [];
    try {
      Object.keys(localStorage).filter((k) => PREFIJOS_AJENOS.some((p) => k.startsWith(p))).forEach((k) => { localStorage.removeItem(k); borradas.push(k); });
      Object.keys(sessionStorage).filter((k) => PREFIJOS_AJENOS.some((p) => k.startsWith(p))).forEach((k) => sessionStorage.removeItem(k));
    } catch (e) { /* sin almacenamiento */ }
    // Una base abierta por un marco que acaba de quitarse tarda en cerrarse: no se espera más de un segundo y medio.
    const bases = BASES_AJENAS.map((n) => new Promise((res) => {
      try { const q = indexedDB.deleteDatabase(n); q.onsuccess = q.onerror = q.onblocked = () => res(); } catch (e) { res(); }
      setTimeout(res, 1500);
    }));
    await Promise.all(bases);
    return borradas;
  }

  MT.vivos = { mostrar, ocultar, reiniciar, limpiarAlmacenAjeno, abiertos: () => Object.keys(paneles), activo: () => (raiz && !raiz.hidden ? activo : null), lado: () => lado, dividir(id) { if (id && id !== activo) { lado = id; refrescar(); } } };
  MT.vivos.iniciar = iniciar;
})(window.MT = window.MT || {});
