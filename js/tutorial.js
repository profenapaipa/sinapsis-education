/* tutorial.js: el tutorial guiado de la plataforma (MT.tutorial).

   Para qué sirve. Quien entra elige un rol y un ejemplo, y el tutorial lo LLEVA por las pantallas reales (cambia la dirección, el rol y,
   cuando el caso lo pide, ejecuta la acción de ejemplo: proponer, aprobar, devolver, reenviar, el quiz). No son capturas: lo que se ve es
   la plataforma funcionando, con una tarjeta flotante que dice qué mirar y un anillo suave sobre el elemento clave. Al salir, todo queda
   donde estaba para explorarlo con calma.

   De dónde sale cada recorrido. Hay 5 roles x 6 ejemplos = 30 recorridos (casos2: se sumó el de Tecnología). NO se escribieron 30 guiones: cada uno se deriva del guion de
   js/casos.js (MT.casos.guion), filtrando los pasos que le tocan a ese rol y tomando de ahí el título y la primera frase; los pasos que el
   guion no trae (por ejemplo, las categorías de apoyo de coordinación) salen de la guía por rol de js/guias.js. Aquí solo viven los textos
   propios del tutorial (TEXTOS): selector, bienvenidas, resúmenes finales y rótulos. Son borrador por aprobar del dueño.

   Reglas que se respetan:
   - Códigos 8A-01 a 8A-10 y datos ficticios; nada de nombres, diagnósticos ni cifras.
   - Niky hoy responde con ejemplos preparados; propone, la persona decide. Los textos no prometen nada que no exista.
   - Atrás vuelve a cargar el ejemplo y repite las acciones hasta ese paso, para que la pantalla nunca contradiga el texto (por ejemplo,
     que la familia vea «aprobado» en un paso que dice «todavía no hay novedades»).
   - Sin movimiento con prefers-reduced-motion ni con html[data-movimiento="calmado"] (css/tutorial.css). */
