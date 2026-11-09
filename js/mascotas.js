/* mascotas.js: las cuatro mascotas de la plataforma, dibujadas con una misma mano, con siete emociones, con ropa propia y tejiendo.

   CONTRATO (lo usan otras partes de la plataforma; no cambiar sin avisar):
     MT.mascotas.lista                      -> [{ id, nombre, animal, rol, color }] con id 'sinapso' | 'kinesis' | 'wisfox' | 'niky'
     MT.mascotas.mascota(id, { pose, emocion, tamano, clase, etiqueta })
         pose: 'base' | 'saluda' | 'senala' | 'piensa' | 'celebra' | 'teje' (si no existe, cae en 'base'): mueve los brazos.
               'teje' pone las agujas, la pieza tejida y el ovillo al lado (ver más abajo).
         emocion: 'contento' (por defecto) | 'curioso' | 'pensando' | 'celebra' | 'animo' | 'sorprendido' | 'duda' (si no existe, cae en 'contento'):
                  cambia ojos, cejas, boca y un detalle pequeño, nunca la silueta. Se combina con pose (saluda + contento, base + duda...).
                  Si no pasas emocion, las poses 'piensa' y 'celebra' traen la suya ('pensando' y 'celebra'); las demás, 'contento'.
         tamano: ancho en px (alto proporcional); clase: clase extra; etiqueta: texto alternativo (si falta, es decorativa y va aria-hidden)
         devuelve un <svg> listo para insertar, con data-pose y data-emocion ya resueltos.
   Ayudas añadidas (no quitan nada del contrato):
     MT.mascotas.EMOCIONES                  -> las siete emociones, en orden
     MT.mascotas.alAzar(id, [emociones])    -> el nombre de una emoción de esa lista (o de las siete) distinta de la última que se devolvió para ese id
     MT.mascotas.cambiar(svg, emocion)      -> cambia la cara de una mascota que ya está en la página, SIN reemplazar el nodo, y le da un pequeño rebote
     MT.mascotas.paraRol(rol)               -> el id de la mascota que acompaña a ese rol ('docente' -> 'kinesis', ...); si no se conoce, 'sinapso'
     MT.mascotas.escena(ids, { pose, emocion, tamano, etiqueta, teje }) -> un <div> con varias mascotas en fila (por defecto las cuatro)
     MT.mascotas.POSES                      -> las poses que existen
     MT.mascotas.tejer(svg)                 -> dispara ahora el ciclo de tejer de una mascota que teje (lo usan las pruebas y quien quiera un bis)
     MT.mascotas.activas() / latir()        -> cuántas mascotas vigila el reloj compartido / un latido de ese reloj (solo para pruebas)
   Opciones extra de mascota(): viva:true agrega un parpadeo de reposo; teje:true la pone a tejer (pose 'teje') y, cada cierto tiempo, repite el
   ciclo de tejer (ver css/mascotas.css). Por defecto no se mueve nada.

   POR QUÉ SE VEN «DE LA MISMA MANO». Las cuatro se construyen con las mismas piezas y las mismas medidas, y solo cambian la silueta, el color y la ropa:
     - lienzo de 120 x 120; la cabeza ocupa el centro (unos 62 de ancho) y el cuerpo es un óvalo bajo y pequeño: cabeza grande, amables;
     - un solo contorno (3 de grosor, extremos redondeados) en el color de la tinta del tema; los detalles de la cara van en una tinta fija y más fina;
     - la MISMA cara: la función cara() dibuja ojos, cejas, mejillas, nariz y boca igual en las cuatro, y es la única que sabe de emociones.
       Lo que las vuelve animales distintos va DEBAJO de esa cara (hocico, antifaz, mejillas claras, orejas) y se queda quieto con las emociones;
     - cada una lleva una prenda de punto con el mismo trato (contorno, puntadas en V, un adorno de lana) y la lana tiene siempre la misma textura:
       dos cabos torcidos con marcas de torsión y un hilo de luz, como la lana del pendón;
     - luz y sombra mínimas e iguales y UNA segunda tonalidad por mascota (--piel2).
   Sin degradados: todo es color plano; la textura son trazos cortos (pelo, puntadas, moteado). Los colores salen de los hilos de tokens.css.

   EL INFINITO. El 31 de octubre se decidió no usar el ∞ en nada público hasta consultar a personas neurodivergentes. Por eso las gafas del oso
   son dos anillos redondos y separados (como las manchas naturales del oso de anteojos). La variante con ∞ existe, apagada, en ANTEOJOS_INFINITO. */
