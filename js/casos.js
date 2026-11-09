/* casos.js: los cinco casos de la exposición guiada.

   Para qué sirve. El lunes 9 de noviembre el equipo expone la plataforma en la mesa de la Cámara de Comercio. Después del pitch (unos 3 minutos)
   quedan de 7 a 12 minutos para mostrar cómo trabajan juntos Kinesis, Wisfox y Niky con UN mismo ejemplo, mientras los estudiantes de cada
   grupo cuentan lo que construyeron. Hay cinco casos preparados y funcionales, pero en cada exposición se usa uno solo: se elige en el
   selector del guion (modo presentación) o con la dirección del sitio, por ejemplo ?caso=3.

   Qué trae cada caso (todo con códigos P-01 a P-10, sin nombres ni diagnósticos):
   - una asignatura, una actividad y el estudiante con quien se cuenta la historia;
   - el perfil de apoyos de ese estudiante, ya guardado;
   - lo que Niky propone al docente y lo que le explica al estudiante (respuestas de ejemplo, no un modelo conectado);
   - el guion de pasos: en qué pantalla estar, qué grupo habla y cuánto tiempo dura cada paso.
   El caso 5 agrega un giro: orientación devuelve el ajuste con una nota, el docente lo corrige y orientación lo aprueba.

   Qué NO trae todavía (queda pendiente a propósito): los recursos de cada caso en cada portal, como imágenes, audios, tarjetas y guías
   imprimibles. El texto de las actividades y de los quizes es un borrador por aprobar del equipo docente.

   Cómo se activa. Sin el modo presentación nada de esto cambia: la plataforma se comporta como siempre. Con el modo presentación activo,
   el caso elegido define el guion, lo que responde Niky y las sugerencias del chat. El número del caso se recuerda en este navegador. */