(function (MT) {
  'use strict';
  const { h, icono } = MT.ui;

  /* ---------------------------------------------------------------- TEXTOS (borrador por aprobar) */
  const TEXTOS = {
    nombre: 'Tutorial guiado',
    boton: 'Ver el tutorial',
    botonAyuda: 'Elige tu rol y un ejemplo; el tutorial te lleva por las pantallas reales.',
    selector: {
      titulo: 'Elige un ejemplo',
      bajada: 'Tú decides quién eres y qué caso quieres ver. Te llevamos por las pantallas reales, paso a paso.',
      rol: '¿Con qué rol lo quieres ver?',
      ejemplos: 'Seis ejemplos',   // casos2: eran cinco; ahora son seis con el de Tecnología
      nota: 'Los ejemplos usan datos ficticios y reemplazan lo que hayas creado en este navegador.',
      empezar: 'Empezar',
      cerrar: 'Cerrar',
    },
    // Una línea y una mascota por ejemplo (el título y la asignatura salen de js/casos.js).
    casos: {
      1: { linea: 'Una rutina del día en inglés, con una ayuda a la medida.', quien: 'wisfox', emocion: 'contento' },
      2: { linea: 'Recetas y escalas, con tiempo adicional y vocabulario de apoyo.', quien: 'kinesis', emocion: 'curioso' },
      3: { linea: 'Cadenas alimentarias, con pausas activas para trabajar mejor.', quien: 'sinapso', emocion: 'animo' },
      4: { linea: 'Escribir un cuento sin leerlo frente al curso.', quien: 'niky', emocion: 'pensando' },
      5: { linea: 'Una línea de tiempo donde orientación devuelve el ajuste y todo se corrige.', quien: 'kinesis', emocion: 'duda' },
      // ---- casos2 ---- Tecnología: lo acompaña Kinesis (el caso principal de ese equipo) con ánimo, que además le da su propio color en la tarjeta.
      6: { linea: 'Un primer programa con Turtle (Python): ejemplo que funciona, trabajo en pareja y retos por niveles.', quien: 'kinesis', emocion: 'animo' },
      // ---- fin casos2 ----
    },
    ui: {
      paso: (n, t) => `Paso ${n} de ${t}`,
      siguiente: 'Siguiente', atras: 'Atrás', terminar: 'Terminar', salir: 'Salir',
      cambiarRol: 'Cambiar de rol', otroEjemplo: 'Otro ejemplo', inicio: 'Volver al inicio',
      tarjeta: 'Tutorial guiado',
      ejemplo: (c) => `Ejemplo: ${c.asignatura}`,
      probar: 'Probar este ejemplo',
      vivo: (n, t, titulo) => `Paso ${n} de ${t}: ${titulo}`,
    },
    // Bienvenida de cada rol: se arma con el lema de js/roles.js y el caso elegido.
    intro: {
      titulo: (rol) => `Así se ve la plataforma como ${rol.toLowerCase()}`,
      texto: (r, c) => `${r.lema} Hoy: ${c.asignatura}, «${c.titulo}».`,
    },
    decision: { titulo: '¿Qué quieres ver primero?' },
    opciones: {
      docente: [['Planear con Kinesis', 'actividad', 'kinesis'], ['Preguntarle a Niky', 'ideas', 'niky'], ['Ajustar para un estudiante', 'ajuste', 'kinesis']],
      orientacion: [['Revisar un perfil', 'perfil', 'kinesis'], ['Decidir sobre un ajuste', 'decidir', 'kinesis']],
      estudiante: [['Practicar con Wisfox', 'quiz', 'wisfox'], ['Preguntarle a Niky', 'ayuda', 'niky']],
    },
    pasos: {
      apoyos: (c) => `Aquí están los apoyos de ${c.estudiante}, siempre sin diagnóstico.`,
      llega: (c) => `El ajuste de ${c.estudiante} llega a orientación`,
      llegaTexto: 'Cada cambio trae su razón. Nada avanza sin su decisión.',
      sinNovedades: 'Todavía no hay novedades para ti',
      sinNovedadesTexto: 'El ajuste se está revisando. La familia ve algo solo cuando orientación lo aprueba.',
      aprobadoDocente: 'Orientación aprobó y el estudiante lo recibe',
      archivosFamilia: 'Material que el colegio comparte contigo',
      archivosFamiliaTexto: 'Aquí llegan los archivos que el equipo marca para la familia.',
      archivosOrientacion: 'Lo clínico queda donde solo tú lo ves',
      archivosOrientacionTexto: 'Los archivos clínicos son solo de orientación. Ni la docencia ni Niky los reciben.',
      cifras: (c) => (c.devuelve
        ? 'Hay un ajuste devuelto a la docencia con una nota. Coordinación lo cuenta, pero no ve de quién es.'
        : 'Hay un ajuste esperando revisión. Coordinación lo cuenta, pero no ve de quién es.'),
      estudiantesCoord: (c) => `Cada estudiante se registra con un código, como ${c.estudiante}.`,
    },
    // ---- casos2 ---- Aviso de autorizaciones (borrador por aprobar). Solo un aviso con una casilla de ejemplo: no muestra ni simula documentos.
    autorizacion: {
      titulo: 'Autorización de datos',
      casilla: 'Autorización de datos presente',
      nota: 'Es un aviso de ejemplo: aquí no se muestra ningún documento ni dato real.',
      texto: 'La autorización de datos de menores, la política y el PIAR firmado se guardan en la sección Documentos de Kinesis (/documentos), y es la familia quien los carga.',
      textoFamilia: 'Tú cargas la autorización de datos, la política y el PIAR firmado en la sección Documentos de Kinesis (/documentos).',
    },
    // ---- fin casos2 ----
    // ---- nikylibre ---- Paso «Niky te ayuda» de orientación, familia y coordinación (BORRADOR POR APROBAR del dueño).
    // pedido: lo que se le pide a Niky (aparece como mensaje de la persona). respuesta: el texto de ejemplo cuando no hay servidor (GitHub
    // Pages) o cuando el ejemplo no está en el catálogo del servidor (Ciencias sociales). Con servidor, el tutorial manda el código preparado
    // del catálogo ('<rol>-<n>') y responde el texto del catálogo, sin gastar cuota.
    niky: {
      titulo: 'Niky te ayuda',
      orientacion: {
        texto: 'Niky te propone una nota para el docente. Tú la revisas y decides qué enviar.',
        pestana: 'Nota al docente',
        pedido: (c) => `Ayúdame a escribir una nota al docente sobre el ajuste de ${c.estudiante} en ${c.asignatura}.`,
        respuesta: (c) => `**Nota para el docente (borrador)**\n\nEl ajuste de ${c.estudiante} en ${c.asignatura} responde a los apoyos de su perfil. ${c.devuelve ? 'La versión corregida ya incluye el apoyo que faltaba.' : 'Cada cambio trae su razón.'} El objetivo de la clase no cambia.\n\n- Mira cómo le va en la próxima sesión.\n- Si algo no funciona, cuéntalo y lo revisamos.\n\nEs una propuesta: decides tú.`,
      },
      familia: {
        texto: 'Niky te sugiere cómo acompañar en casa, con palabras sencillas.',
        pestana: 'Acompañar en casa',
        pedido: (c) => `¿Cómo acompaño en casa la actividad de ${c.asignatura}?`,
        respuesta: (c) => `Hola. En ${c.asignatura} trabajamos «${c.titulo}». El colegio aprobó un ajuste para que tu hija o hijo participe con los apoyos que ya usa en clase.\n\n**Cómo acompañar en casa:**\n1. Pídele que te cuente con sus palabras qué hizo.\n2. Celebra el esfuerzo, no solo el resultado.\n\nSi tienes dudas, escríbele al colegio.`,
      },
      coordinacion: {
        texto: 'Niky lee las cifras contigo: cuántos hay, nunca de quién son.',
        pestana: 'Leer las cifras',
        pedido: (c) => `Léeme las cifras del colegio en el ejemplo de ${c.asignatura}.`,
        respuesta: (c) => `**Lectura de las cifras (datos de ejemplo)**\n\n- ${c.devuelve ? 'Hay un ajuste devuelto a la docencia con una nota.' : 'Hay un ajuste esperando revisión.'}\n- Cada estudiante se registra con un código, como ${c.estudiante}.\n\nLas cifras dicen cuántos ajustes hay, no de quién son.`,
      },
    },
    // ---- fin nikylibre ----
    final: {
      titulo: (rol) => `Lo que lograste como ${rol.toLowerCase()}`,
      bajada: (c) => `Recorriste el ejemplo de ${c.asignatura}. Todo sigue ahí para explorarlo con calma.`,
      otroRol: 'Ver este ejemplo con otro rol',
      explorar: 'Explorar con calma',
    },
    // Tres viñetas por rol: qué hiciste y qué ganaste, con el ícono que lo representa.
    logros: {
      estudiante: [['libro', 'Recibiste la actividad a tu medida.'], ['logros', 'Respondiste el quiz y ganaste puntos y logros.'], ['chat', 'Le preguntaste a Niky lo que no entendías.']],
      docente: [['docente', 'Viste los apoyos de tu estudiante, sin diagnóstico.'], ['recorrido', 'Planeaste con DUA y enviaste un ajuste a orientación.'], ['chat', 'Pediste ideas a Niky y tú decidiste qué usar.']],
      orientacion: [['docente', 'Revisaste el perfil de apoyos de tu estudiante.'], ['estado', 'Decidiste sobre el ajuste antes de que llegara al estudiante.'], ['orientacion', 'Dejaste lo clínico donde solo tú lo ves.']],
      familia: [['familia', 'Viste solo lo ya aprobado, en palabras sencillas.'], ['estado', 'Entendiste por qué se hizo cada cambio.'], ['libro', 'Supiste cómo acompañar la práctica en casa.']],
      coordinacion: [['coordinacion', 'Dejaste cursos y estudiantes listos para trabajar.'], ['libro', 'Definiste las categorías de apoyo del colegio.'], ['estado', 'Viste cuántos ajustes hay, sin ver de quién son.']],
    },
  };

  const ROLES = ['estudiante', 'docente', 'orientacion', 'familia', 'coordinacion'];
  const rolDe = (id) => MT.roles.por(id);
  const raiz = document.documentElement;
  const frase = (t) => ((String(t).match(/^.*?[.!?](?=\s|$)/) || [t])[0]);   // solo la primera frase: la tarjeta lleva UNA idea corta

  /* ---------------------------------------------------------------- 1. Los pasos de cada recorrido (derivados de js/casos.js y js/guias.js) */
  // Qué acciones de ejemplo hay que haber hecho ya para que la pantalla de un paso sea coherente (todas son idempotentes).
  function cadena(c, accion) {
    const hastaAprobar = c.devuelve ? ['proponer', 'devolver', 'reenviar', 'aprobar'] : ['proponer', 'aprobar'];
    return ({
      proponer: ['proponer'], devolver: ['proponer', 'devolver'], reenviar: ['proponer', 'devolver', 'reenviar'],
      aprobar: hastaAprobar, simularQuiz: hastaAprobar.concat('simularQuiz'), ideas: ['ideas'], ayuda: ['ayuda'],
    })[accion] || [];
  }

  function pasosDe(rolId, n) {
    const c = MT.casos.lista[n - 1]; const r = rolDe(rolId); const g = MT.casos.guion(c); const G = MT.guias.GUIA[rolId].pasos;
    const T = TEXTOS.pasos;
    const del = (rol, hash, accion) => g.find((p) => p.rol === rol && p.hash === hash && (accion ? p.accion === accion : !p.accion));
    const delN = (rol, hash, k) => g.filter((p) => p.rol === rol && p.hash === hash && !p.accion)[k || 0];
    const de = (p, extra) => Object.assign({ rolId, titulo: p.titulo, texto: frase(p.texto) }, extra);
    const deGuia = (i, extra) => Object.assign({ rolId, titulo: G[i].t, texto: frase(G[i].d) }, extra);
    const intro = { id: 'intro', rolId, hash: '#/mi/resumen', quien: 'sinapso', pose: 'saluda', emocion: 'curioso', titulo: TEXTOS.intro.titulo(r.nombre), texto: TEXTOS.intro.texto(r, c) };
    const opc = TEXTOS.opciones[rolId];
    if (opc) intro.opciones = opc.map(([texto, ir, quien]) => ({ texto, ir, quien }));
    let p = [intro];
    // nikylibre: el paso corto de Niky de orientación, familia y coordinación (antes solo docente y estudiante abrían a Niky). Queda en la
    // misma pantalla y con la misma acción del paso anterior, para que lo que se ve no cambie mientras Niky responde.
    const pasoNiky = (hash, accion) => ({ rolId, id: 'niky', hash, accion, niky: true, quien: 'niky', pose: 'piensa', emocion: 'pensando', foco: 'niky', titulo: TEXTOS.niky.titulo, texto: TEXTOS.niky[rolId].texto });

    if (rolId === 'estudiante') {
      p.push(
        de(delN('estudiante', '#/mi/resumen', 0), { id: 'medida', hash: '#/mi/resumen', accion: 'aprobar', quien: 'wisfox', emocion: 'animo', foco: 'actividad' }),
        de(delN('estudiante', '#/mi/resumen', 1), { id: 'quiz', hash: '#/mi/resumen', quien: 'wisfox', emocion: 'pensando', foco: 'quiz' }),
        de(del('estudiante', '#/mi/logros', 'simularQuiz'), { id: 'logros', hash: '#/mi/logros', accion: 'simularQuiz', quien: 'wisfox', emocion: 'celebra', foco: 'logros' }),
        de(del('estudiante', '#/mi/ruta'), { id: 'ruta', hash: '#/mi/ruta', quien: 'wisfox', emocion: 'animo', foco: 'ruta' }),
        de(del('estudiante', '#/mi/resumen', 'ayuda'), { id: 'ayuda', hash: '#/mi/resumen', accion: 'ayuda', quien: 'niky', emocion: 'pensando', foco: 'niky' }));
    } else if (rolId === 'docente') {
      p.push(
        { rolId, id: 'apoyos', hash: '#/mi/estudiantes', quien: 'kinesis', emocion: 'curioso', foco: 'tabla', titulo: G[0].t, texto: T.apoyos(c) },
        de(del('docente', '#/mi/actividades'), { id: 'actividad', hash: '#/mi/actividades', quien: 'kinesis', emocion: 'animo', foco: 'actividad' }),
        de(del('docente', '#/mi/actividades', 'ideas'), { id: 'ideas', hash: '#/mi/actividades', accion: 'ideas', quien: 'niky', pose: 'piensa', emocion: 'pensando', foco: 'niky' }),
        de(del('docente', '#/mi/ajustes', 'proponer'), { id: 'ajuste', hash: '#/mi/ajustes', accion: 'proponer', quien: 'kinesis', emocion: 'pensando', foco: 'ajuste' }));
      if (c.devuelve) p.push(de(del('docente', '#/mi/ajustes', 'reenviar'), { id: 'reenvio', hash: '#/mi/ajustes', accion: 'reenviar', quien: 'kinesis', emocion: 'duda', foco: 'ajuste' }));
      p.push(deGuia(4, { id: 'recibe', hash: '#/mi/resumen', accion: 'aprobar', quien: 'kinesis', emocion: 'celebra', titulo: T.aprobadoDocente, foco: 'tarjetas' }));
    } else if (rolId === 'orientacion') {
      p.push(
        de(del('orientacion', '#/mi/estudiantes'), { id: 'perfil', hash: '#/mi/estudiantes', quien: 'kinesis', emocion: 'curioso', foco: 'tabla' }),
        { rolId, id: 'llega', hash: '#/mi/ajustes', accion: 'proponer', quien: 'kinesis', emocion: 'pensando', foco: 'ajuste', titulo: T.llega(c), texto: T.llegaTexto });
      if (c.devuelve) p.push(de(del('orientacion', '#/mi/ajustes', 'devolver'), { id: 'devuelve', hash: '#/mi/ajustes', accion: 'devolver', quien: 'kinesis', emocion: 'duda', foco: 'ajuste' }));
      p.push(
        de(del('orientacion', '#/mi/ajustes', 'aprobar'), { id: 'decidir', hash: '#/mi/ajustes', accion: 'aprobar', quien: 'kinesis', emocion: 'celebra', foco: 'ajuste' }),
        pasoNiky('#/mi/ajustes', 'aprobar'),   // nikylibre: Niky redacta la nota al docente sobre el ajuste recién decidido
        { rolId, id: 'archivos', hash: '#/mi/archivos', quien: 'kinesis', emocion: 'animo', foco: 'tarjetas', titulo: T.archivosOrientacion, texto: T.archivosOrientacionTexto },
        // ---- casos2 ---- Antes de trabajar con un perfil, orientación comprueba que la autorización de datos esté (aviso de ejemplo).
        { rolId, id: 'autorizacion', hash: '#/mi/archivos', quien: 'kinesis', emocion: 'curioso', foco: 'tarjetas', autorizacion: true, titulo: TEXTOS.autorizacion.titulo, texto: TEXTOS.autorizacion.texto });
        // ---- fin casos2 ----
    } else if (rolId === 'familia') {
      p.push(
        { rolId, id: 'espera', hash: '#/mi/resumen', accion: c.devuelve ? 'devolver' : 'proponer', quien: 'kinesis', emocion: 'curioso', foco: 'tarjetas', titulo: T.sinNovedades, texto: T.sinNovedadesTexto },
        de(del('familia', '#/mi/resumen'), { id: 'aprobado', hash: '#/mi/resumen', accion: 'aprobar', quien: 'kinesis', emocion: 'celebra', foco: 'tarjetas' }),
        pasoNiky('#/mi/resumen', 'aprobar'),   // nikylibre: con el ajuste ya aprobado, Niky sugiere cómo acompañar en casa
        { rolId, id: 'archivos', hash: '#/mi/archivos', quien: 'kinesis', emocion: 'animo', foco: 'tarjetas', titulo: T.archivosFamilia, texto: T.archivosFamiliaTexto },
        // ---- casos2 ---- Versión breve para la familia, que es quien carga los documentos.
        { rolId, id: 'autorizacion', hash: '#/mi/archivos', quien: 'kinesis', emocion: 'curioso', foco: 'tarjetas', autorizacion: true, titulo: TEXTOS.autorizacion.titulo, texto: TEXTOS.autorizacion.textoFamilia });
        // ---- fin casos2 ----
    } else {   // coordinación
      p.push(
        de(del('coordinacion', '#/mi/cursos'), { id: 'cursos', hash: '#/mi/cursos', quien: 'kinesis', emocion: 'animo', foco: 'tabla' }),
        deGuia(1, { id: 'estudiantes', hash: '#/mi/estudiantes', quien: 'kinesis', emocion: 'animo', foco: 'tabla', texto: T.estudiantesCoord(c) }),
        // ---- casos2 ---- Paso de autorizaciones: va justo después de registrar estudiantes, que es cuando importa saber que su autorización existe.
        { rolId, id: 'autorizacion', hash: '#/mi/estudiantes', quien: 'kinesis', emocion: 'curioso', foco: 'tabla', autorizacion: true, titulo: TEXTOS.autorizacion.titulo, texto: TEXTOS.autorizacion.texto },
        // ---- fin casos2 ----
        deGuia(2, { id: 'categorias', hash: '#/mi/categorias', quien: 'kinesis', emocion: 'pensando', foco: 'tabla' }),
        deGuia(3, { id: 'cifras', hash: '#/mi/resumen', accion: c.devuelve ? 'devolver' : 'proponer', quien: 'kinesis', emocion: 'celebra', foco: 'tarjetas', texto: T.cifras(c) }),
        pasoNiky('#/mi/resumen', c.devuelve ? 'devolver' : 'proponer'));   // nikylibre: Niky lee esas mismas cifras
    }
    p = p.filter((x) => x && x.titulo);
    p.forEach((x) => { x.pose = x.pose || 'senala'; });
    return p;
  }

  /* ---------------------------------------------------------------- 2. El estado del recorrido */
  const est = { activo: false, rol: 'docente', caso: 1, i: 0, pasos: [], ficha: 0, volverA: null };
  let tarjeta = null; let overlay = null; let aviso = null; let anillo = null; let ocupado = false;
  const refs = {};

  function limpiarAnillo() { if (anillo) { anillo.classList.remove('tut-foco'); anillo = null; } }

  /* Qué resaltar en cada pantalla. Se busca el primero que exista; si no hay nada, no se resalta (el paso se entiende igual). */
  const FOCOS = {
    tabla: '#app table, #app .tabla-scroll, #app .lista-filas, #app .tarjeta',
    actividad: '#app .tarjeta--actividad, #app .actividad, #app [data-actividad], #app .tarjeta',
    ajuste: '#app .ajuste, #app [data-ajuste], #app .tarjeta',
    tarjetas: '#app .rejilla > *, #app .tarjeta',
    quiz: '#app .quiz, #app .tarjeta',
    logros: '#app .logros, #app .tarjeta',
    ruta: '#app .ruta, #app .tarjeta',
    niky: '#btn-niky, .niky-boton, .niky',
  };
  function resaltar(clave) {
    limpiarAnillo();
    const sel = FOCOS[clave]; if (!sel) return;
    const el = [...document.querySelectorAll(sel)].find((x) => x.offsetWidth > 0 && x.offsetHeight > 0 && (clave === 'niky' || x.offsetHeight < window.innerHeight * 0.7) && !x.closest('.tut, .tut-sel'));   // un anillo del tamaño de toda la pantalla no señala nada
    if (!el) return;
    anillo = el; el.classList.add('tut-foco');
    // Se lleva a la vista sin pelear con la tarjeta flotante: MT.movimiento respeta el modo calmado.
    try { if (clave !== 'niky') MT.movimiento.desplazar(el); } catch (e) { /* sin desplazamiento: el anillo igual se ve al bajar */ }
  }

  /* ---------------------------------------------------------------- 3. Ir a un paso */
  const caja = () => document.getElementById('app');
  async function recargarCaso() { await MT.casos.cargar(est.caso); }

  async function ir(i, volver) {
    if (ocupado) return; ocupado = true;
    try {
      const atras = i < est.i;
      const antes = est.i;
      est.i = Math.max(0, Math.min(est.pasos.length - 1, i));
      // Atrás o un salto hacia un paso anterior: se vuelve al ejemplo limpio para que la pantalla no contradiga el texto.
      if (atras || (i === 0 && antes !== 0)) await recargarCaso();
      const p = est.pasos[est.i];
      MT.store.cambiar((s) => { s.rol = p.rolId; });
      MT.casos.cerrarPanel();
      // Las acciones de los pasos anteriores ya deberían estar hechas; se repiten por si se saltó con una opción (son idempotentes).
      if (p.accion) cadena(MT.casos.actual(), p.accion).forEach((a) => MT.casos.accion(a));
      if (p.niky) abrirNiky(p.rolId);
      pintar(true);
      if (location.hash === p.hash) MT.router.recargar(); else location.hash = p.hash;
      // Después de que el router pinta la pantalla: anillo y foco al botón que se estaba usando (el router lleva el foco al título).
      setTimeout(() => { if (est.activo && est.pasos[est.i] === p) { resaltar(p.foco); if (volver !== false) enfocar(volver); } }, 220);
      setTimeout(() => { if (est.activo && est.pasos[est.i] === p && p.foco && !anillo) resaltar(p.foco); }, 900);
    } finally { ocupado = false; }
  }
  function enfocar(el) {
    const b = el && el.isConnected && !el.disabled ? el : (refs.siguiente && !refs.siguiente.disabled ? refs.siguiente : refs.atras);
    if (b) b.focus({ preventScroll: true });
  }
  /* nikylibre: abre a Niky con el pedido del caso, como el paso de ideas del docente (conversación limpia, una pestaña propia).
     La tarea 'tut-<rol>' no es una tarea del servidor: con servidor y un ejemplo del catálogo, js/ia.js manda el código preparado
     ('<rol>-<n>') con la tarea que exige el catálogo; sin servidor, o con Ciencias sociales (que no está en el catálogo), no sale ninguna
     petición y responde el texto de TEXTOS.niky, que se deja en respuestasIA justo antes. */
  function abrirNiky(rolId) {
    const N = TEXTOS.niky[rolId]; const c = MT.casos.actual();
    if (!N || !MT.ia || !MT.ia.panel) return;
    const tarea = 'tut-' + rolId;
    MT.datos.respuestasIA[tarea] = N.respuesta(c);
    MT.store.cambiar((s) => { s.ia = []; });
    MT.ia.panel.abrir({ texto: N.pedido(c), tarea, sesion: { id: tarea, titulo: N.pestana } });
  }
  const siguiente = (e) => { if (est.i >= est.pasos.length - 1) final(); else ir(est.i + 1, e && e.currentTarget); };
  const saltarA = (id, e) => { const k = est.pasos.findIndex((x) => x.id === id); if (k >= 0) ir(k, e && e.currentTarget); };

  /* ---------------------------------------------------------------- 4. La tarjeta flotante */
  function masc(quien, emocion, pose, tam) { return MT.mascotas.mascota(quien, { pose: pose || 'base', emocion, tamano: tam || 64, clase: 'tut-masc' }); }

  function construirTarjeta() {
    refs.mascWrap = h('div', { class: 'tut__masc' });
    refs.meta = h('p', { class: 'tut__meta' });
    refs.barra = h('span', { class: 'tut__barra-valor' });
    refs.titulo = h('h2', { class: 'tut__titulo', id: 'tut-titulo', tabindex: '-1' });
    refs.texto = h('p', { class: 'tut__texto', id: 'tut-texto' });
    // ---- casos2 ---- Casilla del paso de autorizaciones: de ejemplo, no guarda nada. Va marcada, y puede desmarcarse sin efecto.
    refs.autorizacion = h('div', { class: 'tut__auth', hidden: true },
      h('label', { class: 'tut__auth-casilla' }, h('input', { type: 'checkbox', id: 'tut-autorizacion', checked: true }), h('span', null, TEXTOS.autorizacion.casilla)),
      h('p', { class: 'tut__auth-nota' }, TEXTOS.autorizacion.nota));
    // ---- fin casos2 ----
    refs.opciones = h('div', { class: 'tut__opciones', role: 'group', 'aria-label': TEXTOS.decision.titulo });
    refs.atras = h('button', { class: 'btn btn--suave tut__btn', type: 'button', onclick: (e) => ir(est.i - 1, e.currentTarget) }, TEXTOS.ui.atras);
    refs.siguiente = h('button', { class: 'btn tut__btn tut__btn--principal', type: 'button', onclick: siguiente }, TEXTOS.ui.siguiente);
    aviso = h('p', { class: 'solo-lectores', 'aria-live': 'polite', 'aria-atomic': 'true' });
    const enlace = (texto, fn, id) => h('button', { class: 'tut__enlace', type: 'button', id, onclick: fn }, texto);
    tarjeta = h('aside', { class: 'tut', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'tut-titulo', 'aria-describedby': 'tut-texto', 'aria-label': null },
      h('div', { class: 'tut__cab' }, refs.mascWrap, h('div', { class: 'tut__cab-texto' }, refs.meta, h('div', { class: 'tut__barra', role: 'presentation' }, refs.barra))),
      refs.titulo, refs.texto, refs.autorizacion, refs.opciones,
      h('div', { class: 'tut__botones' }, refs.atras, refs.siguiente),
      h('div', { class: 'tut__extras' },
        enlace(TEXTOS.ui.cambiarRol, () => abrirSelector({ foco: 'rol' }), 'tut-cambiar-rol'),
        enlace(TEXTOS.ui.otroEjemplo, () => abrirSelector({ foco: 'caso' }), 'tut-otro'),
        enlace(TEXTOS.ui.inicio, () => volverAlInicio(), 'tut-inicio'),
        enlace(TEXTOS.ui.salir, () => salir(), 'tut-salir')),
      aviso);
    document.body.append(tarjeta);
    if (window.ResizeObserver) new ResizeObserver(medir).observe(tarjeta);
  }
  // El resto de la página deja sitio a la tarjeta (y Niky sube): se mide, no se adivina.
  function medir() { raiz.style.setProperty('--tut-alto', (tarjeta && est.activo && !tarjeta.hidden ? tarjeta.offsetHeight : 0) + 'px'); }

  function pintar(anunciar) {
    if (!tarjeta) construirTarjeta();
    const p = est.pasos[est.i]; const c = MT.casos.lista[est.caso - 1]; const r = rolDe(est.rol); const n = est.pasos.length;
    tarjeta.hidden = false; raiz.dataset.tutorial = 'activo';
    // La mascota habla con la emoción del paso; si MT.narrativa tiene una línea de la guía de ese rol, no se usa: la frase sale del guion del caso.
    refs.mascWrap.replaceChildren(masc(p.quien, p.emocion, p.pose));
    tarjeta.dataset.quien = p.quien;
    refs.meta.textContent = `${TEXTOS.ui.paso(est.i + 1, n)} · ${r.nombre} · ${TEXTOS.ui.ejemplo(c)}`;
    refs.barra.style.width = `${((est.i + 1) / n) * 100}%`;
    refs.titulo.textContent = p.titulo; refs.texto.textContent = p.texto;
    refs.opciones.replaceChildren(...(p.opciones || []).map((o) => h('button', { class: 'tut__opcion', type: 'button', 'data-quien': o.quien, onclick: (e) => saltarA(o.ir, e) },
      masc(o.quien, 'contento', 'base', 36), h('span', null, o.texto))));
    refs.opciones.hidden = !(p.opciones && p.opciones.length);
    // casos2: la casilla de autorización solo aparece en su paso, y siempre vuelve marcada.
    refs.autorizacion.hidden = !p.autorizacion;
    if (p.autorizacion) refs.autorizacion.querySelector('input').checked = true;
    refs.atras.disabled = est.i === 0;
    refs.siguiente.textContent = est.i === n - 1 ? TEXTOS.ui.terminar : TEXTOS.ui.siguiente;
    if (anunciar) aviso.textContent = TEXTOS.ui.vivo(est.i + 1, n, p.titulo);
    medir();
  }

  /* ---------------------------------------------------------------- 5. Pantallas grandes: elegir ejemplo y resumen final */
  function cerrarOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
    document.removeEventListener('keydown', atrapar, true);
    if (tarjeta && est.activo) { tarjeta.inert = false; }
    raiz.classList.remove('tut-abierto');
  }
  // El foco se queda dentro de la ventana grande mientras está abierta (es modal): Tab recorre sus controles en círculo.
  function atrapar(e) {
    if (e.key !== 'Tab' || !overlay) return;
    const f = [...overlay.querySelectorAll('button:not([disabled]), a[href]')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const a = document.activeElement;
    if (e.shiftKey && (a === f[0] || !overlay.contains(a))) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (a === f[f.length - 1] || !overlay.contains(a))) { e.preventDefault(); f[0].focus(); }
  }
  function ventana(contenido, etiquetaId) {
    cerrarOverlay();
    overlay = h('div', { class: 'tut-sel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': etiquetaId }, h('div', { class: 'tut-sel__panel' }, contenido));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrarVentana(); });
    document.body.append(overlay);
    raiz.classList.add('tut-abierto');
    document.addEventListener('keydown', atrapar, true);
    return overlay;
  }
  // Cerrar la ventana grande: si hay un recorrido en marcha se sigue en su paso; si no, se vuelve a la portada.
  function cerrarVentana() {
    cerrarOverlay();
    if (est.activo) enfocar(refs.siguiente);
    else if (location.hash === '#/tutorial') location.hash = '#/';
  }

  function chipsDeRol(actual, alElegir) {
    return h('div', { class: 'tut-chips', role: 'group', 'aria-label': TEXTOS.selector.rol }, ROLES.map((id) => {
      const r = rolDe(id);
      return h('button', { class: 'tut-chip', type: 'button', 'data-rol': id, 'aria-pressed': String(id === actual), onclick: () => alElegir(id) },
        icono(r.icono), h('span', null, r.nombre));
    }));
  }

  function abrirSelector(op) {
    const ficha = { rol: est.activo ? est.rol : ((MT.store.obtener().rol && ROLES.includes(MT.store.obtener().rol)) ? MT.store.obtener().rol : 'docente') };
    const tarjetas = h('div', { class: 'tut-casos' });
    const chips = h('div', { class: 'tut-chips-caja' });
    const pintarSel = () => {
      chips.replaceChildren(chipsDeRol(ficha.rol, (id) => { ficha.rol = id; pintarSel(); const b = overlay && overlay.querySelector(`[data-rol="${id}"]`); if (b) b.focus(); }));
      tarjetas.replaceChildren(...MT.casos.lista.map((c) => {
        const t = TEXTOS.casos[c.n];
        return h('button', { class: 'tut-caso', type: 'button', 'data-caso': String(c.n), 'data-quien': t.quien, onclick: () => iniciar({ rol: ficha.rol, caso: c.n }) },
          h('span', { class: 'tut-caso__masc' }, masc(t.quien, t.emocion, 'base', 56)),
          h('span', { class: 'tut-caso__texto' }, h('span', { class: 'tut-caso__asig' }, c.asignatura), h('strong', null, c.titulo), h('span', { class: 'tut-caso__linea' }, t.linea)),
          h('span', { class: 'tut-caso__ir' }, icono('flecha')));
      }));
    };
    pintarSel();
    const S = TEXTOS.selector;
    const o = ventana(h('div', { class: 'tut-sel__cuerpo' },
      h('div', { class: 'tut-sel__cab' },
        masc('sinapso', 'contento', 'saluda', 72),
        h('div', null, h('h2', { id: 'tut-sel-t', tabindex: '-1' }, S.titulo), h('p', { class: 'tut-sel__bajada' }, S.bajada)),
        h('button', { class: 'btn btn--chico btn--suave tut-sel__cerrar', type: 'button', onclick: cerrarVentana }, S.cerrar)),
      h('p', { class: 'tut-etiqueta' }, S.rol), chips,
      h('p', { class: 'tut-etiqueta' }, S.ejemplos), tarjetas,
      h('p', { class: 'tut-sel__nota' }, S.nota),
      h('div', { class: 'tut-sel__pie' }, h('button', { class: 'tut__enlace', type: 'button', onclick: () => volverAlInicio() }, TEXTOS.ui.inicio))), 'tut-sel-t');
    const objetivo = (op && op.foco === 'caso') ? o.querySelector('.tut-caso') : o.querySelector('.tut-chip[aria-pressed="true"]');
    (objetivo || o.querySelector('#tut-sel-t')).focus({ preventScroll: true });
  }

  function final() {
    const r = rolDe(est.rol); const c = MT.casos.lista[est.caso - 1];
    limpiarAnillo(); MT.casos.cerrarPanel();
    if (tarjeta) { tarjeta.hidden = true; }
    // Terminado el recorrido la señal se quita: Niky vuelve a aparecer (se oculta mientras el tutorial está activo).
    delete raiz.dataset.tutorial;
    medir();
    const S = TEXTOS.final;
    const o = ventana(h('div', { class: 'tut-sel__cuerpo tut-final' },
      h('div', { class: 'tut-final__cab' }, masc('sinapso', 'celebra', 'celebra', 96),
        h('div', null, h('p', { class: 'tut-etiqueta' }, `${r.nombre} · ${TEXTOS.ui.ejemplo(c)}`), h('h2', { id: 'tut-final-t', tabindex: '-1' }, S.titulo(r.nombre)), h('p', { class: 'tut-sel__bajada' }, S.bajada(c)))),
      h('ul', { class: 'tut-logros' }, TEXTOS.logros[est.rol].map(([ic, t]) => h('li', null, h('span', { class: 'tut-logros__ic' }, icono(ic)), h('span', null, t)))),
      h('p', { class: 'tut-etiqueta' }, S.otroRol),
      chipsDeRol(est.rol, (id) => iniciar({ rol: id, caso: est.caso })),
      h('div', { class: 'tut-final__botones' },
        h('button', { class: 'btn', type: 'button', id: 'tut-explorar', onclick: () => salir() }, S.explorar),
        h('button', { class: 'btn btn--suave', type: 'button', id: 'tut-otro-ejemplo', onclick: () => abrirSelector({ foco: 'caso' }) }, TEXTOS.ui.otroEjemplo),
        h('button', { class: 'btn btn--suave', type: 'button', id: 'tut-final-inicio', onclick: () => volverAlInicio() }, TEXTOS.ui.inicio))), 'tut-final-t');
    o.querySelector('#tut-explorar').focus({ preventScroll: true });
    est.terminado = true;
  }

  /* ---------------------------------------------------------------- 6. Empezar, salir, volver al inicio */
  async function iniciar(op) {
    const rol = ROLES.includes(op && op.rol) ? op.rol : 'docente';
    const caso = op && op.caso >= 1 && op.caso <= MT.casos.lista.length ? op.caso : 1;
    cerrarOverlay(); limpiarAnillo();
    if (location.hash === '#/tutorial') history.replaceState(null, '', location.pathname + location.search + '#/');
    MT.casos.tutorial(true);
    // Siempre se parte del ejemplo limpio: así el recorrido es el mismo para cualquiera y no depende de lo que se hizo antes.
    await MT.casos.cargar(caso);
    Object.assign(est, { activo: true, rol, caso, i: 0, terminado: false, pasos: pasosDe(rol, caso) });
    ocupado = false;
    pintar(true);
    await ir(0, refs.siguiente);
  }

  // Salir deja todo como está (el ejemplo, el rol y la pantalla): quien sale puede seguir explorando con calma.
  function salir() {
    cerrarOverlay(); limpiarAnillo(); MT.casos.cerrarPanel();
    est.activo = false;
    if (tarjeta) tarjeta.hidden = true;
    delete raiz.dataset.tutorial; raiz.style.removeProperty('--tut-alto');
    const t = caja() && caja().querySelector('h1'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
  }
  function volverAlInicio() {
    salir();
    if (location.hash === '#/' || location.hash === '' ) MT.router.recargar(); else location.hash = '#/';
  }

  // Escape sale del recorrido (o cierra la ventana grande) salvo que otra cosa lo haya usado antes: un diálogo, el chat de Niky o un menú.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (document.querySelector('dialog[open]')) return;
    if (overlay) { e.preventDefault(); cerrarVentana(); return; }
    const slot = document.getElementById('slot-ia');
    if (est.activo && !(slot && !slot.hidden && slot.contains(document.activeElement))) { e.preventDefault(); salir(); }
  });

  /* ---------------------------------------------------------------- 7. Entradas: ruta #/tutorial, ?tutorial=1 y la lista de la Guía */
  MT.router.registrar({
    id: 'tutorial', titulo: 'Tutorial', espacio: '',
    render(main, ctx) {
      // Detrás de la ventana se ve la portada: así, al cerrar, la persona no queda en una pantalla vacía.
      MT.router.rutas.inicio.render(main, ctx);
      // ---- recorrido ---- #/tutorial/<rol> empieza directo en ese rol (entrada desde dentro de Kinesis y Wisfox); sin rol, el selector de siempre.
      const m = /^#\/tutorial\/([a-z]+)/.exec(location.hash);
      if (m && ROLES.includes(m[1])) iniciar({ rol: m[1] }); else abrirSelector();
    },
  });
  // ---- recorrido ---- Kinesis y Wisfox (dentro del marco) piden abrir el recorrido sin recargar:
  // window.parent.postMessage({ tipo: 'recorrido:abrir', portal: 'kinesis' | 'wisfox', rol: 'docente' | 'orientacion' | 'familia' | 'coordinacion' | 'estudiante' }, origen).
  // Solo se atiende desde el origen de los portales o desde esta misma página, igual que niky:abrir; un rol inválido cae al de ese portal.
  const ORIGEN_PORTALES = 'https://profenapaipa.github.io';
  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGEN_PORTALES && e.origin !== location.origin) return;
    const d = e.data;
    if (!d || typeof d !== 'object' || d.tipo !== 'recorrido:abrir' || !['kinesis', 'wisfox'].includes(d.portal)) return;
    iniciar({ rol: ROLES.includes(d.rol) ? d.rol : (d.portal === 'wisfox' ? 'estudiante' : 'docente') });
  });

  if (/[?&]tutorial=1/.test(location.search)) {
    const q = new URLSearchParams(location.search); q.delete('tutorial');
    const resto = q.toString();
    history.replaceState(null, '', location.pathname + (resto ? '?' + resto : '') + '#/tutorial');
  }

  // La Guía lista los 30 recorridos (6 por rol; casos2) con «Probar este ejemplo». Se agrega al final de la pantalla sin tocar su archivo.
  function listaDeRol(rolId) {
    const r = rolDe(rolId);
    return h('details', { class: 'tut-lista__rol', 'data-rol': rolId },
      h('summary', null, icono(r.icono), h('strong', null, r.nombre), h('span', { class: 'suave' }, ` · ${MT.casos.lista.length} ejemplos`)),
      h('ul', null, MT.casos.lista.map((c) => h('li', null,
        h('span', null, h('strong', null, c.asignatura), h('small', null, TEXTOS.casos[c.n].linea)),
        h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'data-caso': String(c.n), onclick: () => iniciar({ rol: rolId, caso: c.n }) }, TEXTOS.ui.probar)))));
  }
  function seccionGuia(sub) {
    const roles = ROLES.includes(sub) ? [sub] : ROLES;
    const s = h('section', { class: 'tut-lista', 'aria-labelledby': 'tut-lista-t' },
      h('h2', { id: 'tut-lista-t' }, TEXTOS.nombre),
      h('p', { class: 'suave' }, 'Cada ejemplo te lleva por las pantallas reales. Cuando salgas, queda todo para que lo explores con calma.'),
      h('div', { class: 'acciones' }, h('button', { class: 'btn', type: 'button', id: 'guia-ver-tutorial', onclick: () => abrirSelector() }, TEXTOS.boton)),
      roles.map(listaDeRol));
    return s;
  }
  const guia = MT.router.rutas.guia;
  if (guia && !guia.__tutorial) {
    const original = guia.render; guia.__tutorial = true;
    guia.render = function (main, ctx) { original.call(this, main, ctx); const c = main.querySelector('.contenedor') || main; c.append(seccionGuia(ctx && ctx.sub)); };
  }

  window.addEventListener('hashchange', () => {
    if (overlay && !est.activo && location.hash !== '#/tutorial') cerrarOverlay();
    // Si la persona se va por su cuenta a otra pantalla, el tutorial termina limpio: no deja tarjeta ni señal colgadas.
    const p = est.activo && !ocupado && est.pasos[est.i];
    if (p && !overlay && location.hash !== p.hash) salir();
  });
  window.addEventListener('pagehide', () => { delete raiz.dataset.tutorial; });

  MT.tutorial = { TEXTOS, ROLES, abrir: abrirSelector, iniciar, salir, ir, pasosDe, estado: est, final, volverAlInicio, siguiente: () => siguiente() };
})(window.MT = window.MT || {});
