/* mascotas.js: las cuatro mascotas de la plataforma, dibujadas con una misma mano y con siete emociones.

   CONTRATO (lo usan otras partes de la plataforma; no cambiar sin avisar):
     MT.mascotas.lista                      -> [{ id, nombre, animal, rol, color }] con id 'sinapso' | 'kinesis' | 'wisfox' | 'niky'
     MT.mascotas.mascota(id, { pose, emocion, tamano, clase, etiqueta })
         pose: 'base' | 'saluda' | 'senala' | 'piensa' | 'celebra' (si no existe, cae en 'base'): mueve los brazos.
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
     MT.mascotas.escena(ids, { pose, emocion, tamano, etiqueta }) -> un <div> con varias mascotas en fila (por defecto las cuatro)
     MT.mascotas.POSES                      -> las poses que existen
   Opción extra de mascota(): viva:true agrega un parpadeo de reposo (ver css/mascotas.css). Por defecto no se mueve nada.

   POR QUÉ SE VEN «DE LA MISMA MANO». Las cuatro se construyen con las mismas piezas y las mismas medidas, y solo cambian la silueta y el color:
     - lienzo de 120 x 120; la cabeza ocupa el centro (unos 62 de ancho) y el cuerpo es un óvalo bajo y pequeño: cabeza grande, amables;
     - un solo contorno (3 de grosor, extremos redondeados) en el color de la tinta del tema; los detalles de la cara van en una tinta fija y más fina;
     - la MISMA cara: la función cara() dibuja ojos, cejas, boca y detalle igual en las cuatro, y es la única que sabe de emociones;
     - los mismos brazos: un trazo grueso con extremo redondo, que es manita en el oso, el zorro y el venado y tentáculo en el pulpo;
     - un hilo en cada una, siempre del lado izquierdo de quien mira, y las poses solo mueven el brazo derecho (y los dos en 'celebra');
     - luz y sombra mínimas e iguales: un brillo suave arriba a la izquierda de la cabeza y una sombrita bajo el mentón; y UNA segunda tonalidad
       por mascota (--piel2: mejillas, interior de las orejas, ventosas), un rosado cálido ajustado al color de cada una.
   Sin degradados: todo es color plano. Los colores salen de los hilos de tokens.css, así que cambian con el tema.

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
  const POSES = ['base', 'saluda', 'senala', 'piensa', 'celebra'];

  // Interruptor de la variante con ∞ en las gafas. Apagado a propósito (ver el encabezado). Para encenderlo se cambia a true y no hace falta tocar nada más.
  const ANTEOJOS_INFINITO = false;

  /* ---------- piezas compartidas ---------- */

  // Un miembro (brazo, tentáculo, asta): el mismo trazo dos veces, primero el contorno y encima el color. Así todo extremo queda redondo y con contorno.
  const miembro = (d, relleno, grosor) => {
    const w = grosor || 10;
    return `<path class="m-t" d="${d}" stroke-width="${w + 3}"/><path d="${d}" stroke="${relleno}" stroke-width="${w}"/>`;
  };
  // El hilo suelto: línea gruesa de lana con su contorno, igual en las cuatro.
  const hilo = (d, color) => `<path class="m-t" d="${d}" stroke-width="5.4"/><path d="${d}" stroke="${color}" stroke-width="2.8"/>`;
  // Estrellita de cuatro puntas (destello) con contorno fino.
  const destello = (x, y, s, color) => `<path class="m-destello" fill="${color}" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z"/>`;

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

  // Los brazos por pose. Las dos listas parten de los hombros (38, 90) y (82, 90). Cada brazo termina en la «mano» (último punto).
  const BRAZOS = {
    base: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q93 95 92 107', mano: [28, 107] },
    saluda: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q98 86 100 66', mano: [28, 107] },
    senala: { i: 'M38 90 Q27 95 28 107', d: 'M82 90 Q97 91 111 83', mano: [28, 107] },
    piensa: { i: 'M38 90 Q27 95 28 107', d: 'M82 92 Q91 83 75 79', mano: [28, 107] },
    celebra: { i: 'M38 90 Q22 86 20 62', d: 'M82 90 Q98 86 100 62', mano: [20, 62] },
  };
  // Adornos de cada pose, en tinta fija: dos rayitas junto a la mano que saluda, tres puntos de pensamiento y confeti con los cuatro hilos.
  const ADORNO = {
    saluda: () => `<path class="m-t" stroke-width="2.4" d="M107 56 Q111 63 107 70 M111 53 Q117 63 111 73"/>`,
    senala: () => '',
    piensa: () => `<circle class="m-pt" cx="101" cy="33" r="2.2"/><circle class="m-pt" cx="107" cy="24" r="3.2"/><circle class="m-pt" cx="113" cy="12" r="4.4"/>`,
    celebra: () => [[9, 34, 'kinesis'], [18, 12, 'mosaico'], [104, 12, 'wisfox'], [112, 36, 'valeria']]
      .map(([x, y, c]) => `<circle class="m-confeti" cx="${x}" cy="${y}" r="3.4" fill="var(--hilo-${c})"/>`).join(''),
  };

  /* ---------- las cuatro ---------- */

  // Cada dibujo recibe los brazos y la cara ya resueltos y devuelve el interior del <svg>. El orden es de atrás hacia adelante.
  const DIBUJO = {
    // Sinapso: oso de anteojos. Cabeza redonda, orejas grandes con el interior más cálido, hocico claro y anteojos redondos alrededor de los ojos.
    // La bufanda tejida con los cuatro hilos es lo que une a las demás.
    sinapso(p) {
      const col = ['kinesis', 'valeria', 'wisfox', 'mosaico'].map((c) => `var(--hilo-${c})`);
      const franjas = col.map((c, i) => `<rect class="m-t" x="${34 + i * 13}" y="78" width="13" height="14" rx="3.5" fill="${c}"/>`).join('');
      const cola = col.map((c, i) => `<rect class="m-t" x="43" y="${88 + i * 6.4}" width="14" height="6.4" rx="2.2" fill="${c}"/>`).join('');
      // Anteojos: dos aros redondos y separados, con un puente y lente casi transparente. La variante con ∞ está apagada (ver ANTEOJOS_INFINITO).
      const gafas = ANTEOJOS_INFINITO
        ? `<path class="m-gafa" d="M60 52 C56 41 33 41 33 52 C33 63 56 63 60 52 C64 41 87 41 87 52 C87 63 64 63 60 52 Z"/>`
        : `<path class="m-gafa" d="M57 50 Q60 46.5 63 50" fill="none"/><circle class="m-gafa" cx="46" cy="52" r="11.5"/><circle class="m-gafa" cx="74" cy="52" r="11.5"/>`;
      return `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/>`
        + franjas + `<g transform="rotate(4 50 88)">${cola}</g>`
        + `<circle class="m-t m-piel" cx="31" cy="25" r="11.5"/><circle class="m-t m-piel" cx="89" cy="25" r="11.5"/>`
        + `<circle class="m-piel2" cx="31" cy="26" r="6"/><circle class="m-piel2" cx="89" cy="26" r="6"/>`
        + `<circle class="m-piel" cx="60" cy="52" r="31"/>` + LUZ
        + `<ellipse class="m-crema" cx="60" cy="67.5" rx="16" ry="12.5"/>`
        + `<circle class="m-t" cx="60" cy="52" r="31" fill="none"/>`
        + gafas + p.cara + p.brazos;
    },

    // Kinesis: pulpo, el aula. Un tentáculo sostiene un hilo verde; las ventosas son la segunda tonalidad.
    kinesis(p) {
      const T = ['M47 82 Q44 102 34 108', 'M56 84 Q55 104 50 110', 'M64 84 Q65 104 70 110', 'M73 82 Q76 102 86 108'];
      const tent = T.map((d) => miembro(d, 'var(--piel)', 10)).join('');
      // Ventosas: dos puntos por tentáculo, sobre la curva, hacia la punta.
      const ventosas = [[44.6, 96], [38.6, 104.6], [55.2, 99], [52, 106.5], [64.8, 99], [68, 106.5], [75.4, 96], [81.4, 104.6]]
        .map(([x, y]) => `<circle class="m-piel2" cx="${x}" cy="${y}" r="1.9"/>`).join('');
      // El hilo sale de la punta del tentáculo izquierdo y cuelga en una vuelta. Va antes del brazo para que la punta lo agarre.
      const [x, y] = p.mano;
      const lana = `<path class="m-t" d="M${x} ${y} c-2 8 -14 10 -17 3 c-3 -6 3 -11 8 -6 c3 3 -1 7 -4 5" stroke-width="8"/><path d="M${x} ${y} c-2 8 -14 10 -17 3 c-3 -6 3 -11 8 -6 c3 3 -1 7 -4 5" stroke="var(--hilo-kinesis)" stroke-width="5"/>`;
      return `<ellipse class="m-t m-piel" cx="60" cy="90" rx="24" ry="12"/>` + tent + ventosas + sombra(85)
        + lana + `<ellipse class="m-t m-piel" cx="60" cy="50" rx="32" ry="33"/>` + LUZ
        + `<circle class="m-crema" cx="52" cy="29" r="3.2" opacity=".5"/><circle class="m-crema" cx="64" cy="25" r="2.4" opacity=".5"/><circle class="m-crema" cx="75" cy="31" r="3" opacity=".5"/>`
        + p.cara + p.brazos;
    },

    // Wisfox: zorro, el estudiante. La cola termina en un hilo ámbar.
    wisfox(p) {
      const cola = `<path class="m-t m-piel" d="M44 108 C18 116 5 100 9 80 C11 71 20 71 22 78 C24 89 34 94 46 94 Z"/>`
        + `<path class="m-crema" d="M9 80 C11 71 20 71 22 78 C18 82 12 84 9 80 Z"/>`
        + `<path class="m-t" d="M9 80 C11 71 20 71 22 78" fill="none"/>`;
      const lana = hilo('M16 73 C13 63 24 59 21 51 C20 46 14 47 16 52', 'var(--hilo-wisfox)');
      return lana + cola
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/><ellipse class="m-crema" cx="60" cy="103" rx="12" ry="10"/>` + sombra(83)
        + `<path class="m-t m-piel" d="M32 42 L30 10 L56 27 Z"/><path class="m-t m-piel" d="M88 42 L90 10 L64 27 Z"/>`
        + `<path class="m-piel2" d="M36 34 L35 19 L48 28 Z"/><path class="m-piel2" d="M84 34 L85 19 L72 28 Z"/>`
        + `<ellipse class="m-piel" cx="60" cy="54" rx="32" ry="28"/>` + LUZ
        + `<ellipse class="m-crema" cx="60" cy="68" rx="24" ry="12"/>`
        + `<ellipse class="m-t" cx="60" cy="54" rx="32" ry="28" fill="none"/>`
        + p.cara + p.brazos;
    },

    // Niky: venado azul, la IA que acompaña. Un hilo azul enrollado en el asta izquierda.
    niky(p) {
      const asta = (d, rama) => miembro(d, 'var(--m-crema)', 4.4) + miembro(rama, 'var(--m-crema)', 4.4);
      const izq = asta('M48 27 Q42 15 36 6', 'M43 17 L30 14');
      const der = asta('M72 27 Q78 15 84 6', 'M77 17 L90 14');
      // El hilo enrollado: tres vueltas cruzando el asta izquierda y un cabo suelto que cae hacia la oreja.
      const vueltas = ['M40 23.2 L50 19.2', 'M37 17.7 L47 13.7', 'M34.5 12.5 L43.5 8.5'].map((d) => `<path class="m-t" d="${d}" stroke-width="5.2"/><path d="${d}" stroke="var(--hilo-valeria)" stroke-width="2.8"/>`).join('');
      const cabo = hilo('M40 23 C34 25 31 30 34 34', 'var(--hilo-valeria)');
      return izq + der + vueltas + cabo
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/><ellipse class="m-crema" cx="60" cy="104" rx="11" ry="9"/>` + sombra(84)
        + `<g transform="rotate(-48 28 40)"><ellipse class="m-t m-piel" cx="28" cy="40" rx="7" ry="12"/><ellipse class="m-piel2" cx="28" cy="41" rx="3.4" ry="7.4"/></g>`
        + `<g transform="rotate(48 92 40)"><ellipse class="m-t m-piel" cx="92" cy="40" rx="7" ry="12"/><ellipse class="m-piel2" cx="92" cy="41" rx="3.4" ry="7.4"/></g>`
        + `<ellipse class="m-piel" cx="60" cy="52" rx="29" ry="31"/>` + LUZ
        + `<ellipse class="m-crema" cx="60" cy="68" rx="14" ry="10"/>`
        + `<ellipse class="m-t" cx="60" cy="52" rx="29" ry="31" fill="none"/>`
        + p.cara + p.brazos;
    },
  };

  // Arma el interior del svg para una combinación pose + emoción.
  function dibujar(m, pose, emocion) {
    const b = BRAZOS[pose];
    // Con la emoción 'pensando' y los brazos en reposo, la mano derecha sube a la mejilla (el mismo brazo de la pose 'piensa'): no cambia la silueta.
    const bd = (emocion === 'pensando' && pose === 'base') ? BRAZOS.piensa.d : b.d;
    const brazos = miembro(b.i, 'var(--piel)') + miembro(bd, 'var(--piel)') + (ADORNO[pose] ? ADORNO[pose]() : '');
    const detalle = EMO[emocion].detalle && pose !== 'piensa' && pose !== 'celebra' ? DETALLE[EMO[emocion].detalle]() : '';
    return DIBUJO[m.id]({ brazos, mano: b.mano, cara: cara(emocion) }) + detalle;
  }

  // Si no se pide emoción, las poses con un gesto propio traen la suya; si se pide una que no existe, cae en 'contento'.
  const resolver = (pose, emocion) => EMO[emocion] ? emocion
    : (emocion == null || emocion === '') ? (pose === 'piensa' ? 'pensando' : pose === 'celebra' ? 'celebra' : 'contento') : 'contento';

  function mascota(id, op) {
    const o = Object.assign({ pose: 'base', emocion: undefined, tamano: 120, clase: '', etiqueta: '', viva: false }, op);
    const m = LISTA.find((x) => x.id === id) || LISTA[0];
    const pose = POSES.includes(o.pose) ? o.pose : 'base';
    const emocion = resolver(pose, o.emocion);
    // El texto alternativo se pone con setAttribute (no dentro de la cadena) para que unas comillas en la etiqueta no rompan el SVG.
    const el = svg(`<svg class="mascota mascota--${m.id}" viewBox="0 0 120 120" focusable="false" xmlns="http://www.w3.org/2000/svg">${dibujar(m, pose, emocion)}</svg>`);
    el.setAttribute('width', o.tamano); el.setAttribute('height', o.tamano);
    el.dataset.pose = pose; el.dataset.emocion = emocion; el.dataset.mascota = m.id;
    if (o.viva) el.classList.add('mascota--viva');
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
    const t = svg(`<svg xmlns="http://www.w3.org/2000/svg">${dibujar(m, pose, nueva)}</svg>`);
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
    const o = Object.assign({ pose: 'base', emocion: undefined, tamano: 96, etiqueta: '' }, op);
    const el = document.createElement('div');
    el.className = 'mascotas-escena';
    (ids || LISTA.map((x) => x.id)).forEach((id) => el.append(mascota(id, { pose: o.pose, emocion: o.emocion, tamano: o.tamano })));
    if (o.etiqueta) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.etiqueta); } else el.setAttribute('aria-hidden', 'true');
    return el;
  }

  MT.mascotas = { lista: LISTA, mascota, paraRol, escena, POSES, EMOCIONES, alAzar, cambiar };
})(window.MT = window.MT || {});
