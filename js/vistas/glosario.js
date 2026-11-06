/* glosario.js: las palabras del tema, explicadas en lenguaje cotidiano.

   Dos usos: la página #/glosario con todas, y un marcado automático: la primera vez que una sigla aparece en una
   pantalla se vuelve un botón que abre su explicación. Es un botón y no un texto emergente al pasar el cursor
   porque en el celular no existe el cursor, y porque un botón también se alcanza con el teclado. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  const TERMINOS = [
    { sigla: 'PIAR', nombre: 'Plan Individual de Ajustes Razonables', que: 'La herramienta con la que el colegio y la familia planean los ajustes que un estudiante necesita para aprender y participar. Lo contempla el Decreto 1421 de 2017, que lo establece para estudiantes con discapacidad.' },
    { palabra: 'neurodiversidad', nombre: 'Neurodiversidad', que: 'La idea de que las diferencias en cómo funciona el cerebro humano son una variación natural, como la diversidad cultural o biológica. No describe a una persona sola: describe a un grupo, y en un aula todos somos parte de ella.' },
    { palabra: 'neurodivergencia', nombre: 'Neurodivergencia', que: 'La manera de procesar, aprender o percibir que se aparta de lo más habitual. Es una forma de ser y de aprender, no una falta.' },
    { palabra: 'neurodesarrollo', nombre: 'Neurodesarrollo', que: 'El proceso por el cual el cerebro y el sistema nervioso se desarrollan y se organizan desde la infancia, y con ellos la atención, el lenguaje, la memoria y la manera de relacionarse. Cada persona lo recorre a su ritmo.' },
    { sigla: 'DUA', nombre: 'Diseño Universal para el Aprendizaje', que: 'Una manera de planear la clase pensando desde el principio en que todos aprendemos distinto. Tiene tres principios: ofrecer varias formas de presentar la información (el qué), de expresarse (el cómo) y de motivarse (el por qué).' },
    { sigla: 'XP', nombre: 'Puntos de experiencia', que: 'Los puntos que ganas al hacer lecciones y quizes. Suben tu nivel. Son para ver tu propio avance, no para compararte con nadie.' },
    { nombre: 'Marco normativo', que: 'Las normas que respaldan el derecho a una educación inclusiva y al cuidado de los datos personales: la Ley 115 de 1994 (Ley General de Educación); el Decreto 1421 de 2017 (atención educativa a la población con discapacidad, con el PIAR); la Ley 1618 de 2013 (derechos de las personas con discapacidad) y la Ley 1346 de 2009 (que aprueba la Convención sobre los derechos de las personas con discapacidad); la Ley 1098 de 2006 (Código de la Infancia y la Adolescencia); y la Ley 1581 de 2012 (protección de datos personales). Son un punto de partida: la mirada pedagógica sigue creciendo más allá de la norma.' },
    { palabra: 'agentividad', nombre: 'Agentividad', que: 'La capacidad de las personas de decidir y de actuar sobre su propio aprendizaje y su labor. En Mosaico Telar la inteligencia artificial es una herramienta al servicio de esa capacidad: propone y ordena, y quien decide es una persona.' },
    { nombre: 'Ajuste', que: MT.guias.AJUSTE },
    { nombre: 'Apoyo', que: 'Lo que le sirve a un estudiante para aprender, por ejemplo más tiempo o imágenes junto al texto. En Mosaico Telar un apoyo se describe siempre sin diagnóstico.' },
    { nombre: 'Información clínica', que: 'Datos de salud o un diagnóstico. En Mosaico Telar solo existe como archivos que ve únicamente orientación: ni docentes, ni familias, ni coordinación, ni la inteligencia artificial la reciben.' },
    { nombre: 'Mínimo privilegio', que: 'La regla de que cada rol ve solo lo que necesita para hacer su trabajo y nada más. Por eso coordinación administra el colegio pero no ve los apoyos de los estudiantes.' },
    { nombre: 'Portal', que: 'Cada una de las tres partes de la plataforma: Kinesis (el aula), Niky (la guía) y Wisfox (el estudiante).' },
  ];

  // Se marcan al primer uso las siglas y también las palabras clave del eje narrativo (neurodiversidad, neurodivergencia, neurodesarrollo).
  const SIGLAS = TERMINOS.filter((t) => t.sigla || t.palabra);
  const clave = (t) => t.sigla || t.palabra;
  const NO = 'BUTTON, A, LABEL, SELECT, OPTION, TEXTAREA, INPUT, DIALOG, H1, SCRIPT, STYLE, SVG, ABBR, .termino, .vivos, [role="heading"]';

  function explicar(t) {
    MT.dlg.abrir({ titulo: t.sigla ? `${t.sigla}: ${t.nombre}` : t.nombre, cuerpo: h('div', null, h('p', null, t.que), h('p', null, h('a', { href: '#/glosario', onclick: () => document.querySelector('dialog[open]') && document.querySelector('dialog[open]').close() }, 'Ver todo el glosario'))),
      acciones: [{ texto: 'Entendido', onclick: (cerrar) => cerrar() }] });
  }

  /* Marca la primera aparición de cada sigla en una pantalla. Solo toca texto corrido: nunca títulos, botones ni enlaces. */
  function marcar(main) {
    const pendientes = new Map(SIGLAS.map((t) => [clave(t), t]));
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && !n.parentElement.closest(NO) && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const nodos = []; while (walker.nextNode()) nodos.push(walker.currentNode);
    // Se recorre en orden de aparición. Dentro de un mismo texto se marca primero la sigla que aparece antes, y se sigue con lo que queda
    // a su derecha: así la primera aparición de cada una en la pantalla es la que se marca, sin importar el orden de la lista.
    for (const nodo of nodos) {
      let actual = nodo;
      while (pendientes.size && actual) {
        let mejor = null;
        for (const [sigla, t] of pendientes) {
          const m = new RegExp(`(^|[^A-Za-zÁÉÍÓÚáéíóúÑñ])${sigla}(?![A-Za-zÁÉÍÓÚáéíóúÑñ])`).exec(actual.nodeValue);
          if (!m) continue;
          const i = m.index + m[1].length;
          if (!mejor || i < mejor.i) mejor = { sigla, t, i };
        }
        if (!mejor) break;
        const despues = actual.splitText(mejor.i + mejor.sigla.length);
        const medio = actual.splitText(mejor.i);
        medio.replaceWith(h('button', { class: 'termino', type: 'button', 'aria-label': `${mejor.sigla}: qué significa`, onclick: () => explicar(mejor.t) }, mejor.sigla));
        pendientes.delete(mejor.sigla);
        actual = despues;
      }
      if (!pendientes.size) break;
    }
  }

  // Abre una entrada del glosario por su nombre (para enlaces que no son siglas, como "las leyes que los respaldan").
  function abrirNombre(nombre) { const t = TERMINOS.find((x) => x.nombre === nombre); if (t) explicar(t); }
  MT.glosario = { marcar, TERMINOS, abrirNombre };

  MT.router.registrar({
    id: 'glosario', titulo: 'Glosario', espacio: '',
    render(main) {
      const c = pagina(main, { etiqueta: 'Glosario', titulo: 'Las palabras del tema, sin complicaciones', descripcion: 'Qué significa cada sigla y cada término que verás en la plataforma.' });
      c.append(h('dl', { class: 'glosario' }, TERMINOS.map((t) => h('div', { class: 'tarjeta' }, h('dt', null, t.sigla ? h('span', null, h('strong', null, t.sigla), ' · ', t.nombre) : h('strong', null, t.nombre)), h('dd', null, t.que)))));
    },
  });
})(window.MT = window.MT || {});
