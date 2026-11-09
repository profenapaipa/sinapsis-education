/* quienes.js: «Quiénes somos». Cuenta qué es el Semillero Maker de Tecnología con Sentido, muestra de forma gráfica cómo se aprende
   (design thinking + aprendizaje basado en proyectos, «aprender haciendo») y los cuatro componentes de la experiencia, y lleva dentro,
   como subsección desplegable, la Identidad.
   Decisiones del dueño (8 nov 2026): enfoque «aprender haciendo», tono cercano y claro, esquema de cuatro componentes en círculo con las
   fases del design thinking como anillo. Firma: «Néstor Andrés Paipa». Sin créditos del colegio, sin precios y sin datos inventados. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  /* TODO el texto de la sección está aquí, junto, para editarlo en un solo lugar.
     BORRADOR POR APROBAR: nada de esto está aprobado todavía por el dueño. */
  const TEXTOS = {
    etiqueta: 'Quiénes somos',
    titulo: 'Quiénes somos',
    apertura: 'Somos el Semillero Maker de Tecnología con Sentido: un lugar para aprender haciendo.',
    semillero: {
      titulo: 'El semillero',
      parrafos: [
        'En el semillero se aprende construyendo. Partimos de una pregunta real, probamos, nos equivocamos y volvemos a intentar hasta tener algo que le sirva a otras personas.',
        'La tecnología tiene sentido cuando responde a una necesidad concreta. Por eso cada proyecto nace de escuchar a quienes lo van a usar, y se comparte para seguir mejorándolo.',
      ],
      firma: 'Semillero Maker de Tecnología con Sentido, de Néstor Andrés Paipa.',
    },
    metodologia: {
      titulo: 'Así aprendemos',
      intro: 'Juntamos dos ideas. El design thinking nos ayuda a entender a las personas antes de construir. El aprendizaje basado en proyectos nos lleva a aprender haciendo algo con sentido.',
      leyenda: 'En el centro está aprender haciendo. Alrededor, los cuatro componentes que hicieron posible la experiencia. Y las cinco fases forman un camino que se repite en cada proyecto.',
      centro: ['Aprender', 'haciendo'],
      fasesTitulo: 'Las cinco fases del design thinking',
      componentesTitulo: 'Los cuatro componentes',
    },
    fases: [
      { nombre: 'Empatizar', texto: 'Escuchamos y observamos a quien vive la situación.' },
      { nombre: 'Definir', texto: 'Ponemos en una frase lo que de verdad hace falta.' },
      { nombre: 'Idear', texto: 'Imaginamos muchas salidas, sin descartar pronto.' },
      { nombre: 'Prototipar', texto: 'Construimos algo sencillo para poder tocarlo.' },
      { nombre: 'Probar', texto: 'Lo usamos con personas y lo mejoramos.' },
    ],
    // El orden es el del dueño: pedagógico, emprendimiento, tecnológico y crítico.
    componentes: [
      { id: 'pedagogico', nombre: 'Pedagógico', texto: 'Cada estudiante aprende a su manera, y el proyecto se diseña para que todos tengan un camino.' },
      { id: 'emprendimiento', nombre: 'Emprendimiento', texto: 'Una idea se vuelve algo útil, con un propósito y cuidado por quienes lo usan.' },
      { id: 'tecnologico', nombre: 'Tecnológico', texto: 'Programar, fabricar y probar para dar vida a lo que imaginamos.' },
      { id: 'critico', nombre: 'Crítico', texto: 'Preguntarnos para quién sirve, a quién deja por fuera y cómo mejorarlo.' },
    ],
    identidad: {
      titulo: 'Identidad',
      resumen: 'Cómo se ve y cómo habla la plataforma. Todo lo que ves ahí está hecho con los mismos componentes que usa el resto del sitio.',
    },
    esquema: {
      nombre: 'Esquema de la metodología: aprender haciendo',
      descripcion: 'Un círculo con «Aprender haciendo» en el centro, rodeado por cuatro componentes: pedagógico, tecnológico, emprendimiento y crítico. '
        + 'Un anillo exterior con cinco fases numeradas: empatizar, definir, idear, prototipar y probar. Debajo hay la misma información en lista.',
    },
  };

  // Un color y una forma por componente: no se distingue solo por color (cada sector lleva su nombre escrito).
  // Los tonos salen de los hilos del logo; el texto sobre ámbar va en tinta por contraste.
  const COLOR = {
    pedagogico: { fondo: '#1B7F56', tinta: '#FFFFFF' },
    tecnologico: { fondo: '#2B4FA3', tinta: '#FFFFFF' },
    emprendimiento: { fondo: '#E8A13C', tinta: '#1A1714' },
    critico: { fondo: '#E0527E', tinta: '#1A1714' },
  };
  // Posición en el círculo (en el sentido del reloj, desde arriba): el ancho de cada sector decide dónde cabe cada nombre.
  const SECTORES = [['pedagogico', -90], ['tecnologico', 0], ['emprendimiento', 90], ['critico', 180]];

  const NS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, ...hijos) {
    const el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => el.setAttribute(k, attrs[k]));
    hijos.forEach((x) => { if (x != null) el.append(x); });
    return el;
  }
  const rad = (g) => (g * Math.PI) / 180;
  const punto = (cx, cy, r, g) => [cx + r * Math.cos(rad(g)), cy + r * Math.sin(rad(g))];

  // Sector anular entre dos radios, centrado en el ángulo g y con el ancho dado (grados).
  function sector(cx, cy, r1, r2, g, ancho) {
    const a1 = g - ancho / 2; const a2 = g + ancho / 2;
    const [x1, y1] = punto(cx, cy, r2, a1); const [x2, y2] = punto(cx, cy, r2, a2);
    const [x3, y3] = punto(cx, cy, r1, a2); const [x4, y4] = punto(cx, cy, r1, a1);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r2} ${r2} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${r1} ${r1} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
  }

  // El esquema es un SVG propio (sin imágenes externas). Tiene nombre y descripción accesibles, y la misma información en lista debajo.
  function esquema() {
    const cx = 200; const cy = 200;
    const hijos = [
      S('title', { id: 'esq-t' }, TEXTOS.esquema.nombre),
      S('desc', { id: 'esq-d' }, TEXTOS.esquema.descripcion),
      // Anillo de las cinco fases.
      S('circle', { cx, cy, r: 172, fill: 'none', stroke: '#1A1714', 'stroke-opacity': '.28', 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }),
    ];
    // Flechas del anillo (sentido del reloj) entre fase y fase: indican que el camino se repite.
    for (let i = 0; i < 5; i++) {
      const g = -90 + 72 * i + 36;
      const [px, py] = punto(cx, cy, 172, g);
      const t = rad(g + 90); const n = rad(g);
      const pt = (a, b) => `${(px + Math.cos(t) * a + Math.cos(n) * b).toFixed(1)},${(py + Math.sin(t) * a + Math.sin(n) * b).toFixed(1)}`;
      hijos.push(S('polygon', { points: `${pt(8, 0)} ${pt(-5, 6)} ${pt(-5, -6)}`, fill: '#1A1714', 'fill-opacity': '.55' }));
    }
    // Cuatro sectores: los componentes.
    SECTORES.forEach(([id, g]) => {
      const c = COLOR[id]; const comp = TEXTOS.componentes.find((x) => x.id === id);
      const [tx, ty] = punto(cx, cy, 104, g);
      hijos.push(S('path', { d: sector(cx, cy, 58, 150, g, 84), fill: c.fondo, stroke: '#1A1714', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      hijos.push(S('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: c.tinta, 'font-size': 15, 'font-weight': 800 }, comp.nombre));
    });
    // Centro: aprender haciendo.
    hijos.push(S('circle', { cx, cy, r: 52, fill: '#1A1714' }));
    hijos.push(S('text', { x: cx, y: cy - 9, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#FFFFFF', 'font-size': 17, 'font-weight': 800 }, TEXTOS.metodologia.centro[0]));
    hijos.push(S('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#FFFFFF', 'font-size': 17, 'font-weight': 800 }, TEXTOS.metodologia.centro[1]));
    // Nodos numerados de las fases.
    TEXTOS.fases.forEach((f, i) => {
      const [x, y] = punto(cx, cy, 172, -90 + 72 * i);
      hijos.push(S('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 20, fill: '#FFFFFF', stroke: '#1A1714', 'stroke-width': 3 }));
      hijos.push(S('text', { x: x.toFixed(1), y: y.toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#1A1714', 'font-size': 18, 'font-weight': 800 }, String(i + 1)));
    });
    const el = S('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-labelledby': 'esq-t esq-d', class: 'quienes-esquema', focusable: 'false' }, ...hijos);
    return el;
  }

  function render(main, ctx) {
    const c = pagina(main, { etiqueta: TEXTOS.etiqueta, titulo: TEXTOS.titulo, descripcion: TEXTOS.apertura });
    c.classList.add('quienes');

    c.append(h('section', { class: 'quienes-seccion', 'aria-labelledby': 'q-semillero' },
      h('h2', { id: 'q-semillero' }, TEXTOS.semillero.titulo),
      ...TEXTOS.semillero.parrafos.map((p) => h('p', { class: 'quienes-texto' }, p)),
      h('p', { class: 'quienes-firma' }, TEXTOS.semillero.firma)));

    c.append(h('section', { class: 'quienes-seccion', 'aria-labelledby': 'q-metodo' },
      h('h2', { id: 'q-metodo' }, TEXTOS.metodologia.titulo),
      h('p', { class: 'quienes-texto' }, TEXTOS.metodologia.intro),
      h('div', { class: 'quienes-metodo' },
        h('figure', { class: 'quienes-figura' }, esquema(), h('figcaption', { class: 'suave' }, TEXTOS.metodologia.leyenda)),
        h('div', { class: 'quienes-listas' },
          h('div', { class: 'tarjeta tarjeta--borde' },
            h('h3', null, TEXTOS.metodologia.componentesTitulo),
            h('ul', { class: 'quienes-componentes' }, TEXTOS.componentes.map((x) => h('li', null,
              h('span', { class: 'quienes-chip', style: 'background:' + COLOR[x.id].fondo, 'aria-hidden': 'true' }),
              h('span', null, h('strong', null, x.nombre + '. '), x.texto))))),
          h('div', { class: 'tarjeta tarjeta--borde' },
            h('h3', null, TEXTOS.metodologia.fasesTitulo),
            h('ol', { class: 'quienes-fases' }, TEXTOS.fases.map((x) => h('li', null, h('strong', null, x.nombre + '. '), x.texto))))))));

    // Identidad: subsección desplegable. Se monta la primera vez que se abre, porque el manual de marca es pesado (logo animado, muestras)
    // y la mayoría de quienes llegan aquí solo buscan saber quiénes somos.
    const det = h('details', { class: 'quienes-identidad', id: 'identidad-sub' },
      h('summary', null, h('span', { class: 'quienes-identidad__t' }, TEXTOS.identidad.titulo), h('span', { class: 'quienes-identidad__d suave' }, TEXTOS.identidad.resumen)));
    const cuerpo = h('div', { class: 'quienes-identidad__cuerpo' });
    det.append(cuerpo);
    let montado = false;
    const montar = () => { if (montado || !det.open || !MT.identidadCuerpo) return; montado = true; MT.identidadCuerpo(cuerpo); if (MT.glosario) MT.glosario.marcar(cuerpo); };
    det.addEventListener('toggle', montar);
    c.append(h('section', { class: 'quienes-seccion', 'aria-label': TEXTOS.identidad.titulo }, det));
    if (ctx && ctx.identidad) { det.open = true; montar(); }
  }

  MT.router.registrar({ id: 'quienes', titulo: 'Quiénes somos', espacio: '', render });
  MT.quienesTextos = TEXTOS;
})(window.MT = window.MT || {});
