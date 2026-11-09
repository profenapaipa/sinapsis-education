/* datos.js: los datos de partida y las reglas del negocio.

   Todo lo que trae la plataforma de partida es de ejemplo: los estudiantes son códigos (8A-01 a 8A-10), sin
   nombres, y no hay diagnósticos en ninguna parte. Lo que se crea después queda en el navegador de quien lo crea.
   La información clínica solo existe como archivos con visibilidad "clínico", que ve únicamente orientación. */
(function (MT) {
  'use strict';

  // Los tres principios del Diseño Universal para el Aprendizaje (DUA).
  const dua = [
    { id: 'repr', titulo: 'Múltiples formas de representación', principio: 'El “qué” del aprendizaje',
      opciones: ['Imágenes junto al texto', 'Instrucciones en pasos numerados', 'Un ejemplo resuelto antes de la tarea'] },
    { id: 'accion', titulo: 'Múltiples formas de acción y expresión', principio: 'El “cómo” del aprendizaje',
      opciones: ['Responder escribiendo, dibujando o hablando', 'Elegir el formato de entrega', 'Trabajar en parejas'] },
    { id: 'compromiso', titulo: 'Múltiples formas de compromiso', principio: 'El “por qué” del aprendizaje',
      opciones: ['Elegir el contexto de la tarea', 'Metas cortas con retroalimentación', 'Compartir en pareja y no frente al curso'] },
  ];

  const asignaturas = ['Inglés', 'Matemáticas', 'Ciencias naturales', 'Ciencias sociales', 'Lengua castellana', 'Educación artística', 'Tecnología'];

  const categoriasBase = [
    'Instrucciones en pasos cortos y numerados', 'Apoyo visual junto al texto', 'Tiempo adicional del 50 %', 'Evitar leer en voz alta frente al curso',
    'Una sola tarea a la vez', 'Descansos activos cada 15 minutos', 'Instrucciones orales y escritas', 'Vocabulario de apoyo',
  ];

  function semilla() {
    const est = (id, extra) => Object.assign({ id, curso: 'c1', piar: false, apoyos: [], fortalezas: [] }, extra);
    return {
      cursos: [{ id: 'c1', nombre: '8.°-A' }, { id: 'c2', nombre: '8.°-B' }],
      categorias: categoriasBase.map((nombre, i) => ({ id: 'k' + (i + 1), nombre })),
      estudiantes: [
        est('8A-01'),
        est('8A-02', { piar: true, apoyos: ['Descansos activos cada 15 minutos', 'Instrucciones orales y escritas'], fortalezas: ['Explica con ejemplos propios'] }),
        est('8A-03', { piar: true, apoyos: ['Instrucciones en pasos cortos y numerados', 'Apoyo visual junto al texto', 'Tiempo adicional del 50 %', 'Evitar leer en voz alta frente al curso', 'Una sola tarea a la vez'], fortalezas: ['Aprende muy bien con imágenes', 'Trabaja con entusiasmo en pareja'] }),
        est('8A-04'), est('8A-05'), est('8A-06'),
        est('8A-07', { piar: true, apoyos: ['Vocabulario de apoyo', 'Tiempo adicional del 50 %'], fortalezas: ['Buena memoria para el vocabulario nuevo'] }),
        est('8A-08'), est('8A-09', { curso: 'c2' }), est('8A-10', { curso: 'c2' }),
      ],
      actividades: [{
        id: 'a1', titulo: 'Mi rutina del día', asignatura: 'Inglés', tema: 'Present simple',
        descripcion: 'Los estudiantes cuentan su rutina con tarjetas de imagen, verbo y hora. Cada uno elige cómo mostrarla: escribiéndola, dibujándola con rótulos o grabando un audio corto.',
        dua: { repr: ['Imágenes junto al texto'], accion: ['Responder escribiendo, dibujando o hablando'], compromiso: ['Compartir en pareja y no frente al curso'] },
        pasos: ['Mira las imágenes de la rutina.', 'Une cada imagen con su verbo.', 'Cuéntale tu rutina a una compañera.'],
        quiz: [
          { q: 'She ___ breakfast at seven.', o: ['eat', 'eats', 'eating', 'eated'], a: 1, why: 'Con she, he o it, el verbo lleva -s.' },
          { q: 'Con “I”, “you”, “we” y “they”, el verbo…', o: ['lleva -ing', 'lleva -s', 'queda igual', 'cambia a pasado'], a: 2, why: 'Con esos sujetos el verbo no cambia.' },
          { q: 'My brother ___ the bus to school.', o: ['takes', 'take', 'taking', 'is take'], a: 0, why: 'My brother es tercera persona: takes.' },
          { q: 'Elige la oración correcta:', o: ['He wake up early.', 'He waking up early.', 'He wakes up early.', 'He wakes ups early.'], a: 2, why: 'Solo el verbo lleva -s: wakes up.' },
        ],
        archivos: [], estado: 'publicada', fecha: new Date().toISOString(),
      }],
      ajustes: [], archivos: [], notas: [], eventos: [],
      progreso: {},
    };
  }

  /* Cada apoyo del perfil se convierte en un cambio concreto de la actividad, con su razón. Los apoyos que
     el colegio agrega por su cuenta (categorías propias) también producen un cambio: se anotan tal cual. */
  const reglasAjuste = [
    { coincide: /pasos cortos/i, crear: () => ({ cambio: 'Las instrucciones pasan de un párrafo a pasos cortos y numerados, uno por tarjeta.', porque: 'Su perfil indica que le funcionan los pasos cortos.' }) },
    { coincide: /visual/i, crear: () => ({ cambio: 'Cada concepto clave lleva una imagen y un color.', porque: 'El apoyo visual junto al texto le ayuda a entender sin depender solo de la lectura.' }) },
    { coincide: /tiempo adicional/i, crear: (a) => { const p = (a.match(/(\d+)/) || [0, 50])[1]; return { cambio: `Se agrega ${p} % más de tiempo en cada parte de la actividad.`, porque: `Tiene tiempo adicional del ${p} % en su perfil.` }; } },
    { coincide: /voz alta/i, crear: () => ({ cambio: 'Comparte su respuesta con una compañera y el docente la escucha aparte.', porque: 'Evita la lectura en voz alta frente al curso.' }) },
    { coincide: /una sola tarea/i, crear: () => ({ cambio: 'Las tarjetas se entregan de una en una.', porque: 'Su perfil pide una sola tarea a la vez.' }) },
    { coincide: /descansos/i, crear: () => ({ cambio: 'Se agrega una pausa activa de dos minutos a mitad de la actividad.', porque: 'Sus apoyos incluyen descansos activos.' }) },
    { coincide: /orales y escritas/i, crear: () => ({ cambio: 'Cada instrucción se dice en voz alta y también se escribe.', porque: 'Le sirve recibir la instrucción por dos canales.' }) },
    // ---- casos2 ---- Reglas de los apoyos del caso de Tecnología (programación con Turtle): sin ellas el ajuste solo diría «se tiene en cuenta».
    { coincide: /ejemplo que ya funciona/i, crear: () => ({ cambio: 'La actividad empieza con un programa que ya funciona, para ejecutarlo y cambiarlo.', porque: 'Su perfil indica que parte mejor de un ejemplo completo que de una hoja en blanco.' }) },
    { coincide: /en pareja/i, crear: () => ({ cambio: 'Programa en pareja: una persona escribe y la otra revisa, y se turnan.', porque: 'Programar en pareja le da compañía y le ayuda a encontrar errores hablando.' }) },
    { coincide: /por niveles/i, crear: () => ({ cambio: 'Los retos vienen por niveles: cada uno elige desde cuál empezar y puede subir cuando quiera.', porque: 'Los retos por niveles le dejan avanzar a su paso y sentir logros pequeños.' }) },
    { coincide: /letra grande/i, crear: () => ({ cambio: 'El editor de código se abre con letra grande.', porque: 'Le sirve leer el código con letra más grande.' }) },
    // ---- fin casos2 ----
    { coincide: /vocabulario/i, crear: () => ({ cambio: 'Se agrega un banco de palabras con su significado al lado.', porque: 'Su perfil pide vocabulario de apoyo.' }) },
  ];

  function generarAjuste(estudiante) {
    return (estudiante.apoyos || []).map((apoyo) => {
      const regla = reglasAjuste.find((r) => r.coincide.test(apoyo));
      return regla ? regla.crear(apoyo) : { cambio: `Se tiene en cuenta en la actividad: ${apoyo}.`, porque: 'Es un apoyo registrado en su perfil.' };
    });
  }

  const logros = [
    { id: 'leccion', nombre: 'Primera lección', icono: '📘' },
    { id: 'quiz', nombre: 'Quiz completo', icono: '🏅' },
    { id: 'perfecto', nombre: 'Quiz perfecto', icono: '🎯' },
    { id: 'nota', nombre: 'Primera nota', icono: '📝' },
    { id: 'ia', nombre: 'Preguntó a Niky', icono: '💬' },
    { id: 'adaptada', nombre: 'Actividad a mi medida', icono: '🧵' },
  ];

  // Respuestas de ejemplo de Niky mientras no haya un modelo conectado.
  const respuestasIA = {
    disenar: '**Actividad de 20 minutos**\n\n**Inicio (4 min).** Muestra tres imágenes del tema y pregunta: “¿Qué ves primero?”. Responden en voz alta, en parejas o señalando.\n\n**Desarrollo (12 min).** Cada estudiante arma su respuesta con tarjetas de imagen y palabra. Elige cómo mostrarla: escribiéndola, dibujándola con rótulos o grabando un audio corto.\n\n**Cierre (4 min).** Cada pareja comparte una idea y el docente señala la regla central.\n\nPor qué sirve al DUA: hay varias formas de representar (imagen y texto), de expresar (escribir, dibujar o hablar) y de motivar (elegir y compartir en pareja).',
    ajustar: '**Ajustes propuestos**\n\nCada apoyo del perfil se convierte en un cambio concreto, y cada cambio dice por qué. El docente puede aceptar, cambiar o quitar cualquiera antes de que pase a orientación.',
    ayuda: 'Buena pregunta. La idea es esta:\n\n- Con **I, you, we, they** el verbo queda igual: *I eat breakfast.*\n- Con **he, she, it** el verbo lleva **-s**: *She eats breakfast.*\n\nLa -s aparece solo cuando hablas de una tercera persona, alguien de quien cuentas algo.\n\n**Pruébalo tú:** ¿cómo dirías “mi hermano toma el bus”? Empieza con “My brother…” y dime qué le pasa al verbo.',
    general: 'Estoy en **modo de ejemplo**: todavía no tengo conexión con un modelo de lenguaje, así que respondo con textos preparados. Puedes pedirme **diseñar una actividad**, **ajustarla a un perfil** o **explicarte un tema**.',
  };

  MT.datos = { dua, asignaturas, semilla, reglasAjuste, generarAjuste, logros, respuestasIA };
})(window.MT = window.MT || {});
