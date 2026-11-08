/* mascotas.js: las cuatro mascotas de la plataforma, dibujadas con una misma mano.

   CONTRATO (lo usan otras partes de la plataforma; no cambiar sin avisar):
     MT.mascotas.lista                      -> [{ id, nombre, animal, rol, color }] con id 'sinapso' | 'kinesis' | 'wisfox' | 'niky'
     MT.mascotas.mascota(id, { pose, tamano, clase, etiqueta })
         pose: 'base' | 'saluda' | 'senala' | 'piensa' | 'celebra' (si no existe, cae en 'base')
         tamano: ancho en px (alto proporcional); clase: clase extra; etiqueta: texto alternativo (si falta, es decorativa y va aria-hidden)
         devuelve un <svg> listo para insertar.
   Ayudas añadidas (no quitan nada del contrato):
     MT.mascotas.paraRol(rol)               -> el id de la mascota que acompaña a ese rol ('docente' -> 'kinesis', ...); si no se conoce, 'sinapso'
     MT.mascotas.escena(ids, { pose, tamano, etiqueta }) -> un <div> con varias mascotas en fila (por defecto las cuatro)
     MT.mascotas.POSES                      -> las poses que existen
   Opción extra de mascota(): viva:true agrega un parpadeo de reposo (ver css/mascotas.css). Por defecto no se mueve nada.

   POR QUÉ SE VEN «DE LA MISMA MANO». Las cuatro se construyen con las mismas piezas y las mismas medidas, y solo cambian la silueta y el color:
     - lienzo de 120 x 120; la cabeza ocupa el centro (círculo u óvalo de unos 62 de ancho) y el cuerpo es un óvalo bajo y pequeño: cabeza grande, amables;
     - un solo contorno (3 de grosor, extremos redondeados) en el color de la tinta del tema; los detalles de la cara van en una tinta fija y más fina;
     - los mismos ojos (punto con un brillo), en el mismo sitio, y la misma nariz y boca mínimas;
     - los mismos brazos: un trazo grueso con extremo redondo, que es manita en el oso, el zorro y el venado y tentáculo en el pulpo;
     - un hilo en cada una, siempre del lado izquierdo de quien mira, y las poses solo mueven el brazo derecho (y los dos en 'celebra').
   Sin degradados ni sombras: todo es color plano. Los colores salen de los hilos de tokens.css, así que cambian con el tema.

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

  // Los ojos: punto con un brillo pequeño. Mismo tamaño y mismo sitio en las cuatro.
  const ojos = () => ['46', '74'].map((x) => `<circle class="m-ojo" cx="${x}" cy="52" r="3.6"/><circle class="m-brillo" cx="${+x + 1.2}" cy="50.8" r="1.2"/>`).join('');
  // Nariz y boca mínimas. En 'celebra' la boca se abre un poco.
  const hocico = (abierta) => `<ellipse class="m-nariz" cx="60" cy="64.5" rx="4.2" ry="3.2"/>` + (abierta
    ? `<path class="m-boca" d="M53 70 Q60 82 67 70 Q60 72.5 53 70 Z"/>`
    : `<path class="m-d" d="M60 67.5 V70 M52.5 69.5 Q56.2 74.6 60 70 Q63.8 74.6 67.5 69.5"/>`);

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

  // Cada dibujo recibe la pose ya resuelta (brazos) y devuelve el interior del <svg>. El orden es de atrás hacia adelante.
  const DIBUJO = {
    // Sinapso: oso de anteojos. La bufanda tejida con los cuatro hilos es lo que une a las demás.
    sinapso(p) {
      const col = ['kinesis', 'valeria', 'wisfox', 'mosaico'].map((c) => `var(--hilo-${c})`);
      const franjas = col.map((c, i) => `<rect class="m-t" x="${34 + i * 13}" y="78" width="13" height="14" rx="3.5" fill="${c}"/>`).join('');
      const cola = col.map((c, i) => `<rect class="m-t" x="43" y="${88 + i * 6.4}" width="14" height="6.4" rx="2.2" fill="${c}"/>`).join('');
      // Anteojos: dos anillos redondos y separados. La variante con ∞ está apagada (ver ANTEOJOS_INFINITO).
      const gafas = ANTEOJOS_INFINITO
        ? `<path class="m-gafa" d="M60 52 C56 41 33 41 33 52 C33 63 56 63 60 52 C64 41 87 41 87 52 C87 63 64 63 60 52 Z"/>`
        : `<circle class="m-gafa" cx="46" cy="52" r="11"/><circle class="m-gafa" cx="74" cy="52" r="11"/>`;
      return `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/>`
        + franjas + `<g transform="rotate(4 50 88)">${cola}</g>`
        + `<circle class="m-t m-piel" cx="33" cy="26" r="10"/><circle class="m-t m-piel" cx="87" cy="26" r="10"/>`
        + `<circle class="m-crema" cx="33" cy="27" r="4.6"/><circle class="m-crema" cx="87" cy="27" r="4.6"/>`
        + `<circle class="m-piel" cx="60" cy="52" r="31"/>`
        + `<ellipse class="m-crema" cx="60" cy="68" rx="13" ry="10"/>` + gafas
        + `<circle class="m-t" cx="60" cy="52" r="31" fill="none"/>`
        + `<g class="m-ojos">${ojos()}</g>` + hocico(p.abierta)
        + p.brazos;
    },

    // Kinesis: pulpo, el aula. Un tentáculo sostiene un hilo verde.
    kinesis(p) {
      const tent = ['M47 82 Q44 102 34 108', 'M56 84 Q55 104 50 110', 'M64 84 Q65 104 70 110', 'M73 82 Q76 102 86 108']
        .map((d) => miembro(d, 'var(--piel)', 10)).join('');
      // El hilo sale de la punta del tentáculo izquierdo y cuelga en una vuelta. Va antes del brazo para que la punta lo agarre.
      const [x, y] = p.mano;
      const lana = hilo(`M${x} ${y} c-1 6 -10 8 -14 3 c-3 -4 1 -9 6 -5`, 'var(--hilo-kinesis)');
      return `<ellipse class="m-t m-piel" cx="60" cy="90" rx="24" ry="12"/>` + tent
        + lana + `<ellipse class="m-t m-piel" cx="60" cy="50" rx="32" ry="33"/>`
        + `<circle class="m-crema" cx="47" cy="30" r="3.2" opacity=".55"/><circle class="m-crema" cx="62" cy="25" r="2.4" opacity=".55"/><circle class="m-crema" cx="73" cy="31" r="3" opacity=".55"/>`
        + `<g class="m-ojos">${ojos()}</g>` + hocico(p.abierta)
        + p.brazos;
    },

    // Wisfox: zorro, el estudiante. La cola termina en un hilo ámbar.
    wisfox(p) {
      const cola = `<path class="m-t m-piel" d="M44 108 C18 116 5 100 9 80 C11 71 20 71 22 78 C24 89 34 94 46 94 Z"/>`
        + `<path class="m-crema" d="M9 80 C11 71 20 71 22 78 C18 82 12 84 9 80 Z"/>`
        + `<path class="m-t" d="M9 80 C11 71 20 71 22 78" fill="none"/>`;
      const lana = hilo('M16 73 C13 63 24 59 21 51 C20 46 14 47 16 52', 'var(--hilo-wisfox)');
      return lana + cola
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/><ellipse class="m-crema" cx="60" cy="103" rx="12" ry="10"/>`
        + `<path class="m-t m-piel" d="M32 42 L30 10 L56 27 Z"/><path class="m-t m-piel" d="M88 42 L90 10 L64 27 Z"/>`
        + `<path class="m-crema" d="M36 34 L35 20 L48 28 Z"/><path class="m-crema" d="M84 34 L85 20 L72 28 Z"/>`
        + `<ellipse class="m-piel" cx="60" cy="54" rx="32" ry="28"/>`
        + `<ellipse class="m-crema" cx="60" cy="68" rx="24" ry="12"/>`
        + `<ellipse class="m-t" cx="60" cy="54" rx="32" ry="28" fill="none"/>`
        + `<g class="m-ojos">${ojos()}</g>` + hocico(p.abierta)
        + p.brazos;
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
        + `<ellipse class="m-t m-piel" cx="60" cy="99" rx="25" ry="18"/><ellipse class="m-crema" cx="60" cy="104" rx="11" ry="9"/>`
        + `<g transform="rotate(-48 28 40)"><ellipse class="m-t m-piel" cx="28" cy="40" rx="7" ry="12"/><ellipse class="m-crema" cx="28" cy="41" rx="3.2" ry="7"/></g>`
        + `<g transform="rotate(48 92 40)"><ellipse class="m-t m-piel" cx="92" cy="40" rx="7" ry="12"/><ellipse class="m-crema" cx="92" cy="41" rx="3.2" ry="7"/></g>`
        + `<ellipse class="m-piel" cx="60" cy="52" rx="29" ry="31"/>`
        + `<ellipse class="m-crema" cx="60" cy="68" rx="14" ry="10"/>`
        + `<ellipse class="m-t" cx="60" cy="52" rx="29" ry="31" fill="none"/>`
        + `<g class="m-ojos">${ojos()}</g>` + hocico(p.abierta)
        + p.brazos;
    },
  };


  function mascota(id, op) {
    const o = Object.assign({ pose: 'base', tamano: 120, clase: '', etiqueta: '', viva: false }, op);
    const m = LISTA.find((x) => x.id === id) || LISTA[0];
    const pose = POSES.includes(o.pose) ? o.pose : 'base';
    const b = BRAZOS[pose];
    const brazos = miembro(b.i, 'var(--piel)') + miembro(b.d, 'var(--piel)') + (ADORNO[pose] ? ADORNO[pose]() : '');
    const dentro = DIBUJO[m.id]({ brazos, mano: b.mano, abierta: pose === 'celebra' });
    // El texto alternativo se pone con setAttribute (no dentro de la cadena) para que unas comillas en la etiqueta no rompan el SVG.
    const el = svg(`<svg class="mascota mascota--${m.id}" viewBox="0 0 120 120" focusable="false" xmlns="http://www.w3.org/2000/svg">${dentro}</svg>`);
    el.setAttribute('width', o.tamano); el.setAttribute('height', o.tamano);
    el.dataset.pose = pose;
    if (o.viva) el.classList.add('mascota--viva');
    if (o.clase) o.clase.split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
    if (o.etiqueta) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.etiqueta); }
    else el.setAttribute('aria-hidden', 'true');
    return el;
  }

  // Qué mascota acompaña a cada rol: Kinesis al aula (docente, orientación, familia, coordinación), Wisfox al estudiante, Niky a la guía con IA.
  const POR_ROL = { docente: 'kinesis', orientacion: 'kinesis', familia: 'kinesis', coordinacion: 'kinesis', administracion: 'kinesis', estudiante: 'wisfox', ia: 'niky', valeria: 'niky', niky: 'niky' };
  const paraRol = (rol) => POR_ROL[rol] || 'sinapso';

  // Una fila de mascotas (por defecto las cuatro, con Sinapso primero). Sin etiqueta por mascota: la fila entera es decorativa salvo que se pase `etiqueta`.
  function escena(ids, op) {
    const o = Object.assign({ pose: 'base', tamano: 96, etiqueta: '' }, op);
    const el = document.createElement('div');
    el.className = 'mascotas-escena';
    (ids || LISTA.map((x) => x.id)).forEach((id) => el.append(mascota(id, { pose: o.pose, tamano: o.tamano })));
    if (o.etiqueta) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.etiqueta); } else el.setAttribute('aria-hidden', 'true');
    return el;
  }

  MT.mascotas = { lista: LISTA, mascota, paraRol, escena, POSES };
})(window.MT = window.MT || {});
