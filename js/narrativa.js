/* narrativa.js: la voz y el hilo del relato de la plataforma (quién habla, qué dice y con qué emoción, en cada momento del recorrido).

   CONTRATO (lo consumen la entrada, los espacios y Niky; si falta una línea devuelve null y quien llama no pinta nada):
     MT.narrativa.linea(contexto, datos) -> { texto, emocion, quien } | null
       contexto: 'bienvenida' | 'reto' | 'rol:<id>' | 'portal:<kinesis|wisfox|niky>' | 'paso:<rol>:<n>' | 'exito' | 'espera' | 'error' | 'vacio'
                 y, solo para la entrada: 'demo:<sinapso|kinesis|wisfox|niky>:<reto|accion|logro|animo>'
       datos (opcional): { quien } cambia quién habla en 'exito', 'espera', 'error' y 'vacio'; { tipo } afina 'exito' ('aprobado', 'enviado', 'respuesta')
       emocion: 'contento' | 'curioso' | 'pensando' | 'celebra' | 'animo' | 'sorprendido' | 'duda'
       quien: id de mascota ('sinapso' | 'kinesis' | 'wisfox' | 'niky')

   EL ARCO (el mismo en todo recorrido). La persona es quien protagoniza; Sinapso es la guía que une; Kinesis es el aula, Wisfox el estudiante y
   Niky la ayuda con IA, que propone mientras la persona decide. Cinco momentos, cada uno con su emoción de mascota:
     1 Bienvenida (contento)    te reconocen: sabes quién eres y dónde estás.
     2 Reto (curioso)           cada cerebro aprende a su ritmo y hace falta un apoyo a la medida.
     3 Guía y herramienta (pensando)  la mascota de tu rol te acompaña y Niky ayuda cuando la pides.
     4 Acción (animo)           haces UNA cosa concreta con un ejemplo que funciona.
     5 Logro (celebra)          ves el resultado y qué sigue.
   Reglas de las frases: una sola idea, 12 palabras o menos, presente y tuteo, sin cifras, sin comparar y sin prometer.
   Todo texto nuevo vive en TEXTOS, aquí abajo, para que el dueño lo apruebe o lo cambie en un solo lugar. */
