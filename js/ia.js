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
  const recortar = (tarea, texto) => String(texto || '').replace(/\s+/g, ' ').trim().slice(0, tarea === 'ajustar' ? 2500 : 300);

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
    estado: 'El mapa lo dice módulo por módulo: unos **funcionan hoy**, otros están **en integración**, otros responden con **ejemplos** (como yo) y otros **vienen**. La etiqueta de cada uno es la fuente más fiable. Yo hoy no estoy conectada a un modelo de lenguaje.',
    planes: 'Cada forma de participar describe qué incluye y qué todavía se está validando. Léelas con calma y compara con lo que tu colegio necesita. Yo no cierro acuerdos ni hago ofertas: eso lo conversan personas, en la sección de piloto.',
    piloto: 'Un piloto es un **primer recorrido acompañado** en un colegio, paso a paso y sin datos reales hasta que todo esté en regla. Sirve para probar, escuchar y ajustar antes de decidir nada. Los detalles se conversan con el equipo, en la sección de piloto.',
    pantalla: 'Esta pantalla forma parte de la plataforma. Mira el título, lee la descripción de arriba y usa el menú para moverte. Si te pierdes, el **inicio** siempre está a un toque. Si quieres, dime qué buscas y te sugiero adónde ir.',
  };

  async function preguntar({ tarea, texto }) {
    const limpio = recortar(tarea, texto);
    if (info.modo === 'servidor') {
      try {
        const r = await fetch((cfg.base || '') + '/api/valeria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // El servidor solo conoce tres tareas; las preguntas guía de las burbujas viajan como «general».
          body: JSON.stringify({ tarea: ['ajustar', 'disenar', 'ayuda'].includes(tarea) ? tarea : 'general', texto: limpio }),
          signal: AbortSignal.timeout((cfg.espera || 8000) + 2000),
        });
        if (!r.ok) throw new Error('servidor ' + r.status);
        const d = await r.json();
        return { fuente: d.fuente === 'gemini' ? 'en vivo' : 'respaldo', texto: d.texto };
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

  async function consultar(texto, tareaForzada) {
    const st = MT.store;
    const tarea = tareaForzada || inferirTarea(texto);
    st.cambiar((s) => { s.ia.push({ rol: 'yo', texto }); if (s.ia.length > 30) s.ia.shift(); });
    let respuesta;
    if (tarea === 'general') {
      await demora(350);
      respuesta = { fuente: info.modo === 'servidor' ? 'respaldo' : 'ejemplo', texto: MT.datos.respuestasIA.general };
    } else {
      const base = tarea === 'ajustar' ? (st.obtener().actividad || texto) : texto;
      respuesta = await preguntar({ tarea, texto: base });
    }
    st.cambiar((s) => {
      s.ia.push({ rol: 'ia', texto: respuesta.texto, fuente: respuesta.fuente });
      if (s.ia.length > 30) s.ia.shift();
      MT.store.logro('ia');
      if (tarea === 'disenar') s.actividad = respuesta.texto;
    });
    return respuesta;
  }

  function chipModo() {
    return info.modo === 'servidor'
      ? h('span', { class: 'sello sello--ok' }, 'En vivo' + (info.modelo ? ' · ' + info.modelo : ''))
      : h('span', { class: 'sello sello--aviso' }, 'Simulada');
  }

  /* El chat. Se monta en cualquier contenedor; cada instancia se suscribe al estado compartido. */
  function montarChat(contenedor, sugerencias) {
    const st = MT.store;
    let ocupado = false;
    const estadoEl = h('div', { class: 'chat__estado' });
    const lista = h('div', { class: 'chat__mensajes', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversación con Niky' });
    const chips = h('div', { class: 'chat__sugerencias' });
    const campo = h('textarea', { rows: '2', maxlength: '300', 'aria-label': 'Escribe tu mensaje para Niky', placeholder: 'Escribe aquí lo que necesitas…' });
    const boton = h('button', { class: 'btn', type: 'submit' }, 'Enviar');
    const form = h('form', { class: 'chat__form', 'aria-label': 'Mensaje para Niky', onsubmit: (e) => { e.preventDefault(); mandar(campo.value); } }, campo, boton);
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mandar(campo.value); } });

    async function mandar(texto, tarea) {
      const limpio = String(texto || '').trim();
      if (!limpio || ocupado) return;
      ocupado = true; boton.disabled = true; campo.value = '';
      await consultar(limpio, tarea);
      ocupado = false; boton.disabled = false;
      // La respuesta se pintó cuando todavía estaba «ocupado»: sin este repintado «Niky está pensando…» quedaba junto a la respuesta.
      pintarMensajes(st.obtener());
    }

    function pintarEstado() {
      estadoEl.replaceChildren(chipModo(), h('span', { class: 'suave' },
        info.modo === 'servidor' ? 'Respuestas de un modelo de lenguaje.' : 'Respuestas de ejemplo. Se conectará a un modelo real.'));
    }
    function pintarMensajes(s) {
      const nodos = [];
      if (!s.ia.length) {
        nodos.push(h('div', { class: 'msg msg--ia' }, ricoTexto('Hola, soy **Niky**, la guía de ' + MT.nombre + '. Puedo ayudar al docente a diseñar una actividad y al estudiante a resolver sus dudas. Todo lo que respondo es una propuesta: decide quien enseña.')));
      }
      for (const m of s.ia) {
        nodos.push(h('div', { class: 'msg msg--' + m.rol }, ricoTexto(m.texto),
          m.rol === 'ia' && m.fuente ? h('small', null, m.fuente === 'ejemplo' ? 'Respuesta de ejemplo' : m.fuente === 'respaldo' ? 'Respuesta de respaldo' : 'Generada en vivo') : null));
      }
      if (ocupado) nodos.push(h('div', { class: 'msg msg--ia' }, 'Niky está pensando…'));
      lista.replaceChildren(...nodos);
      lista.scrollTop = lista.scrollHeight;
    }
    function pintarChips() {
      chips.replaceChildren(...(sugerencias || []).map((sug) =>
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => mandar(sug.texto, sug.tarea) }, sug.etiqueta)));
    }

    const repintar = (s) => pintarMensajes(s);
    const desuscribir = st.suscribir(repintar);
    const alModo = () => pintarEstado();
    window.addEventListener('mt-ia-modo', alModo);

    contenedor.replaceChildren(h('div', { class: 'chat' }, estadoEl, lista, chips, form));
    pintarEstado(); pintarChips(); pintarMensajes(st.obtener());

    return {
      enviar: mandar,
      foco: () => campo.focus(),
      destruir() { desuscribir(); window.removeEventListener('mt-ia-modo', alModo); },
    };
  }

  /* La ventana de Niky: el lugar fijo de la IA en todos los espacios. Sigue siendo el aside #slot-ia (así los casos, el modo presentación y
     los botones «Pedir ideas a Niky» no cambian), pero ahora es una ventana flotante y NO modal, junto al botón de js/niky.js: la persona
     puede seguir leyendo la pantalla mientras conversa. El estilo está en css/niky.css. */
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
    abrir(opciones) {
      const slot = document.getElementById('slot-ia');
      if (!slot) return;
      // Quién la abrió: al cerrar, el foco vuelve ahí (el botón flotante, o el botón «Pedir ideas a Niky» que se tocó).
      const activo = document.activeElement;
      if (!this.abierto && activo && activo !== document.body && !slot.contains(activo)) this.quienAbrio = activo;
      if (!this.chat) {
        let avatar;
        try { avatar = MT.mascotas.mascota('niky', { tamano: 40, emocion: 'contento' }); } catch (e) { avatar = marca('valeria'); }
        const cab = h('div', { class: 'panel-ia__cab' }, avatar, h('h2', { id: 'titulo-panel-ia' }, 'Niky'),
          h('button', { class: 'btn btn--chico btn--suave cerrar', type: 'button', 'aria-label': 'Cerrar la conversación con Niky', onclick: () => this.cerrar() }, 'Cerrar'));
        const cuerpo = h('div', { class: 'panel-ia__cuerpo' });
        slot.replaceChildren(cab, cuerpo);
        // No modal: no atrapa el foco ni tapa la pantalla. Tiene nombre y Escape la cierra desde cualquier punto de su interior.
        slot.setAttribute('role', 'dialog');
        slot.setAttribute('aria-modal', 'false');
        slot.setAttribute('aria-labelledby', 'titulo-panel-ia');
        slot.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); this.cerrar(); } });
        this.cuerpo = cuerpo;
      }
      if (this.chat) this.chat.destruir();
      this.chat = montarChat(this.cuerpo, this.sugerenciasPara());
      slot.hidden = false;
      this.abierto = true;
      const btn = document.getElementById('btn-ia');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (opciones && opciones.texto) { this.chat.enviar(opciones.texto, opciones.tarea); this.chat.foco(); }
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

  MT.ia = { info, detectar, puedeHaberServidor, preguntar, consultar, montarChat, panel, chipModo };
})(window.MT = window.MT || {});
