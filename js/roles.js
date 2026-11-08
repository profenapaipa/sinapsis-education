/* roles.js: quién es cada persona en la plataforma y qué le toca hacer.

   Esta es la respuesta a "entro y no sé qué hacer": en vez de mostrar tres proyectos y que
   cada quien adivine, se pregunta una sola cosa (¿quién eres?) y todo lo demás sale de ahí:
   a dónde ir, qué puedes hacer, qué no, qué recibes, qué entregas y cuál es tu siguiente paso
   según lo que ya hiciste.

   Los cinco roles son los que ya existen en Kinesis (docente, orientación, familia, administración)
   y en Wisfox (estudiante). El de coordinación es el administrador de Kinesis: por mínimo privilegio
   NO ve información clínica ni el PIAR completo (lib/permissions.ts, canViewDiagnosis).

   Cada rol entra a su espacio en #/mi (js/vistas/espacio.js). */
(function (MT) {
  'use strict';

  const lista = [
    {
      id: 'docente', boton: 'Soy docente', nombre: 'Docente', espacio: 'Kinesis', marca: 'kinesis', icono: 'docente',
      lema: 'Planeo la clase una vez y la ajusto a cada estudiante.',
      haces: ['Ver los apoyos de cada estudiante, sin diagnóstico', 'Planear con los tres principios del DUA', 'Pedir ideas a Niky', 'Enviar un ajuste a orientación'],
      noHaces: ['Ver información clínica de estudiantes que no son de su curso', 'Aprobar su propio ajuste'],
      recibes: 'La decisión de orientación sobre tu ajuste.',
      entregas: 'La actividad y el ajuste que propones.',
    },
    {
      id: 'orientacion', boton: 'Soy de orientación', nombre: 'Orientación', espacio: 'Kinesis', marca: 'kinesis', icono: 'orientacion',
      lema: 'Reviso y apruebo los ajustes antes de que lleguen al estudiante.',
      haces: ['Revisar los ajustes que propone el docente', 'Aprobarlos o devolverlos con una nota', 'Completar los perfiles PIAR que falten'],
      noHaces: ['Cambiar la actividad del docente'],
      recibes: 'Los ajustes propuestos por los docentes.',
      entregas: 'La aprobación, o la devolución con una nota.',
    },
    {
      id: 'familia', boton: 'Soy familia', nombre: 'Familia', espacio: 'Kinesis', marca: 'kinesis', icono: 'familia',
      lema: 'Veo qué se hace en clase para que mi hijo o hija aprenda a su manera.',
      haces: ['Ver el proceso mientras ocurre', 'Leer el mensaje para casa'],
      noHaces: ['Ver información clínica', 'Cambiar ajustes'],
      recibes: 'Las novedades, ya aprobadas por orientación.',
      entregas: 'Nada: solo mira y acompaña.',
    },
    {
      id: 'coordinacion', boton: 'Soy de coordinación', nombre: 'Coordinación', espacio: 'Kinesis', marca: 'kinesis', icono: 'coordinacion',
      lema: 'Dejo el colegio listo para que docentes, orientación y familias puedan trabajar.',
      haces: ['Crear y editar usuarios, cursos y periodos', 'Definir las categorías de apoyo del colegio', 'Vincular a cada familia con su estudiante', 'Ver cuántos ajustes hay en cada estado, sin ver de quién'],
      noHaces: ['Ver el diagnóstico ni el PIAR completo (mínimo privilegio)', 'Aprobar ajustes: eso es de orientación'],
      recibes: 'Las cifras del colegio: estudiantes, ajustes pendientes y planeaciones con DUA completo.',
      entregas: 'La estructura: quién es quién, en qué curso y con qué familia.',
    },
    {
      id: 'estudiante', boton: 'Soy estudiante', nombre: 'Estudiante', espacio: 'Wisfox', marca: 'wisfox', icono: 'libro',
      lema: 'Aprendo a mi ritmo, con la actividad hecha a mi medida.',
      haces: ['Hacer la actividad que le llegó', 'Responder el quiz y jugar', 'Preguntarle a Niky'],
      noHaces: ['Ver los ajustes ni los perfiles de otros'],
      recibes: 'La actividad ya aprobada y a tu medida.',
      entregas: 'Tu progreso: puntos, quiz y logros.',
    },
  ];

  const por = (id) => lista.find((r) => r.id === id);

  /* Qué ve y qué hace cada rol con cada dato. Es la regla de la plataforma; la demostración usa solo datos ficticios. */
  const COLUMNAS = ['Docente', 'Orientación', 'Familia', 'Estudiante', 'Coordinación', 'Niky'];
  const MATRIZ = [
    { dato: 'Información clínica', celdas: ['No ve', 'Ve, con permiso', 'No ve', 'No ve', 'No ve', 'Nunca la recibe'], nota: 'Vive aislada en Kinesis. Es lo más protegido.' },
    { dato: 'Apoyos y fortalezas', celdas: ['Ve', 'Ve', 'Ve, en lenguaje sencillo', 'Ve su plan', 'No ve', 'Solo un perfil anónimo'], nota: 'Es lo que el docente necesita para ajustar la clase.' },
    { dato: 'Actividad planeada', celdas: ['Crea', 'Ve', 'Ve el tema', 'Ve la suya', 'Ve el conteo', 'Propone ideas'], nota: 'El docente decide; Niky solo propone.' },
    { dato: 'Ajuste propuesto', celdas: ['Crea', 'Revisa', 'Ve cuando se aprueba', 'Recibe el ajustado', 'Ve cuántos hay', 'Ayuda a redactarlo'], nota: 'No llega a nadie sin la aprobación de orientación.' },
    { dato: 'Aprobación', celdas: ['Ve el resultado', 'Decide', 'Ve el resultado', 'No ve', 'Ve el conteo', 'No participa'], nota: 'La única decisión que desbloquea el paso siguiente.' },
    { dato: 'Progreso del estudiante', celdas: ['Ve el resumen', 'Ve', 'Ve', 'Lo genera', 'No ve', 'No lo ve'], nota: 'Puntos, quiz y logros de Wisfox.' },
    { dato: 'Usuarios, cursos y vínculos', celdas: ['Ve sus cursos', 'Ve', 'Ve a su estudiante', 'Ve el suyo', 'Crea y edita', 'No participa'], nota: 'Quién es quién, en qué curso y con qué familia.' },
  ];

  MT.roles = { lista, por, COLUMNAS, MATRIZ };
})(window.MT = window.MT || {});
