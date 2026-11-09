/* mensajes.js: los textos que estrenan el modo presentación, el funcionamiento sin conexión, la versión calmada y el respaldo
   de los portales. Están todos aquí, y no repartidos por el código, por una razón: son textos públicos y los aprueba el dueño del
   proyecto (guía de voz, regla de oro). Quien revisa solo tiene que abrir este archivo, y cambiar una frase no toca la lógica.

   El guion de la mesa es un BORRADOR: mientras `aprobado` sea false, la pantalla lo dice con la marca "[por aprobar]".
   Cuando el dueño lo apruebe basta con cambiar `aprobado` a true; la marca desaparece sola. */
(function (MT) {
  'use strict';

  // El nombre público de la plataforma, en un solo lugar. Pasó de «Mosaico Telar» a «Sinapsis Education» (nov 2026). Los identificadores
  // internos (MT, el repositorio, las claves de almacenamiento) conservan el nombre de código para no romper datos guardados ni enlaces.
  MT.nombre = MT.nombre || 'Sinapsis Education';

  MT.mensajes = {
    presentacion: {
      activar: 'Modo presentación',
      salir: 'Salir de la presentación',
      ayudaBoton: 'Letra más grande y un guion para recorrer la plataforma con un caso. Atajo: Alt+P.',
      guion: 'Guion de la mesa',
      borrador: '[por aprobar]',
      paso: (n, total) => `Paso ${n} de ${total}`,
      turno: (rol) => `Turno: ${rol}`,
      turnoGeneral: 'Para todo el grupo',
      caso: 'Caso',
      habla: (grupo) => (grupo === 'Todos' ? 'Habla: todas y todos' : `Habla: ${grupo}`),
      tiempo: (seg, total) => { const m = (x) => `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`; return `${m(seg)} de ${m(total)}`; },
      casoListo: (n) => `Listo: caso ${n} cargado desde el principio.`,
      anterior: 'Anterior',
      siguiente: 'Siguiente',
      empezarDeNuevo: 'Empezar de nuevo',
      reiniciado: 'Listo: volvieron los datos de ejemplo y la plataforma quedó sin rol elegido.',
      pantallaCompleta: 'Pantalla completa',
      ocultar: 'Ocultar guion',
      mostrar: 'Mostrar guion',
      atajos: 'Con el foco en el guion, las flechas ← y → cambian de paso. Alt+G lleva el foco al guion.',
    },

    sinConexion: {
      aviso: 'Sin conexión. ' + MT.nombre + ' sigue funcionando: los datos de ejemplo están en este dispositivo. Los portales de Kinesis y Wisfox necesitan internet y se abren de nuevo cuando regrese.',
      volvio: 'Volvió la conexión.',
      versionNueva: 'Hay una versión nueva de ' + MT.nombre + '.',
      recargar: 'Recargar',
      cerrar: 'Cerrar el aviso',
    },

    respaldo: {
      titulo: (portal) => `${portal} no se puede abrir ahora`,
      explicacion: (portal) => `${portal} es una aplicación de su propio equipo y se abre desde internet. Ahora no hay conexión, o el portal no responde.`,
      siguePuesto: 'Lo que sigue funcionando',
      sigue: (portal) => [
        `La guía, que explica cómo se usa ${portal} sin necesitar conexión.`,
        'Niky responde con ejemplos preparados.',
      ],
      verEnMiEspacio: (portal) => `Ver ${portal} en Mi espacio`,
      reintentar: 'Intentar de nuevo',
      reintentando: 'Comprobando la conexión…',
      abrirAparte: 'Abrir aparte',
      sigueSinConexion: 'Todavía no se puede abrir. Puedes abrirlo aparte o intentarlo de nuevo en un momento.',
      comoRol: (rol) => `Se abre como ${rol}; puedes cambiar de rol en la franja de arriba.`,
    },

    // La línea fija bajo la barra de cada portal externo: la salida para cuando el portal no se ve y nada avisó (por ejemplo, un error 404).
    rescate: {
      aprobado: false,
      borrador: '[por aprobar]',
      pregunta: '¿No ves el portal?',
      aparte: 'Ábrelo aparte',
      o: ' o ',
      miEspacio: 'usa Mi espacio',
    },

    calmado: {
      etiqueta: 'Versión calmada',
      ayuda: 'Quita animaciones, transiciones y revelados, y suaviza el fondo.',
      sistema: 'Tu sistema ya pide menos movimiento; esta opción lo mantiene aunque lo cambies.',
    },

    /* Selector de estilo de la página en Apariencia. Está apagado (MT.config.mostrarEstilos = false), así que nadie lo ve todavía.
       Estos nombres son de trabajo: los define el dueño antes de encender el selector. */
    estilos: {
      aprobado: false,
      leyenda: 'Estilo de la página',
      sitio: 'El de siempre',
      hilo: 'Hilo',
      piezas: 'Piezas',
      taller: 'Taller',
    },

    // Los textos de la red de seguridad contra pantalla en blanco viven en js/red-de-seguridad.js: ese archivo no puede depender de este.

    /* El guion: un recorrido por los cinco roles siguiendo un ajuste, de principio a fin. Cada paso lleva a la pantalla donde ocurre
       (rol y hash). `rol` vacío significa "sin rol elegido". Los textos son del borrador. */
    guion: {
      aprobado: false,
      pasos: [
        { rol: '', hash: '#/', titulo: 'Empezamos por el aula', texto: 'Presenta el proyecto en una frase: ' + MT.nombre + ' acompaña la variedad de formas de aprender en el aula y reúne en un mismo tejido a quienes la viven.' },
        { rol: 'coordinacion', hash: '#/mi/cursos', titulo: 'Coordinación deja el colegio listo', texto: 'Se crea el curso y se registra a cada estudiante solo con un código, sin nombres.' },
        { rol: 'orientacion', hash: '#/mi/estudiantes', titulo: 'Orientación registra los apoyos', texto: 'En el perfil de cada estudiante se marca lo que le ayuda a aprender. Aquí no hay diagnósticos.' },
        { rol: 'docente', hash: '#/mi/actividades', titulo: 'La docencia planea la clase', texto: 'Se planea la actividad con los tres principios del DUA. Niky propone ideas; quien enseña decide.' },
        { rol: 'docente', hash: '#/mi/ajustes', titulo: 'La docencia ajusta la actividad', texto: 'Cada apoyo se vuelve un cambio concreto, con su razón, y se envía a orientación.' },
        { rol: 'orientacion', hash: '#/mi/ajustes', titulo: 'Orientación revisa y decide', texto: 'Aprueba el ajuste o lo devuelve con una nota. Nada avanza sin esta decisión.' },
        { rol: 'familia', hash: '#/mi/resumen', titulo: 'La familia ve la novedad', texto: 'Solo aparece lo ya aprobado, con su razón y en lenguaje sencillo.' },
        { rol: 'estudiante', hash: '#/mi/resumen', titulo: 'El estudiante recibe la actividad a su medida', texto: 'La practica, responde el quiz y gana logros a su ritmo.' },
        { rol: 'docente', hash: '#/mi/resumen', titulo: 'La docencia ve el progreso', texto: 'Con lo que pasó, decide el siguiente paso. El ciclo vuelve a empezar.' },
        { rol: '', hash: '#/guia', titulo: 'Los tres portales', texto: 'Kinesis, Niky y Wisfox son los proyectos de los que nace esta plataforma. Aquí se ven juntos.' },
      ],
    },
  };
})(window.MT = window.MT || {});
