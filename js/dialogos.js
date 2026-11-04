/* dialogos.js: ventanas, avisos y formularios, para crear y editar sin salir de la pantalla.

   Usa el elemento <dialog> nativo: el navegador atrapa el foco dentro, Escape cierra y el foco vuelve a donde
   estaba. Todo texto entra como texto (nunca como HTML). */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  let n = 0;

  function toast(texto, tipo) {
    let region = document.getElementById('avisos');
    if (!region) { region = h('div', { id: 'avisos', class: 'avisos', role: 'status', 'aria-live': 'polite' }); document.body.append(region); }
    const t = h('div', { class: 'aviso-flotante' + (tipo === 'error' ? ' aviso-flotante--error' : '') }, texto);
    region.append(t);
    setTimeout(() => t.remove(), tipo === 'error' ? 7000 : 3500);
  }

  function abrir({ titulo, cuerpo, acciones, ancho }) {
    const id = 'dlg-' + (++n);
    const cierre = h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Cerrar la ventana' }, 'Cerrar');
    const pie = h('div', { class: 'dialogo__pie' });
    const d = h('dialog', { class: 'dialogo', 'aria-labelledby': id, style: ancho ? `max-width:${ancho}` : null },
      h('div', { class: 'dialogo__cab' }, h('h2', { id }, titulo), cierre), h('div', { class: 'dialogo__cuerpo' }, cuerpo), pie);
    const cerrar = () => d.close();
    cierre.addEventListener('click', cerrar);
    (acciones || []).forEach((a) => pie.append(h('button', { class: 'btn' + (a.suave ? ' btn--suave' : ''), type: 'button', onclick: () => a.onclick(cerrar) }, a.texto)));
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d) cerrar(); });
    document.body.append(d);
    d.showModal();
    return { cerrar, el: d };
  }

  function confirmar(texto, boton) {
    return new Promise((res) => {
      let respondido = false;
      const fin = (v) => { if (!respondido) { respondido = true; res(v); } };
      const dlg = abrir({ titulo: 'Confirma esta acción', cuerpo: h('p', null, texto),
        acciones: [{ texto: boton || 'Sí, continuar', onclick: (c) => { fin(true); c(); } }, { texto: 'Cancelar', suave: true, onclick: (c) => { fin(false); c(); } }] });
      dlg.el.addEventListener('close', () => fin(false));
    });
  }

  /* Un campo de formulario. Devuelve { el, leer, error } para poder validar sin conocer su tipo. */
  function campo(def) {
    const id = 'cmp-' + (++n);
    const base = { id, name: def.id };
    let el; let leer;
    if (def.tipo === 'area') { el = h('textarea', Object.assign({ rows: def.filas || 4, maxlength: def.max || 1200 }, base), def.valor || ''); leer = () => el.value.trim(); }
    else if (def.tipo === 'select') {
      el = h('select', base, (def.opciones || []).map((o) => h('option', { value: o.valor, selected: o.valor === def.valor }, o.texto)));
      leer = () => el.value;
    } else if (def.tipo === 'checks') {
      const valores = new Set(def.valor || []);
      const lista = h('div', { class: 'checks' }, (def.opciones || []).map((o) => h('label', { class: 'casilla' },
        h('input', { type: 'checkbox', value: o, checked: valores.has(o) }), o)));
      el = lista;
      leer = () => [...lista.querySelectorAll('input:checked')].map((i) => i.value);
    } else {
      /* def.entrada: 'email', 'tel', 'url'... (QA-06). Con el tipo correcto el celular muestra el teclado con arroba y el navegador sabe
         qué autocompletar (WCAG 1.3.5). El formulario sigue con novalidate: la validación y sus mensajes son los de la plataforma. */
      const extra = {};
      if (def.entrada) { extra.type = def.entrada; extra.inputmode = def.entrada; }
      if (def.autocompletar) extra.autocomplete = def.autocompletar;
      el = h('input', Object.assign({ type: 'text', maxlength: def.max || 120, value: def.valor || '' }, base, extra)); leer = () => el.value.trim();
    }
    const envoltura = h('div', { class: 'campo' }, def.tipo === 'checks' ? h('p', { class: 'campo__etiqueta' }, def.etiqueta) : h('label', { for: id }, def.etiqueta),
      el, def.ayuda ? h('p', { class: 'suave campo__ayuda' }, def.ayuda) : null);
    // marcar: avisa a las tecnologías de apoyo cuál campo falló (aria-invalid) y lo deja listo para corregir (QA-06c).
    const marcar = (malo) => { if (def.tipo === 'checks') return; if (malo) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); };
    if (def.tipo !== 'checks') el.addEventListener('input', () => marcar(false));
    return { el: envoltura, leer, marcar, enfocar: () => (def.tipo === 'checks' ? null : el.focus()), def };
  }

  /* Un formulario completo en un diálogo. onGuardar recibe un objeto {id: valor}; si lanza un Error, se
     muestra el mensaje y la ventana queda abierta. */
  function formulario({ titulo, campos, textoGuardar, onGuardar, extra, ancho }) {
    const cs = campos.map(campo);
    const error = h('p', { class: 'aviso', role: 'alert', hidden: true });
    const cuerpo = h('form', { class: 'formulario', novalidate: true }, error, cs.map((c) => c.el), extra || null);
    const dlg = abrir({ titulo, cuerpo, ancho, acciones: [
      { texto: textoGuardar || 'Guardar', onclick: async (cerrar) => {
        const valores = {};
        cs.forEach((c) => c.marcar(false));
        for (const c of cs) {
          const v = c.leer();
          if (c.def.requerido && (!v || (Array.isArray(v) && !v.length))) { error.hidden = false; error.textContent = `Falta: ${c.def.etiqueta}.`; c.marcar(true); c.enfocar(); return; }
          valores[c.def.id] = v;
        }
        try { await onGuardar(valores); cerrar(); } catch (e) { error.hidden = false; error.textContent = e.message; }
      } },
      { texto: 'Cancelar', suave: true, onclick: (cerrar) => cerrar() },
    ] });
    cuerpo.addEventListener('submit', (e) => e.preventDefault());
    /* Enter dentro de un campo de una sola línea envía el formulario (QA-06b). Antes el envío se cancelaba y no pasaba nada.
       Se excluyen el área de texto (Enter es un salto de línea) y los botones, que ya hacen lo suyo con Enter. Se pulsa el primer
       botón del pie, el de guardar, para reutilizar sus validaciones. */
    cuerpo.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return;
      if (!(e.target instanceof HTMLInputElement) || e.target.type === 'checkbox' || e.target.type === 'radio' || e.target.type === 'button' || !cs.some((c) => c.el.contains(e.target))) return;   // solo los campos del formulario, no los del editor de quiz (extra)
      e.preventDefault();
      const guardar = dlg.el.querySelector('.dialogo__pie .btn');
      if (guardar) guardar.click();
    });
    const primero = cs.find((c) => c.def.tipo !== 'checks');
    if (primero) setTimeout(() => primero.enfocar(), 30);
    return dlg;
  }

  MT.dlg = { abrir, confirmar, campo, formulario, toast };
})(window.MT = window.MT || {});
