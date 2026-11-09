/* guias.js: qué es cada portal y qué hace cada rol en él. Es la fuente única de la que beben la barra de portales,
   la guía de inicio rápido y la franja de pasos de Mi espacio, así nunca se contradicen.

   Un "paso" dice en qué portal ocurre (portal) y en qué sección de Mi espacio se puede hacer ahora mismo (aqui).
   Un "ajuste" se explica aquí una vez, en lenguaje cotidiano, y todas las pantallas lo reutilizan. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;

  const AJUSTE = 'Un ajuste es un cambio en cómo se hace una actividad para que le sirva mejor a cada estudiante: por ejemplo, más tiempo o instrucciones en pasos cortos. No cambia lo que se aprende, solo el camino para llegar.';

  const PORTALES = {
    kinesis: {
      nombre: 'Kinesis', rotulo: 'El aula', paraQuien: 'Docentes, orientación, familias y coordinación',
      que: 'Es el hilo de quien enseña: desde aquí la docencia teje la personalización del aprendizaje con cada estudiante.',
      haces: ['Ver los apoyos de cada estudiante, sin diagnóstico', 'Planear con los tres principios del DUA', 'Proponer, revisar y aprobar ajustes', 'Mostrar a la familia lo ya aprobado'],
      entrega: 'Entrega a Wisfox la actividad aprobada y a la familia las novedades.', estado: ['Disponible', 'ok'],
    },
    valeria: {
      nombre: 'Niky', rotulo: 'La guía', paraQuien: 'Docentes y estudiantes',
      que: 'Es el hilo que cruza a los otros dos: propone, ordena y lleva la información hasta quien debe decidir. La IA amplía la agentividad de las personas; no la reemplaza.',
      haces: ['Pedir ideas para una actividad', 'Pedir ayuda para redactar un ajuste', 'Aclarar una duda de un tema', 'Responder en español e inglés'],
      entrega: 'Entrega propuestas al docente y explicaciones al estudiante.', estado: ['Respuestas de ejemplo', 'aviso'],
    },
    wisfox: {
      nombre: 'Wisfox', rotulo: 'El estudiante', paraQuien: 'Estudiantes (y su familia, acompañando)',
      que: 'Es el hilo del estudiante: material didáctico interactivo que parte de la malla curricular de su institución.',
      haces: ['Seguir su ruta de aprendizaje', 'Hacer la actividad que le llegó, a su medida', 'Responder quizes y ganar logros', 'Preguntar sus dudas a Niky'],
      entrega: 'Devuelve al docente el progreso: quiz, puntos y logros.', estado: ['Disponible', 'ok'],
    },
  };
  // El orden de las pestañas es el del flujo de trabajo: se planea en Kinesis, la guía acompaña, y se aprende en Wisfox.
  const ORDEN = ['kinesis', 'valeria', 'wisfox'];

  const GUIA = {
    docente: { principal: 'kinesis', meta: 'Planear una clase, ajustarla a cada estudiante y ver cómo le va.', pasos: [
      { portal: 'kinesis', t: 'Conoce los apoyos de tus estudiantes', d: 'Mira qué le sirve a cada uno. Nunca verás un diagnóstico.', aqui: 'estudiantes' },
      { portal: 'kinesis', t: 'Planea la actividad con DUA', d: 'Piensa la clase para todos: varias formas de representar, de expresarse y de motivarse. Agrega su quiz.', aqui: 'actividades' },
      { portal: 'valeria', t: 'Pide ideas a Niky', d: 'Te propone una actividad. Tú decides qué usar.', aqui: 'actividades' },
      { portal: 'kinesis', t: 'Ajusta la actividad a un estudiante', d: 'Cada apoyo se vuelve un cambio concreto, con su razón. Envíalo a orientación.', aqui: 'ajustes' },
      { portal: 'wisfox', t: 'Mira cómo la recibe el estudiante', d: 'Cuando orientación aprueba, el estudiante la ve a su medida y tú ves su progreso.', aqui: 'resumen' },
    ] },
    orientacion: { principal: 'kinesis', meta: 'Validar que cada ajuste sea adecuado antes de que llegue al estudiante.', pasos: [
      { portal: 'kinesis', t: 'Completa los perfiles de apoyo', d: 'Marca qué le ayuda a cada estudiante. Sin diagnóstico en el perfil.', aqui: 'estudiantes' },
      { portal: 'kinesis', t: 'Revisa los ajustes propuestos', d: 'El docente propone y tú validas. Cada cambio trae su razón.', aqui: 'ajustes' },
      { portal: 'kinesis', t: 'Aprueba o devuelve con una nota', d: 'Nada llega al estudiante ni a la familia sin tu decisión.', aqui: 'ajustes' },
      { portal: 'kinesis', t: 'Guarda lo clínico donde solo tú lo ves', d: 'Los archivos clínicos son solo de orientación.', aqui: 'archivos' },
    ] },
    familia: { principal: 'kinesis', meta: 'Entender qué se hace en clase y acompañar en casa.', pasos: [
      { portal: 'kinesis', t: 'Mira las novedades', d: 'Lo que el colegio ya aprobó, en lenguaje sencillo y con su razón.', aqui: 'resumen' },
      { portal: 'kinesis', t: 'Lee los mensajes del equipo', d: 'Las notas que el equipo marcó para ti.', aqui: 'resumen' },
      { portal: 'wisfox', t: 'Acompaña la práctica en casa', d: 'Tu estudiante practica en Wisfox. Pregúntale por sus logros.', aqui: null },
    ] },
    coordinacion: { principal: 'kinesis', meta: 'Dejar el colegio listo para que los demás puedan trabajar.', pasos: [
      { portal: 'kinesis', t: 'Crea los cursos', d: 'Cada estudiante necesita un curso.', aqui: 'cursos' },
      { portal: 'kinesis', t: 'Registra a los estudiantes', d: 'Con un código, sin nombres en esta demostración.', aqui: 'estudiantes' },
      { portal: 'kinesis', t: 'Define las categorías de apoyo', d: 'Las opciones que orientación marcará en los perfiles.', aqui: 'categorias' },
      { portal: 'kinesis', t: 'Mira las cifras del colegio', d: 'Cuántos ajustes hay en cada estado, sin ver de quién.', aqui: 'resumen' },
    ] },
    estudiante: { principal: 'wisfox', meta: 'Aprender a tu ritmo, con la actividad hecha a tu medida.', pasos: [
      { portal: 'wisfox', t: 'Entra a tu actividad de hoy', d: 'Si orientación aprobó un ajuste para ti, ya viene a tu medida.', aqui: 'resumen' },
      { portal: 'wisfox', t: 'Sigue tu ruta de Inglés', d: 'Lecciones cortas con su quiz y la explicación de cada respuesta.', aqui: 'ruta' },
      { portal: 'valeria', t: 'Pregunta lo que no entiendas', d: 'Niky te explica con ejemplos y te hace una pregunta para practicar.', aqui: null },
      { portal: 'wisfox', t: 'Mira tus logros', d: 'Puntos, niveles y logros por lo que vas haciendo.', aqui: 'logros' },
    ] },
  };

  const rolActual = () => MT.store.obtener().rol;
  const irAqui = (rol, seccion) => { MT.store.cambiar((s) => { s.rol = rol; }); location.hash = '#/mi/' + seccion; };

  // Los pasos de un rol que ocurren en un portal.
  const pasosEn = (rol, portal) => (GUIA[rol] ? GUIA[rol].pasos.map((p, i) => ({ ...p, n: i + 1 })).filter((p) => p.portal === portal) : []);
  // Las secciones de Mi espacio que pertenecen a un portal: las de estudiante son de Wisfox; las demás, de Kinesis.
  const seccionesEn = (rol, portal) => (MT.secciones && MT.secciones[rol] && ((portal === 'wisfox') === (rol === 'estudiante')) && portal !== 'valeria' ? MT.secciones[rol] : []);

  // Una pista que se repite en las pantallas: qué es un ajuste, sin jerga.
  const notaAjuste = () => h('p', { class: 'nota-ajuste' }, h('strong', null, '¿Qué es un ajuste? '), AJUSTE);

  /* La franja que acompaña dentro de Mi espacio: en qué paso de tu guía estás, cómo volver a ella y qué sigue. */
  function franjaDe(rol, seccion) {
    const g = GUIA[rol]; if (!g) return null;
    // Un paso que depende de que otro rol haya actuado (el docente ve cómo la recibe el estudiante solo cuando orientación aprobó) no se
    // marca como «el paso en el que estás» antes de tiempo: a un docente nuevo le decía «Paso 5 de 5» en su primera pantalla.
    const hecho = (p) => !(rol === 'docente' && p.portal === 'wisfox') || MT.store.obtener().ajustes.some((a) => a.estado === 'aprobado');
    const i = g.pasos.findIndex((p) => p.aqui === seccion && hecho(p));
    const sig = g.pasos[i + 1] || null;
    const ir = (p) => (p.aqui ? irAqui(rol, p.aqui) : (location.hash = '#/portales/' + p.portal));
    return h('div', { class: 'franja-guia', role: 'region', 'aria-label': 'Tu guía de inicio rápido' },
      h('span', { class: 'franja-guia__texto' }, i >= 0 ? h('span', null, h('strong', null, `Paso ${i + 1} de ${g.pasos.length} de tu guía: `), g.pasos[i].t) : h('span', null, h('strong', null, 'Tu guía: '), g.meta)),
      h('span', { class: 'acciones' }, h('a', { class: 'btn btn--chico btn--suave', href: '#/guia/' + rol }, 'Volver a mi guía'),
        // «Siguiente» de la guía es secundario: la acción principal de la pantalla es la de la cabecera (una sola acción principal por pantalla).
        sig ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => ir(sig) }, 'Siguiente: ' + sig.t) : null));
  }

  MT.guias = { PORTALES, ORDEN, GUIA, AJUSTE, pasosEn, seccionesEn, franjaDe, notaAjuste, irAqui, rolActual };
})(window.MT = window.MT || {});