(function (MT) {
  'use strict';

  /* Los cinco momentos, con su emoción y su rótulo corto (la entrada los pinta en la franja de cada ejemplo). */
  const MOMENTOS = [
    { id: 'bienvenida', rotulo: 'Bienvenida', emocion: 'contento' },
    { id: 'reto', rotulo: 'Reto', emocion: 'curioso' },
    { id: 'guia', rotulo: 'Guía', emocion: 'pensando' },
    { id: 'accion', rotulo: 'Acción', emocion: 'animo' },
    { id: 'logro', rotulo: 'Logro', emocion: 'celebra' },
  ];

  /* Cada entrada es [texto, emoción, quién habla]. Si la emoción o quién se omiten, valen los de la regla de cada contexto. */
  const TEXTOS = {
    reto: ['Cada cerebro aprende a su ritmo: hace falta apoyo a la medida.', 'curioso', 'sinapso'],
    bienvenida: ['Hola, te esperaba. Aquí cada cerebro aprende a su ritmo.', 'contento', 'sinapso'],
    rol: {
      docente: ['Planeas una vez y ajustas la clase a cada estudiante.', 'contento'],
      orientacion: ['Tu mirada decide qué ajuste llega al estudiante.', 'pensando'],
      familia: ['Aquí ves, con palabras sencillas, lo que se hace en clase.', 'contento'],
      coordinacion: ['Dejas el colegio listo para que todos puedan trabajar.', 'animo'],
      estudiante: ['Hoy tu actividad viene hecha a tu medida.', 'animo'],
    },
    portal: {
      kinesis: ['Kinesis es el aula: aquí se planea y se aprueba.', 'contento', 'kinesis'],
      wisfox: ['Wisfox es donde practicas a tu ritmo.', 'animo', 'wisfox'],
      niky: ['Niky propone ideas; tú decides cuál usar.', 'curioso', 'niky'],
    },
    /* Una frase por paso de la guía de cada rol (mismo orden que MT.guias.GUIA). Primero reconoce, luego invita a una sola acción, y el
       último paso cierra con el logro. La emoción sale del lugar del paso: curioso al empezar, celebra al terminar, pensando con Niky. */
    paso: {
      docente: [
        'Mira qué le sirve a cada estudiante: sus apoyos, en lenguaje sencillo.',   // honestidad: en Kinesis el docente asignado al curso sí puede ver lo clínico
        'Piensa la clase para todos y agrega su quiz.',
        'Pídele ideas a Niky y quédate con la que te sirva.',
        'Elige un apoyo y mira el cambio que propone.',
        'Así recibe el estudiante lo que aprobó orientación.',
      ],
      orientacion: [
        'Marca qué le ayuda a cada estudiante, sin diagnóstico.',
        'Lee cada ajuste con su razón antes de decidir.',
        'Aprueba o devuelve con una nota; tú decides.',
        'Lo clínico queda donde solo tú lo ves.',
      ],
      familia: [
        'Lee lo que el colegio ya aprobó, en palabras sencillas.',
        'Estas son las notas que el equipo dejó para ti.',
        'Pregúntale a tu estudiante por sus logros en Wisfox.',
      ],
      coordinacion: [
        'Empieza por los cursos: cada estudiante necesita uno.',
        'Registra estudiantes con un código, sin nombres.',
        'Define las opciones de apoyo que orientación usará.',
        'Mira cómo va el colegio, sin ver de quién es cada dato.',
      ],
      estudiante: [
        'Abre tu actividad de hoy: ya viene a tu medida.',
        'Sigue tu ruta, una lección corta a la vez.',
        'Si algo no se entiende, pregúntale a Niky.',
        'Mira tus logros: cada paso que diste cuenta.',
      ],
    },
    exito: {
      _: ['¡Listo! Mira lo que lograste y qué sigue.', 'celebra', 'sinapso'],
      aprobado: ['Aprobado: ahora el estudiante puede recibirlo a su medida.', 'celebra', 'kinesis'],
      enviado: ['Enviado. Ahora le toca a orientación revisarlo.', 'celebra', 'kinesis'],
      respuesta: ['Esa es una idea. Tú decides si la usas.', 'contento', 'niky'],
    },
    espera: ['Estoy pensando una propuesta; un momento.', 'pensando', 'niky'],
    error: ['Esto no salió como esperábamos. Intenta de nuevo.', 'duda', 'sinapso'],
    vacio: ['Aquí aún no hay nada. Empieza con una sola cosa.', 'curioso', 'sinapso'],
    /* La entrada: cada pestaña de «Pruébalo en un minuto» recorre los momentos en pequeño. reto = lo que ves al abrirla, accion = al tocar,
       logro = al terminar, animo = cuando algo no salió y se acompaña. */
    demo: {
      sinapso: { reto: ['Una actividad viaja del aula al estudiante.', 'curioso', 'sinapso'], accion: ['Cada paso pasa por una persona que decide.', 'pensando', 'sinapso'], logro: ['Así llega al estudiante, a su medida.', 'celebra', 'sinapso'] },
      kinesis: { reto: ['Cada estudiante necesita un apoyo distinto.', 'curioso', 'kinesis'], accion: ['Mira cómo cambia la actividad con ese apoyo.', 'pensando', 'kinesis'], logro: ['Aprobado: la actividad ya puede llegar al estudiante.', 'celebra', 'kinesis'] },
      wisfox: { reto: ['Practica con la actividad hecha a tu medida.', 'curioso', 'wisfox'], accion: ['Mira por qué esa respuesta es la correcta.', 'pensando', 'wisfox'], logro: ['Bien hecho: cada respuesta explica el camino.', 'celebra', 'wisfox'], animo: ['Todavía no, y está bien: la explicación ayuda.', 'animo', 'wisfox'] },
      niky: { reto: ['Pregúntame; yo propongo y tú decides.', 'curioso', 'niky'], accion: ['Estoy pensando una respuesta para ti.', 'pensando', 'niky'], respuesta: ['Esta es mi propuesta; tú decides qué hacer.', 'animo', 'niky'], logro: ['Tú decidiste qué hacer con mi idea.', 'celebra', 'niky'] },
    },
  };

  // La mascota que acompaña a cada rol: la del estudiante es Wisfox y la de quienes enseñan y acompañan es Kinesis.
  const mascotaDeRol = (rol) => (rol === 'estudiante' ? 'wisfox' : 'kinesis');
  // El paso vive en un portal de guias.js ('valeria' es el id interno de Niky): de ahí sale quién habla y con qué emoción.
  const quienDePortal = (p) => (p === 'valeria' ? 'niky' : p === 'wisfox' ? 'wisfox' : 'kinesis');

  const hecha = (t, emocionPorDefecto, quienPorDefecto) => (t ? { texto: t[0], emocion: t[1] || emocionPorDefecto, quien: t[2] || quienPorDefecto } : null);

  function linea(contexto, datos) {
    const d = datos || {};
    const partes = String(contexto || '').split(':');
    const [tipo, a, b] = partes;
    switch (tipo) {
      case 'bienvenida': return hecha(TEXTOS.bienvenida);
      case 'reto': return hecha(TEXTOS.reto);
      case 'rol': return hecha(TEXTOS.rol[a], 'contento', mascotaDeRol(a));
      case 'portal': return hecha(TEXTOS.portal[a]);
      case 'paso': {
        const frases = TEXTOS.paso[a]; const n = parseInt(b, 10);
        if (!frases || !(n >= 1 && n <= frases.length)) return null;
        // El portal del paso viene de la guía real, así cambiar un paso allí no deja la mascota equivocada acá.
        const paso = MT.guias && MT.guias.GUIA[a] && MT.guias.GUIA[a].pasos[n - 1];
        const quien = paso ? quienDePortal(paso.portal) : mascotaDeRol(a);
        const emocion = n === frases.length ? 'celebra' : n === 1 ? 'curioso' : quien === 'niky' ? 'pensando' : 'animo';
        return { texto: frases[n - 1], emocion, quien };
      }
      case 'exito': { const l = hecha(TEXTOS.exito[d.tipo] || TEXTOS.exito._); if (d.quien) l.quien = d.quien; return l; }
      case 'espera': case 'error': case 'vacio': { const l = hecha(TEXTOS[tipo]); if (d.quien) l.quien = d.quien; return l; }
      case 'demo': return hecha(TEXTOS.demo[a] && TEXTOS.demo[a][b]);
      default: return null;
    }
  }

  MT.narrativa = { linea, TEXTOS, MOMENTOS };
})(window.MT = window.MT || {});