(function (MT) {
  'use strict';
  const { svg } = MT.ui;

  const LISTA = [
    { id: 'sinapso', nombre: 'Sinapso', animal: 'oso de anteojos', rol: 'guía general', color: 'var(--hilo-mosaico)' },
    { id: 'kinesis', nombre: 'Kinesis', animal: 'pulpo', rol: 'el aula', color: 'var(--hilo-kinesis)' },
    { id: 'wisfox', nombre: 'Wisfox', animal: 'zorro', rol: 'el estudiante', color: 'var(--hilo-wisfox)' },
    { id: 'niky', nombre: 'Niky', animal: 'venado', rol: 'la guía con IA', color: 'var(--hilo-valeria)' },
  ];
  const POSES = ['base', 'saluda', 'senala', 'piensa', 'celebra', 'teje'];

  // Interruptor de la variante con ∞ en las gafas. Apagado a propósito (ver el encabezado). Para encenderlo se cambia a true y no hace falta tocar nada más.
  const ANTEOJOS_INFINITO = false;

  const HILO = { kinesis: 'var(--hilo-kinesis)', valeria: 'var(--hilo-valeria)', wisfox: 'var(--hilo-wisfox)', mosaico: 'var(--hilo-mosaico)' };
  const CUATRO = [HILO.kinesis, HILO.valeria, HILO.wisfox, HILO.mosaico];

  /* ---------- piezas compartidas ---------- */

  // Un miembro (brazo, tentáculo, asta): el mismo trazo dos veces, primero el contorno y encima el color. Así todo extremo queda redondo y con contorno.
  const miembro = (d, relleno, grosor) => {
    const w = grosor || 10;
    return `<path class="m-t" d="${d}" stroke-width="${w + 3}"/><path d="${d}" stroke="${relleno}" stroke-width="${w}"/>`;
  };
  // LA LANA, al estilo del pendón: un cabo de color con su contorno, las marcas de torsión (rayitas cortas que cruzan el hilo, como en la lana torcida
  // del banner) y un hilo fino de luz en el borde de arriba. Una línea lisa se veía floja; con las marcas se lee como hilo aun a 56 px.
  const lana = (d, color, w) => {
    const g = w || 3.4;
    return `<path class="m-t" d="${d}" stroke-width="${g + 2.2}"/><path d="${d}" stroke="${color}" stroke-width="${g}"/>`
      + `<path class="m-tors" d="${d}" stroke-width="${(g * 0.9).toFixed(2)}" stroke-dasharray="0.9 1.5"/>`
      + `<path class="m-luzh" d="${d}" stroke-width="${(g * 0.2).toFixed(2)}" transform="translate(-.4 -.5)"/>`;
  };
  // Compatibilidad con el nombre anterior: el hilo suelto de las cuatro.
  const hilo = (d, color) => lana(d, color, 3.2);
  // Estrellita de cuatro puntas (destello) con contorno fino.
  const destello = (x, y, s, color) => `<path class="m-destello" fill="${color}" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z"/>`;

  // Utilidades de geometría para curvas 'M x y Q cx cy x y' (todos los brazos y tentáculos son de esa forma).
  const nums = (d) => d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const qEn = (d, t) => { const [x0, y0, cx, cy, x1, y1] = nums(d); const u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; };
  // La misma curva desplazada de lado (más hacia la punta): así dos tentáculos salen juntos del hombro y se abren un poco, como un solo brazo de dos cabos.
  const paralelo = (d, off) => {
    const [x0, y0, cx, cy, x1, y1] = nums(d); const L = Math.hypot(x1 - x0, y1 - y0) || 1; const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    const f = (v) => v.toFixed(1);
    return `M${f(x0 + nx * off * 0.4)} ${f(y0 + ny * off * 0.4)} Q${f(cx + nx * off * 0.7)} ${f(cy + ny * off * 0.7)} ${f(x1 + nx * off)} ${f(y1 + ny * off)}`;
  };
  // Números repetibles (sin Math.random) para que el pelaje y el moteado sean siempre el mismo dibujo.
  const azar = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const f1 = (v) => v.toFixed(1);

  // Pelaje: trazos cortos que salen hacia el borde de una elipse, entre dos ángulos (0 = derecha, -90 = arriba). Textura de pelo sin silueta nueva.
  function pelaje(cx, cy, rx, ry, n, semilla, a0, a1, largo, cls) {
    const r = azar(semilla); let d = '';
    for (let i = 0; i < n; i++) {
      const a = (a0 + (a1 - a0) * r()) * Math.PI / 180, k = 0.7 + 0.2 * r(), l = largo * (0.7 + 0.6 * r());
      d += `M${f1(cx + Math.cos(a) * rx * k)} ${f1(cy + Math.sin(a) * ry * k)}l${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l)}`;
    }
    return `<path class="${cls || 'm-pelo'}" d="${d}"/>`;
  }
  // Puntadas de punto jersey: pequeñas V en filas desencajadas, solo donde la prueba pred(x, y) dice que hay prenda.
  function puntoV(pred, x0, y0, x1, y1, sx, sy) {
    let d = ''; let j = 0;
    for (let y = y0; y <= y1; y += sy, j++) for (let x = x0 + (j % 2 ? sx / 2 : 0); x <= x1; x += sx) {
      if (pred(x, y)) d += `M${f1(x - 1.5)} ${f1(y - 1.1)}L${f1(x)} ${f1(y + 0.9)}L${f1(x + 1.5)} ${f1(y - 1.1)}`;
    }
    return `<path class="m-v" d="${d}"/>`;
  }
  // Trenzado (punto de trenza): dos ondas que se cruzan en vertical, una oscura y otra clara.
  function trenzado(x, y0, y1, amp) {
    let a = '', b = '';
    for (let y = y0; y <= y1; y += 1.5) {
      const s = Math.sin((y - y0) * 0.78) * amp;
      a += (y === y0 ? 'M' : 'L') + f1(x + s) + ' ' + f1(y); b += (y === y0 ? 'M' : 'L') + f1(x - s) + ' ' + f1(y);
    }
    return `<path class="m-cable" d="${a}"/><path class="m-cable m-cable--luz" d="${b}"/>`;
  }
  // Costura: una línea de puntadas (guiones) a lo largo de un trazo.
  const costura = (d) => `<path class="m-costura" d="${d}"/>`;
  const enElipse = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  const enCuerpo = enElipse(60, 99, 23.5, 16.5);

  // Un ovillo pequeño con el mismo trenzado del banner: las vueltas del hilo cruzan la bola en diagonal.
  function ovillo(cx, cy, r, color) {
    const arcos = [-0.55, -0.1, 0.35].map((k) => `M${f1(cx - r * 0.9)} ${f1(cy + r * k + r * 0.35)}Q${f1(cx)} ${f1(cy + r * k - r * 0.75)} ${f1(cx + r * 0.9)} ${f1(cy + r * k + r * 0.35)}`).join('');
    const cruz = `M${f1(cx - r * 0.6)} ${f1(cy - r * 0.75)}Q${f1(cx + r * 0.7)} ${f1(cy - r * 0.2)} ${f1(cx + r * 0.55)} ${f1(cy + r * 0.8)}M${f1(cx - r * 0.85)} ${f1(cy - r * 0.2)}Q${f1(cx + r * 0.1)} ${f1(cy + r * 0.2)} ${f1(cx - r * 0.1)} ${f1(cy + r * 0.95)}`;
    return `<g class="m-ovillo"><circle class="m-t" cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`
      + `<path class="m-tors" d="${arcos}" stroke-width="1.5" stroke-dasharray="0.9 1.4" style="stroke-opacity:.45"/><path class="m-luzh" d="${cruz}" stroke-width="1.1"/><path class="m-luzh" d="${arcos}" stroke-width=".8" style="stroke-opacity:.35"/></g>`;
  }
  // Una aguja de madera clara con su bolita en la punta. La clase sirve para moverla en el ciclo de tejer; el origen del giro es la mano (x0, y0).
  const aguja = (x0, y0, x1, y1, cls) => `<g class="${cls}" style="transform-origin:${x0}px ${y0}px"><path class="m-t" d="M${x0} ${y0}L${x1} ${y1}" stroke-width="4.6"/><path d="M${x0} ${y0}L${x1} ${y1}" stroke="#EBCB8E" stroke-width="2"/><circle class="m-t" cx="${x1}" cy="${y1}" r="2.3" fill="#EBCB8E" stroke-width="2"/></g>`;

  /* ---------- la cara: ojos, cejas, boca y detalle, una sola vez para las cuatro ---------- */

  const EX = [46, 74], EY = 52;   // los ojos, siempre en el mismo sitio
  const BY = 37;                  // altura de las cejas (por encima de los anteojos del oso, que llegan a 41)

  // Cada emoción es una receta corta: cómo son los ojos, a dónde miran, qué hacen las cejas, qué boca y qué detalle va en la esquina.
  //   ojo: 'punto' (pupila con brillo) | 'arco' (ojo feliz cerrado) | 'grande' (ojo con blanco alrededor)
  //   cejas: [izquierda, derecha], cada una [dy del extremo de afuera, dy del extremo de adentro, curva]; negativo = más arriba
  const EMO = {
    contento:    { ojo: 'punto', r: 3.6, mira: [0, 0], cejas: null, boca: 'sonrisa', detalle: null },
    curioso:     { ojo: 'punto', r: 4.3, mira: [1.7, -1.7], cejas: [[1.5, 1, 0], [-2, -4.5, -3.5]], boca: 'curiosa', detalle: 'brillo' },
    pensando:    { ojo: 'punto', r: 3.6, mira: [-1.8, -2], cejas: [[1.5, 1, 0], [-1, -3, -2]], boca: 'chica', detalle: 'gota' },
    celebra:     { ojo: 'arco', r: 3.6, mira: [0, 0], cejas: null, boca: 'abierta', detalle: 'destellos' },
    animo:       { ojo: 'punto', r: 4, mira: [0, 0], cejas: [[1.5, -1.5, -1.5], [1.5, -1.5, -1.5]], boca: 'grande', detalle: 'corazon' },
    sorprendido: { ojo: 'grande', r: 2.8, mira: [0, 0], cejas: [[-2.5, -2.5, -3.5], [-2.5, -2.5, -3.5]], boca: 'o', detalle: 'rayas' },
    duda:        { ojo: 'punto', r: 3.3, mira: [-2, 1.2], cejas: [[2.5, 0, 0.5], [-3.5, -5, -3]], boca: 'ondulada', detalle: 'pregunta' },
  };
  const EMOCIONES = Object.keys(EMO);

  const ojosDe = (e) => EX.map((x) => {
    if (e.ojo === 'arco') return `<path class="m-ojo-arco m-d" d="M${x - 5} ${EY + 1.5} Q${x} ${EY - 6} ${x + 5} ${EY + 1.5}"/>`;
    const cx = x + e.mira[0], cy = EY + e.mira[1];
    const blanco = e.ojo === 'grande' ? `<circle class="m-esclera" cx="${x}" cy="${EY}" r="6"/>` : '';
    return blanco + `<circle class="m-ojo" cx="${cx}" cy="${cy}" r="${e.r}"/><circle class="m-brillo" cx="${cx + e.r * 0.33}" cy="${cy - e.r * 0.33}" r="${Math.max(1.1, e.r * 0.34)}"/>`;
  }).join('');

  const cejasDe = (e) => !e.cejas ? '' : e.cejas.map(([o, i, a], k) => {
    const x = EX[k], lado = k ? 1 : -1, xo = x + lado * 5.5, xi = x - lado * 5.5;
    return `<path class="m-d m-ceja" d="M${xo} ${BY + o} Q${x} ${BY + (o + i) / 2 + a} ${xi} ${BY + i}"/>`;
  }).join('');

  // La nariz es igual en las cuatro; la boca cambia con la emoción. Las cerradas llevan el hilito que baja de la nariz.
  const BOCA = {
    sonrisa: 'M60 67.5 V70 M52.5 69.5 Q56.2 74.6 60 70 Q63.8 74.6 67.5 69.5',
    curiosa: 'M60 67.5 V69.5 M54 70 Q59 75.5 66.5 68.8',
    chica: 'M60 67.5 V69.5 M55 71.5 Q60 73.5 67 70.2',
    grande: 'M60 67.5 V69 M51 68.5 Q60 80 69 68.5',
    ondulada: 'M60 67.5 V69.5 M52 72 Q56 68.4 60 72 T68 72',
  };
  const bocaDe = (b) => b === 'abierta' ? `<path class="m-boca" d="M53 70 Q60 82 67 70 Q60 72.5 53 70 Z"/>`
    : b === 'o' ? `<ellipse class="m-boca" cx="60" cy="73.6" rx="3" ry="3.8"/>`
    : `<path class="m-d" d="${BOCA[b]}"/>`;
  const NARIZ = `<ellipse class="m-nariz" cx="60" cy="64.5" rx="4.2" ry="3.2"/>`;

  // El detalle pequeño de la esquina superior derecha (el único lugar libre en las cuatro). Las poses 'piensa' y 'celebra' ya ocupan esa esquina.
  const DETALLE = {
    brillo: () => destello(103, 24, 9, 'var(--hilo-wisfox)') + destello(113, 40, 4.5, 'var(--hilo-wisfox)'),
    gota: () => `<path class="m-gota" d="M104 9 C101 16 97 20 97 25 A7 7 0 0 0 111 25 C111 20 107 16 104 9 Z"/><path class="m-d" stroke="#FAF7F2" stroke-width="1.8" d="M101 25 Q101 28.5 104 29.5"/>`,
    destellos: () => destello(14, 26, 6.5, 'var(--hilo-kinesis)') + destello(106, 20, 8, 'var(--hilo-mosaico)') + destello(110, 44, 4.5, 'var(--hilo-wisfox)') + destello(18, 8, 3.8, 'var(--hilo-valeria)'),
    corazon: () => `<path class="m-corazon" d="M105 32 C96 26 96 17 101.5 17 C103.5 17 105 18.5 105 20 C105 18.5 106.5 17 108.5 17 C114 17 114 26 105 32 Z"/>`,
    rayas: () => `<path class="m-t" stroke-width="3.2" d="M98 21 L104 14 M104 31 L113 28 M110 12 L111 4"/>`,
    pregunta: () => `<path class="m-t" stroke-width="3" d="M97 20 Q97 11 104 11 Q111 11 111 17.5 Q111 21.5 106 24 Q104 25.5 104 29"/><circle class="m-pt" cx="104" cy="35.5" r="2"/>`,
  };

  // Toda la cara: las mejillas van debajo de los ojos y el resto encima.
  const cara = (emocion) => {
    const e = EMO[emocion];
    return `<ellipse class="m-mejilla" cx="36" cy="67" rx="4.8" ry="3.2"/><ellipse class="m-mejilla" cx="84" cy="67" rx="4.8" ry="3.2"/>`
      + `<g class="m-ojos">${ojosDe(e)}</g>` + cejasDe(e) + NARIZ + bocaDe(e.boca);
  };
  // Luz suave en la cabeza (arriba a la izquierda) y sombra mínima bajo el mentón, sobre el cuerpo: iguales en las cuatro.
  const LUZ = `<ellipse class="m-luz" cx="39" cy="36" rx="8.5" ry="3.8" transform="rotate(-38 39 36)"/>`;
  const sombra = (y) => `<ellipse class="m-sombra" cx="60" cy="${y}" rx="15" ry="4.5"/>`;
  // La nariz húmeda: un brillo blanco pequeño encima de la nariz compartida.
  const HUMEDO = `<ellipse class="m-humedo" cx="58.6" cy="63.6" rx="1.4" ry=".8"/>`;

  // Los brazos por pose. Las dos listas parten de los hombros (38, 90) y (82, 90). Cada brazo termina en la «mano» (último punto).
  const BRAZOS = {
    base: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q93 95 92 107', mi: [28, 107], md: [92, 107] },
    saluda: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q98 86 100 66', mi: [28, 107], md: [100, 66] },
    senala: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q97 91 111 83', mi: [28, 107], md: [111, 83] },
    piensa: { i: 'M38 90 Q27 95 28 107', d: 'M82 92 Q91 83 75 79', mi: [28, 107], md: [75, 79] },
    celebra: { i: 'M38 90 Q22 86 20 62', d: 'M82 90 Q98 86 100 62', mi: [20, 62], md: [100, 62] },
    // Tejiendo: los dos brazos se recogen hacia el centro y cada mano sostiene una aguja.
    teje: { i: 'M38 90 Q38 100 47 104', d: 'M82 90 Q82 100 73 104', mi: [47, 104], md: [73, 104] },
  };
  // Adornos de cada pose, en tinta fija: dos rayitas junto a la mano que saluda, tres puntos de pensamiento y confeti con los cuatro hilos.
  const ADORNO = {
    saluda: () => `<path class="m-t" stroke-width="2.4" d="M107 56 Q111 63 107 70 M111 53 Q117 63 111 73"/>`,
    senala: () => '',
    piensa: () => `<circle class="m-pt" cx="101" cy="33" r="2.2"/><circle class="m-pt" cx="107" cy="24" r="3.2"/><circle class="m-pt" cx="113" cy="12" r="4.4"/>`,
    celebra: () => [[9, 34, 'kinesis'], [18, 12, 'mosaico'], [104, 12, 'wisfox'], [112, 36, 'valeria']]
      .map(([x, y, c]) => `<circle class="m-confeti" cx="${x}" cy="${y}" r="3.4" fill="var(--hilo-${c})"/>`).join(''),
  };

  /* ---------- lo que teje cada una (solo en la pose 'teje') ---------- */

  // Las agujas se cruzan en X delante del vientre; la pieza cuelga debajo del cruce y el ovillo queda abajo a la derecha. Todo cabe en el lienzo.
  // La última fila de la pieza (.m-fila-nueva) es la que «se teje» en el ciclo: aparece al final del movimiento. En reposo la pieza está completa.
  const PX = 47, PY = 94, PW = 26, PH = 19;   // la pieza: rectángulo de 26 x 19
  const PIEZA = {
    // Una bufanda: franjas de los cuatro hilos con puntadas en V.
    sinapso: () => {
      const h = PH / 4;
      return CUATRO.map((c, i) => `<rect class="${i === 3 ? 'm-fila-nueva ' : ''}m-franja" x="${PX}" y="${f1(PY + i * h)}" width="${PW}" height="${f1(h + 0.3)}" fill="${c}"/>`).join('')
        + puntoV(() => true, PX + 2.5, PY + 2.4, PX + PW - 1, PY + PH - 1.5, 3, 2.6);
    },
    // Una malla (el aula): cuadrícula de hilo verde con nudos, sobre papel.
    kinesis: () => {
      const col = [PX + 4, PX + 10.5, PX + 17, PX + 23], fil = [PY + 4.5, PY + 9.7, PY + 14.8];
      const v = col.map((x) => `M${x} ${PY + 1}V${PY + PH - 1}`).join('');
      const h = fil.slice(0, 2).map((y) => `M${PX + 1.5} ${y}H${PX + PW - 1.5}`).join('');
      const nudos = (ys) => ys.map((y) => col.map((x) => `<circle class="m-nudo" cx="${x}" cy="${y}" r="1.5"/>`).join('')).join('');
      return `<rect class="m-papel" x="${PX}" y="${PY}" width="${PW}" height="${PH}"/>`
        + `<path class="m-malla" d="${v}${h}" stroke="${HILO.kinesis}" stroke-width="1.9"/><path class="m-tors" d="${v}${h}" stroke-width="1.7" stroke-dasharray="0.8 1.3"/>`
        + nudos(fil.slice(0, 2))
        + `<g class="m-fila-nueva"><path class="m-malla" d="M${PX + 1.5} ${fil[2]}H${PX + PW - 1.5}" stroke="${HILO.kinesis}" stroke-width="1.9"/>${nudos([fil[2]])}</g>`;
    },
    // Una pieza de colores, remendada: su aprendizaje, cuadro a cuadro.
    wisfox: () => {
      const cs = [HILO.wisfox, HILO.valeria, HILO.mosaico, HILO.kinesis, HILO.mosaico, HILO.wisfox, HILO.valeria, HILO.wisfox, HILO.kinesis];
      const w = PW / 3, h = PH / 3;
      return cs.map((c, i) => `<rect class="${i > 5 ? 'm-fila-nueva ' : ''}m-franja" x="${f1(PX + (i % 3) * w)}" y="${f1(PY + Math.floor(i / 3) * h)}" width="${f1(w + 0.2)}" height="${f1(h + 0.2)}" fill="${c}"/>`).join('')
        + puntoV(() => true, PX + 2, PY + 2.2, PX + PW - 1, PY + PH - 1, 3, 2.6);
    },
    // El hilo azul que une a los demás: una cinta estrecha de punto azul con el cabo suelto que se va al ovillo.
    niky: () => `<rect class="m-franja" x="${PX + 6}" y="${PY}" width="${PW - 12}" height="${PH - 5}" fill="${HILO.valeria}"/>`
      + `<rect class="m-fila-nueva m-franja" x="${PX + 6}" y="${PY + PH - 5.4}" width="${PW - 12}" height="5.6" fill="${HILO.valeria}"/>`
      + puntoV(() => true, PX + 8.5, PY + 2.4, PX + PW - 7, PY + PH - 1, 3, 2.6)
      + lana(`M60 ${PY + PH + 0.5} Q60 ${PY + PH + 3.6} 52 ${PY + PH + 3.2}`, HILO.valeria, 2.4),
  };
  function tejiendo(id) {
    const [x, y] = [101, 106];
    const pieza = PIEZA[id]();
    // El contorno de la pieza va encima de su relleno para que las franjas no pisen el borde.
    const marco = id === 'niky' ? `<rect class="m-t" x="${PX + 6}" y="${PY}" width="${PW - 12}" height="${PH - 5}" fill="none" stroke-width="2.4"/>` : `<rect class="m-t" x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="none" stroke-width="2.4" rx="1"/>`;
    const color = id === 'sinapso' ? HILO.mosaico : id === 'kinesis' ? HILO.kinesis : id === 'wisfox' ? HILO.wisfox : HILO.valeria;
    // El hilo va del ovillo a la aguja derecha; encima, un guion claro que corre durante el ciclo para que se vea cómo avanza.
    const trayecto = `M${x - 7} ${y - 3} Q84 96 66 94`;
    return `<g class="m-pieza">${pieza}${marco}</g>`
      + lana(trayecto, color, 2.6) + `<path class="m-flujo" d="${trayecto}"/>`
      + ovillo(x, y, 8, color)
      + aguja(44, 108, 66, 84, 'm-ag-i') + aguja(76, 108, 54, 84, 'm-ag-d');
  }

  /* ---------- las cuatro ---------- */

  // Cada dibujo recibe los brazos y la cara ya resueltos y devuelve el interior del <svg>. El orden es de atrás hacia adelante.
  // p = { pose, emocion, b (brazos de la pose), cara, teje }
  const DIBUJO = {
    // Sinapso: oso de anteojos (oso andino). Cara oscura de pelo miel con el «antifaz» claro: dos anillos alrededor de los ojos que bajan por las
    // mejillas hasta el hocico alargado, y una nariz grande y negra. Orejas pequeñas y redondas, mechones sobre la frente.
    // Lleva un chaleco de punto rosa y la bufanda de los cuatro hilos; teje esa misma bufanda.
    sinapso(p) {
      const franjas = CUATRO.map((c, i) => `<rect class="m-t" x="${34 + i * 13}" y="78" width="13" height="14" rx="3.5" fill="${c}"/>`).join('');
      const nervios = CUATRO.map((c, i) => `<path class="m-rib" d="M${37 + i * 13} 80.5v9.5M${41 + i * 13} 80.5v9.5M${45 + i * 13} 80.5v9.5"/>`).join('');
      const cola = CUATRO.map((c, i) => `<rect class="m-t" x="43" y="${88 + i * 6.4}" width="14" height="6.4" rx="2.2" fill="${c}"/>`).join('');
      // La bufanda cuelga del lado izquierdo solo si no está tejiendo: tejiendo, la bufanda es la pieza de las agujas.
      const colgante = p.teje ? '' : `<g transform="rotate(4 50 88)">${cola}</g>`;
      // Anteojos: dos aros redondos y separados, con un puente y lente casi transparente. La variante con ∞ está apagada (ver ANTEOJOS_INFINITO).
      const gafas = ANTEOJOS_INFINITO
        ? `<path class="m-gafa" d="M60 52 C56 41 33 41 33 52 C33 63 56 63 60 52 C64 41 87 41 87 52 C87 63 64 63 60 52 Z"/>`
        : `<path class="m-puente" d="M57 50 Q60 46.5 63 50"/><circle class="m-gafa" cx="46" cy="52" r="11.5"/><circle class="m-gafa" cx="74" cy="52" r="11.5"/>`;
      // El chaleco: abierto en V sobre una camisa clara, con trenzado a los lados y puntadas en V.
      const chaleco = `<path class="m-t m-prenda" d="M36 91 Q60 85 84 91 L86 102 Q86 117 60 117.5 Q34 117 34 102 Z" fill="${HILO.mosaico}"/>`
        + puntoV((x, y) => enCuerpo(x, y) && Math.abs(x - 60) > (y - 90) * 0.55, 40, 94, 80, 114, 3.6, 3)
        + trenzado(41.5, 96, 113, 1.6) + trenzado(78.5, 96, 113, 1.6)
        + `<path class="m-camisa" d="M52 89 L60 105 L68 89 Z"/><path class="m-t" d="M52 89.5 L60 105 L68 89.5" stroke-width="2" fill="none"/>`
        + `<path class="m-tors" d="M36 91 Q60 85 84 91" stroke-width="1" stroke-dasharray="0.9 1.5" style="stroke-opacity:.4"/>`
        + `<circle class="m-boton" cx="60" cy="110" r="1.7"/><circle class="m-boton" cx="60" cy="115" r="1.7"/>`;
      const hacerPelos = pelaje(60, 52, 31, 31, 26, 11, -175, -5, 3.4) + pelaje(60, 52, 31, 31, 10, 21, 172, 200, 3) + pelaje(60, 52, 31, 31, 10, 31, -20, 8, 3);
      const mechones = `<path class="m-mechon" d="M53 22.5 Q51 16 56 13.5 M60 21 Q60 14 65 11.5 M67 22.5 Q70 17 75 16.5"/>`;
      return `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/>`
        + chaleco + franjas + nervios + colgante
        + `<circle class="m-t m-piel" cx="33" cy="26" r="9"/><circle class="m-t m-piel" cx="87" cy="26" r="9"/>`
        + `<circle class="m-piel2" cx="33" cy="27" r="4.6"/><circle class="m-piel2" cx="87" cy="27" r="4.6"/>`
        + `<circle class="m-piel" cx="60" cy="52" r="31"/>` + LUZ
        + hacerPelos + mechones
        // el antifaz: de cada anillo baja una mancha clara por la mejilla hasta el hocico, que se alarga y lleva la nariz grande
        + `<ellipse class="m-crema" cx="39" cy="65" rx="6" ry="9" transform="rotate(14 39 65)"/><ellipse class="m-crema" cx="81" cy="65" rx="6" ry="9" transform="rotate(-14 81 65)"/>`
        + `<ellipse class="m-crema" cx="60" cy="69" rx="15.5" ry="12.5"/>`
        + `<ellipse class="m-nariz-g" cx="60" cy="63.6" rx="7.4" ry="5"/>`
        + `<circle class="m-t" cx="60" cy="52" r="31" fill="none"/>`
        + gafas + p.cara + HUMEDO + p.labor + p.brazos;
    },

    // Kinesis: pulpo, el aula. Cabeza ovalada (el manto) con piel moteada y ojos de pupila horizontal; cuerpo de persona con ocho tentáculos
    // en parejas: dos forman cada brazo y dos cada pierna. Delantal de taller con bolsillo y un metro al cuello; teje una malla (el aula).
    kinesis(p) {
      const Pierna = ['M46 84 Q41 101 31 108', 'M52 85 Q51 103 44 111', 'M68 85 Q69 103 76 111', 'M74 84 Q79 101 89 108'];
      const piernas = Pierna.map((d) => miembro(d, 'var(--piel)', 7)).join('');
      const ventosas = Pierna.map((d) => [0.5, 0.72, 0.9].map((t) => { const [x, y] = qEn(d, t); return `<circle class="m-piel2" cx="${f1(x)}" cy="${f1(y)}" r="${t > 0.8 ? 1.4 : 1.8}"/>`; }).join('')).join('');
      // moteado de la piel: manchitas oscuras y claras (los cromatóforos) repartidas por la cabeza, fuera de la cara
      const r = azar(7); let motas = '';
      for (let i = 0; i < 26; i++) {
        const x = 32 + r() * 56, y = 17 + r() * 58, ra = 0.9 + r() * 2.1, claro = r() > 0.55;
        if (((x - 60) / 28) ** 2 + ((y - 48) / 33) ** 2 > 0.82) continue;
        if (y > 40 && x > 38 && x < 82 && y < 74) continue;    // deja libre la cara
        motas += `<circle class="${claro ? 'm-mota-c' : 'm-mota'}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(ra)}"/>`;
      }
      // El iris dorado de los ojos del pulpo (la pupila horizontal la da el css); en 'celebra' los ojos son arcos y no lleva iris.
      const iris = p.emocion === 'celebra' ? '' : EX.map((x) => `<ellipse class="m-iris" cx="${x}" cy="${EY}" rx="7.2" ry="6.6"/>`).join('');
      const delantal = `<path class="m-t m-prenda" d="M48 82 L72 82 L76 101 Q60 108 44 101 Z" fill="#D9B27A"/>`
        + `<path class="m-tors" d="M48 82 L44 101 M72 82 L76 101" stroke-width="1" stroke-dasharray="0.9 1.5" style="stroke-opacity:.4"/>`
        + `<path class="m-t" d="M52 93 H68 V102 Q60 105.5 52 102 Z" fill="#C79A5C" stroke-width="2"/>`
        + costura('M54 95.2 H66 V101 Q60 103.6 54 101 Z')
        // en el bolsillo asoma un lápiz
        + `<path class="m-t" d="M64 92.5 L66.6 85.8" stroke-width="4"/><path d="M64 92.5 L66.6 85.8" stroke="${HILO.mosaico}" stroke-width="1.8"/>`;
      // El metro de costurera: cinta amarilla con marcas, alrededor del cuello y con un extremo colgando sobre el delantal.
      const cinta = `M42 77 Q60 90 78 77`, colgado = 'M45 82 Q42 90 44.5 98';
      const metro = `<path class="m-t" d="${cinta}" stroke-width="6.4"/><path d="${cinta}" stroke="#F0C24A" stroke-width="4"/><path class="m-marcas" d="${cinta}" stroke-width="3.2" stroke-dasharray="0.7 2.3"/>`
        + `<path class="m-t" d="${colgado}" stroke-width="6.4"/><path d="${colgado}" stroke="#F0C24A" stroke-width="4"/><path class="m-marcas" d="${colgado}" stroke-width="3.2" stroke-dasharray="0.7 2.3"/>`;
      // Los brazos: dos tentáculos por brazo, que salen juntos del hombro y se abren hacia la punta. Cada punta lleva su ventosa.
      const brazo = (d) => [3, -3].map((s) => miembro(paralelo(d, s), 'var(--piel)', 6.4)).join('')
        + [3, -3].map((s) => { const q = paralelo(d, s); return [0.68, 0.88].map((t) => { const [x, y] = qEn(q, t); return `<circle class="m-ventosa" cx="${f1(x)}" cy="${f1(y)}" r="1.2"/>`; }).join(''); }).join('');
      const brazos = brazo(p.b.i) + brazo(p.b.d);
      // Sin teje: de la punta del brazo izquierdo cuelga un hilo verde con textura (es lo que va a tejer).
      const [hx, hy] = p.b.mi;
      const hiloPunta = p.teje ? '' : lana(`M${hx} ${hy} c-2 7 -9 8 -11 3 c-2 -4 3 -8 6 -4 c2 2.4 -1 5 -3 3.4`, 'var(--hilo-kinesis)', 3);
      return `<ellipse class="m-t m-piel" cx="60" cy="90" rx="24" ry="12"/>` + piernas + ventosas + sombra(85) + delantal
        + hiloPunta + `<ellipse class="m-t m-piel" cx="60" cy="48" rx="30" ry="35"/>` + LUZ + motas + metro
        + iris + p.cara + p.labor + brazos + p.adorno;
    },

    // Wisfox: zorro, el estudiante. Hocico fino y blanco, mejillas claras con mechones, orejas grandes con el borde oscuro, patas oscuras y cola espesa
    // con la punta blanca. Suéter azul de punto con cuello y una franja de puntos; teje una pieza de colores, la de su aprendizaje.
    wisfox(p) {
      const cola = `<path class="m-t m-piel" d="M44 108 C14 118 1 98 7 78 C11 66 23 68 25 77 C27 89 35 94 46 94 Z"/>`
        + `<path class="m-crema" d="M7 78 C11 66 23 68 25 77 C20 81 12 83 7 78 Z"/>`
        + `<path class="m-t" d="M7 78 C11 66 23 68 25 77" fill="none"/>`
        + pelaje(25, 95, 12, 12, 12, 5, 100, 260, 3.2);
      // Si no teje, el hilo ámbar sube desde la punta de la cola (con la textura de lana).
      const hiloCola = p.teje ? '' : lana('M14 68 C11 59 21 56 18 49 C17 44 11 45 13 50', 'var(--hilo-wisfox)', 3);
      // Suéter: cuerpo de punto con puntadas en V, un cuello alto acanalado, puños y una franja de puntos.
      const sueter = `<path class="m-t m-prenda" d="M35 91 Q60 84 85 91 L86 102 Q86 117 60 117.5 Q34 117 34 102 Z" fill="${HILO.valeria}"/>`
        + puntoV((x, y) => enCuerpo(x, y) && y > 90, 38, 92, 82, 116, 3.6, 3)
        + `<path class="m-bandas" d="M36 101 H84"/>`
        + [40, 46, 52, 58, 64, 70, 76, 82].map((x, i) => `<circle class="m-pt-lana" cx="${x}" cy="101" r="1.3" fill="${[HILO.wisfox, HILO.mosaico][i % 2]}"/>`).join('')
        + `<path class="m-t" d="M37 113 Q60 123 83 113" fill="none" stroke-width="2"/><path class="m-rib" d="M40 113.8 v3 M46 115.6 v3 M52 116.7 v3 M60 117 v3 M68 116.7 v3 M74 115.6 v3 M80 113.8 v3"/>`;
      const cuello = `<ellipse class="m-t" cx="60" cy="86" rx="16.5" ry="6" fill="${HILO.valeria}" stroke-width="2.6"/><path class="m-rib" d="M47 83.5 v5 M51 82.5 v6 M55 82 v6.6 M59 81.8 v6.8 M63 81.8 v6.8 M67 82 v6.6 M71 82.5 v6 M75 83.5 v5"/>`;
      const patas = `<ellipse class="m-t m-oscuro" cx="47" cy="115.5" rx="7" ry="3.8"/><ellipse class="m-t m-oscuro" cx="73" cy="115.5" rx="7" ry="3.8"/>`;
      // Orejas: borde oscuro por fuera y blanco por dentro.
      const oreja = (s) => { const X = (x) => s < 0 ? x : 120 - x; return `<path class="m-t m-oscuro" d="M${X(31)} 43 L${X(27)} 7 L${X(57)} 27 Z"/><path class="m-crema" d="M${X(35.5)} 36 L${X(33)} 17.5 L${X(49)} 28.5 Z"/>`; };
      // El hocico fino y blanco con mejillas claras y mechones a los lados (el contorno de la cabeza queda quebrado, como el pelo del zorro).
      const cabeza = 'M60 26 C42 26 29 38 29 53 L23 61 L32 64.5 L30 72 L43 73.5 Q52 80.5 60 80.5 Q68 80.5 77 73.5 L90 72 L88 64.5 L97 61 L91 53 C91 38 78 26 60 26 Z';
      const blanco = `<path class="m-crema" d="M30 70 L43 73.5 Q52 80.5 60 80.5 Q68 80.5 77 73.5 L90 70 Q86 61 75 62.5 Q66 57 60 59.5 Q54 57 45 62.5 Q34 61 30 70 Z"/>`;
      const lagrima = `<path class="m-pelo m-pelo--fuerte" d="M52 57 Q55 60 55.6 63.4 M68 57 Q65 60 64.4 63.4"/>`;
      return hiloCola + cola
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/>` + patas + sombra(83)
        + sueter + cuello
        + oreja(-1) + oreja(1)
        + `<path class="m-piel" d="${cabeza}"/>` + LUZ + blanco
        + pelaje(60, 52, 31, 26, 16, 3, -170, -10, 3.2) + lagrima
        + `<path class="m-t" d="${cabeza}" fill="none"/>`
        + p.cara + HUMEDO + p.labor + p.brazos;
    },

    // Niky: venado azul, la IA que acompaña. Ojos grandes y oscuros con ojera clara, hocico alargado con la nariz húmeda, orejas largas, astas pequeñas
    // ramificadas con el hilo azul enrollado. Lleva un poncho de punto azul con zigzag y flecos; teje el hilo azul que une a las demás.
    niky(p) {
      const asta = (d, ramas) => miembro(d, 'var(--m-crema)', 4.2) + ramas.map((r) => miembro(r, 'var(--m-crema)', 3.6)).join('');
      const izq = asta('M48 27 Q42 15 37 7', ['M43.5 17.5 L31 14.5', 'M40 12 L40.5 3.5']);
      const der = asta('M72 27 Q78 15 83 7', ['M76.5 17.5 L89 14.5', 'M80 12 L79.5 3.5']);
      // El hilo enrollado: tres vueltas cruzando el asta izquierda y un cabo suelto que cae hacia la oreja.
      const vueltas = ['M40.5 23.6 L50 19.6', 'M37.5 18 L47 14'].map((d) => lana(d, 'var(--hilo-valeria)', 2.2)).join('');
      const cabo = lana('M40 23.5 C34 25 31 30 34 34.5', 'var(--hilo-valeria)', 2.6);
      const oreja = (s) => { const x = s < 0 ? 28 : 92; return `<g transform="rotate(${s * -50} ${x} 40)"><ellipse class="m-t m-piel" cx="${x}" cy="40" rx="6.6" ry="13.5"/><ellipse class="m-piel2" cx="${x}" cy="41" rx="3.2" ry="8.6"/></g>`; };
      // Poncho: una capa corta de punto con zigzag crema, una hilera de puntos rosa y flecos en el borde.
      const borde = 'M96 108 Q60 121 24 108';
      const flecos = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) => { const [x, y] = qEn(borde, t); return `M${f1(x)} ${f1(y - 0.5)}v3.2`; }).join('');
      let zig = 'M31 99.5'; for (let k = 0; k < 11; k++) zig += `l${k % 2 ? 2.8 : 2.8} ${k % 2 ? 4 : -4}`;
      const poncho = `<path class="m-t m-prenda" d="M42 83 Q60 92 78 83 L96 108 Q60 121 24 108 Z" fill="${HILO.valeria}"/>`
        + puntoV((x, y) => y > 90 && y < 112 && ((x - 60) / 33) ** 2 + ((y - 84) / 30) ** 2 < 1, 31, 92, 89, 113, 3.6, 3)
        + `<path class="m-zig" d="${zig}"/>`
        + [36, 42, 48, 54, 60, 66, 72, 78, 84].map((x, i) => `<circle class="m-pt-lana" cx="${x}" cy="107" r="1.2" fill="${[HILO.mosaico, 'var(--m-crema)'][i % 2]}"/>`).join('')
        + `<path class="m-fleco" d="${flecos}"/>`;
      const ojeras = EX.map((x) => `<ellipse class="m-ojera" cx="${x}" cy="${EY}" rx="8" ry="7.4"/>`).join('');
      return izq + der + vueltas + cabo
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/>` + sombra(84)
        + poncho + oreja(-1) + oreja(1)
        + `<ellipse class="m-piel" cx="60" cy="52" rx="29" ry="31"/>` + LUZ
        + pelaje(60, 52, 29, 31, 16, 9, -170, -10, 3.2)
        + `<path class="m-crema" d="M60 56 Q75 62 73 74 Q70 83 60 83 Q50 83 47 74 Q45 62 60 56 Z"/>`
        + `<ellipse class="m-t" cx="60" cy="52" rx="29" ry="31" fill="none"/>`
        + ojeras + p.cara + HUMEDO + p.labor + p.brazos;
    },
  };

  // Arma el interior del svg para una combinación pose + emoción.
  function dibujar(m, pose, emocion) {
    const b = BRAZOS[pose];
    // Con la emoción 'pensando' y los brazos en reposo, la mano derecha sube a la mejilla (el mismo brazo de la pose 'piensa'): no cambia la silueta.
    const piensaMano = emocion === 'pensando' && pose === 'base';
    const bb = Object.assign({}, b, { d: piensaMano ? BRAZOS.piensa.d : b.d, md: piensaMano ? BRAZOS.piensa.md : b.md });
    // Cada mascota viste su brazo: manga y pata oscura en el zorro, mano clara en el venado, brazo desnudo en el oso; el pulpo arma los suyos (dos tentáculos).
    // Las manos llevan clases propias (m-oscuro, m-palma) y no m-piel: así la silueta de las siete emociones sigue siendo idéntica.
    const manga = m.id === 'wisfox' ? HILO.valeria : 'var(--piel)';
    const mano = (xy) => m.id === 'wisfox' ? `<circle class="m-t m-oscuro" cx="${xy[0]}" cy="${xy[1]}" r="5.1"/>` : m.id === 'niky' ? `<circle class="m-t m-palma" cx="${xy[0]}" cy="${xy[1]}" r="4.8"/>` : '';
    const brazos = m.id === 'kinesis' ? '' : miembro(bb.i, manga) + miembro(bb.d, manga) + mano(bb.mi) + mano(bb.md) + (ADORNO[pose] ? ADORNO[pose]() : '');
    const detalle = EMO[emocion].detalle && pose !== 'piensa' && pose !== 'celebra' ? DETALLE[EMO[emocion].detalle]() : '';
    // El orden: cuerpo y ropa, la labor (agujas, pieza, ovillo) y al final los brazos, para que las manos agarren las agujas.
    const teje = pose === 'teje';
    return DIBUJO[m.id]({ pose, emocion, b: bb, cara: cara(emocion), teje, brazos, labor: teje ? tejiendo(m.id) : '', adorno: ADORNO[pose] ? ADORNO[pose]() : '' }) + detalle;
  }
  const dibujarCompleto = dibujar;

  // Si no se pide emoción, las poses con un gesto propio traen la suya; si se pide una que no existe, cae en 'contento'.
  const resolver = (pose, emocion) => EMO[emocion] ? emocion
    : (emocion == null || emocion === '') ? (pose === 'piensa' ? 'pensando' : pose === 'celebra' ? 'celebra' : 'contento') : 'contento';

  /* ---------- el ciclo de tejer: un solo reloj compartido ---------- */

  // Cada cierto tiempo (12 a 20 s, con un desfase propio por personaje para que no tejan a coro) las mascotas que tejen repiten un ciclo de unos 3 s.
  // El reloj es UNO para toda la página: se enciende con la primera mascota que teje y se apaga cuando no queda ninguna. Las que salen de la página
  // se sueltan solas en el siguiente latido (isConnected), así no hay fugas. Con la pestaña oculta no se dispara nada, y con el modo calmado o
  // prefers-reduced-motion nunca se dispara: la pieza queda quieta y ya tejida.
  const TEJEN = new Set(); let reloj = null;
  const PERIODO = { sinapso: 13000, kinesis: 15500, wisfox: 17500, niky: 19500 };   // entre 13 y 20 s
  const PRIMERA = { sinapso: 1800, kinesis: 4200, wisfox: 6800, niky: 9400 };       // la primera vez, poco después de aparecer
  const DURACION = 3200;
  const sinMovimiento = () => document.documentElement.getAttribute('data-movimiento') === 'calmado'
    || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function tejer(el) {
    if (sinMovimiento()) return el;
    el.classList.remove('mascota--tejiendo'); void el.getBoundingClientRect();   // reinicia el ciclo si se pide dos veces seguidas
    el.classList.add('mascota--tejiendo'); el._finTeje = Date.now() + DURACION;
    return el;
  }
  function latir() {
    const t = Date.now();
    for (const el of [...TEJEN]) {
      if (!el.isConnected) { if (el._visto || t - el._alta > 30000) TEJEN.delete(el); continue; }
      el._visto = true;
      if (el._finTeje && t >= el._finTeje) { el.classList.remove('mascota--tejiendo'); el._finTeje = 0; }
      if (document.hidden || sinMovimiento()) continue;
      if (t >= el._prox) { tejer(el); el._prox = t + (PERIODO[el.dataset.mascota] || 15000) + Math.floor(Math.random() * 1500); }
    }
    if (!TEJEN.size && reloj) { clearInterval(reloj); reloj = null; }
  }
  function vigilar(el) {
    el._alta = Date.now(); el._prox = el._alta + (PRIMERA[el.dataset.mascota] || 3000);
    TEJEN.add(el);
    if (!reloj) reloj = setInterval(latir, 500);
  }

  function mascota(id, op) {
    const o = Object.assign({ pose: 'base', emocion: undefined, tamano: 120, clase: '', etiqueta: '', viva: false, teje: false }, op);
    const m = LISTA.find((x) => x.id === id) || LISTA[0];
    const pose = o.teje ? 'teje' : POSES.includes(o.pose) ? o.pose : 'base';
    const emocion = resolver(pose, o.emocion);
    // El texto alternativo se pone con setAttribute (no dentro de la cadena) para que unas comillas en la etiqueta no rompan el SVG.
    const el = svg(`<svg class="mascota mascota--${m.id}" viewBox="0 0 120 120" focusable="false" xmlns="http://www.w3.org/2000/svg">${dibujarCompleto(m, pose, emocion)}</svg>`);
    el.setAttribute('width', o.tamano); el.setAttribute('height', o.tamano);
    el.dataset.pose = pose; el.dataset.emocion = emocion; el.dataset.mascota = m.id;
    if (o.viva) el.classList.add('mascota--viva');
    if (pose === 'teje') { el.classList.add('mascota--teje'); if (o.teje || o.viva) vigilar(el); }
    if (o.clase) o.clase.split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
    if (o.etiqueta) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.etiqueta); }
    else el.setAttribute('aria-hidden', 'true');
    return el;
  }

  // Cambia la cara de una mascota que ya está en la página. Se reescribe el interior del mismo <svg> (el nodo, sus clases, su tamaño y su
  // etiqueta quedan como estaban, así que quien guardó la referencia sigue teniéndola) y se le da un rebote corto con la clase mascota--rebota.
  // El rebote solo mueve transform; css/mascotas.css lo apaga con prefers-reduced-motion y con la versión calmada.
  function cambiar(el, emocion) {
    const m = LISTA.find((x) => x.id === el.dataset.mascota) || LISTA[0];
    const pose = el.dataset.pose || 'base';
    const nueva = EMO[emocion] ? emocion : 'contento';
    if (nueva === el.dataset.emocion) return el;
    const t = svg(`<svg xmlns="http://www.w3.org/2000/svg">${dibujarCompleto(m, pose, nueva)}</svg>`);
    el.replaceChildren(...t.childNodes);
    el.dataset.emocion = nueva;
    el.classList.remove('mascota--rebota'); void el.getBoundingClientRect();   // reinicia la animación si se cambia dos veces seguidas
    el.classList.add('mascota--rebota');
    el.addEventListener('animationend', () => el.classList.remove('mascota--rebota'), { once: true });
    return el;
  }

  // Una emoción de la lista que no se repita con la anterior de ese mismo personaje: así un recorrido no muestra la misma cara dos veces seguidas.
  const ULTIMA = {};
  function alAzar(id, lista) {
    const validas = (Array.isArray(lista) ? lista : []).filter((e) => EMO[e]);
    const base = validas.length ? validas : EMOCIONES;
    const candidatas = base.length > 1 ? base.filter((e) => e !== ULTIMA[id]) : base;
    const e = candidatas[Math.floor(Math.random() * candidatas.length)];
    ULTIMA[id] = e;
    return e;
  }

  // Qué mascota acompaña a cada rol: Kinesis al aula (docente, orientación, familia, coordinación), Wisfox al estudiante, Niky a la guía con IA.
  const POR_ROL = { docente: 'kinesis', orientacion: 'kinesis', familia: 'kinesis', coordinacion: 'kinesis', administracion: 'kinesis', estudiante: 'wisfox', ia: 'niky', valeria: 'niky', niky: 'niky' };
  const paraRol = (rol) => POR_ROL[rol] || 'sinapso';

  // Una fila de mascotas (por defecto las cuatro, con Sinapso primero). Sin etiqueta por mascota: la fila entera es decorativa salvo que se pase `etiqueta`.
  function escena(ids, op) {
    const o = Object.assign({ pose: 'base', emocion: undefined, tamano: 96, etiqueta: '', teje: false }, op);
    const el = document.createElement('div');
    el.className = 'mascotas-escena';
    (ids || LISTA.map((x) => x.id)).forEach((id) => el.append(mascota(id, { pose: o.pose, emocion: o.emocion, tamano: o.tamano, teje: o.teje })));
    if (o.etiqueta) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.etiqueta); } else el.setAttribute('aria-hidden', 'true');
    return el;
  }

  MT.mascotas = { lista: LISTA, mascota, paraRol, escena, POSES, EMOCIONES, alAzar, cambiar, tejer, activas: () => TEJEN.size, latir };
})(window.MT = window.MT || {});
