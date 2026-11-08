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

  async function preguntar({ tarea, texto }) {
    const limpio = recortar(tarea, texto);
    if (info.modo === 'servidor') {
      try {
        const r = await fetch((cfg.base || '') + '/api/valeria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tarea, texto: limpio }),
          signal: AbortSignal.timeout((cfg.espera || 8000) + 2000),
        });
        if (!r.ok) throw new Error('servidor ' + r.status);
        const d = await r.json();
        return { fuente: d.fuente === 'gemini' ? 'en vivo' : 'respaldo', texto: d.texto };
      } catch (e) { /* cae al ejemplo */ }
    }
    await demora(450);
    return { fuente: 'ejemplo', texto: MT.datos.respuestasIA[tarea] || MT.datos.respuestasIA.general };
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
    const form = h('form', { class: 'chat__form', 'aria-label': 'Mensaje para ValerIA', onsubmit: (e) => { e.preventDefault(); mandar(campo.value); } }, campo, boton);
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
        nodos.push(h('div', { class: 'msg msg--ia' }, ricoTexto('Hola, soy **Niky**, la guía de Mosaico Telar. Puedo ayudar al docente a diseñar una actividad y al estudiante a resolver sus dudas. Todo lo que respondo es una propuesta: decide quien enseña.')));
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

  /* El panel: el lugar fijo de Niky en todos los espacios. */
  const panel = {
    chat: null,
    abierto: false,
    // Las sugerencias dependen de quién habla: el docente diseña, el estudiante pregunta.
    sugerenciasPara() {
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
      if (!this.chat) {
        const cab = h('div', { class: 'panel-ia__cab' }, marca('valeria'), h('h2', { id: 'titulo-panel-ia' }, 'Niky'),
          h('button', { class: 'btn btn--chico btn--suave cerrar', type: 'button', onclick: () => this.cerrar() }, 'Cerrar'));
        const cuerpo = h('div', { class: 'panel-ia__cuerpo' });
        slot.replaceChildren(cab, cuerpo);
        slot.setAttribute('role', 'dialog');
        slot.setAttribute('aria-labelledby', 'titulo-panel-ia');
        slot.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.cerrar(); });
        this.cuerpo = cuerpo;
      }
      if (this.chat) this.chat.destruir();
      this.chat = montarChat(this.cuerpo, this.sugerenciasPara());
      slot.hidden = false;
      this.abierto = true;
      const btn = document.getElementById('btn-ia');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (opciones && opciones.texto) this.chat.enviar(opciones.texto, opciones.tarea);
      else this.chat.foco();
    },
    cerrar() {
      const slot = document.getElementById('slot-ia');
      if (!slot) return;
      slot.hidden = true;
      this.abierto = false;
      const btn = document.getElementById('btn-ia');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    },
    alternar() { this.abierto ? this.cerrar() : this.abrir(); },
  };

  MT.ia = { info, detectar, puedeHaberServidor, preguntar, consultar, montarChat, panel, chipModo };
})(window.MT = window.MT || {});
