/* niky.js: el botón flotante de Niky, sus burbujas de sugerencias según dónde estés y la ventana de chat.

   Qué hace
   - Un botón fijo (esquina inferior derecha; en celular, sobre la barra inferior) con el avatar de Niky. Está en todas las pantallas.
   - Al entrar a una pantalla, una burbuja corta propone dos o tres preguntas de ese lugar (tabla CONTEXTOS). Aparece quieta o con un
     fundido suave, sin tomar el foco, se descarta con un toque (o con Escape) y no vuelve en la misma pantalla durante la sesión.
   - Tocar el botón o una sugerencia abre la ventana de chat. La ventana ES el aside #slot-ia de siempre: el motor, el historial y
     MT.ia.panel.abrir / cerrar / alternar son los de js/ia.js, así que los casos, el modo presentación y «Pedir ideas a Niky» siguen
     funcionando sin cambios. Aquí solo se pone el botón, se eligen las preguntas y se cuida el estado (aria-expanded, emoción).

   Qué NO hace: no suena, no se mueve solo, no escribe sin que la persona toque, y no promete lo que hoy no existe: las respuestas son de
   ejemplo y la ventana lo dice (sello «Respuesta de ejemplo»). Niky propone; decide la persona.

   Ganchos para otras partes (todo opcional):
     MT.niky.emocion('celebra' | 'duda' | ..., ms)       cambia un momento la cara del botón (por ejemplo, tras un acierto en un quiz)
     window.dispatchEvent(new CustomEvent('mt-niky-emocion', { detail: { emocion: 'celebra', ms: 3000 } }))   lo mismo, sin depender de este módulo
     MT.niky.sugerencias()                                lo que se propone en esta pantalla (lo usa MT.ia.panel.sugerenciasPara) */
