/* ia.js: Niky, con un lugar fijo donde mostrarse y un solo punto de conexión.

   Dos piezas:
   - El adaptador (preguntar): hoy responde con textos de ejemplo. Cuando haya un servidor
     con un modelo, el mismo método lo llama y nada más cambia.
   - El lugar (chat y panel): el chat vive en la página de Niky y también en un panel que se
     abre desde cualquier espacio. Ambos leen el mismo historial, así la conversación no se pierde
     al cambiar de pantalla.

   Qué se envía al modelo cuando exista: solo la petición escrita (con tope de longitud) y,
   para "ajustar", el texto de la actividad. El perfil del estudiante NO viaja desde aquí: lo
   arma el servidor con datos ficticios. */
(function (MT) {
  'use strict';
  const { h, ricoTexto, marca } = MT.ui;
  const cfg = MT.iaConfig || { proveedor: 'simulado' };
  const info = { modo: 'simulado', modelo: null, listo: false };

  const demora = (ms) => new Promise((r) => setTimeout(r, ms));
  const emitir = () => window.dispatchEvent(new CustomEvent('mt-ia-modo'));

  /* ¿Vale la pena preguntar por /api/estado? En GitHub Pages y desde el disco no hay servidor y la pregunta solo deja un 404 en la consola
     (QA-22), justo donde alguien podría mirar durante la muestra. En el servidor del piloto o en un localhost sí se pregunta. */
  const puedeHaberServidor = (host, protocolo) => protocolo !== 'file:' && !/\.github\.io$/.test(host || '');

  async function detectar() {
    if (cfg.proveedor !== 'simulado' && (cfg.base || puedeHaberServidor(window.location.hostname, window.location.protocol))) {
      try {
        const r = await fetch((cfg.base || '') + '/api/estado', { signal: AbortSignal.timeout(cfg.deteccion || 2500) });
        if (r.ok) {
          const d = await r.json();
          if (d && d.ia) { info.modo = 'servidor'; info.modelo = d.modelo || null; }
        }
      } catch (e) { /* sin servidor: se queda en ejemplo */ }
    }
    info.listo = true;
    emitir();
  }

  // El servidor limita el texto; se recorta aquí también para no mandar de más.
  // iafuente: los topes son los del servidor (ESPECIFICACION_FRENTE): 300 por defecto, 2500 para ajustar, orientar y familia, y 1200 para coordinar.
  // Con un solo tope de 300 las tareas largas llegaban truncadas.
  const TOPE = { ajustar: 2500, orientar: 2500, familia: 2500, coordinar: 1200 };
  const recortar = (tarea, texto) => String(texto || '').replace(/\s+/g, ' ').trim().slice(0, TOPE[tarea] || 300);

  /* Respuestas de ejemplo para las preguntas que Niky propone en cada pantalla (js/niky.js). Son textos preparados, no un modelo: el chat
     lo dice con su sello «Respuesta de ejemplo». Van aquí y no en datos.js porque los casos de la exposición reescriben respuestasIA al
     cargarse, y estas deben seguir ahí. Voz: cercana, sin promesas; Niky propone y decide quien enseña. Borradores por aprobar. */
  const RESPUESTAS_GUIA = {
    'que-es': '**Sinapsis Education** es una plataforma para que un aula aprenda de forma inclusiva. Reúne tres partes que se pasan el trabajo entre sí: **Kinesis** (el aula: docentes, orientación y familias), **Wisfox** (el estudiante practica a su ritmo) y **yo, Niky**, la guía que propone ideas y resuelve dudas.\n\nHoy se puede recorrer con datos de ejemplo. Nada de lo que ves aquí son datos reales.',
    empezar: 'Una forma sencilla de empezar:\n\n- Si enseñas o acompañas, elige **tu rol** y mira el resumen de tu espacio.\n- Si quieres entender el conjunto, abre el **Mapa**: muestra cómo se conecta todo.\n- Si te gusta ver un caso completo, sigue la **guía de inicio rápido** de tu rol.\n\nNo hay un orden obligatorio: puedes volver cuando quieras.',
    apoyos: 'Cada estudiante tiene un **perfil de apoyos**: lo que le ayuda a participar, por ejemplo letra grande, más tiempo o instrucciones con imágenes. En la lista de estudiantes verás los apoyos, **sin diagnósticos**, y en el ajuste de una actividad cada apoyo se vuelve un cambio concreto. Tú decides cuáles usar.',
    revisar: 'Antes de aprobar un ajuste, mira tres cosas:\n\n- Que cada cambio **responda a un apoyo** del perfil.\n- Que la razón esté escrita de forma que la familia la entienda.\n- Que el estudiante pueda hacer la misma actividad de fondo.\n\nSi algo no te convence, devuélvelo con una nota. Yo solo propongo; decide quien acompaña.',
    'explicar-familia': 'Una forma de contarlo a la familia, en tres pasos:\n\n- **Qué cambió:** el ajuste, dicho con palabras simples.\n- **Por qué:** el apoyo que lo motivó, sin mencionar diagnósticos.\n- **Cómo ayudar:** una acción pequeña que se puede hacer en casa.\n\nPuedes cambiar el tono: conoces mejor que yo a esa familia.',
    casa: 'Algunas ideas para acompañar en casa: pídele que **te cuente con sus palabras** lo que hizo, celebra el esfuerzo y no solo el resultado, y deja que use los apoyos que ya usa en clase. Si tienes dudas, escríbele al colegio: yo propongo ideas, el equipo que lo conoce decide.',
    pista: 'Una pista, sin la respuesta:\n\n- Vuelve a leer la pregunta y **subraya la palabra clave**.\n- Piensa en un ejemplo parecido que ya hayas visto.\n- Intenta con tus palabras y luego compara.\n\nSi todavía no sale, dime qué parte se te hace difícil y la miramos juntos.',
    progreso: 'En tu ruta puedes ver lo que ya hiciste y lo que sigue. Avanzas a tu ritmo: lo importante es lo que vas aprendiendo, no la velocidad. Si algo se te quedó difícil, puedes repetirlo y pedirme ayuda.',
    portales: 'Cada portal tiene su lugar:\n\n- **Kinesis:** el aula. Docentes planean y ajustan, orientación revisa y la familia se entera.\n- **Wisfox:** el estudiante recibe su actividad a la medida y practica.\n- **Niky:** soy yo, y acompaño a los dos con ideas y ayuda.\n\nSe pasan el trabajo entre sí, por eso se ven juntos.',
    mapa: 'El mapa tiene tres columnas, una por cada parte (Kinesis, Niky y Wisfox), con sus módulos. Las flechas muestran **qué viaja de una parte a otra**. Toca un módulo para ver qué hace y quién lo usa, y mira la etiqueta: dice si **funciona hoy**, si es un ejemplo o si todavía viene.',
    estado: 'El mapa lo dice módulo por módulo: unos **funcionan hoy**, otros están **en integración**, otros responden con **ejemplos** (como yo) y otros **vienen**. La etiqueta de cada uno es la fuente más fiable. Debajo de cada respuesta de la conversación libre dice de dónde viene: ejemplo, respaldo o en vivo.',
    planes: 'Cada forma de participar describe qué incluye y qué todavía se está validando. Léelas con calma y compara con lo que tu colegio necesita. Yo no cierro acuerdos ni hago ofertas: eso lo conversan personas, en la sección de piloto.',
    piloto: 'Un piloto es un **primer recorrido acompañado** en un colegio, paso a paso y sin datos reales hasta que todo esté en regla. Sirve para probar, escuchar y ajustar antes de decidir nada. Los detalles se conversan con el equipo, en la sección de piloto.',
    pantalla: 'Esta pantalla forma parte de la plataforma. Mira el título, lee la descripción de arriba y usa el menú para moverte. Si te pierdes, el **inicio** siempre está a un toque. Si quieres, dime qué buscas y te sugiero adónde ir.',
  };

  /* iafuente: respuestas PREPARADAS del servidor. Durante el tutorial guiado los pasos no deben gastar cuota ni depender de Gemini: con un codigo
     valido ('<rol>-<n>') y la tarea que le corresponde, POST /api/valeria responde al instante {fuente:'ejemplo'} sin llamar a ningun modelo.
     La tarea esperada de cada codigo sale de 02_Piloto/app/ejemplos-preparados.json (aqui copiada: si cambia alla, cambia aqui). */
  const EJEMPLO_TAREA = {
    docente: ['disenar', 'ajustar', 'ayuda', 'orientar', 'familia'], orientacion: ['orientar', 'coordinar', 'familia', 'orientar', 'coordinar'],
    familia: ['familia', 'familia', 'ayuda', 'familia', 'familia'], coordinacion: ['coordinar', 'coordinar', 'coordinar', 'coordinar', 'coordinar'],
    estudiante: ['ayuda', 'ayuda', 'ayuda', 'ayuda', 'ayuda'],
  };
  // Los casos del guion del servidor (1 Tecnologia, 2 Ingles, 3 Matematicas, 4 Ciencias naturales, 5 Lengua) frente a los de la plataforma (n -> n del servidor).
  // Ciencias sociales (5 de la plataforma) no esta en el guion del servidor: ahi se usan los textos propios de casos.js.
  const CASO_DEL_SERVIDOR = { 1: 2, 2: 3, 3: 4, 4: 5, 6: 1 };
  function codigoDeEjemplo(tarea) {
    const t = MT.tutorial && MT.tutorial.estado;
    if (!t || !t.activo) return null;
    const n = CASO_DEL_SERVIDOR[t.caso]; const tareas = EJEMPLO_TAREA[t.rol];
    // Solo los pedidos del guion (una tarea con nombre); lo que la persona escribe en la caja libre viaja como «general» y va al modelo.
    // Antes se exigía que la tarea pedida coincidiera con la del catálogo, y el paso de Niky del docente (siempre «disenar») se quedaba sin
    // respuesta preparada en los casos 1 a 4 (el catálogo espera ajustar, ayuda, orientar o familia): iba a Gemini y gastaba cuota.
    return n && tareas && tarea && tarea !== 'general' ? t.rol + '-' + n : null;
  }
  // La tarea que el servidor exige para un código preparado (la del catálogo), que es la que se envía con ese código.
  const tareaDeEjemplo = (codigo) => { const [rol, n] = String(codigo || '').split('-'); return (EJEMPLO_TAREA[rol] || [])[Number(n) - 1] || null; };

  async function preguntar({ tarea, texto }) {
    const limpio = recortar(tarea, texto);
    if (info.modo === 'servidor') {
      try {
        // iafuente: disenar y ajustar pueden tardar hasta 20 s en el peor caso (el servidor reintenta una vez si Gemini se cuelga; lo normal son 2 s).
        // Con el tope de 10 s se veria el texto de ejemplo aunque la IA habria respondido. Mientras tanto el chat muestra «Niky esta pensando…».
        const espera = ['disenar', 'ajustar'].includes(tarea) ? Math.max(cfg.espera || 0, 22000) : (cfg.espera || 8000);
        // Perfil: el codigo del estudiante del caso en pantalla (8A-NN). El servidor arma de ahi el perfil de apoyos; el texto del perfil nunca viaja desde la pagina.
        const caso = MT.casos && MT.casos.activo ? MT.casos.activo() : null;
        const perfil = caso && /^8A-\d\d$/.test(caso.estudiante || '') && ['ajustar', 'ayuda', 'orientar', 'familia'].includes(tarea) ? caso.estudiante : null;
        const ejemplo = codigoDeEjemplo(tarea);   // solo dentro del tutorial guiado
        const r = await fetch((cfg.base || '') + '/api/valeria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // El servidor conoce seis tareas; las preguntas guía de las burbujas viajan como «general».
          body: JSON.stringify({ tarea: ejemplo ? tareaDeEjemplo(ejemplo) : ['disenar', 'ajustar', 'ayuda', 'orientar', 'familia', 'coordinar'].includes(tarea) ? tarea : 'general', texto: limpio, ...(perfil ? { perfil } : {}), ...(ejemplo ? { ejemplo } : {}) }),
          signal: AbortSignal.timeout(espera + 2000),
        });
        if (!r.ok) throw new Error('servidor ' + r.status);
        const d = await r.json();
        // iafuente: antes solo «gemini» contaba como en vivo (openclaw salía como «respaldo») y «filtro» pasaba por respuesta.
        return { fuente: ['openclaw', 'gemini'].includes(d.fuente) ? 'en vivo' : d.fuente === 'filtro' ? 'filtro' : d.fuente === 'ejemplo' ? 'ejemplo' : 'respaldo', texto: d.texto };
      } catch (e) { /* cae al ejemplo */ }
    }
    await demora(450);
    return { fuente: 'ejemplo', texto: MT.datos.respuestasIA[tarea] || RESPUESTAS_GUIA[tarea] || MT.datos.respuestasIA.general };
  }

  // Si la persona escribe libre, se adivina qué necesita. Cuando hay una tarea explícita, manda esa.
  function inferirTarea(texto) {
    if (/ajust|apoyo|perfil/i.test(texto)) return 'ajustar';
    if (/plane|actividad|clase|dise[ñn]/i.test(texto)) return 'disenar';
    if (/\b(s|does|verbo|present|simple|entiendo|ayuda)\b/i.test(texto)) return 'ayuda';
    return 'general';
  }

  /* ---------------------------------------------------------------- sesiones: una conversación por tarea
     El estado guarda s.ia = { sesiones: [{ id, titulo, tarea, mensajes, nuevo }], activa }. Antes era solo la lista de mensajes; como hay
     estados viejos en el navegador de la gente (y como js/casos.js todavía hace `s.ia = []` para empezar limpio), TODA lectura pasa por
     sesionesDe(s): si encuentra la forma antigua o nada, la convierte sin perder mensajes (pasan a la primera sesión, «Conversación»). */
  const MAX_SESIONES = 5;
  const MAX_MENSAJES = 30;
  const idNuevo = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const TITULOS = {
    'ordenar-nota-bitacora': 'Ordenar nota de bitácora', 'ajustar-actividad': 'Ajustar actividad', pista: 'Pista', explicar: 'Explicar',
    general: 'Duda libre', libre: 'Duda libre', ajustar: 'Ajustar actividad', disenar: 'Diseñar actividad', ayuda: 'Ayuda', apoyos: 'Apoyos',
    revisar: 'Revisar ajuste', 'explicar-familia': 'Explicar a la familia', casa: 'En casa', progreso: 'Mi ruta', portales: 'Portales',
    mapa: 'Mapa', estado: 'Estado', planes: 'Participar', piloto: 'Piloto', 'que-es': 'Qué es esto', empezar: 'Por dónde empezar', pantalla: 'Esta pantalla',
  };
  function tituloDe(tarea) {
    if (TITULOS[tarea]) return TITULOS[tarea];
    const t = String(tarea || '').replace(/[-_]+/g, ' ').trim();
    return t ? (t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 28) : 'Conversación';
  }
  const mensajesValidos = (l) => (Array.isArray(l) ? l.filter((m) => m && typeof m === 'object' && typeof m.texto === 'string') : []);

  function sesionesDe(s) {
    let ia = s.ia;
    if (Array.isArray(ia)) ia = s.ia = { sesiones: [{ id: idNuevo(), titulo: 'Conversación', tarea: null, mensajes: mensajesValidos(ia), nuevo: false }], activa: '' };
    else if (!ia || typeof ia !== 'object' || !Array.isArray(ia.sesiones)) ia = s.ia = { sesiones: [], activa: '' };
    ia.sesiones = ia.sesiones.filter((x) => x && typeof x === 'object').slice(0, MAX_SESIONES);
    for (const x of ia.sesiones) {
      if (typeof x.id !== 'string' || !x.id) x.id = idNuevo();
      x.titulo = typeof x.titulo === 'string' && x.titulo ? x.titulo.slice(0, 40) : 'Conversación';
      x.mensajes = mensajesValidos(x.mensajes);
      x.tarea = typeof x.tarea === 'string' && x.tarea ? x.tarea : null;
      x.nuevo = !!x.nuevo;
    }
    if (!ia.sesiones.length) ia.sesiones.push({ id: idNuevo(), titulo: 'Conversación', tarea: null, mensajes: [], nuevo: false });
    if (!ia.sesiones.some((x) => x.id === ia.activa)) ia.activa = ia.sesiones[0].id;
    return ia;
  }
  const sesionActiva = (s) => { const ia = sesionesDe(s); return ia.sesiones.find((x) => x.id === ia.activa); };
  const hayMensajes = (s) => sesionesDe(s).sesiones.some((x) => x.mensajes.length > 0);
  const sinLeer = (s) => sesionesDe(s).sesiones.filter((x) => x.nuevo).length;

  /* Borradores y posición de lectura de cada pestaña. Viven en memoria (no en el estado guardado): un borrador a medias no vale la pena
     escribirlo en cada pulsación, y al recargar la página se parte limpio. Se podan cuando la pestaña desaparece. */
  const memoria = new Map();
  const recuerdo = (id) => { if (!memoria.has(id)) memoria.set(id, { borrador: '', scroll: null }); return memoria.get(id); };
  const ocupadas = new Set();         // sesiones esperando respuesta
  let chatsSueltos = 0;               // chats montados fuera de la ventana (la pantalla propia de Niky): ahí la respuesta ya se está viendo

  const aviso = (texto) => window.dispatchEvent(new CustomEvent('mt-ia-aviso', { detail: { texto } }));
  const cara = (emocion, ms) => { try { if (MT.niky && MT.niky.emocion) MT.niky.emocion(emocion, ms); } catch (e) { /* sin botón: no pasa nada */ } };

  /* Abre o reutiliza la pestaña de una tarea. `tarea` es la clave (la misma tarea siempre cae en la misma pestaña), `titulo` es opcional.
     Si ya hay 5 y la tarea es nueva, el mensaje va a la pestaña activa: es mejor eso que borrar la conversación de alguien. */
  function asegurarSesion({ tarea, titulo } = {}) {
    let id = null;
    MT.store.cambiar((s) => {
      const ia = sesionesDe(s);
      const clave = tarea || null;
      let x = clave && ia.sesiones.find((y) => y.tarea === clave);
      if (!x && clave) {
        // La conversación vacía sin tarea (la de siempre al abrir por primera vez) se aprovecha en vez de dejarla huérfana.
        const vacia = ia.sesiones.length === 1 && !ia.sesiones[0].tarea && !ia.sesiones[0].mensajes.length ? ia.sesiones[0] : null;
        if (vacia) { x = vacia; x.tarea = clave; x.titulo = (titulo || tituloDe(clave)).slice(0, 40); }
        else if (ia.sesiones.length < MAX_SESIONES) { x = { id: idNuevo(), titulo: (titulo || tituloDe(clave)).slice(0, 40), tarea: clave, mensajes: [], nuevo: false }; ia.sesiones.push(x); }
        else aviso('Ya hay ' + MAX_SESIONES + ' pestañas. Cierra una para abrir otra; esta pregunta va a la pestaña actual.');
      }
      if (!x) x = ia.sesiones.find((y) => y.id === ia.activa);
      ia.activa = x.id; x.nuevo = false; id = x.id;
    });
    return id;
  }
  function nuevaSesion() {
    let id = null;
    MT.store.cambiar((s) => {
      const ia = sesionesDe(s);
      if (ia.sesiones.length >= MAX_SESIONES) { aviso('Ya hay ' + MAX_SESIONES + ' pestañas. Cierra una para abrir otra.'); id = ia.activa; return; }
      const x = { id: idNuevo(), titulo: 'Duda libre', tarea: null, mensajes: [], nuevo: false };
      ia.sesiones.push(x); ia.activa = x.id; id = x.id;
    });
    return id;
  }
  function activarSesion(id) {
    MT.store.cambiar((s) => { const ia = sesionesDe(s); const x = ia.sesiones.find((y) => y.id === id); if (x) { ia.activa = id; x.nuevo = false; } });
  }
  function cerrarSesion(id) {
    MT.store.cambiar((s) => {
      const ia = sesionesDe(s);
      const i = ia.sesiones.findIndex((y) => y.id === id);
      if (i < 0 || ia.sesiones.length === 1) return;     // la última no se cierra: siempre queda dónde escribir
      ia.sesiones.splice(i, 1);
      if (ia.activa === id) { ia.activa = ia.sesiones[Math.min(i, ia.sesiones.length - 1)].id; ia.sesiones.find((y) => y.id === ia.activa).nuevo = false; }
    });
    memoria.delete(id); ocupadas.delete(id);
  }

  /* Una pregunta en una pestaña. `sesionId` se fija al enviar: si la persona cambia de pestaña mientras Niky responde, la respuesta llega
     a la pestaña donde se preguntó, no a la que se esté viendo. */
  async function consultar(texto, tareaForzada, sesionId) {
    const st = MT.store;
    const tarea = tareaForzada || inferirTarea(texto);
    const sid = sesionId || sesionActiva(st.obtener()).id;
    let existe = true;
    st.cambiar((s) => {
      const x = sesionesDe(s).sesiones.find((y) => y.id === sid);
      if (!x) { existe = false; return; }
      x.mensajes.push({ rol: 'yo', texto }); if (x.mensajes.length > MAX_MENSAJES) x.mensajes.shift();
      ocupadas.add(sid);
    });
    if (!existe) return null;
    cara('pensando');
    let respuesta; let fallo = false;
    try {
      if (tarea === 'general') {
        await demora(350);
        respuesta = { fuente: info.modo === 'servidor' ? 'respaldo' : 'ejemplo', texto: MT.datos.respuestasIA.general };
      } else {
        const base = tarea === 'ajustar' ? (st.obtener().actividad || texto) : texto;
        respuesta = await preguntar({ tarea, texto: base });
      }
    } catch (e) {
      fallo = true;
      respuesta = { fuente: 'respaldo', texto: 'No pude responder ahora. Intenta de nuevo en un momento.' };
    }
    ocupadas.delete(sid);
    st.cambiar((s) => {
      const ia = sesionesDe(s);
      const x = ia.sesiones.find((y) => y.id === sid);
      if (x) {
        x.mensajes.push({ rol: 'ia', texto: respuesta.texto, fuente: respuesta.fuente });
        if (x.mensajes.length > MAX_MENSAJES) x.mensajes.shift();
        // Una respuesta que nadie está viendo queda marcada: de ahí sale el contador del botón.
        x.nuevo = !(ia.activa === sid && (panel.abierto || chatsSueltos > 0));
      }
      MT.store.logro('ia');
      if (tarea === 'disenar') s.actividad = respuesta.texto;
    });
    // La cara del botón: duda si hubo error o respaldo; si no, celebra un momento y vuelve a reposo.
    if (fallo || respuesta.fuente === 'respaldo' || respuesta.fuente === 'filtro') { cara('contento'); cara('duda', 3500); }
    else { cara('contento'); cara('celebra', 2500); }
    return respuesta;
  }

  function chipModo() {
    return info.modo === 'servidor'
      ? h('span', { class: 'sello sello--ok' }, 'En vivo' + (info.modelo ? ' · ' + info.modelo : ''))
      : h('span', { class: 'sello sello--aviso' }, 'Simulada');
  }

  /* El chat. Se monta en cualquier contenedor y muestra la pestaña activa; cada instancia se suscribe al estado compartido.
     `opciones.enVentana` lo pone la ventana de Niky: quien monta el chat fuera de ella (la pantalla propia de Niky) cuenta como
     «viendo» las respuestas, y por eso no las marca como sin leer. */
  function montarChat(contenedor, sugerencias, opciones) {
    const st = MT.store;
    const enVentana = !!(opciones && opciones.enVentana);
    let mostrada = null;            // id de la pestaña pintada, para guardar su borrador y su posición al cambiar
    const estadoEl = h('div', { class: 'chat__estado' });
    const lista = h('div', { class: 'chat__mensajes', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversación con Niky' });
    const chips = h('div', { class: 'chat__sugerencias' });
    const campo = h('textarea', { rows: '2', maxlength: '300', 'aria-label': 'Escribe tu mensaje para Niky', 'aria-describedby': 'chat-aviso', placeholder: 'Escribe aquí lo que necesitas…' });
    const boton = h('button', { class: 'btn', type: 'submit' }, 'Enviar');
    const form = h('form', { class: 'chat__form', 'aria-label': 'Mensaje para Niky', onsubmit: (e) => { e.preventDefault(); mandar(campo.value); } }, campo, boton);
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mandar(campo.value); } });
    campo.addEventListener('input', () => { if (mostrada) recuerdo(mostrada).borrador = campo.value; });
    lista.addEventListener('scroll', () => {
      if (!mostrada) return;
      // Pegado al final se recuerda como «null»: así una pestaña que sigue recibiendo mensajes se queda abajo y no en una posición vieja.
      recuerdo(mostrada).scroll = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 8 ? null : lista.scrollTop;
    });

    async function mandar(texto, tarea) {
      const limpio = String(texto || '').trim();
      const sid = sesionActiva(st.obtener()).id;
      if (!limpio || ocupadas.has(sid)) return;
      campo.value = ''; recuerdo(sid).borrador = '';
      await consultar(limpio, tarea, sid);
    }

    function pintarEstado() {
      estadoEl.replaceChildren(chipModo(), h('span', { class: 'suave' },
        info.modo === 'servidor' ? 'Respuestas de un modelo de lenguaje.' : 'Respuestas de ejemplo. Se conectará a un modelo real.'));
    }
    function pintar(s) {
      const x = sesionActiva(s);
      if (mostrada !== x.id) {
        // Cambio de pestaña: se guarda el borrador de la anterior (ya se guarda al escribir) y se recupera el de la nueva.
        mostrada = x.id; campo.value = recuerdo(x.id).borrador;
      }
      const nodos = [];
      if (!x.mensajes.length) {
        nodos.push(h('div', { class: 'msg msg--ia' }, ricoTexto('Hola, soy **Niky**, la guía de ' + MT.nombre + '. Puedo ayudar al docente a diseñar una actividad y al estudiante a resolver sus dudas. Todo lo que respondo es una propuesta: decide quien enseña.')));
      }
      for (const m of x.mensajes) {
        nodos.push(h('div', { class: 'msg msg--' + m.rol }, ricoTexto(m.texto),
          m.rol === 'ia' && m.fuente ? h('small', null, m.fuente === 'ejemplo' ? 'Respuesta de ejemplo' : m.fuente === 'respaldo' ? 'Respuesta de respaldo' : m.fuente === 'filtro' ? 'Aviso de privacidad, no es una respuesta' : 'Generada en vivo') : null));
      }
      const ocupado = ocupadas.has(x.id);
      if (ocupado) nodos.push(h('div', { class: 'msg msg--ia' }, 'Niky está pensando…'));
      boton.disabled = ocupado;
      lista.replaceChildren(...nodos);
      const r = recuerdo(x.id);
      lista.scrollTop = r.scroll == null ? lista.scrollHeight : r.scroll;
    }
    function pintarChips() {
      chips.replaceChildren(...(sugerencias || []).map((sug) =>
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => mandar(sug.texto, sug.tarea) }, sug.etiqueta)));
    }

    const desuscribir = st.suscribir(pintar);
    const alModo = () => pintarEstado();
    window.addEventListener('mt-ia-modo', alModo);
    if (!enVentana) chatsSueltos++;

    contenedor.replaceChildren(h('div', { class: 'chat' }, estadoEl, lista, chips,
      h('p', { class: 'chat__aviso suave', id: 'chat-aviso' }, 'Todo es ficticio: no escribas datos personales reales.'), form));
    pintarEstado(); pintarChips(); pintar(st.obtener());

    return {
      enviar: mandar,
      foco: () => campo.focus(),
      destruir() { desuscribir(); window.removeEventListener('mt-ia-modo', alModo); if (!enVentana) chatsSueltos = Math.max(0, chatsSueltos - 1); },
    };
  }

  /* La ventana de Niky: el lugar fijo de la IA en todos los espacios. Sigue siendo el aside #slot-ia (así los casos, el modo presentación y
     los botones «Pedir ideas a Niky» no cambian), pero ahora es una ventana flotante y NO modal, junto al botón de js/niky.js: la persona
     puede seguir leyendo la pantalla mientras conversa. Arriba lleva las pestañas, una por tarea. El estilo está en css/niky.css. */
  const panel = {
    chat: null,
    abierto: false,
    quienAbrio: null,
    // Las sugerencias dependen de dónde estás (js/niky.js las elige por pantalla y rol y pone primero las del caso activo).
    // Sin ese módulo, o en la pantalla propia de Niky, se usan las de siempre.
    sugerenciasPara() {
      const propias = MT.niky && MT.niky.sugerencias && MT.niky.sugerencias();
      if (propias && propias.length) return propias;
      const rol = MT.store.obtener().rol;
      // En la exposición guiada las sugerencias son las del caso (asignatura y pregunta del estudiante).
      const delCaso = MT.casos && MT.casos.sugerencias(rol);
      if (delCaso) return delCaso;
      if (rol === 'docente') return [{ etiqueta: 'Diseñar una actividad de inglés', texto: 'Necesito una actividad de 20 minutos para enseñar el present simple a grado 8.º.', tarea: 'disenar' }];
      if (rol === 'estudiante') return [{ etiqueta: 'No entiendo la s del verbo', texto: 'No entiendo cuándo se le pone la s al verbo.', tarea: 'ayuda' }];
      return [{ etiqueta: 'Diseñar una actividad', texto: 'Necesito una actividad de 20 minutos para enseñar el present simple a grado 8.º.', tarea: 'disenar' },
              { etiqueta: 'Explicar la s del verbo', texto: 'No entiendo cuándo se le pone la s al verbo.', tarea: 'ayuda' }];
    },

    /* La barra de pestañas (WAI-ARIA tabs con activación al enfocar). Una pestaña es un botón role=tab; su «×» es un botón aparte, hermano,
       porque un botón dentro de otro no es válido. Solo la pestaña activa y su «×» están en el orden de Tab (roving tabindex): se entra con
       Tab, se recorre con las flechas, Inicio/Fin saltan a los extremos y Supr cierra. */
    construirPestanas() {
      const barra = h('div', { class: 'pestanas' });
      const lista = h('div', { class: 'pestanas__lista', role: 'tablist', 'aria-label': 'Tareas con Niky' });
      const mas = h('button', { class: 'pestanas__mas', type: 'button', 'aria-label': 'Nueva pestaña', title: 'Nueva pestaña', onclick: () => { nuevaSesion(); this.chat && this.chat.foco(); } }, '+');
      const anuncio = h('div', { class: 'solo-lectores', 'aria-live': 'polite', role: 'status' });
      barra.append(lista, mas, anuncio);
      const decir = (t) => { anuncio.textContent = ''; setTimeout(() => { anuncio.textContent = t; }, 30); };
      window.addEventListener('mt-ia-aviso', (e) => decir(e.detail.texto));

      const pintar = (s) => {
        const ia = sesionesDe(s);
        // Lo que ya no existe se olvida (borradores de pestañas cerradas o de un «Empezar de nuevo»).
        const vivas = new Set(ia.sesiones.map((x) => x.id));
        for (const k of [...memoria.keys()]) if (!vivas.has(k)) memoria.delete(k);
        const hadFoco = lista.contains(document.activeElement) ? document.activeElement : null;
        const enfocadaId = hadFoco ? (hadFoco.closest('[data-id]') || {}).dataset : null;
        lista.replaceChildren(...ia.sesiones.map((x) => {
          const activa = x.id === ia.activa;
          const t = h('button', { class: 'pestana' + (x.nuevo ? ' pestana--nueva' : ''), type: 'button', role: 'tab', id: 'pestana-' + x.id, 'aria-selected': String(activa),
            'aria-controls': 'cuerpo-ia', tabindex: activa ? '0' : '-1', title: x.titulo + (ia.sesiones.length > 1 ? ' (Supr cierra la pestaña)' : ''), onclick: () => activarSesion(x.id) },
            h('span', { class: 'pestana__texto' }, x.titulo),
            x.nuevo ? h('span', { class: 'pestana__punto', 'aria-hidden': 'true' }) : null,
            x.nuevo ? h('span', { class: 'solo-lectores' }, '(respuesta nueva)') : null);
          const c = ia.sesiones.length > 1
            ? h('button', { class: 'pestana__cerrar', type: 'button', 'aria-label': 'Cerrar la pestaña ' + x.titulo, tabindex: activa ? '0' : '-1', onclick: () => {
              const i = ia.sesiones.findIndex((y) => y.id === x.id); const vecina = ia.sesiones[i + 1] || ia.sesiones[i - 1];
              cerrarSesion(x.id); decir('Pestaña ' + x.titulo + ' cerrada.');
              const d = document.getElementById('pestana-' + (activa ? sesionActiva(MT.store.obtener()).id : (vecina && vecina.id))); if (d) d.focus();
            } }, '×')
            : null;
          return h('div', { class: 'pestana-par' + (activa ? ' pestana-par--activa' : ''), role: 'presentation', 'data-id': x.id }, t, c);
        }));
        const cuerpo = document.getElementById('cuerpo-ia');
        if (cuerpo) { cuerpo.setAttribute('role', 'tabpanel'); cuerpo.setAttribute('aria-labelledby', 'pestana-' + ia.activa); }
        mas.disabled = ia.sesiones.length >= MAX_SESIONES;
        mas.title = mas.disabled ? 'Máximo ' + MAX_SESIONES + ' pestañas' : 'Nueva pestaña';
        const act = lista.querySelector('[aria-selected="true"]');
        if (act && lista.scrollTo && lista.scrollWidth > lista.clientWidth) { const par = act.parentNode; lista.scrollLeft = Math.max(0, par.offsetLeft - 8); }
        if (enfocadaId && !lista.contains(document.activeElement)) { const d = document.getElementById('pestana-' + ia.activa); if (d) d.focus(); }
      };
      lista.addEventListener('keydown', (e) => {
        const tabs = [...lista.querySelectorAll('[role="tab"]')];
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        let j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = tabs.length - 1;
        else if (e.key === 'Delete' && tabs.length > 1) {
          e.preventDefault();
          const id = tabs[i].id.slice('pestana-'.length); const vecina = tabs[i + 1] || tabs[i - 1];
          cerrarSesion(id); decir('Pestaña cerrada.');
          const d = document.getElementById(vecina.id); if (d) d.focus();
          return;
        }
        if (j == null) return;
        e.preventDefault();
        activarSesion(tabs[j].id.slice('pestana-'.length));
        const d = document.getElementById(tabs[j].id); if (d) d.focus();
      });
      MT.store.suscribir(pintar);
      pintar(MT.store.obtener());
      return barra;
    },

    /* Abre la ventana. opciones: { texto, tarea, sesion: { id, titulo } }.
       Con `sesion` (Kinesis y Wisfox, vía niky:abrir) o con una `tarea`, se abre o REUSA la pestaña de esa tarea y el primer mensaje va allí;
       sin ninguna de las dos se muestra la pestaña que ya estaba activa. */
    abrir(opciones) {
      const slot = document.getElementById('slot-ia');
      if (!slot) return;
      // Quién la abrió: al cerrar, el foco vuelve ahí (el botón flotante, o el botón «Pedir ideas a Niky» que se tocó).
      const activo = document.activeElement;
      if (!this.abierto && activo && activo !== document.body && !slot.contains(activo)) this.quienAbrio = activo;
      if (!this.cuerpo) {
        let avatar;
        try { avatar = MT.mascotas.mascota('niky', { tamano: 40, emocion: 'contento' }); } catch (e) { avatar = marca('valeria'); }
        const cab = h('div', { class: 'panel-ia__cab' }, avatar, h('h2', { id: 'titulo-panel-ia' }, 'Niky'),
          h('button', { class: 'btn btn--chico btn--suave cerrar', type: 'button', 'aria-label': 'Cerrar la conversación con Niky', onclick: () => this.cerrar() }, 'Cerrar'));
        const cuerpo = h('div', { class: 'panel-ia__cuerpo', id: 'cuerpo-ia', role: 'tabpanel' });
        slot.replaceChildren(cab, this.construirPestanas(), cuerpo);
        cuerpo.setAttribute('aria-labelledby', 'pestana-' + sesionActiva(MT.store.obtener()).id);
        // No modal: no atrapa el foco ni tapa la pantalla. Tiene nombre y Escape la cierra desde cualquier punto de su interior.
        slot.setAttribute('role', 'dialog');
        slot.setAttribute('aria-modal', 'false');
        slot.setAttribute('aria-labelledby', 'titulo-panel-ia');
        slot.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); this.cerrar(); } });
        this.cuerpo = cuerpo;
      }
      // Primero se decide la pestaña (esto también la marca como leída) y luego se monta el chat sobre ella.
      const sesion = opciones && opciones.sesion;
      const clave = sesion && sesion.id ? sesion.id : (opciones && opciones.texto && opciones.tarea) || null;
      if (clave) asegurarSesion({ tarea: clave, titulo: sesion && sesion.titulo });
      else MT.store.cambiar((s) => { sesionActiva(s).nuevo = false; });
      if (this.chat) this.chat.destruir();
      this.abierto = true;
      slot.hidden = false;
      this.chat = montarChat(this.cuerpo, this.sugerenciasPara(), { enVentana: true });
      const btn = document.getElementById('btn-ia');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (opciones && opciones.texto) { this.chat.enviar(opciones.texto, opciones.sesion ? (opciones.tarea || 'general') : opciones.tarea); this.chat.foco(); }
      else this.chat.foco();
    },
    cerrar() {
      const slot = document.getElementById('slot-ia');
      if (!slot) return;
      const teniaFoco = slot.contains(document.activeElement);
      slot.hidden = true;
      this.abierto = false;
      const btn = document.getElementById('btn-ia');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      // El foco vuelve a quien abrió; si ese botón ya no está a la vista, al botón flotante de Niky.
      const visible = (el) => el && el.isConnected && el.getClientRects().length > 0;
      const destino = [this.quienAbrio, document.getElementById('niky-fab'), btn].find(visible);
      this.quienAbrio = null;
      if (destino && (teniaFoco || document.activeElement === document.body)) destino.focus();
    },
    alternar() { this.abierto ? this.cerrar() : this.abrir(); },
  };

  const sesiones = { MAX: MAX_SESIONES, de: sesionesDe, activa: sesionActiva, hayMensajes, sinLeer, asegurar: asegurarSesion, nueva: nuevaSesion, activar: activarSesion, cerrar: cerrarSesion, titulo: tituloDe };
  MT.ia = { info, detectar, puedeHaberServidor, preguntar, consultar, montarChat, panel, chipModo, sesiones, codigoDeEjemplo, tareaDeEjemplo };
})(window.MT = window.MT || {});
