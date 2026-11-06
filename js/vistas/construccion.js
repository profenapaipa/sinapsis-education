/* construccion.js: "Cómo lo estamos construyendo". Las cinco miradas del proyecto (pedagógica, tecnológica, jurídica, ética y humana)
   cruzadas con el camino de observar, definir, imaginar, prototipar y probar.

   Cada celda cuenta tres cosas, con honestidad y sin reproche:
   - Existe: lo que ya se puede señalar.
   - Hasta el pilotaje: lo que se hace antes y durante el pilotaje del 5 de noviembre, con datos de ejemplo.
   - Lo que seguimos tejiendo: lo que todavía no está.
   Regla: aquí solo figura como "existe" lo que existe. Lo que está por confirmar va en "seguimos tejiendo". Los textos nacen de la matriz
   de evidencia del proyecto (carpeta privada) y se redactaron con la guía de voz. Cada celda lleva, si tiene, la página del sitio donde se ve. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;

  const ETAPAS = ['Observar', 'Definir', 'Imaginar', 'Prototipar', 'Probar'];
  const MIRADAS = ['Pedagógica', 'Tecnológica', 'Jurídica', 'Ética', 'Humana'];

  // c(existe, pilotaje, tejiendo, [ruta, texto del enlace]) por mirada y etapa, en el orden de ETAPAS.
  const c = (existe, pilotaje, tejiendo, ver) => ({ existe, pilotaje, tejiendo, ver });
  const DATOS = {
    Pedagógica: [
      c('El DUA y el PIAR como marco de lo que ocurre en el aula.', 'Observar cómo planean quienes enseñan y cómo resuelve una actividad un grupo de estudiantes.', 'Escuchar a docentes, orientación, familias y estudiantes.', ['#/glosario', 'Ver el glosario']),
      c('Qué es un ajuste y qué no hacemos: no diagnostica ni decide por quien enseña.', '', 'Contrastar la definición con quienes enseñan.', ['#/mapa/distingue', 'Ver qué nos distingue']),
      c('El camino de un ajuste, de quien enseña a la familia y al estudiante, con el DUA como base.', '', 'Revisarlo con orientación.', ['#/recorrido/camino', 'Ver el camino de un ajuste']),
      c('Actividades con DUA, ajustes con aprobación, vista de familia y una ruta de Inglés de grado 8.°.', 'Planear con docentes usando el recorrido.', 'Más materias y el PIAR en su formato oficial.', ['#/mi', 'Entrar a Mi espacio']),
      c('', 'Medir cuánto tarda planear una clase y si cumple los tres principios del DUA.', 'Un curso durante un periodo, con acompañamiento.', ['#/hoja/etapas', 'Ver las etapas']),
    ],
    Tecnológica: [
      c('Un recorrido automático por cada rol que señala lo que desconcierta a quien llega.', 'Observar cómo se comporta en computadores y pantallas reales.', 'Probar en un celular real.', null),
      c('Un sitio sin dependencias externas y con una política de seguridad estricta.', '', 'Decidir dónde vivirá el servidor.', ['#/hoja/arquitectura', 'Ver la arquitectura']),
      c('La arquitectura capa por capa, con lo que hay hoy y lo siguiente, y un servidor diseñado y con pruebas.', '', 'Un modelo de datos común y un solo inicio de sesión para los tres portales.', ['#/hoja/arquitectura', 'Ver la arquitectura']),
      c('Una plataforma publicada, con auditoría automática de pantallas, temas, contraste y recorrido completo.', 'Congelar la versión antes del pilotaje.', 'El servidor conectado y Niky con un modelo de lenguaje.', ['#/mi', 'Entrar a Mi espacio']),
      c('Una auditoría automática en cada cambio.', 'Probar en los computadores y con el proyector.', 'Una revisión de seguridad independiente antes de usar datos reales.', ['#/hoja/arquitectura', 'Ver la arquitectura']),
    ],
    Jurídica: [
      c('Lectura de las normas que enmarcan el trabajo.', 'Autorización escrita del colegio para el pilotaje.', 'El concepto de una asesoría jurídica.', null),
      c('Tres niveles de datos: por ahora solo datos de ejemplo.', '', 'Una política de tratamiento de datos.', ['#/recorrido/datos', 'Ver cómo viaja la información']),
      c('Una lista de pasos antes de usar datos reales: autorizaciones, acuerdos, cifrado y revisión de seguridad.', '', 'Definir con asesoría la forma de organización del proyecto.', ['#/hoja/etapas', 'Ver las etapas']),
      c('Un aviso permanente de datos de ejemplo y borradores de documentos, a la espera de revisión jurídica.', '', 'Que una persona abogada los revise.', null),
      c('', 'El pilotaje usa solo datos de ejemplo.', 'Probar la lista completa y un plan para incidentes.', null),
    ],
    Ética: [
      c('Cuidado de la voz y de las cifras: sin comparar, sin culpar, sin exponer a nadie.', 'Observar si alguien se siente expuesto o corregido.', 'Escuchar a personas neurodivergentes.', ['#/mapa/distingue', 'Ver qué nos distingue']),
      c('Límites claros: no diagnostica, no reemplaza al equipo del colegio, no decide por quien enseña.', '', '', ['#/mapa/distingue', 'Ver qué nos distingue']),
      c('La IA propone y quien enseña decide; cada rol ve solo lo que necesita.', '', 'Consultar a personas neurodivergentes sobre los símbolos y el lenguaje.', ['#/recorrido/roles', 'Ver quién ve qué']),
      c('Una matriz de quién ve qué, y estudiantes por código, sin nombres.', '', 'Que un servidor haga cumplir los permisos.', ['#/recorrido/roles', 'Ver quién ve qué']),
      c('', 'Ver si la palabra «ajuste» se entiende sin sonar a corrección.', 'Escuchar a familias y estudiantes con calma.', null),
    ],
    Humana: [
      c('Una persona que no conocía el proyecto lo recorrió y mostró dónde se pierde quien llega.', 'Observar a docentes y a un grupo de clase.', 'Conversar con orientación y familias.', null),
      c('Cinco roles, cada uno con lo que hace, lo que no hace y lo que recibe.', '', '', ['#/recorrido/roles', 'Ver los roles']),
      c('Pensar en relaciones antes que en funciones, con una guía de inicio por rol.', '', 'Contrastar con quienes viven el aula.', ['#/guia', 'Ver la guía de inicio']),
      c('Glosario, guía en cada sección, selector de rol y una animación que respeta «reducir movimiento».', 'Revisar la carga sensorial: movimiento, contraste y previsibilidad.', 'Pruebas con lector de pantalla y con familias.', ['#/glosario', 'Ver el glosario']),
      c('', 'Ver si se entienden los pasos y dónde se atascan.', 'Probar con familias, orientación y estudiantes distintos.', null),
    ],
  };

  function detalle(mirada, etapa, d) {
    const bloque = (titulo, texto) => (texto ? h('div', { class: 'celda-detalle__bloque' }, h('h3', null, titulo), h('p', null, texto)) : null);
    MT.dlg.abrir({ titulo: `${mirada} · ${etapa}`, cuerpo: h('div', { class: 'celda-detalle' },
      bloque('Existe', d.existe) || h('div', { class: 'celda-detalle__bloque' }, h('h3', null, 'Existe'), h('p', { class: 'suave' }, 'Todavía no hay nada que señalar aquí. Por eso está entre lo que seguimos tejiendo.')),
      bloque('Hasta el pilotaje (5 de noviembre)', d.pilotaje), bloque('Lo que seguimos tejiendo', d.tejiendo),
      d.ver ? h('p', null, h('a', { class: 'btn btn--chico', href: d.ver[0], onclick: () => { const x = document.querySelector('dialog[open]'); if (x) x.close(); } }, d.ver[1])) : null),
    acciones: [{ texto: 'Cerrar', suave: true, onclick: (cerrar) => cerrar() }] });
  }

  function cuadricula(c2) {
    const marca = (lleno, clase, rotulo) => h('i', { class: 'punto-celda ' + clase + (lleno ? ' punto-celda--on' : ''), title: rotulo, 'aria-hidden': 'true' });
    c2.append(h('div', { class: 'celda-leyenda' },
      h('span', null, marca(true, 'p1'), ' Existe'), h('span', null, marca(true, 'p2'), ' Hasta el pilotaje (5 de nov)'), h('span', null, marca(true, 'p3'), ' Lo que seguimos tejiendo'),
      h('span', { class: 'suave' }, 'Toca una celda para ver el detalle.')));
    c2.append(h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla construccion' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Mirada'), ETAPAS.map((e) => h('th', { scope: 'col' }, e)))),
      h('tbody', null, MIRADAS.map((m) => h('tr', null, h('th', { scope: 'row' }, m),
        DATOS[m].map((d, i) => h('td', null, h('button', { class: 'celda', type: 'button', 'aria-label': `${m}, ${ETAPAS[i]}: ver el detalle. ${d.existe ? 'Hay algo que existe.' : 'Todavía no hay algo que exista.'}${d.pilotaje ? ' Tiene parte en el pilotaje.' : ''}${d.tejiendo ? ' Hay lo que seguimos tejiendo.' : ''}`, onclick: () => detalle(m, ETAPAS[i], d) },
          marca(!!d.existe, 'p1', 'Existe'), marca(!!d.pilotaje, 'p2', 'Hasta el pilotaje'), marca(!!d.tejiendo, 'p3', 'Lo que seguimos tejiendo'))))))))));
  }

  MT.construccion = { cuadricula, DATOS, ETAPAS, MIRADAS };
})(window.MT = window.MT || {});