(function (MT) {
  'use strict';
  const { h } = MT.ui;

  /* ---------------------------------------------------------------- qué se propone y dónde
     Cada contexto: un saludo y las preguntas que la persona puede tocar. `texto` es lo que se envía como primera pregunta;
     `tarea` elige la respuesta de ejemplo (ver js/ia.js). Son borradores de voz por aprobar: están todos aquí, juntos, para revisarlos. */
  const CONTEXTOS = {
    inicio: {
      saludo: 'Hola, soy Niky. Puedo contarte qué es esto o ayudarte a elegir por dónde empezar.',
      sugerencias: [
        { etiqueta: '¿Qué es esto?', texto: '¿Qué es Sinapsis Education?', tarea: 'que-es' },
        { etiqueta: '¿Por dónde empiezo?', texto: '¿Por dónde empiezo?', tarea: 'empezar' },
      ],
    },
    aula: {
      saludo: '¿Te ayudo con una actividad o con los apoyos de un estudiante?',
      sugerencias: [
        { etiqueta: '¿Cómo ajusto una actividad?', texto: '¿Cómo ajusto una actividad a los apoyos de un estudiante?', tarea: 'ajustar' },
        { etiqueta: '¿Qué apoyos tiene un estudiante?', texto: '¿Qué apoyos tiene un estudiante y cómo los uso?', tarea: 'apoyos' },
        { etiqueta: 'Diseñar una actividad', texto: 'Necesito una actividad de 20 minutos para enseñar el present simple a grado 8.º.', tarea: 'disenar' },
      ],
    },
    orientacion: {
      saludo: '¿Quieres revisar un ajuste o preparar cómo contarlo?',
      sugerencias: [
        { etiqueta: '¿Qué apoyos tiene un estudiante?', texto: '¿Qué apoyos tiene un estudiante y cómo los uso?', tarea: 'apoyos' },
        { etiqueta: '¿Qué reviso antes de aprobar?', texto: '¿Qué reviso antes de aprobar un ajuste?', tarea: 'revisar' },
        { etiqueta: '¿Cómo lo explico a la familia?', texto: '¿Cómo le explico este ajuste a la familia?', tarea: 'explicar-familia' },
      ],
    },
    familia: {
      saludo: '¿Quieres entender un ajuste o saber cómo acompañar en casa?',
      sugerencias: [
        { etiqueta: '¿Qué significa este ajuste?', texto: '¿Qué significa el ajuste que recibió mi estudiante?', tarea: 'explicar-familia' },
        { etiqueta: '¿Cómo acompaño en casa?', texto: '¿Cómo puedo acompañar en casa?', tarea: 'casa' },
      ],
    },
    estudiante: {
      saludo: '¿Algo se te hizo difícil? Cuéntame y lo miramos juntos.',
      sugerencias: [
        { etiqueta: 'No entiendo esta actividad', texto: 'No entiendo cuándo se le pone la s al verbo.', tarea: 'ayuda' },
        { etiqueta: 'Dame una pista', texto: 'Dame una pista, sin la respuesta.', tarea: 'pista' },
        { etiqueta: '¿Cómo voy?', texto: '¿Cómo voy en mi ruta?', tarea: 'progreso' },
      ],
    },
    portales: {
      saludo: 'Aquí están los tres portales. ¿Te cuento qué hace cada uno?',
      sugerencias: [
        { etiqueta: '¿Qué hace cada portal?', texto: '¿Qué hace cada portal?', tarea: 'portales' },
        { etiqueta: '¿Por dónde empiezo?', texto: '¿Por dónde empiezo?', tarea: 'empezar' },
      ],
    },
    mapa: {
      saludo: 'Este mapa muestra cómo se conecta todo. ¿Te ayudo a leerlo?',
      sugerencias: [
        { etiqueta: '¿Qué es cada parte?', texto: '¿Qué es cada parte del mapa?', tarea: 'mapa' },
        { etiqueta: '¿Qué funciona hoy?', texto: '¿Qué funciona hoy y qué todavía no?', tarea: 'estado' },
      ],
    },
    planes: {
      saludo: '¿Tienes dudas sobre cómo participar?',
      sugerencias: [
        { etiqueta: '¿Qué es cada forma de participar?', texto: '¿Qué es cada forma de participar?', tarea: 'planes' },
        { etiqueta: '¿Qué es un piloto?', texto: '¿Qué se hace en un piloto?', tarea: 'piloto' },
      ],
    },
    pagina: {
      saludo: '¿Hay algo de esta pantalla que quieras entender mejor?',
      sugerencias: [
        { etiqueta: '¿Qué puedo hacer aquí?', texto: '¿Qué puedo hacer en esta pantalla?', tarea: 'pantalla' },
        { etiqueta: '¿Por dónde empiezo?', texto: '¿Por dónde empiezo?', tarea: 'empezar' },
      ],
    },
  };

  /* Dónde estás: de la ruta (#/mi/resumen, #/portales/wisfox...) y del rol sale un contexto. Devuelve null si ahí Niky ya está a la
     vista (la pantalla de Niky es su propio chat): el botón sigue, pero no se ofrece una burbuja que repetiría lo que ya se ve. */
  const ESTUDIANTE = new Set(['estudiante']);
  const ORIENTACION = new Set(['orientacion']);
  function dondeEstoy() {
    const partes = (window.location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    const id = partes[0] || 'inicio';
    const sub = partes[1] || '';
    const rol = (MT.store && MT.store.obtener().rol) || '';
    const delRol = (r) => (ESTUDIANTE.has(r) ? 'estudiante' : ORIENTACION.has(r) ? 'orientacion' : r === 'familia' ? 'familia' : 'aula');
    let contexto;
    let portal = null;
    if (id === 'inicio') contexto = 'inicio';
    else if (id === 'valeria') contexto = null;
    else if (id === 'portales') {
      if (sub === 'valeria') contexto = null;
      else if (sub === 'wisfox') { contexto = 'estudiante'; portal = 'wisfox'; }
      else if (sub === 'kinesis') { contexto = rol ? delRol(rol) : 'aula'; portal = 'kinesis'; }
      else contexto = 'portales';
    } else if (id === 'mi') contexto = rol ? delRol(rol) : 'inicio';
    else if (id === 'guia') contexto = sub && sub !== 'inicio' ? delRol(sub) : 'pagina';
    else if (id === 'mapa') contexto = 'mapa';
    else if (id === 'planes' || id === 'registro') contexto = 'planes';
    else contexto = 'pagina';
    return { id: contexto, portal, clave: id + '/' + sub + '|' + rol };
  }

  /* Las sugerencias de la pantalla. Si hay un caso activo (exposición guiada), sus preguntas van primero: son las que cuenta la historia.
     Se completan con las del contexto hasta tres, sin repetir. */
  function sugerencias() {
    const d = dondeEstoy();
    if (!d.id) return null;
    const rol = MT.store.obtener().rol;
    const propias = (CONTEXTOS[d.id] || CONTEXTOS.pagina).sugerencias;
    const delCaso = (MT.casos && MT.casos.sugerencias(rol)) || [];
    const vistas = new Set(delCaso.map((s) => s.etiqueta));
    return delCaso.concat(propias.filter((s) => !vistas.has(s.etiqueta))).slice(0, 3);
  }

  function saludo() {
    const d = dondeEstoy();
    if (!d.id) return null;
    // Si la narrativa tiene una línea para este portal, esa voz manda; si no, el saludo de la tabla.
    let linea = null;
    try { linea = d.portal && MT.narrativa && MT.narrativa.linea('portal:' + d.portal); } catch (e) { linea = null; }
    return { texto: (linea && linea.texto) || CONTEXTOS[d.id].saludo, emocion: (linea && linea.emocion) || 'curioso' };
  }

  /* ---------------------------------------------------------------- el botón y la burbuja */
  const NOMBRE_BOTON = 'Hablar con Niky, la guía con IA';
  let raiz = null; let boton = null; let burbuja = null; let temporizador = null; let calma = null;
  let emocionBase = 'contento';

  function avatar(emocion) {
    try { return MT.mascotas.mascota('niky', { tamano: 56, emocion }); } catch (e) { return h('span', { class: 'niky-boton__inicial', 'aria-hidden': 'true' }, 'N'); }
  }
  function pintarAvatar(emocion) {
    if (!boton) return;
    const cuenta = boton.querySelector('.niky-boton__cuenta');   // el contador de sin leer sobrevive al cambio de cara
    boton.replaceChildren(avatar(emocion));
    if (cuenta) boton.append(cuenta);
    boton.dataset.emocion = emocion;
  }
  // Un momento de otra cara y de vuelta a la de reposo; así el botón acompaña sin quedarse "atascado" en una emoción.
  function emocion(nombre, ms) {
    pintarAvatar(nombre);
    clearTimeout(calma);
    if (ms) calma = setTimeout(() => pintarAvatar(emocionBase), ms);
    else emocionBase = nombre;
  }

  const ventanaAbierta = () => { const s = document.getElementById('slot-ia'); return !!s && !s.hidden; };
  const bloqueado = () => ventanaAbierta() || document.documentElement.dataset.presentacion === 'activa' || document.documentElement.hasAttribute('data-amplio');

  const claveVistas = 'sinapsis.niky.burbujas';
  const vistas = new Set();
  try { JSON.parse(sessionStorage.getItem(claveVistas) || '[]').forEach((k) => vistas.add(k)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ }
  function recordar(k) { vistas.add(k); try { sessionStorage.setItem(claveVistas, JSON.stringify([...vistas])); } catch (e) { /* idem */ } }

  function ocultarBurbuja(devolverFoco) {
    clearTimeout(temporizador);
    if (!burbuja) return;
    const teniaFoco = burbuja.contains(document.activeElement);
    burbuja.hidden = true;
    burbuja.replaceChildren();
    if (boton && !ventanaAbierta()) emocion('contento');
    if (teniaFoco && devolverFoco !== false && boton) boton.focus();
  }

  function abrirCon(s) {
    ocultarBurbuja(false);
    MT.ia.panel.abrir(s ? { texto: s.texto, tarea: s.tarea } : undefined);
  }

  function mostrarBurbuja() {
    if (!burbuja || bloqueado()) return;
    const d = dondeEstoy();
    if (!d.id || vistas.has(d.clave)) return;
    const s = saludo(); const lista = sugerencias();
    if (!s || !lista || !lista.length) return;
    recordar(d.clave);
    burbuja.replaceChildren(
      h('div', { class: 'niky-burbuja__cab' },
        h('strong', null, 'Niky'),
        h('button', { class: 'niky-burbuja__cerrar', type: 'button', 'aria-label': 'Descartar las sugerencias de Niky', onclick: () => ocultarBurbuja(true) }, '×')),
      h('p', { class: 'niky-burbuja__texto' }, s.texto),
      h('div', { class: 'niky-burbuja__opciones' }, lista.map((x) =>
        h('button', { class: 'niky-burbuja__opcion', type: 'button', onclick: () => abrirCon(x) }, x.etiqueta))));
    burbuja.hidden = false;
    // Reinicia el fundido de aparición aunque la burbuja anterior se haya quitado hace poco.
    burbuja.classList.remove('niky-burbuja--entra'); void burbuja.offsetWidth; burbuja.classList.add('niky-burbuja--entra');
    emocion(s.emocion);
  }

  // Tras cada cambio de pantalla se quita la burbuja anterior y, un momento después, se ofrece la de la pantalla nueva.
  // La demora deja que el router termine de pintar y lleve el foco al título: la burbuja nunca compite con eso.
  function programar() {
    ocultarBurbuja(false);
    clearTimeout(temporizador);
    if (bloqueado()) return;
    // En celular la burbuja no aparece sola: taparía el botón «Empezar», los formularios y los «Siguiente». Quien la quiere toca el botón de Niky.
    if (window.matchMedia('(max-width: 860px)').matches) return;
    temporizador = setTimeout(mostrarBurbuja, 1100);
  }

  function construir() {
    if (raiz) return;
    boton = h('button', { class: 'niky-boton', id: 'niky-fab', type: 'button', 'aria-label': NOMBRE_BOTON, 'aria-haspopup': 'dialog', 'aria-controls': 'slot-ia', 'aria-expanded': 'false',
      onclick: () => MT.ia.panel.alternar() });
    burbuja = h('div', { class: 'niky-burbuja', id: 'niky-burbuja', role: 'group', 'aria-label': 'Sugerencias de Niky', hidden: true });
    burbuja.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); ocultarBurbuja(true); } });
    raiz = h('div', { class: 'niky', id: 'niky' }, burbuja, boton);
    // Justo antes de la ventana: el orden del teclado queda burbuja, botón, ventana.
    const ventana = document.getElementById('slot-ia');
    if (ventana && ventana.parentNode) ventana.parentNode.insertBefore(raiz, ventana); else document.body.append(raiz);
    pintarAvatar(emocionBase);

    // La ventana la abren y cierran muchas partes (el botón, los casos, el modo presentación): se observa su atributo hidden
    // en vez de depender de quién la llamó, para que el botón diga siempre la verdad (aria-expanded) y la burbuja se aparte.
    if (ventana) {
      new MutationObserver(() => {
        const abierta = ventanaAbierta();
        boton.setAttribute('aria-expanded', String(abierta));
        if (abierta) { ocultarBurbuja(false); emocion('contento'); } else if (!bloqueado()) programar();
      }).observe(ventana, { attributes: true, attributeFilter: ['hidden'] });
    }
    // El modo presentación y el modo amplio lo esconden con CSS; aquí solo se retira la burbuja pendiente.
    new MutationObserver(() => { if (bloqueado()) ocultarBurbuja(false); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-presentacion', 'data-amplio'] });

    /* La cara del botón la mueve js/ia.js mientras conversa (piensa, celebra, duda). Aquí solo se cuida el contador de respuestas sin leer:
       un número discreto sobre el botón que cuenta las pestañas con respuesta nueva. Va dentro del propio botón para que el lector de
       pantalla lo diga en su nombre («2 respuestas nuevas»). */
    if (MT.store && MT.store.suscribir) {
      let contado = -1;
      const contar = (s) => {
        const n = MT.ia && MT.ia.sesiones ? MT.ia.sesiones.sinLeer(s) : 0;
        if (n === contado) return;
        contado = n;
        const previa = boton.querySelector('.niky-boton__cuenta');
        if (previa) previa.remove();
        if (n > 0) boton.append(h('span', { class: 'niky-boton__cuenta', 'aria-hidden': 'true' }, String(n)));
        boton.setAttribute('aria-label', NOMBRE_BOTON + (n > 0 ? ' (' + n + (n === 1 ? ' respuesta nueva' : ' respuestas nuevas') + ')' : ''));
      };
      MT.store.suscribir(contar);
      contar(MT.store.obtener());
    }
    window.addEventListener('mt-niky-emocion', (e) => { if (e.detail && e.detail.emocion) emocion(e.detail.emocion, e.detail.ms || 3000); });
  }

  function iniciar() {
    construir();
    window.addEventListener('hashchange', programar);
    // Cuando cambia el rol sin cambiar de ruta (se elige «Soy docente» en #/mi), la burbuja debe seguir al rol nuevo.
    if (MT.store && MT.store.suscribir) {
      let rolAntes = MT.store.obtener().rol;
      MT.store.suscribir((s) => { if (s.rol !== rolAntes) { rolAntes = s.rol; programar(); } });
    }
    programar();
  }

  /* Niky como la única IA de los portales. Kinesis y Wisfox son aplicaciones aparte, dentro de un marco: cuando una persona toca allí «apoyo con IA»,
     la aplicación avisa a la plataforma con un mensaje y es Niky quien abre la conversación. Contrato acordado con el equipo de Kinesis:
       window.parent.postMessage({ tipo: 'niky:abrir', portal: 'kinesis' | 'wisfox', tarea: '<id corto>', contexto: '<texto>' | { rol, pantalla, borrador } }, 'https://profenapaipa.github.io')
     Solo se atienden mensajes de ese origen, del tipo exacto y de un portal conocido; el texto se recorta y nunca se ejecuta ni se inserta como HTML. */
  const ORIGEN_PORTALES = 'https://profenapaipa.github.io';
  const TAREAS_PORTAL = {
    'ordenar-nota-bitacora': (c) => 'Ayúdame a ordenar esta nota de bitácora' + (c ? ': ' + c : '.'),
    'ajustar-actividad': (c) => 'Ayúdame a ajustar esta actividad' + (c ? ': ' + c : '.'),
    'pista': (c) => 'Dame una pista' + (c ? ' sobre: ' + c : '.'),
    'explicar': (c) => 'Explícame esto con otras palabras' + (c ? ': ' + c : '.'),
  };
  function alMensajeDePortal(e) {
    if (e.origin !== ORIGEN_PORTALES) return;
    const d = e.data;
    if (!d || typeof d !== 'object' || d.tipo !== 'niky:abrir' || !['kinesis', 'wisfox'].includes(d.portal)) return;
    const tarea = typeof d.tarea === 'string' ? d.tarea.slice(0, 60) : '';
    const c = d.contexto;
    const contexto = (typeof c === 'string' ? c : c && typeof c === 'object' && typeof c.borrador === 'string' ? c.borrador : '').replace(/\s+/g, ' ').trim().slice(0, 200);
    const armar = TAREAS_PORTAL[tarea];
    ocultarBurbuja(false);
    // Cada tarea del portal tiene su pestaña: la misma tarea reutiliza la suya y otra tarea abre una nueva (máximo 5).
    const id = tarea.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'general';
    MT.ia.panel.abrir({ texto: armar ? armar(contexto) : (contexto || 'Necesito ayuda con esta pantalla.'), tarea: 'general', sesion: { id } });
  }
  window.addEventListener('message', alMensajeDePortal);

  MT.niky = { CONTEXTOS, dondeEstoy, sugerencias, saludo, emocion, ocultarBurbuja, mostrarBurbuja };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(window.MT = window.MT || {});
