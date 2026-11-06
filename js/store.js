/* store.js: el estado de la plataforma y las operaciones para crearlo, editarlo y borrarlo.

   Qué guarda: el rol de quien usa la plataforma y las colecciones de datos (cursos, estudiantes, categorías de
   apoyo, actividades, ajustes, notas, progreso y los metadatos de los archivos). Todo queda en el navegador de
   quien lo crea (localStorage); los archivos, en IndexedDB (ver archivos.js). No hay servidor: nada sale del dispositivo.

   Si el almacenamiento falla (modo privado, sitio bloqueado), todo sigue funcionando en memoria. */
(function (MT) {
  'use strict';
  const CLAVE = 'mosaicotelar.v2';

  function inicial() {
    return Object.assign({
      rol: '',
      cuenta: null,           // el registro de esta persona (correo, rol, plan); sobrevive a "empezar de nuevo"
      vinculo: 'P-03',        // el estudiante con quien se identifica la familia y el propio estudiante
      contador: {},
      actividad: '',          // el último texto que propuso Niky al docente
      ia: [],
    }, MT.datos.semilla());
  }

  function cargar() {
    try {
      const crudo = window.localStorage.getItem(CLAVE);
      if (crudo) return Object.assign(inicial(), JSON.parse(crudo));
    } catch (e) { /* almacenamiento no disponible: se sigue en memoria */ }
    return inicial();
  }

  let estado = cargar();
  const oyentes = new Set();
  let guardado = true;

  function guardar() {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(estado)); guardado = true; } catch (e) { guardado = false; }
  }
  function avisar() { oyentes.forEach((f) => { try { f(estado); } catch (e) { console.error(e); } }); }

  MT.store = {
    obtener: () => estado,
    cambiar(fn) { fn(estado); guardar(); avisar(); },
    suscribir(f) { oyentes.add(f); return () => oyentes.delete(f); },
    reiniciar() { const c = estado.cuenta; estado = inicial(); estado.cuenta = c; guardar(); avisar(); },
    persistente: () => guardado,
    // Anota algo en la historia. Solo lo marcado para la familia aparece en su vista.
    evento(texto, paraFamilia, estudiante) {
      estado.eventos.push({ t: new Date().toISOString(), texto, familia: !!paraFamilia, estudiante: estudiante || '' });
      if (estado.eventos.length > 80) estado.eventos.shift();
    },
    logro(id, estudiante) {
      const p = MT.db.progreso(estudiante || estado.vinculo);
      if (!p.logros.includes(id)) p.logros.push(id);
    },
  };

  /* Operaciones sobre las colecciones. Cada una guarda y avisa, así las pantallas se repintan solas. */
  const prefijos = { actividades: 'a', ajustes: 'j', archivos: 'f', notas: 'n', cursos: 'c', categorias: 'k' };
  MT.db = {
    lista: (col) => estado[col] || [],
    obtener: (col, id) => (estado[col] || []).find((x) => x.id === id) || null,
    crear(col, obj) {
      let creado;
      MT.store.cambiar((s) => {
        let id = obj.id;
        if (!id) {
          if (col === 'estudiantes') {
            const mayor = Math.max(0, ...s.estudiantes.map((e) => Number((e.id.match(/\d+/) || [0])[0])));
            id = 'P-' + String(mayor + 1).padStart(2, '0');
          } else {
            s.contador[col] = (s.contador[col] || 100) + 1;
            id = prefijos[col] + s.contador[col];
          }
        }
        creado = Object.assign({}, obj, { id });
        s[col].push(creado);
      });
      return creado;
    },
    actualizar(col, id, cambios) {
      MT.store.cambiar((s) => { const x = s[col].find((y) => y.id === id); if (x) Object.assign(x, cambios); });
      return MT.db.obtener(col, id);
    },
    borrar(col, id) { MT.store.cambiar((s) => { s[col] = s[col].filter((x) => x.id !== id); }); },
    progreso(estudiante) {
      if (!estado.progreso[estudiante]) estado.progreso[estudiante] = { xp: 0, logros: [], quiz: {}, vistas: [] };
      return estado.progreso[estudiante];
    },
    sumarXP(estudiante, n) { MT.store.cambiar(() => { const p = MT.db.progreso(estudiante); p.xp = Math.min(500, p.xp + n); }); },
    // El ajuste más reciente de una actividad para un estudiante, o null.
    ajusteDe(actividadId, estudiante) {
      const l = estado.ajustes.filter((a) => a.actividad === actividadId && a.estudiante === estudiante);
      return l.length ? l[l.length - 1] : null;
    },
    estudiante: (id) => (estado.estudiantes || []).find((e) => e.id === id) || null,
    curso: (id) => (estado.cursos || []).find((c) => c.id === id) || null,
  };
})(window.MT = window.MT || {});