(function (MT) {
  'use strict';
  const CLAVE = 'mosaicotelar.caso';
  const ahora = () => new Date().toISOString();

  // Las opciones del DUA se escriben igual que en datos.js, para que el formulario de la actividad las reconozca marcadas.
  const REPR = ['Imágenes junto al texto', 'Instrucciones en pasos numerados', 'Un ejemplo resuelto antes de la tarea'];
  const ACCION = ['Responder escribiendo, dibujando o hablando', 'Elegir el formato de entrega', 'Trabajar en parejas'];
  const COMPROMISO = ['Elegir el contexto de la tarea', 'Metas cortas con retroalimentación', 'Compartir en pareja y no frente al curso'];

  const CASOS = [
    /* ---------------------------------------------------------------- 1. Inglés: es el ejemplo de partida de la plataforma */
    {
      n: 1, etiqueta: 'Inglés: «Mi rutina del día»', asignatura: 'Inglés', estudiante: 'P-03', titulo: 'Mi rutina del día',
      perfil: null, actividad: null, // usa el perfil y la actividad que ya trae la plataforma
      ideas: 'Necesito una actividad de 20 minutos para enseñar el present simple a grado 8.º.',
      ayuda: { etiqueta: 'No entiendo la s del verbo', pregunta: 'No entiendo cuándo se le pone la s al verbo.' },
      ia: null, // las respuestas de ejemplo de datos.js ya son de este caso
    },

    /* ---------------------------------------------------------------- 2. Matemáticas: tiempo adicional y vocabulario de apoyo */
    {
      n: 2, etiqueta: 'Matemáticas: proporcionalidad', asignatura: 'Matemáticas', estudiante: 'P-07', titulo: 'Recetas y escalas: razón y proporción',
      perfil: null, // P-07 ya trae tiempo adicional y vocabulario de apoyo
      actividad: {
        id: 'a2', titulo: 'Recetas y escalas: razón y proporción', asignatura: 'Matemáticas', tema: 'Razón y proporción',
        descripcion: 'Los estudiantes cambian una receta de limonada de 2 a 6 vasos y descubren qué se mantiene igual. Cada uno elige cómo mostrar su resultado: con una tabla, un dibujo o explicándolo en voz alta.',
        dua: { repr: [REPR[0], REPR[2]], accion: [ACCION[0]], compromiso: [COMPROMISO[0]] },
        pasos: ['Mira la receta de limonada para 2 vasos.', 'Calcula cuánto necesitas para 6 vasos con la tabla de tarjetas.', 'Cuéntale a una compañera qué se mantiene igual.'],
        quiz: [
          { q: 'Una receta usa 2 tazas de harina por 1 taza de leche. ¿Cuántas tazas de harina necesitas para 3 tazas de leche?', o: ['3', '4', '6', '8'], a: 2, why: 'Si la leche se multiplica por 3, la harina también: 2 × 3 = 6.' },
          { q: 'La razón entre 6 niñas y 3 niños se escribe…', o: ['3 : 6', '6 : 3', '6 + 3', '9 : 1'], a: 1, why: 'Se escribe en el orden de la frase: 6 niñas por cada 3 niños, 6 : 3.' },
          { q: '¿Cuál de estas es una proporción?', o: ['2 : 1 = 6 : 3', '2 : 1 = 6 : 4', '3 : 1 = 6 : 3', '2 : 3 = 6 : 3'], a: 0, why: 'Es proporción cuando las dos razones valen lo mismo: 6 : 3 se simplifica a 2 : 1.' },
          { q: 'Un mapa tiene escala 1 : 100. Si algo mide 5 cm en el mapa, en la realidad mide…', o: ['5 cm', '50 cm', '500 cm', '105 cm'], a: 2, why: 'La escala 1 : 100 dice que 1 cm del mapa son 100 cm reales: 5 × 100 = 500 cm.' },
        ],
        archivos: [],
      },
      ideas: 'Necesito una actividad de 20 minutos sobre proporcionalidad para grado 8.º, con una receta de cocina.',
      ayuda: { etiqueta: 'No entiendo qué es una razón', pregunta: 'No entiendo qué es una razón en matemáticas.' },
      ia: {
        disenar: '**Actividad de 20 minutos: recetas y escalas**\n\n**Inicio (4 min).** Muestra la receta de una limonada para 2 vasos y pregunta: “¿Qué cambiaría si fueran 6?”. Responden en voz alta, en parejas o señalando.\n\n**Desarrollo (12 min).** Cada estudiante completa una tabla con tarjetas de ingredientes y elige cómo mostrar su resultado: la tabla, un dibujo o explicándolo hablando.\n\n**Cierre (4 min).** Comparten en pareja qué se mantiene igual cuando la receta crece.\n\nTú decides qué usar y qué cambiar.',
        ayuda: 'Buena pregunta. La idea es esta:\n\n- Una **razón** compara dos cantidades dividiéndolas. En la limonada, 2 vasos de agua por 1 limón es la razón *2 : 1*.\n- Una **proporción** dice que dos razones valen lo mismo: *2 : 1 = 6 : 3*.\n\nTruco: multiplica o divide las dos cantidades por el mismo número.\n\nPara practicar: si 2 limones dan 4 vasos, ¿cuántos limones necesitas para 10 vasos?',
      },
    },

    /* ---------------------------------------------------------------- 3. Ciencias naturales: descansos y recibir la instrucción por dos canales */
    {
      n: 3, etiqueta: 'Ciencias naturales: cadenas alimentarias', asignatura: 'Ciencias naturales', estudiante: 'P-02', titulo: 'Quién come a quién: cadenas alimentarias',
      perfil: null, // P-02 ya trae descansos activos e instrucciones orales y escritas
      actividad: {
        id: 'a3', titulo: 'Quién come a quién: cadenas alimentarias', asignatura: 'Ciencias naturales', tema: 'Ecosistemas y cadenas alimentarias',
        descripcion: 'Los estudiantes arman en parejas una cadena alimentaria con tarjetas y flechas. Cada uno elige cómo presentarla: dibujándola, escribiéndola o contándola.',
        dua: { repr: [REPR[0], REPR[1]], accion: [ACCION[0], ACCION[2]], compromiso: [COMPROMISO[2]] },
        pasos: ['Mira las tarjetas del ecosistema: pasto, saltamontes, rana, culebra y águila.', 'Ordena la cadena con flechas, de quien es comido a quien come.', 'Cuéntale tu cadena a tu pareja.'],
        quiz: [
          { q: '¿Quién es el productor en la cadena pasto → saltamontes → rana?', o: ['El pasto', 'El saltamontes', 'La rana', 'Ninguno'], a: 0, why: 'El pasto fabrica su alimento con la luz del sol: es el productor.' },
          { q: 'Un animal que come solo plantas se llama…', o: ['carnívoro', 'herbívoro', 'descomponedor', 'productor'], a: 1, why: 'Herbívoro: su alimento son las plantas.' },
          { q: 'En una cadena alimentaria, la flecha indica…', o: ['quién es más grande', 'hacia dónde pasa la energía', 'quién vive más años', 'dónde viven'], a: 1, why: 'La flecha señala hacia dónde pasa la energía: de quien es comido a quien come.' },
          { q: '¿Qué hacen los descomponedores, como los hongos?', o: ['Producen su alimento con luz', 'Cazan animales', 'Descomponen lo que muere y devuelven nutrientes al suelo', 'Solo comen plantas vivas'], a: 2, why: 'Los descomponedores transforman lo que muere en nutrientes que vuelven al suelo.' },
        ],
        archivos: [],
      },
      ideas: 'Necesito una actividad de 20 minutos sobre cadenas alimentarias para grado 8.º.',
      ayuda: { etiqueta: 'No entiendo qué es un productor', pregunta: 'No entiendo qué son los productores y los consumidores.' },
      ia: {
        disenar: '**Actividad de 20 minutos: quién come a quién**\n\n**Inicio (4 min).** Muestra tres imágenes de un ecosistema y pregunta: “¿Quién come a quién?”. Responden en voz alta, en parejas o señalando.\n\n**Desarrollo (12 min).** En parejas arman una cadena con tarjetas y flechas (la flecha indica hacia dónde va la energía). Cada uno elige cómo presentarla: dibujo, texto o hablando.\n\n**Cierre (4 min).** Pausa activa de dos minutos y comparten en pareja.\n\nTú decides qué usar y qué cambiar.',
        ayuda: 'Buena pregunta. La idea es esta:\n\n- Los **productores** (las plantas) fabrican su alimento con la luz del sol.\n- Los **consumidores** comen a otros seres vivos: los herbívoros comen plantas y los carnívoros comen animales.\n- Los **descomponedores** (hongos y bacterias) transforman lo que muere.\n\nEjemplo: *pasto → saltamontes → rana*.\n\nPara practicar: en esa cadena, ¿quién es el productor?',
      },
    },

    /* ---------------------------------------------------------------- 4. Lengua castellana: evitar leer en voz alta frente al curso */
    {
      n: 4, etiqueta: 'Lengua castellana: escribir un cuento', asignatura: 'Lengua castellana', estudiante: 'P-05', titulo: 'Escribo un cuento corto',
      perfil: { id: 'P-05', piar: true, apoyos: ['Evitar leer en voz alta frente al curso', 'Instrucciones en pasos cortos y numerados'], fortalezas: ['Escribe con mucha imaginación'] },
      actividad: {
        id: 'a4', titulo: 'Escribo un cuento corto', asignatura: 'Lengua castellana', tema: 'El cuento: inicio, nudo y desenlace',
        descripcion: 'Los estudiantes arman un cuento con tarjetas de personaje, lugar y problema. Cada uno elige cómo contarlo: escribiéndolo, dibujándolo en viñetas o grabándolo.',
        dua: { repr: [REPR[1], REPR[2]], accion: [ACCION[0], ACCION[1]], compromiso: [COMPROMISO[2]] },
        pasos: ['Elige una tarjeta de personaje, una de lugar y una de problema.', 'Escribe el inicio, el nudo y el desenlace de tu cuento.', 'Compártelo con una compañera, sin leerlo frente al curso.'],
        quiz: [
          { q: '¿En qué parte del cuento aparece el problema del personaje?', o: ['En el inicio', 'En el nudo', 'En el desenlace', 'En el título'], a: 1, why: 'En el nudo aparece el problema que el personaje debe enfrentar.' },
          { q: 'En el inicio de un cuento se presenta…', o: ['la solución del problema', 'el personaje y el lugar', 'el final', 'la enseñanza'], a: 1, why: 'El inicio presenta quién es el personaje y dónde está.' },
          { q: '¿Qué pasa en el desenlace?', o: ['Se presenta el personaje', 'Aparece el problema', 'El problema se resuelve o termina', 'Se escribe el título'], a: 2, why: 'En el desenlace el problema se resuelve o termina.' },
          { q: '¿Cuál de estas frases puede ser el inicio de un cuento?', o: ['Y colorín colorado, este cuento se ha acabado.', 'Lucía encontró un mapa viejo en la biblioteca del barrio.', 'Entonces el dragón huyó y todos celebraron.', 'Por eso nunca se debe mentir.'], a: 1, why: 'Presenta a un personaje y un lugar, y deja una pregunta abierta.' },
        ],
        archivos: [],
      },
      ideas: 'Necesito una actividad de 20 minutos para que grado 8.º escriba un cuento corto.',
      ayuda: { etiqueta: 'No sé cómo empezar mi cuento', pregunta: 'No sé cómo empezar mi cuento.' },
      ia: {
        disenar: '**Actividad de 20 minutos: escribo un cuento**\n\n**Inicio (4 min).** Lee un cuento de tres líneas y pregunta: “¿Cuál es el inicio, el nudo y el desenlace?”. Responden en voz alta, en parejas o señalando.\n\n**Desarrollo (12 min).** Cada estudiante elige tarjetas de personaje, lugar y problema y arma su cuento: escribiéndolo, en viñetas dibujadas o grabado.\n\n**Cierre (4 min).** Lo comparten en pareja, sin leerlo frente al curso.\n\nTú decides qué usar y qué cambiar.',
        ayuda: 'Buena pregunta. Empieza con tres preguntas:\n\n- ¿Quién es tu personaje?\n- ¿Dónde está?\n- ¿Qué problema tiene?\n\nUn cuento tiene **inicio** (presentas al personaje y el lugar), **nudo** (aparece el problema) y **desenlace** (se resuelve).\n\nEjemplo de inicio: *Lucía encontró un mapa viejo en la biblioteca del barrio.*\n\nPara practicar: ¿cuál sería el problema de tu personaje?',
      },
    },

    /* ---------------------------------------------------------------- 5. Ciencias sociales: orientación devuelve el ajuste con una nota */
    {
      n: 5, etiqueta: 'Ciencias sociales: línea de tiempo (con devolución)', asignatura: 'Ciencias sociales', estudiante: 'P-08', titulo: 'Línea de tiempo de la Independencia',
      // Empieza con dos apoyos: por eso la primera versión del ajuste queda incompleta y orientación la devuelve.
      perfil: { id: 'P-08', piar: true, apoyos: ['Apoyo visual junto al texto', 'Una sola tarea a la vez'], fortalezas: ['Recuerda las fechas con facilidad'] },
      devuelve: {
        nota: 'A este perfil también le sirven los descansos activos. Ya lo agregué: vuelve a generar el ajuste.',
        apoyoNuevo: 'Descansos activos cada 15 minutos',
      },
      actividad: {
        id: 'a5', titulo: 'Línea de tiempo de la Independencia', asignatura: 'Ciencias sociales', tema: 'La Independencia de Colombia',
        descripcion: 'Los estudiantes arman una línea de tiempo con tarjetas de fecha, imagen y hecho. Cada uno elige cómo presentarla: dibujada, escrita o contada.',
        dua: { repr: [REPR[0]], accion: [ACCION[0], ACCION[1]], compromiso: [COMPROMISO[1]] },
        pasos: ['Mira las cuatro imágenes: 1810, 1819, 1821 y 1830.', 'Ordena las tarjetas de la más antigua a la más reciente.', 'Cuéntale tu línea de tiempo a una compañera.'],
        quiz: [
          { q: '¿En qué año fue el grito de independencia del 20 de julio?', o: ['1810', '1819', '1821', '1830'], a: 0, why: 'El 20 de julio de 1810 se dio el grito de independencia en Santafé.' },
          { q: 'La Batalla de Boyacá ocurrió en…', o: ['1810', '1819', '1830', '1850'], a: 1, why: 'Fue el 7 de agosto de 1819, un triunfo clave del ejército libertador.' },
          { q: 'Una línea de tiempo suele ordenar los hechos…', o: ['del más reciente al más antiguo', 'por orden alfabético', 'del más antiguo al más reciente', 'al azar'], a: 2, why: 'Se ordenan en el tiempo, de lo más antiguo a lo más reciente.' },
          { q: '¿Qué fue la Gran Colombia?', o: ['Una batalla', 'Una república que unió territorios que hoy son Colombia, Venezuela, Ecuador y Panamá', 'Un río', 'Un tratado con España'], a: 1, why: 'Fue una república creada en 1819 que reunió esos territorios.' },
        ],
        archivos: [],
      },
      ideas: 'Necesito una actividad de 20 minutos sobre la Independencia de Colombia para grado 8.º.',
      ayuda: { etiqueta: '¿Qué pasó en 1819?', pregunta: 'No entiendo qué pasó en 1819.' },
      ia: {
        disenar: '**Actividad de 20 minutos: línea de tiempo**\n\n**Inicio (4 min).** Muestra cuatro imágenes de épocas (1810, 1819, 1821 y 1830) y pregunta: “¿Qué cambió entre una y otra?”. Responden en voz alta, en parejas o señalando.\n\n**Desarrollo (12 min).** Arman una línea de tiempo con tarjetas de fecha, imagen y hecho, una tarjeta a la vez. Eligen cómo presentarla: dibujada, escrita o contada.\n\n**Cierre (4 min).** La comparten en pareja.\n\nTú decides qué usar y qué cambiar.',
        ayuda: 'Buena pregunta. La idea es esta:\n\n- En **1819** ocurrió la **Batalla de Boyacá** (7 de agosto), un triunfo clave del ejército libertador.\n- Ese mismo año se creó la **Gran Colombia**, una república que unió varios territorios.\n\nPista para tu línea de tiempo: el grito de independencia fue el 20 de julio de **1810**.\n\nPara practicar: ¿cuál va primero en tu línea, 1810 o 1819?',
      },
    },
  ];

  /* ---------------------------------------------------------------- el caso elegido */
  const leer = () => { try { const n = Number(window.localStorage.getItem(CLAVE)); return n >= 1 && n <= CASOS.length ? n : 1; } catch (e) { return 1; } };
  const guardar = (n) => { try { window.localStorage.setItem(CLAVE, String(n)); } catch (e) { /* sin almacenamiento: vale mientras la página esté abierta */ } };
  const presentando = () => !!(MT.presentacion && MT.presentacion.activo());

  // Fuera del modo presentación la plataforma no cambia: el caso solo existe mientras se expone.
  const actual = () => CASOS[leer() - 1];
  const activo = () => (presentando() ? actual() : null);

  /* ---------------------------------------------------------------- lo que responde Niky en cada caso */
  const RESPUESTAS_BASE = Object.assign({}, MT.datos.respuestasIA);
  function sincronizar() {
    const c = activo();
    // Se restaura primero lo de partida y encima se pone lo del caso: así cambiar de caso nunca deja respuestas de otro.
    Object.keys(MT.datos.respuestasIA).forEach((k) => { delete MT.datos.respuestasIA[k]; });
    Object.assign(MT.datos.respuestasIA, RESPUESTAS_BASE, c && c.ia ? c.ia : {});
  }
  // Las sugerencias del chat: lo que el docente le pide a Niky y lo que le pregunta el estudiante en este caso.
  function sugerencias(rol) {
    const c = activo();
    if (!c) return null;
    const doc = { etiqueta: 'Pedir ideas: ' + c.asignatura, texto: c.ideas, tarea: 'disenar' };
    const est = { etiqueta: c.ayuda.etiqueta, texto: c.ayuda.pregunta, tarea: 'ayuda' };
    return rol === 'docente' ? [doc] : rol === 'estudiante' ? [est] : [doc, est];
  }

  /* ---------------------------------------------------------------- aplicar un caso a los datos */
  function aplicar(s, c) {
    s.vinculo = c.estudiante;
    if (c.perfil) {
      const e = s.estudiantes.find((x) => x.id === c.perfil.id);
      if (e) Object.assign(e, { piar: c.perfil.piar, apoyos: c.perfil.apoyos.slice(), fortalezas: c.perfil.fortalezas.slice() });
    }
    // Con una actividad propia, la lista del docente muestra solo la del caso: la historia se cuenta sin ruido.
    if (c.actividad) s.actividades = [Object.assign({ estado: 'publicada', fecha: ahora() }, c.actividad)];
  }

  async function cargar(n) {
    const c = CASOS[n - 1];
    if (!c) return false;
    guardar(n);
    // Se parte de los datos de ejemplo limpios (también vacía archivos y portales abiertos), y encima se aplica el caso.
    await MT.barra.empezarDeNuevo({ confirmar: false });
    MT.store.cambiar((s) => aplicar(s, c));
    sincronizar();
    MT.router.recargar();
    return true;
  }

  /* ---------------------------------------------------------------- acciones de los pasos
     Cada una es idempotente: si el paso se repite (el estudiante vuelve atrás) no duplica nada. Así quien presenta solo cuenta
     y señala; el estado de la plataforma ya está donde debe estar. */
  const db = () => MT.db;
  const act = (c) => db().lista('actividades').find((a) => a.estado === 'publicada') || db().lista('actividades')[0];
  const ajusteDe = (c) => { const a = act(c); return db().lista('ajustes').filter((x) => a && x.actividad === a.id && x.estudiante === c.estudiante).pop() || null; };

  const acciones = {
    proponer(c) {
      if (ajusteDe(c)) return;
      const a = act(c); const e = db().estudiante(c.estudiante);
      db().crear('ajustes', { actividad: a.id, estudiante: c.estudiante, items: MT.datos.generarAjuste(e), estado: 'propuesto', nota: '', fecha: ahora() });
      MT.store.cambiar(() => MT.store.evento('Un docente propuso un ajuste para ' + c.estudiante, false, c.estudiante));
    },
    devolver(c) {
      const j = ajusteDe(c); if (!j || j.estado !== 'propuesto' || !c.devuelve) return;
      const e = db().estudiante(c.estudiante);
      // Orientación completa el perfil con lo que faltaba y devuelve el ajuste con la razón.
      if (!e.apoyos.includes(c.devuelve.apoyoNuevo)) db().actualizar('estudiantes', e.id, { apoyos: e.apoyos.concat(c.devuelve.apoyoNuevo) });
      db().actualizar('ajustes', j.id, { estado: 'devuelto', nota: c.devuelve.nota });
      MT.store.cambiar(() => { MT.store.evento('Se actualizó el perfil de ' + c.estudiante, false, c.estudiante); MT.store.evento('Orientación devolvió un ajuste', false, c.estudiante); });
    },
    reenviar(c) {
      const j = ajusteDe(c); if (!j || j.estado !== 'devuelto') return;
      db().actualizar('ajustes', j.id, { estado: 'propuesto', nota: '', items: MT.datos.generarAjuste(db().estudiante(c.estudiante) || { apoyos: [] }) });
    },
    aprobar(c) {
      const j = ajusteDe(c); if (!j || j.estado !== 'propuesto') return;
      db().actualizar('ajustes', j.id, { estado: 'aprobado', nota: '' });
      MT.store.cambiar(() => MT.store.evento('Se aprobó un ajuste de ' + act(c).titulo, true, c.estudiante));
    },
    // El estudiante termina el quiz con 3 de 4: suma puntos y logros, y el docente ve el progreso en su resumen.
    simularQuiz(c) {
      const a = act(c); const p = db().progreso(c.estudiante);
      if (p.quiz[a.id] !== undefined) return;
      const ok = Math.max(0, a.quiz.length - 1);
      MT.store.cambiar(() => {
        p.quiz[a.id] = ok; p.xp = Math.min(500, p.xp + 20 + ok * 5);
        MT.store.logro('quiz', c.estudiante); if (ajusteDe(c) && ajusteDe(c).estado === 'aprobado') MT.store.logro('adaptada', c.estudiante);
        MT.store.evento('Completó un quiz con ' + ok + ' de ' + a.quiz.length, true, c.estudiante);
      });
    },
    // Los pasos con Niky empiezan con la conversación limpia: así en pantalla se ve solo lo de ese paso, y no lo del anterior.
    ideas(c) { if (MT.ia && MT.ia.panel) { MT.store.cambiar((s) => { s.ia = []; }); MT.ia.panel.abrir({ texto: c.ideas, tarea: 'disenar' }); } },
    ayuda(c) { if (MT.ia && MT.ia.panel) { MT.store.cambiar((s) => { s.ia = []; }); MT.ia.panel.abrir({ texto: c.ayuda.pregunta, tarea: 'ayuda' }); } },
  };

  function accion(nombre) { const c = actual(); if (nombre && acciones[nombre]) acciones[nombre](c); }

  // El panel de Niky se cierra al pasar al paso siguiente, sin quitarle el foco al botón «Siguiente» de quien presenta.
  function cerrarPanel() {
    const slot = document.getElementById('slot-ia');
    if (slot && !slot.hidden) { slot.hidden = true; if (MT.ia && MT.ia.panel) MT.ia.panel.abierto = false; const b = document.getElementById('btn-ia'); if (b) b.setAttribute('aria-expanded', 'false'); }
  }

  /* ---------------------------------------------------------------- el guion de pasos
     grupo: quién habla (Kinesis, Wisfox, Niky o todos). seg: segundos sugeridos. accion: lo que la plataforma hace sola al entrar.
     Reparto del tiempo (caso de unos 9 minutos): Kinesis 3:00, Wisfox 2:45, Niky 2:35 y el resto para abrir y cerrar. El caso 5 suma
     dos pasos (la devolución y el reenvío), así que dura cerca de 10 minutos y medio. */
  function guion(c) {
    const e = c.estudiante;
    const p = [
      { rol: '', hash: '#/', grupo: 'Todos', seg: 25, titulo: 'El caso de hoy',
        texto: `Presenta el caso: ${c.asignatura}, «${c.titulo}», y un estudiante identificado solo con el código ${e}. Todo es un ejemplo con datos ficticios.` },

      { rol: 'coordinacion', hash: '#/mi/cursos', grupo: 'Kinesis', seg: 25, titulo: 'Coordinación deja el colegio listo',
        texto: 'Coordinación crea el curso y registra a cada estudiante solo con un código, sin nombres. Es la estructura donde trabaja el resto del equipo.' },
      { rol: 'orientacion', hash: '#/mi/estudiantes', grupo: 'Kinesis', seg: 35, titulo: `Orientación: el perfil de ${e}`,
        texto: `En la fila de ${e} se ven sus apoyos, sin diagnóstico. Es lo que orientación registra y lo que el docente necesita para ajustar la clase.` },
      { rol: 'docente', hash: '#/mi/actividades', grupo: 'Kinesis', seg: 35, titulo: 'La docencia planea con el DUA',
        texto: `Abre la actividad «${c.titulo}»: se ven los tres principios del DUA y sus pasos cortos. Quien enseña decide qué ofrecer.` },
      { rol: 'docente', hash: '#/mi/ajustes', grupo: 'Kinesis', seg: 30, accion: 'proponer', titulo: 'El docente ajusta la actividad',
        texto: c.devuelve ? `Cada apoyo del perfil se vuelve un cambio con su razón. Esta primera versión solo recoge dos apoyos, y ya está enviada a orientación.`
          : `Cada apoyo de ${e} se vuelve un cambio concreto, con su razón. El ajuste ya está enviado a orientación.` },
    ];
    if (c.devuelve) {
      p.push(
        { rol: 'orientacion', hash: '#/mi/ajustes', grupo: 'Kinesis', seg: 35, accion: 'devolver', titulo: 'Orientación devuelve el ajuste con una nota',
          texto: 'Orientación revisa y devuelve el ajuste con una nota: al perfil le faltaba un apoyo, y ya quedó completo. Nada avanza sin su decisión.' },
        { rol: 'docente', hash: '#/mi/ajustes', grupo: 'Kinesis', seg: 35, accion: 'reenviar', titulo: 'La docencia corrige y vuelve a enviar',
          texto: 'Con el perfil completo, el ajuste se genera de nuevo y se reenvía. Ahora incluye el apoyo que faltaba.' });
    }
    p.push(
      { rol: 'orientacion', hash: '#/mi/ajustes', grupo: 'Kinesis', seg: 30, accion: 'aprobar', titulo: 'Orientación aprueba',
        texto: 'Orientación revisa los cambios y aprueba. Desde este momento el ajuste llega a la familia y al estudiante.' },
      { rol: 'familia', hash: '#/mi/resumen', grupo: 'Kinesis', seg: 25, titulo: 'La familia ve lo aprobado',
        texto: 'Solo aparece lo ya aprobado, con su razón y en lenguaje sencillo. La familia no ve información clínica ni cambia ajustes.' },

      { rol: 'estudiante', hash: '#/mi/resumen', grupo: 'Wisfox', seg: 45, titulo: 'Wisfox: la actividad a su medida',
        texto: 'El estudiante recibe la actividad con la marca «A tu medida» y la lista de cambios pensados para su perfil.' },
      { rol: 'estudiante', hash: '#/mi/resumen', grupo: 'Wisfox', seg: 45, titulo: 'Practica y responde el quiz',
        texto: 'Responde dos o tres preguntas del quiz. Cada respuesta explica por qué, sea correcta o no.' },
      { rol: 'estudiante', hash: '#/mi/logros', grupo: 'Wisfox', seg: 40, accion: 'simularQuiz', titulo: 'Puntos y logros',
        texto: 'Se suman puntos y se ganan logros. El docente verá este progreso para decidir el siguiente paso.' },
      { rol: 'estudiante', hash: '#/mi/ruta', grupo: 'Wisfox', seg: 35, titulo: 'La ruta de Inglés del equipo Wisfox',
        texto: 'Esta es la ruta de Inglés de grado 8.º que el equipo escribió con la malla del colegio: lo que Wisfox ya trae construido.' },

      { rol: 'docente', hash: '#/mi/actividades', grupo: 'Niky', seg: 55, accion: 'ideas', titulo: 'Niky ayuda a la docencia',
        texto: 'El docente le pide ideas a Niky, que propone una actividad con una respuesta de ejemplo. La IA acompaña; quien enseña decide qué usar.' },
      { rol: 'estudiante', hash: '#/mi/resumen', grupo: 'Niky', seg: 55, accion: 'ayuda', titulo: 'Niky ayuda al estudiante',
        texto: 'El estudiante le hace una pregunta sobre el tema. Niky explica con un ejemplo y le deja una pregunta para practicar.' },
      { rol: '', hash: '#/recorrido/roles', grupo: 'Niky', seg: 45, titulo: 'Lo que Niky nunca recibe',
        texto: 'La tabla «Quién ve qué» muestra que Niky no recibe información clínica ni perfiles de estudiantes. Hoy responde con ejemplos preparados.' },

      { rol: '', hash: '#/guia', grupo: 'Todos', seg: 35, titulo: 'Tres portales, una sola plataforma',
        texto: 'Cierra con los tres portales juntos e invita a probar la plataforma con el código QR del pendón. Quedan abiertas las preguntas.' });
    return p;
  }

  const total = (pasos) => pasos.reduce((t, x) => t + x.seg, 0);

  MT.casos = { lista: CASOS, numero: leer, actual, activo, cargar, guion, total, accion, sincronizar, sugerencias, cerrarPanel };
})(window.MT = window.MT || {});
