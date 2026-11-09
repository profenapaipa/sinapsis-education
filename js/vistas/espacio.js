/* espacio.js: "Mi espacio", la plataforma de trabajo de cada rol (#/mi/<sección>).

   Una sola ruta y cinco espacios. Lo que ve y puede hacer cada rol sale de la misma regla (roles.js):
   - docente: estudiantes (apoyos, sin clínico), actividades, ajustes, archivos y notas.
   - orientación: revisa y aprueba ajustes, edita los apoyos del perfil, ve todos los archivos.
   - familia: ve lo ya aprobado de su estudiante y los archivos que se le compartieron.
   - coordinación: estructura (estudiantes, cursos, categorías). No ve apoyos ni archivos ni notas.
   - estudiante: su actividad (la ajustada si fue aprobada), quiz, logros y material.
   Todo se crea, edita y borra aquí y se guarda en este navegador. */
(function (MT) {
  'use strict';
  const { h, ricoTexto, htmlSeguro, icono } = MT.ui;
  const st = MT.store;
  const db = MT.db;
  const { dlg } = MT;
  const S = () => st.obtener();
  const fecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

  const SECCIONES = {
    docente: [
      { id: 'resumen', etiqueta: 'Inicio', icono: 'inicio' }, { id: 'estudiantes', etiqueta: 'Estudiantes', icono: 'docente' },
      { id: 'actividades', etiqueta: 'Actividades', icono: 'libro' }, { id: 'ajustes', etiqueta: 'Ajustes', icono: 'recorrido' },
      { id: 'notas', etiqueta: 'Notas', icono: 'chat' }, { id: 'archivos', etiqueta: 'Archivos', icono: 'mapa' },
    ],
    orientacion: [
      { id: 'resumen', etiqueta: 'Inicio', icono: 'inicio' }, { id: 'ajustes', etiqueta: 'Revisar ajustes', icono: 'recorrido' },
      { id: 'estudiantes', etiqueta: 'Perfiles', icono: 'orientacion' }, { id: 'notas', etiqueta: 'Notas', icono: 'chat' },
      { id: 'archivos', etiqueta: 'Archivos', icono: 'mapa' },
    ],
    familia: [
      { id: 'resumen', etiqueta: 'Novedades', icono: 'inicio' }, { id: 'archivos', etiqueta: 'Archivos', icono: 'mapa' },
    ],
    coordinacion: [
      { id: 'resumen', etiqueta: 'Resumen', icono: 'inicio' }, { id: 'estudiantes', etiqueta: 'Estudiantes', icono: 'coordinacion' },
      { id: 'cursos', etiqueta: 'Cursos', icono: 'libro' }, { id: 'categorias', etiqueta: 'Categorías de apoyo', icono: 'estado' },
    ],
    estudiante: [
      { id: 'resumen', etiqueta: 'Mi actividad', icono: 'inicio' }, { id: 'ruta', etiqueta: 'Ruta de Inglés', icono: 'libro' },
      { id: 'logros', etiqueta: 'Mis logros', icono: 'logros' }, { id: 'archivos', etiqueta: 'Material', icono: 'mapa' },
    ],
  };
  MT.secciones = SECCIONES; // la barra de portales y la guía las usan para listar dónde se trabaja cada cosa
  const ROL_ESP = { docente: 'kinesis', orientacion: 'kinesis', familia: 'kinesis', coordinacion: 'kinesis', estudiante: 'wisfox' };

  const caja = (...hijos) => h('div', { class: 'tarjeta' }, ...hijos);
  /* El título, la línea de «qué hacer aquí» y el botón principal de cada vista viven en la cabecera única de la pantalla (js/vistas/comun.js),
     no dentro de la tarjeta: así todas las secciones arrancan igual. cab() se sigue llamando igual desde cada vista y, como ellas se repintan
     al cambiar los datos, la cabecera se actualiza en su sitio sin rehacerse. Devuelve null: dentro de la tarjeta ya no queda nada. */
  const cab = (titulo, boton, linea) => { if (MT.comun.cabActual) MT.comun.cabActual.poner({ titulo, accion: boton || null, linea: linea || '' }); return null; };
  const botonNuevo = (texto, f) => h('button', { class: 'btn btn--chico', type: 'button', onclick: f }, texto);
  const sinFoco = (txt) => h('div', { class: 'vacio' }, txt);
  const etiquetaEstado = (e) => h('span', { class: 'estado estado--' + e }, { propuesto: 'En revisión', aprobado: 'Aprobado', devuelto: 'Devuelto', publicada: 'Publicada', borrador: 'Borrador' }[e] || e);

  /* ------------------------------ Estudiantes ------------------------------ */
  function formEstudiante(rol, e) {
    const cursos = db.lista('cursos').map((c) => ({ valor: c.id, texto: c.nombre }));
    const campos = [{ id: 'curso', etiqueta: 'Curso', tipo: 'select', opciones: cursos, valor: e ? e.curso : cursos[0] && cursos[0].valor, requerido: true }];
    if (rol === 'orientacion') {
      campos.push({ id: 'piar', etiqueta: 'Tiene PIAR', tipo: 'select', opciones: [{ valor: 'no', texto: 'No' }, { valor: 'si', texto: 'Sí' }], valor: e && e.piar ? 'si' : 'no' },
        { id: 'apoyos', etiqueta: 'Apoyos que le sirven', tipo: 'checks', opciones: db.lista('categorias').map((c) => c.nombre), valor: e ? e.apoyos : [], ayuda: 'Describe lo que le ayuda, nunca un diagnóstico.' },
        { id: 'fortalezas', etiqueta: 'Fortalezas (una por línea)', tipo: 'area', filas: 3, valor: e ? e.fortalezas.join('\n') : '' });
    }
    dlg.formulario({ titulo: e ? 'Editar a ' + e.id : 'Nuevo estudiante', campos, textoGuardar: e ? 'Guardar cambios' : 'Crear estudiante',
      extra: h('p', { class: 'suave' }, 'Los estudiantes se identifican con un código (P-01, P-02…). No escribas nombres ni documentos: esta es una demostración.'),
      onGuardar: (v) => {
        const datos = { curso: v.curso };
        if (rol === 'orientacion') Object.assign(datos, { piar: v.piar === 'si', apoyos: v.apoyos, fortalezas: v.fortalezas.split('\n').map((x) => x.trim()).filter(Boolean) });
        if (e) { db.actualizar('estudiantes', e.id, datos); st.evento('Se actualizó el perfil de ' + e.id, false, e.id); dlg.toast('Perfil actualizado.'); }
        else { const n = db.crear('estudiantes', Object.assign({ piar: false, apoyos: [], fortalezas: [] }, datos)); dlg.toast('Se creó ' + n.id + '.'); }
      } });
  }

  function vistaEstudiantes(c, rol) {
    const puedeVerApoyos = rol === 'docente' || rol === 'orientacion';
    const pintar = () => {
      const l = S().estudiantes;
      c.replaceChildren(caja(cab('Estudiantes', rol === 'coordinacion' ? botonNuevo('Nuevo estudiante', () => formEstudiante(rol)) : null,
          rol === 'coordinacion' ? 'Coordinación define quién es quién y en qué curso. Los apoyos y el PIAR no se muestran aquí (mínimo privilegio).' : ''),
        l.length ? h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla' },
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Código'), h('th', { scope: 'col' }, 'Curso'), puedeVerApoyos ? h('th', { scope: 'col' }, 'Apoyos') : null, h('th', { scope: 'col' }, 'Acciones'))),
          h('tbody', null, l.map((e) => h('tr', null, h('th', { scope: 'row' }, e.id), h('td', null, (db.curso(e.curso) || {}).nombre || '—'),
            puedeVerApoyos ? h('td', null, e.apoyos.length ? e.apoyos.join(' · ') : h('span', { class: 'suave' }, 'Sin apoyos registrados')) : null,
            h('td', null, h('div', { class: 'acciones' },
              rol === 'coordinacion' || rol === 'orientacion' ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Editar a ' + e.id, onclick: () => formEstudiante(rol, e) }, 'Editar') : null,
              rol === 'coordinacion' ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Borrar a ' + e.id,
                onclick: async () => { if (await dlg.confirmar(`¿Borrar a ${e.id} y sus ajustes y notas?`, 'Sí, borrar')) { MT.store.cambiar((s) => { s.estudiantes = s.estudiantes.filter((x) => x.id !== e.id); s.ajustes = s.ajustes.filter((x) => x.estudiante !== e.id); s.notas = s.notas.filter((x) => x.estudiante !== e.id); }); dlg.toast('Estudiante borrado.'); } } }, 'Borrar') : null)))))))
          : sinFoco('Todavía no hay estudiantes.')));
    };
    pintar();
    MT.router.alSalir(st.suscribir(pintar));
  }

  /* ------------------------------ Cursos y categorías (coordinación) ------------------------------ */
  function listaSimple(c, { col, titulo, ayuda, nuevo, etiquetaCampo, enUso, borrarAviso }) {
    const pintar = () => {
      const l = db.lista(col);
      c.replaceChildren(caja(cab(titulo, botonNuevo(nuevo, () => formNombre(null)), ayuda),
        l.length ? h('ul', { class: 'lista' }, l.map((x) => h('li', { class: 'fila' }, h('span', null, x.nombre, h('small', { class: 'suave' }, ' · ' + enUso(x))),
          h('span', { class: 'acciones' },
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Renombrar ' + x.nombre, onclick: () => formNombre(x) }, 'Renombrar'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Borrar ' + x.nombre, onclick: async () => {
              if (enUso(x, true)) { dlg.toast(borrarAviso, 'error'); return; }
              if (await dlg.confirmar(`¿Borrar “${x.nombre}”?`, 'Sí, borrar')) { db.borrar(col, x.id); dlg.toast('Borrado.'); } } }, 'Borrar')))))
          : sinFoco('Todavía no hay elementos.')));
    };
    function formNombre(x) {
      dlg.formulario({ titulo: x ? 'Renombrar' : nuevo, campos: [{ id: 'nombre', etiqueta: etiquetaCampo, valor: x ? x.nombre : '', requerido: true, max: 70 }],
        onGuardar: (v) => {
          if (db.lista(col).some((y) => y.nombre.toLowerCase() === v.nombre.toLowerCase() && (!x || y.id !== x.id))) throw new Error('Ya existe uno con ese nombre.');
          if (x) {
            if (col === 'categorias') MT.store.cambiar((s) => s.estudiantes.forEach((e) => { e.apoyos = e.apoyos.map((a) => (a === x.nombre ? v.nombre : a)); }));
            db.actualizar(col, x.id, { nombre: v.nombre });
          } else db.crear(col, { nombre: v.nombre });
          dlg.toast('Guardado.');
        } });
    }
    pintar();
    MT.router.alSalir(st.suscribir(pintar));
  }

  const vistaCursos = (c) => listaSimple(c, { col: 'cursos', titulo: 'Cursos', nuevo: 'Nuevo curso', etiquetaCampo: 'Nombre del curso', ayuda: 'Los cursos agrupan a los estudiantes. Un curso con estudiantes no se puede borrar.',
    enUso: (x, solo) => { const n = S().estudiantes.filter((e) => e.curso === x.id).length; return solo ? n > 0 : n + (n === 1 ? ' estudiante' : ' estudiantes'); },
    borrarAviso: 'Ese curso todavía tiene estudiantes. Pásalos a otro curso primero.' });
  const vistaCategorias = (c) => listaSimple(c, { col: 'categorias', titulo: 'Categorías de apoyo', nuevo: 'Nueva categoría', etiquetaCampo: 'Nombre del apoyo', ayuda: 'Son las opciones que orientación puede marcar en un perfil. Dicen qué ayuda, no qué diagnóstico hay.',
    enUso: (x, solo) => { const n = S().estudiantes.filter((e) => e.apoyos.includes(x.nombre)).length; return solo ? false : n + (n === 1 ? ' perfil' : ' perfiles'); }, borrarAviso: '' });

  /* ------------------------------ Actividades (docente) ------------------------------ */
  function formActividad(a) {
    const ing = MT.catalogo.ingles;
    const lecciones = ing.unidades.flatMap((u) => u.lecciones.map((l) => ({ valor: l.id, texto: `P${u.periodo} · ${l.t}`, l })));
    const desde = { id: 'desde', etiqueta: 'Partir de la malla de Inglés (opcional)', tipo: 'select', valor: '', ayuda: 'Copia el tema y el quiz de una lección del equipo de Wisfox; luego puedes editarlos.',
      opciones: [{ valor: '', texto: 'Empezar en blanco' }, ...lecciones.map((l) => ({ valor: l.valor, texto: l.texto }))] };
    const campos = [
      ...(a ? [] : [desde]),
      { id: 'titulo', etiqueta: 'Título', valor: a ? a.titulo : '', requerido: true, max: 80 },
      { id: 'asignatura', etiqueta: 'Asignatura', tipo: 'select', opciones: MT.datos.asignaturas.map((x) => ({ valor: x, texto: x })), valor: a ? a.asignatura : 'Inglés' },
      { id: 'tema', etiqueta: 'Tema', valor: a ? a.tema : '', max: 80, ayuda: 'Lo que se aprende, en pocas palabras. Por ejemplo: Present simple.' },
      { id: 'descripcion', etiqueta: 'Descripción para el docente', tipo: 'area', valor: a ? a.descripcion : '', filas: 3, requerido: true },
      { id: 'pasos', etiqueta: 'Pasos para el estudiante (uno por línea)', tipo: 'area', valor: a ? a.pasos.join('\n') : '', filas: 3, ayuda: 'Instrucciones cortas, una por línea. Si son pasos pequeños y numerados, ya son un apoyo para quien necesita ir despacio.' },
      ...MT.datos.dua.map((d) => ({ id: d.id, etiqueta: d.titulo, tipo: 'checks', opciones: d.opciones, valor: a ? a.dua[d.id] : [], ayuda: d.principio + '. Marca las formas que vas a ofrecer: así la clase sirve a todos desde el diseño, antes de cualquier ajuste individual.' })),
      { id: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: [{ valor: 'publicada', texto: 'Publicada: los estudiantes la ven' }, { valor: 'borrador', texto: 'Borrador: solo tú' }], valor: a ? a.estado : 'publicada' },
    ];
    const ctl = dlg.formulario({ titulo: a ? 'Editar actividad' : 'Nueva actividad', campos, ancho: '40rem', textoGuardar: a ? 'Guardar cambios' : 'Crear actividad',
      extra: h('p', { class: 'suave' }, 'El quiz se arma en la siguiente ventana: preguntas con cuatro opciones y su explicación.'),
      onGuardar: (v) => {
        if (v.desde) { /* se aplicó al elegir; aquí solo se conserva el quiz */ }
        const l = v.desde ? lecciones.find((x) => x.valor === v.desde).l : null;
        const dua = {}; MT.datos.dua.forEach((d) => { dua[d.id] = v[d.id]; });
        const datos = { titulo: v.titulo, asignatura: v.asignatura, tema: v.tema, descripcion: v.descripcion, pasos: v.pasos.split('\n').map((x) => x.trim()).filter(Boolean), dua, estado: v.estado };
        if (a) { db.actualizar('actividades', a.id, datos); dlg.toast('Actividad actualizada.'); }
        else {
          const n = db.crear('actividades', Object.assign({ quiz: l ? l.quiz.map((q) => ({ q: q.q, o: q.o.slice(), a: q.a, why: q.why })) : [], archivos: [], fecha: new Date().toISOString() }, datos));
          st.evento('Nueva actividad: ' + n.titulo, true);
          dlg.toast('Actividad creada. Ya puedes editar su quiz.');
        }
      } });
    // Al elegir una lección de la malla se rellenan los campos, para que se vea lo que se copió.
    const sel = ctl.el.querySelector('select[name="desde"]');
    if (sel) sel.addEventListener('change', () => {
      const x = lecciones.find((y) => y.valor === sel.value); if (!x) return;
      const pon = (n, val) => { const el = ctl.el.querySelector(`[name="${n}"]`); if (el && !el.value) el.value = val; };
      pon('titulo', x.l.t); pon('tema', x.l.t); pon('descripcion', 'Lección de la malla de Inglés de grado 8.° (' + x.texto + '). Incluye ' + x.l.quiz.length + ' preguntas con explicación.');
    });
  }

  function formQuiz(a) {
    const q = a.quiz.map((p) => ({ q: p.q, o: p.o.slice(), a: p.a, why: p.why }));
    const zona = h('div');
    const pintar = () => zona.replaceChildren(...q.map((p, i) => h('fieldset', { class: 'pregunta-edit' }, h('legend', null, 'Pregunta ' + (i + 1)),
      h('div', { class: 'campo' }, h('label', { for: 'q' + i }, 'Enunciado'), h('input', { id: 'q' + i, type: 'text', maxlength: 200, value: p.q, oninput: (e) => { p.q = e.target.value; } })),
      ...p.o.map((o, j) => h('div', { class: 'opcion-edit' }, h('input', { type: 'radio', name: 'c' + i, checked: p.a === j, 'aria-label': `Marcar la opción ${j + 1} de la pregunta ${i + 1} como correcta`, onchange: () => { p.a = j; } }),
        h('input', { type: 'text', maxlength: 120, value: o, 'aria-label': `Opción ${j + 1} de la pregunta ${i + 1}`, oninput: (e) => { p.o[j] = e.target.value; } }))),
      h('div', { class: 'campo' }, h('label', { for: 'w' + i }, 'Por qué esa es la correcta'), h('input', { id: 'w' + i, type: 'text', maxlength: 200, value: p.why || '', oninput: (e) => { p.why = e.target.value; } })),
      h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { q.splice(i, 1); pintar(); } }, 'Quitar esta pregunta'))),
      h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { q.push({ q: '', o: ['', '', '', ''], a: 0, why: '' }); pintar(); } }, 'Agregar una pregunta'));
    pintar();
    dlg.formulario({ titulo: 'Quiz de “' + a.titulo + '”', campos: [], extra: zona, ancho: '42rem', textoGuardar: 'Guardar quiz',
      onGuardar: () => {
        for (const [i, p] of q.entries()) {
          if (!p.q.trim() || p.o.some((o) => !o.trim())) throw new Error(`La pregunta ${i + 1} tiene campos vacíos.`);
          if (new Set(p.o.map((o) => o.trim().toLowerCase())).size < 4) throw new Error(`La pregunta ${i + 1} tiene opciones repetidas.`);
        }
        db.actualizar('actividades', a.id, { quiz: q.map((p) => ({ q: p.q.trim(), o: p.o.map((o) => o.trim()), a: p.a, why: p.why.trim() })) });
        dlg.toast('Quiz guardado.');
      } });
  }

  function vistaActividades(c) {
    const pintar = () => {
      const l = db.lista('actividades');
      c.replaceChildren(caja(cab('Actividades', botonNuevo('Nueva actividad', () => formActividad(null)), 'Planea con los tres principios del DUA. Cada actividad puede ajustarse después a un estudiante.'),
        l.length ? h('div', { class: 'rejilla' }, l.map((a) => h('article', { class: 'tarjeta tarjeta--plana' },
          h('div', { class: 'tarjeta-cab' }, h('h3', null, a.titulo), etiquetaEstado(a.estado)),
          h('p', { class: 'suave' }, `${a.asignatura} · ${a.tema || 'sin tema'} · ${a.quiz.length} preguntas`), h('p', null, a.descripcion),
          h('p', { class: 'suave' }, 'DUA: ' + (['repr', 'accion', 'compromiso'].filter((k) => a.dua[k] && a.dua[k].length).length) + ' de 3 principios'),
          h('div', { class: 'acciones' },
            h('button', { class: 'btn btn--chico', type: 'button', onclick: () => { location.hash = '#/mi/ajustes'; MT.ajusteNuevo = a.id; } }, 'Ajustar a un estudiante'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => formQuiz(a) }, 'Editar quiz'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => formActividad(a) }, 'Editar'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Pedir ideas a Niky para ' + a.titulo, onclick: () => MT.ia.panel.abrir({ texto: `Necesito ideas para una actividad de ${a.asignatura} sobre ${a.tema || a.titulo}.`, tarea: 'disenar' }) }, 'Pedir ideas a Niky'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: async () => { if (await dlg.confirmar(`¿Borrar “${a.titulo}” y sus ajustes?`, 'Sí, borrar')) { MT.store.cambiar((s) => { s.actividades = s.actividades.filter((x) => x.id !== a.id); s.ajustes = s.ajustes.filter((x) => x.actividad !== a.id); }); dlg.toast('Actividad borrada.'); } } }, 'Borrar')))))
          : sinFoco('Todavía no hay actividades. Crea la primera.')));
    };
    pintar();
    MT.router.alSalir(st.suscribir(pintar));
  }

  /* ------------------------------ Ajustes ------------------------------ */
  function proponerAjuste(preActividad) {
    const acts = db.lista('actividades').filter((a) => a.estado === 'publicada');
    const ests = S().estudiantes.filter((e) => e.apoyos.length);
    if (!acts.length || !ests.length) { dlg.toast(!acts.length ? 'Primero publica una actividad.' : 'Ningún estudiante tiene apoyos registrados todavía: orientación debe completar los perfiles.', 'error'); return; }
    const resumen = h('div', { class: 'vista-previa' });
    const ctl = dlg.formulario({ titulo: 'Ajustar una actividad', textoGuardar: 'Enviar a orientación', ancho: '38rem',
      campos: [
        { id: 'actividad', etiqueta: 'Actividad', tipo: 'select', opciones: acts.map((a) => ({ valor: a.id, texto: a.titulo })), valor: preActividad || acts[0].id, requerido: true },
        { id: 'estudiante', etiqueta: 'Estudiante', tipo: 'select', opciones: ests.map((e) => ({ valor: e.id, texto: e.id })), valor: ests[0].id, requerido: true },
      ], extra: h('div', null, h('p', { class: 'etiqueta' }, 'Cambios que se proponen'), resumen),
      onGuardar: (v) => {
        const e = db.estudiante(v.estudiante);
        if (S().ajustes.some((x) => x.actividad === v.actividad && x.estudiante === v.estudiante && x.estado === 'propuesto')) throw new Error('Ya hay un ajuste en revisión para esa actividad y ese estudiante.');
        db.crear('ajustes', { actividad: v.actividad, estudiante: v.estudiante, items: MT.datos.generarAjuste(e), estado: 'propuesto', nota: '', fecha: new Date().toISOString() });
        st.evento('Un docente propuso un ajuste para ' + v.estudiante, false, v.estudiante);
        dlg.toast('Ajuste enviado a orientación.');
      } });
    const act = () => ctl.el.querySelector('[name="estudiante"]');
    const refrescar = () => { const e = db.estudiante(act().value); resumen.replaceChildren(h('ul', { class: 'lista' }, MT.datos.generarAjuste(e).map((i) => h('li', null, h('strong', null, i.cambio), h('br'), h('span', { class: 'suave' }, i.porque))))); };
    act().addEventListener('change', refrescar); refrescar();
  }

  function tarjetaAjuste(a, rol) {
    const act = db.obtener('actividades', a.actividad);
    const revisar = rol === 'orientacion' && a.estado === 'propuesto';
    const decidir = (estado) => {
      const pide = estado === 'devuelto';
      dlg.formulario({ titulo: pide ? 'Devolver el ajuste al docente' : 'Aprobar el ajuste', textoGuardar: pide ? 'Devolver' : 'Aprobar',
        campos: [{ id: 'nota', etiqueta: pide ? 'Qué debe cambiar' : 'Nota para el docente (opcional)', tipo: 'area', filas: 3, requerido: pide, valor: '' }],
        onGuardar: (v) => {
          db.actualizar('ajustes', a.id, { estado, nota: v.nota });
          st.evento(estado === 'aprobado' ? 'Se aprobó un ajuste de ' + (act ? act.titulo : 'una actividad') : 'Orientación devolvió un ajuste', estado === 'aprobado', a.estudiante);
          dlg.toast(estado === 'aprobado' ? 'Ajuste aprobado. Ya llega al estudiante.' : 'Ajuste devuelto.');
        } });
    };
    return h('article', { class: 'tarjeta tarjeta--plana' },
      h('div', { class: 'tarjeta-cab' }, h('h3', null, (act ? act.titulo : 'Actividad borrada') + ' · ' + a.estudiante), etiquetaEstado(a.estado)),
      h('p', { class: 'suave' }, fecha(a.fecha)),
      h('ul', { class: 'lista' }, a.items.map((i) => h('li', null, h('strong', null, i.cambio), h('br'), h('span', { class: 'suave' }, i.porque)))),
      a.nota ? h('p', { class: 'aviso' }, 'Nota: ' + a.nota) : null,
      h('div', { class: 'acciones' },
        revisar ? h('button', { class: 'btn btn--chico', type: 'button', onclick: () => decidir('aprobado') }, 'Aprobar') : null,
        revisar ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => decidir('devuelto') }, 'Devolver con nota') : null,
        rol === 'docente' ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: async () => { if (await dlg.confirmar('¿Retirar este ajuste?', 'Sí, retirar')) { db.borrar('ajustes', a.id); dlg.toast('Ajuste retirado.'); } } }, 'Retirar') : null,
        rol === 'docente' && a.estado === 'devuelto' ? h('button', { class: 'btn btn--chico', type: 'button', onclick: () => { db.actualizar('ajustes', a.id, { estado: 'propuesto', nota: '', items: MT.datos.generarAjuste(db.estudiante(a.estudiante) || { apoyos: [] }) }); dlg.toast('Ajuste enviado de nuevo.'); } }, 'Volver a enviar') : null));
  }

  function vistaAjustes(c, rol) {
    const pintar = () => {
      const l = db.lista('ajustes').slice().reverse();
      const pend = l.filter((a) => a.estado === 'propuesto').length;
      c.replaceChildren(caja(cab(rol === 'orientacion' ? 'Ajustes por revisar' : 'Mis ajustes', rol === 'docente' ? h('span', { class: 'acciones' }, botonNuevo('Nuevo ajuste', () => proponerAjuste()), MT.plan.candado('piar', 'Exportar PIAR')) : (rol === 'orientacion' ? MT.plan.candado('piar', 'Exportar PIAR') : null),
          rol === 'orientacion' ? `${pend} ${pend === 1 ? 'espera' : 'esperan'} tu decisión. Nada llega al estudiante sin tu aprobación.` : 'Cada apoyo del perfil se convierte en un cambio concreto, con su razón. Orientación lo revisa antes de que llegue al estudiante.'), MT.guias.notaAjuste(),
        l.length ? h('div', { class: 'rejilla' }, l.map((a) => tarjetaAjuste(a, rol))) : sinFoco(rol === 'orientacion' ? 'No hay ajustes por revisar.' : 'Aún no has propuesto ajustes.')));
    };
    pintar();
    MT.router.alSalir(st.suscribir(pintar));
    if (rol === 'docente' && MT.ajusteNuevo) { const id = MT.ajusteNuevo; MT.ajusteNuevo = null; setTimeout(() => proponerAjuste(id), 50); }
  }

  /* ------------------------------ Notas ------------------------------ */
  function vistaNotas(c, rol) {
    const nueva = (n) => dlg.formulario({ titulo: n ? 'Editar nota' : 'Nueva nota', textoGuardar: 'Guardar',
      campos: [
        { id: 'estudiante', etiqueta: 'Estudiante', tipo: 'select', opciones: S().estudiantes.map((e) => ({ valor: e.id, texto: e.id })), valor: n ? n.estudiante : S().vinculo, requerido: true },
        { id: 'texto', etiqueta: 'Nota', tipo: 'area', filas: 4, valor: n ? n.texto : '', requerido: true, max: 600, ayuda: 'Escribe lo observado en clase, sin diagnósticos ni datos personales.' },
        { id: 'familia', etiqueta: 'Mostrar a la familia', tipo: 'select', opciones: [{ valor: 'no', texto: 'No, solo el equipo' }, { valor: 'si', texto: 'Sí, que la vea la familia' }], valor: n && n.paraFamilia ? 'si' : 'no' },
      ], onGuardar: (v) => {
        const datos = { estudiante: v.estudiante, texto: v.texto, paraFamilia: v.familia === 'si' };
        if (n) db.actualizar('notas', n.id, datos); else db.crear('notas', Object.assign({ autor: rol, fecha: new Date().toISOString() }, datos));
        MT.store.cambiar(() => MT.store.logro('nota', v.estudiante)); dlg.toast('Nota guardada.');
      } });
    const pintar = () => {
      const l = db.lista('notas').slice().reverse();
      c.replaceChildren(caja(cab('Notas del equipo', botonNuevo('Nueva nota', () => nueva(null)), 'Las notas son del equipo (docentes y orientación). Solo llegan a la familia las que marques para ella.'),
        l.length ? h('ul', { class: 'lista' }, l.map((n) => h('li', { class: 'fila' },
          h('span', null, h('strong', null, n.estudiante), ' · ', n.autor === 'orientacion' ? 'Orientación' : 'Docente', ' · ', fecha(n.fecha), n.paraFamilia ? h('span', { class: 'estado estado--aprobado' }, 'Visible para la familia') : null, h('br'), n.texto),
          h('span', { class: 'acciones' },
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Editar la nota de ' + n.estudiante, onclick: () => nueva(n) }, 'Editar'),
            h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-label': 'Borrar la nota de ' + n.estudiante, onclick: async () => { if (await dlg.confirmar('¿Borrar esta nota?', 'Sí, borrar')) { db.borrar('notas', n.id); dlg.toast('Nota borrada.'); } } }, 'Borrar')))))
          : sinFoco('Todavía no hay notas.')));
    };
    pintar();
    MT.router.alSalir(st.suscribir(pintar));
  }

  /* Los archivos los pinta js/biblioteca.js, que trae su propio h1 y su propia ayuda dentro de la tarjeta. Aquí el título y la ayuda suben a la
     cabecera única y lo que la biblioteca pinte como h1 se baja a h2 (una pantalla, un solo h1); si repite el título de la cabecera, queda solo
     para lectores de pantalla. Un observador lo repite cuando la biblioteca se repinta tras subir o borrar un archivo. */
  function archivos(c, { rol, titulo, ayuda }) {
    cab(titulo, null, ayuda);
    MT.biblioteca.montar(c, { rol, titulo });
    const bajar = () => c.querySelectorAll('h1').forEach((x) => {
      const n = document.createElement('h2'); n.className = x.className + (x.textContent.trim() === titulo ? ' solo-lector' : ''); n.append(...x.childNodes); x.replaceWith(n);
    });
    bajar();
    const o = new MutationObserver(() => { o.disconnect(); bajar(); o.observe(c, { childList: true, subtree: true }); });
    o.observe(c, { childList: true, subtree: true });
    MT.router.alSalir(() => o.disconnect());
  }

  /* ------------------------------ Resúmenes por rol ------------------------------ */
  const celda = (valor, etiqueta, detalle) => h('div', null, h('strong', null, valor), h('span', null, etiqueta), h('small', null, detalle || ''));
  const cifras = (...c) => h('section', { class: 'panel-cifras', 'aria-label': 'Resumen' }, ...c);
  const ir = (hash, texto) => h('a', { class: 'btn btn--chico', href: hash }, texto);

  function resumenDe(rol) {
    const s = S(); const aj = s.ajustes;
    const n = (e) => aj.filter((a) => a.estado === e).length;
    if (rol === 'docente') {
      const sig = !s.actividades.length ? ['Crea tu primera actividad', 'Planea con el DUA y arma su quiz.', '#/mi/actividades', 'Crear actividad']
        : n('devuelto') ? ['Orientación devolvió un ajuste', 'Revisa la nota y vuelve a enviarlo.', '#/mi/ajustes', 'Ver ajustes']
        : !aj.length ? ['Ajusta una actividad a un estudiante', 'Cada apoyo del perfil se vuelve un cambio concreto.', '#/mi/ajustes', 'Hacer un ajuste']
        : n('propuesto') ? ['Tus ajustes esperan a orientación', 'Mientras tanto, planea otra actividad.', '#/mi/actividades', 'Ir a actividades']
        : ['Tus ajustes ya llegaron al estudiante', 'Míralo como lo ve el estudiante.', '#/mi/ajustes', 'Ver ajustes'];
      return { titulo: 'Tu clase, ajustada a cada estudiante', texto: 'Planea una vez, ajusta a cada perfil y deja que orientación valide.', sig,
        panel: cifras(celda(s.estudiantes.length, 'estudiantes', 'en tus cursos'), celda(s.actividades.length, 'actividades', 'planeadas'), celda(n('propuesto'), 'ajustes en revisión', 'esperan a orientación'), celda(n('aprobado'), 'ajustes aprobados', 'ya llegaron al estudiante')) };
    }
    if (rol === 'orientacion') {
      const sig = n('propuesto') ? ['Hay ajustes por revisar', 'El docente propone y tú validas.', '#/mi/ajustes', 'Revisar'] : s.estudiantes.some((e) => !e.apoyos.length) ? ['Completa los perfiles que faltan', 'Sin apoyos registrados no se puede ajustar.', '#/mi/estudiantes', 'Ver perfiles'] : ['Todo al día', 'No hay nada pendiente.', '#/mi/archivos', 'Ver archivos'];
      return { titulo: 'Validas antes de que llegue al estudiante', texto: 'Revisa los ajustes, completa los perfiles y guarda lo clínico donde solo tú lo ves.', sig,
        panel: cifras(celda(n('propuesto'), 'por revisar', 'ajustes pendientes'), celda(s.estudiantes.filter((e) => e.piar).length, 'con PIAR', 'de ' + s.estudiantes.length), celda(s.estudiantes.filter((e) => !e.apoyos.length).length, 'perfiles sin apoyos', 'por completar'), celda(db.lista('archivos').filter((a) => a.visibilidad === 'clinico').length, 'archivos clínicos', 'solo tú los ves')) };
    }
    if (rol === 'coordinacion') {
      return { titulo: 'La estructura del colegio, lista', texto: 'Defines quién es quién, en qué curso y con qué categorías de apoyo. El contenido pedagógico es de docentes y orientación.', sig: ['Revisa que cada estudiante tenga curso', 'Es lo único que necesitan los demás para trabajar.', '#/mi/estudiantes', 'Ver estudiantes'],
        panel: cifras(celda(s.estudiantes.length, 'estudiantes', 'en ' + s.cursos.length + ' cursos'), celda(s.categorias.length, 'categorías de apoyo', 'disponibles'), celda(n('propuesto'), 'ajustes en revisión', 'solo el conteo'), celda(s.actividades.filter((a) => ['repr', 'accion', 'compromiso'].every((k) => a.dua[k] && a.dua[k].length)).length, 'actividades con DUA completo', 'de ' + s.actividades.length)) };
    }
    return null;
  }

  function vistaResumen(c, rol) {
    const r = resumenDe(rol);
    MT.comun.hero({ titulo: r.titulo, texto: r.texto, siguiente: { titulo: r.sig[0], texto: r.sig[1], boton: { texto: r.sig[3], onclick: () => { location.hash = r.sig[2]; } } } });
    c.append(r.panel);
    // Plegado: es referencia, no la acción de la pantalla (la acción es el «siguiente paso» de arriba). Sigue a un clic.
    c.append(h('details', { class: 'plegable' }, h('summary', null, 'Qué puedes hacer y qué no'), h('div', { class: 'rejilla rejilla--2' },
      h('div', null, h('p', { class: 'etiqueta' }, 'Puedes'), h('ul', null, MT.roles.por(rol).haces.map((x) => h('li', null, x)))),
      h('div', null, h('p', { class: 'etiqueta' }, 'No puedes (a propósito)'), h('ul', null, MT.roles.por(rol).noHaces.map((x) => h('li', null, x)))))));
  }

  /* ------------------------------ Familia ------------------------------ */
  function vistaFamilia(c) {
    const s = S(); const id = s.vinculo;
    const aprobados = s.ajustes.filter((a) => a.estudiante === id && a.estado === 'aprobado');
    const novedades = s.eventos.filter((e) => e.familia && (!e.estudiante || e.estudiante === id)).slice().reverse();
    const notas = s.notas.filter((n) => n.estudiante === id && n.paraFamilia).slice().reverse();
    const est = db.estudiante(id);
    MT.comun.hero({ titulo: 'Así acompañamos a tu estudiante', texto: 'Ves lo que el colegio ya aprobó. No ves información clínica ni puedes cambiar ajustes.' });
    c.append(caja(h('div', { class: 'campo' }, h('label', { for: 'vinculo' }, 'Estudiante que acompañas'), h('p', { class: 'suave campo__ayuda' }, 'En el piloto coordinación vincula tu cuenta con tu estudiante. Aquí puedes elegir para ver cómo se ve cada caso.'),
        h('select', { id: 'vinculo', onchange: (e) => { MT.store.cambiar((x) => { x.vinculo = e.target.value; }); MT.router.recargar(); } }, s.estudiantes.map((e) => h('option', { value: e.id, selected: e.id === id }, e.id))))),
      caja(h('h2', null, 'Apoyos en clase'), est && est.apoyos.length ? h('ul', null, est.apoyos.map((a) => h('li', null, a))) : sinFoco('Todavía no hay apoyos registrados.'),
        est && est.fortalezas.length ? h('div', null, h('p', { class: 'etiqueta' }, 'Fortalezas'), h('ul', null, est.fortalezas.map((a) => h('li', null, a)))) : null),
      caja(h('h2', null, 'Ajustes aprobados'), MT.guias.notaAjuste(), aprobados.length ? h('div', { class: 'rejilla' }, aprobados.map((a) => h('article', { class: 'tarjeta tarjeta--plana' }, h('h3', null, (db.obtener('actividades', a.actividad) || { titulo: 'Actividad' }).titulo),
        h('ul', { class: 'lista' }, a.items.map((i) => h('li', null, h('strong', null, i.cambio), h('br'), h('span', { class: 'suave' }, i.porque))))))) : sinFoco('Cuando orientación apruebe un ajuste, lo verás aquí con su explicación.')),
      caja(h('h2', null, 'Mensajes del equipo'), notas.length ? h('ul', { class: 'lista' }, notas.map((n) => h('li', null, h('small', { class: 'suave' }, fecha(n.fecha) + ' · '), n.texto))) : sinFoco('No hay mensajes todavía.')),
      caja(h('h2', null, 'Novedades'), novedades.length ? h('ul', { class: 'lista' }, novedades.slice(0, 8).map((e) => h('li', null, h('small', { class: 'suave' }, fecha(e.t) + ' · '), e.texto))) : sinFoco('Sin novedades por ahora.')));
  }

  /* ------------------------------ Estudiante ------------------------------ */
  function quizRunner(zona, { id, titulo, preguntas, alTerminar }) {
    let i = 0; let aciertos = 0;
    const pintar = () => {
      if (i >= preguntas.length) {
        const todas = aciertos === preguntas.length;
        zona.replaceChildren(h('div', { class: 'quiz-final' }, h('h3', null, todas ? '¡Quiz perfecto!' : 'Quiz completo'), h('p', null, `Acertaste ${aciertos} de ${preguntas.length}.`),
          h('button', { class: 'btn btn--chico', type: 'button', onclick: () => { i = 0; aciertos = 0; pintar(); } }, 'Intentarlo otra vez')));
        alTerminar(aciertos, preguntas.length); return;
      }
      const p = preguntas[i]; let respondida = false;
      const retro = h('div', { class: 'retro', 'aria-live': 'polite' });
      const sig = h('button', { class: 'btn btn--chico', type: 'button', hidden: true, onclick: () => { i += 1; pintar(); } }, i + 1 === preguntas.length ? 'Ver resultado' : 'Siguiente');
      // Si el enunciado cita una frase en inglés (con su espacio en blanco), las opciones también lo están, aunque sean una sola palabra ("eats").
      const enIngles = /«[^»]*___[^»]*»/.test(p.q) && MT.ui.esIngles((p.q.match(/«[^»]*»/) || [''])[0], true);
      const opciones = p.o.map((o, j) => h('button', { class: 'opcion', type: 'button', lang: enIngles || MT.ui.esIngles(o) ? 'en' : null, onclick: (e) => {
        if (respondida) return; respondida = true;
        const ok = j === p.a; if (ok) aciertos += 1;
        opciones.forEach((b, k) => { b.disabled = true; if (k === p.a) b.classList.add('correcta'); else if (k === j) b.classList.add('incorrecta'); });
        retro.replaceChildren(h('strong', null, ok ? 'Correcto. ' : 'No es esa. '), p.why || ''); sig.hidden = false; sig.focus();
      } }, o));
      zona.replaceChildren(h('p', { class: 'etiqueta' }, `${titulo} · Pregunta ${i + 1} de ${preguntas.length}`), h('p', { class: 'pregunta' }, MT.ui.conIdiomas(p.q)), h('div', { class: 'opciones' }, opciones), retro, sig);
    };
    pintar();
  }

  function vistaEstudiante(c, sub) {
    const s = S(); const id = s.vinculo; const p = db.progreso(id);
    const xp = p.xp; const nivel = Math.floor(xp / 100) + 1;
    if (sub === 'resumen') {
      const acts = db.lista('actividades').filter((a) => a.estado === 'publicada');
      MT.comun.hero({ titulo: 'Tu actividad de hoy', texto: 'Aprende a tu ritmo. Si orientación aprobó un ajuste para ti, la actividad ya viene a tu medida.' });
      c.append(MT.comun.panelCifras([{ valor: xp, etiqueta: 'puntos', detalle: 'nivel ' + nivel }, { valor: p.logros.length, etiqueta: 'logros', detalle: 'de ' + MT.datos.logros.length }, { valor: Object.keys(p.quiz).length, etiqueta: 'quizes hechos', detalle: '' }]),
        caja(h('div', { class: 'campo' }, h('label', { for: 'yo' }, 'Quién soy'), h('p', { class: 'suave campo__ayuda' }, 'En el piloto tu cuenta ya viene vinculada a un estudiante. Aquí puedes elegir para ver cómo se ve cada caso.'), h('select', { id: 'yo', onchange: (e) => { MT.store.cambiar((x) => { x.vinculo = e.target.value; }); MT.router.recargar(); } }, s.estudiantes.map((e) => h('option', { value: e.id, selected: e.id === id }, e.id))))));
      if (!acts.length) c.append(caja(sinFoco('Tu docente todavía no publicó actividades.')));
      acts.forEach((a) => {
        const aj = db.lista('ajustes').filter((x) => x.actividad === a.id && x.estudiante === id && x.estado === 'aprobado').pop();
        const zona = h('div');
        c.append(h('article', { class: 'tarjeta' }, h('div', { class: 'tarjeta-cab' }, h('h2', null, a.titulo), aj ? h('span', { class: 'estado estado--aprobado' }, 'A tu medida') : null),
          h('p', { class: 'suave' }, `${a.asignatura} · ${a.tema}`), h('p', null, a.descripcion),
          aj ? h('div', { class: 'aviso' }, h('strong', null, 'Cambios para ti: '), h('ul', null, aj.items.map((i) => h('li', null, i.cambio)))) : null,
          a.pasos.length ? h('ol', null, a.pasos.map((x) => h('li', null, x))) : null,
          a.quiz.length ? h('div', null, h('h3', null, 'Quiz'), zona) : h('p', { class: 'suave' }, 'Esta actividad no tiene quiz.')));
        if (a.quiz.length) quizRunner(zona, { id: a.id, titulo: a.titulo, preguntas: a.quiz, alTerminar: (ok, tot) => cerrarQuiz(id, a.id, ok, tot, !!aj) });
      });
      return;
    }
    if (sub === 'ruta') {
      cab('Ruta de Inglés, grado 8.°', null, 'La escribió el equipo de Wisfox a partir de la malla de Inglés 2026: cuatro unidades, una por periodo.');
      MT.catalogo.ingles.unidades.forEach((u) => {
        c.append(h('section', { class: 'tarjeta' }, h('p', { class: 'etiqueta' }, 'Periodo ' + u.periodo), h('h2', null, u.tituloEs || u.titulo),
          h('div', { class: 'rejilla' }, u.lecciones.map((l) => leccion(l, id)))));
      });
      return;
    }
    if (sub === 'archivos') return archivos(c, { rol: 'estudiante', titulo: 'Material', ayuda: 'Guías y recursos que tu docente compartió contigo.' });
    if (sub === 'logros') {
      cab('Mis logros', null, `${xp} puntos · nivel ${nivel}`);
      c.append(caja(h('div', { class: 'rejilla rejilla--3' }, MT.datos.logros.map((l) => {
        const ok = p.logros.includes(l.id);
        return h('div', { class: 'logro' + (ok ? ' logro--ok' : '') }, h('span', { 'aria-hidden': 'true' }, l.icono), h('strong', null, l.nombre), h('small', null, ok ? 'Conseguido' : 'Por conseguir'));
      }))));
      return;
    }
  }

  function cerrarQuiz(est, clave, ok, tot, adaptada) {
    st.cambiar((s) => {
      const p = db.progreso(est); const antes = p.quiz[clave];
      p.quiz[clave] = Math.max(antes || 0, ok);
      if (antes === undefined) p.xp = Math.min(500, p.xp + 20 + ok * 5);
      ['quiz'].forEach((l) => st.logro(l, est));
      if (ok === tot) st.logro('perfecto', est);
      if (adaptada) st.logro('adaptada', est);
      st.evento('Completó un quiz con ' + ok + ' de ' + tot, true, est);
    });
  }

  function leccion(l, est) {
    const p = db.progreso(est); const hecha = p.vistas.includes(l.id);
    const abrir = () => {
      const zona = h('div');
      const d = dlg.abrir({ titulo: l.t, ancho: '42rem', cuerpo: h('div', null, h('p', { class: 'suave' }, `${l.d} · ${l.tipo}`), h('div', { class: 'leccion' }, htmlSeguro(l.html)),
        l.fichas && l.fichas.length ? h('div', null, h('h3', null, 'Fichas'), h('ul', null, l.fichas.map((f) => h('li', null, h('strong', null, f.t + ': '), f.d)))) : null,
        l.quiz && l.quiz.length ? h('div', null, h('h3', null, 'Quiz de la lección'), zona) : null) });
      st.cambiar(() => { if (!p.vistas.includes(l.id)) { p.vistas.push(l.id); p.xp = Math.min(500, p.xp + 10); st.logro('leccion', est); } });
      if (l.quiz && l.quiz.length) quizRunner(zona, { id: l.id, titulo: l.t, preguntas: l.quiz, alTerminar: (ok, tot) => cerrarQuiz(est, l.id, ok, tot, false) });
      d.el.addEventListener('close', () => MT.router.recargar());
    };
    return h('article', { class: 'tarjeta tarjeta--plana' }, h('h3', null, l.t), h('p', { class: 'suave' }, `${l.d} · ${l.quiz ? l.quiz.length : 0} preguntas`),
      h('button', { class: 'btn btn--chico' + (hecha ? ' btn--suave' : ''), type: 'button', onclick: abrir }, hecha ? 'Repasar' : 'Empezar'));
  }

  /* ------------------------------ Ruta principal ------------------------------ */
  function elegirRol(main) {
    const c = MT.comun.pagina(main, { etiqueta: 'Mi espacio', titulo: '¿Quién eres?', descripcion: 'Elige tu rol. Cada uno ve y hace cosas distintas, y todo lo que haces queda en este navegador.' });
    // Cinco opciones compactas: una ficha por rol, con el color de uno de los hilos y un ícono pequeño. Cada una es un botón y se lee completa.
    c.append(h('div', { class: 'rejilla rejilla--3 rol-opciones' }, MT.roles.lista.map((r) => h('button', { class: 'tarjeta rol-opcion', type: 'button', onclick: () => { st.cambiar((s) => { s.rol = r.id; }); location.hash = '#/mi'; } },
      h('span', { class: 'rol-icono' }, icono(r.icono)), h('strong', null, r.nombre), h('span', { class: 'suave' }, r.lema)))));
  }

  MT.router.registrar({
    id: 'mi', titulo: 'Mi espacio',
    espacio: () => { const r = S().rol; return r ? ROL_ESP[r] : ''; },
    subs: () => (S().rol ? SECCIONES[S().rol] : null),
    render(main, { sub }) {
      const rol = S().rol;
      if (!rol) return elegirRol(main);
      const r = MT.roles.por(rol);
      const contenido = MT.comun.espacio(main, { nombre: 'Mi espacio', descripcion: r.nombre, ruta: 'mi', tabs: SECCIONES[rol].concat(MT.plan.PRO_NAV[rol] || []), sub, rolId: rol });
      const franja = MT.guias.franjaDe(rol, sub); if (franja && MT.comun.cabActual) MT.comun.cabActual.poner({ extra: franja }); // «Paso X de N» siempre bajo la línea de la cabecera
      const c = h('div', { class: 'espacio-cuerpo' }); contenido.append(c);
      const permitido = SECCIONES[rol].some((x) => x.id === sub);
      if (!permitido) { c.append(caja(h('p', { class: 'aviso' }, 'Esta sección no es de tu rol.'))); return; }
      if (rol === 'estudiante') return vistaEstudiante(c, sub);
      if (rol === 'familia') return sub === 'archivos' ? archivos(c, { rol, titulo: 'Archivos para tu familia', ayuda: 'Material que el colegio compartió contigo.' }) : vistaFamilia(c);
      if (sub === 'resumen') return vistaResumen(c, rol);
      if (sub === 'estudiantes') return vistaEstudiantes(c, rol);
      if (sub === 'actividades') return vistaActividades(c);
      if (sub === 'ajustes') return vistaAjustes(c, rol);
      if (sub === 'notas') return vistaNotas(c, rol);
      if (sub === 'cursos') return vistaCursos(c);
      if (sub === 'categorias') return vistaCategorias(c);
      if (sub === 'archivos') return archivos(c, { rol, titulo: 'Archivos', ayuda: rol === 'orientacion' ? 'Aquí también vive lo clínico: solo orientación lo ve.' : 'Guías, imágenes y material. Tú eliges quién lo ve.' });
    },
  });
})(window.MT = window.MT || {});
