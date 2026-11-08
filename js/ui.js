/* ui.js: constructor de elementos, texto seguro y todos los símbolos de la marca.

   Por qué no se usa innerHTML con texto dinámico: lo que responde la IA o escribe una persona
   nunca debe interpretarse como HTML. h() crea nodos y ricoTexto() solo admite negrilla y
   cursiva, también como nodos. Los símbolos SVG sí son cadenas, pero son estáticas, escritas
   aquí, y por eso es seguro parsearlas.

   La familia de símbolos (ver marca.js y docs/ANALISIS_Y_DISENO.md):
   - Cada hilo tiene su propia forma de ficha, como las teselas de un mosaico:
       Kinesis = cuadrado redondeado   Wisfox = hexágono   Niky = círculo
   - Los conserva tal cual los tenían los proyectos (la K en movimiento, el hexágono con W)
     y le suma la tercera, que no existía.
   - El logo del colectivo es el telar: los tres colores de hilo cruzando hilos neutros. */
(function (MT) {
  'use strict';

  function añadir(el, hijos) {
    for (const hijo of hijos.flat(Infinity)) {
      if (hijo == null || hijo === false) continue;
      el.append(hijo.nodeType ? hijo : document.createTextNode(String(hijo)));
    }
  }

  function h(tag, attrs, ...hijos) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    añadir(el, hijos);
    return el;
  }

  function ricoTexto(texto) {
    const frag = document.createDocumentFragment();
    String(texto).split('\n').forEach((linea, i) => {
      if (i) frag.append(document.createElement('br'));
      for (const parte of linea.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)) {
        if (!parte) continue;
        if (parte.startsWith('**')) frag.append(h('strong', null, parte.slice(2, -2)));
        else if (parte.startsWith('*')) frag.append(h('em', null, parte.slice(1, -1)));
        else frag.append(document.createTextNode(parte));
      }
    });
    return frag;
  }

  /* Las lecciones de Inglés traen un poco de HTML (negrillas, listas). Se analiza fuera del documento y solo
     se copian las etiquetas de esta lista, sin ningún atributo: nada de scripts, enlaces ni imágenes. */
  const PERMITIDAS = new Set(['H4', 'P', 'UL', 'OL', 'LI', 'B', 'I', 'STRONG', 'EM', 'BR']);

  /* ¿Este texto está en inglés? (QA-26). La ruta de Inglés mezcla español con ejemplos en inglés, y sin lang="en" un lector de pantalla
     los pronuncia con acento español. No hay marca en los datos, así que se decide por las palabras: hay que ver al menos dos palabras
     funcionales del inglés y ninguna del español ni letras con tilde. Es una heurística conservadora: ante la duda no marca, y un
     texto sin marcar se lee como antes. */
  const EN = new Set('the is are am was were a an to of in on at for with and or i you he she it we they my your his her this that do does did have has be been not can will would should could there their what who how why when where which because if but so than then them these those our us me him'.split(' '));
  const ES = new Set('el la los las de del que y en un una es son por con para se no lo al como más pero su sus qué cuál cómo cuando donde porque también si ya muy sin sobre entre hay está están ser fue era'.split(' '));
  function esIngles(texto, permisivo) {
    const t = String(texto || '').toLowerCase();
    if (/[áéíóúñ¿¡]/.test(t)) return false;
    const palabras = t.match(/[a-z']+/g) || [];
    if (palabras.some((w) => ES.has(w))) return false;
    // permisivo: para una frase citada con su espacio en blanco («Water ___ at 100 degrees.»), basta una palabra del inglés.
    if (permisivo) return palabras.some((w) => EN.has(w));
    return palabras.filter((w) => EN.has(w)).length >= 2 || (palabras.length >= 1 && palabras.length <= 3 && palabras.every((w) => EN.has(w)));
  }
  // Parte un enunciado "¿Cuál es correcta? «She ___ happy.»" y envuelve en lang="en" lo que va entre comillas angulares y es inglés.
  function conIdiomas(texto) {
    const frag = document.createDocumentFragment();
    String(texto).split(/(«[^»]*»)/).forEach((parte) => {
      if (!parte) return;
      if (/^«/.test(parte) && esIngles(parte, /___/.test(parte))) { const sp = document.createElement('span'); sp.lang = 'en'; sp.textContent = parte; frag.append(sp); }
      else frag.append(document.createTextNode(parte));
    });
    return frag;
  }
  function htmlSeguro(cadena) {
    const doc = new DOMParser().parseFromString('<body>' + String(cadena) + '</body>', 'text/html');
    const copiar = (nodo, destino) => {
      for (const n of nodo.childNodes) {
        if (n.nodeType === 3) destino.append(document.createTextNode(n.textContent));
        else if (n.nodeType === 1) {
          if (PERMITIDAS.has(n.tagName)) {
            const nuevo = document.createElement(n.tagName.toLowerCase()); copiar(n, nuevo);
            // Los ejemplos en cursiva de las lecciones de Inglés se marcan con su idioma (el único atributo que se agrega; lo decide esIngles).
            if (n.tagName === 'I' && esIngles(n.textContent)) nuevo.lang = 'en';
            destino.append(nuevo);
          }
          else copiar(n, destino);
        }
      }
    };
    const frag = document.createDocumentFragment();
    copiar(doc.body, frag);
    return frag;
  }

  function svg(cadena) {
    const t = document.createElement('template');
    t.innerHTML = cadena.trim();
    return t.content.firstChild;
  }

  /* El telar. Los tres colores de hilo son los de las aplicaciones: el verde bosque de Kinesis,
     el ámbar de Wisfox y el azul tinta (el océano que Kinesis ya traía, un paso más oscuro) y que aquí es de Niky. */
  const HILOS = ['#1B7F56', '#E8A13C', '#2B4FA3'];

  function cuerpoTelar(columnas, filas, banda, hueco, margen, neutro, sombra) {
    const paso = banda + hueco;
    const ancho = margen * 2 + columnas * paso - hueco;
    const alto = margen * 2 + filas * paso - hueco;
    const r = [];
    for (let i = 0; i < filas; i++)
      r.push(`<rect x="0" y="${margen + i * paso}" width="${ancho}" height="${banda}" rx="${banda / 2}" fill="${neutro}"/>`);
    for (let j = 0; j < columnas; j++)
      r.push(`<rect x="${margen + j * paso}" y="0" width="${banda}" height="${alto}" rx="${banda / 2}" fill="${HILOS[j % 3]}"/>`);
    for (let i = 0; i < filas; i++)
      for (let j = 0; j < columnas; j++)
        if ((i + j) % 2 === 0)
          r.push(`<rect x="${margen + j * paso - 1}" y="${margen + i * paso}" width="${banda + 2}" height="${banda}" fill="${neutro}"/>` +
                 `<rect x="${margen + j * paso - 1}" y="${margen + i * paso + banda - 3}" width="${banda + 2}" height="3" fill="${sombra}"/>`);
    return { ancho, alto, cuerpo: r.join('') };
  }

  // Trama grande, para portadas.
  function telar(columnas, filas, banda, hueco, margen, clase) {
    const t = cuerpoTelar(columnas, filas, banda, hueco, margen, 'var(--hilo)', 'var(--hilo-sombra)');
    return svg(`<svg class="${clase}" viewBox="0 0 ${t.ancho} ${t.alto}" role="img" aria-label="Trama de un telar: tres hilos de color, verde, ámbar e índigo, cruzan hilos claros" focusable="false">${t.cuerpo}</svg>`);
  }

  /* Logo del colectivo: un tejido plano dibujado en espacio negativo.
     Nueve teselas (el mosaico) separadas por hilos que pasan por encima y por debajo (el telar).
     Una sola forma, un solo grosor y dos tintas. Gestalt: cierre (se lee un cuadrado entero aunque lo
     cruzan líneas), similitud (las nueve teselas son iguales), continuidad (cada hilo se lee seguido
     aunque se interrumpa), proximidad (nueve piezas, una figura) y figura y fondo (blanco sobre negro y al revés).
     La tesela usa currentColor y los hilos usan --logo-fondo: así sirve en negro sobre claro y en blanco sobre oscuro. */
  // La base del logo: piezas en currentColor (negro sobre claro, blanco sobre oscuro) y cuatro hilos de colores detrás, que se meten debajo de las
  // piezas. Es la misma geometría que assets/logo.svg y el favicon. Con la clase logo-mono los hilos se ocultan (la versión en blanco y negro).
  const HILOS_LOGO = [['kinesis', 17, 2, 8, 14], ['kinesis', 17, 26, 8, 36], ['wisfox', 39, 2, 8, 36], ['wisfox', 39, 48, 8, 14], ['valeria', 2, 17, 36, 8], ['valeria', 48, 17, 14, 8], ['mosaico', 2, 39, 14, 8], ['mosaico', 26, 39, 36, 8]];
  const LOGO = (c) => `<svg class="${c}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${HILOS_LOGO.map(([n, x, y, w, h2]) => `<rect class="logo-hilo" fill="var(--hilo-${n})" x="${x}" y="${y}" width="${w}" height="${h2}"/>`).join('')}<path fill="currentColor" d="M14.0 2.0H18.0V18.0H2.0V14.0a12 12 0 0 1 12 -12ZM24.0 2.0H40.0V18.0H24.0V2.0ZM46.0 2.0H50.0a12 12 0 0 1 12 12V18.0H46.0V2.0ZM2.0 24.0H18.0V40.0H2.0V24.0ZM24.0 24.0H40.0V40.0H24.0V24.0ZM46.0 24.0H62.0V40.0H46.0V24.0ZM2.0 46.0H18.0V62.0H14.0a12 12 0 0 1 -12 -12V46.0ZM24.0 46.0H40.0V62.0H24.0V46.0ZM46.0 46.0H62.0V50.0a12 12 0 0 1 -12 12H46.0V46.0ZM18.0 14.0h6v4h-6ZM18.0 24.0h6v4h-6ZM14.0 40.0h4v6h-4ZM24.0 40.0h4v6h-4ZM36.0 18.0h4v6h-4ZM46.0 18.0h4v6h-4ZM40.0 36.0h6v4h-6ZM40.0 46.0h6v4h-6Z"/></svg>`;

  /* Las tres teselas, una por hilo, en una sola tinta: cuadrado (Kinesis), hexágono (Wisfox), círculo (Niky).
     Las dos primeras conservan el glifo de su proyecto (la K en movimiento, la W); la tercera se diseñó. */
  const G = 'var(--logo-fondo,#FFFFFF)';
  const MARCAS = {
    mosaico: LOGO,
    kinesis: (c) => `<svg class="${c}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="16" fill="currentColor"/><path d="M22 16v32M24 34l18-15M28 34l16 14" fill="none" stroke="${G}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="49" cy="14" r="4.5" fill="${G}"/></svg>`,
    wisfox: (c) => `<svg class="${c}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 4l24 14v28L32 60 8 46V18z" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M19 24l6.5 18L32 29l6.5 13L45 24" fill="none" stroke="${G}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    valeria: (c) => `<svg class="${c}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="30" fill="currentColor"/><path d="M21 44V20l22 24V20" fill="none" stroke="${G}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  // Íconos de línea: un solo trazo, redondeado, 2 px, como los de Kinesis y Wisfox.
  const L = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONOS = {
    inicio: L('<path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>'),
    recorrido: L('<circle cx="5.5" cy="18" r="2.3"/><circle cx="18.5" cy="6" r="2.3"/><path d="M7.5 17c8 0 2-10 9-10"/>'),
    estado: L('<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.4l2.7 2.7 5-5.6"/>'),
    identidad: L('<circle cx="12" cy="12" r="8.5"/><circle cx="8.4" cy="10.2" r="1"/><circle cx="12" cy="7.6" r="1"/><circle cx="15.6" cy="10.2" r="1"/><path d="M12 20.5c-2 0-2-2.2 0-2.6 1.6-.4 1.6-2.4 0-2.4"/>'),
    docente: L('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.5 0 4 1.8 4 4.5"/>'),
    orientacion: L('<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4h6v3H9zM8.5 12h7M8.5 16h5"/>'),
    familia: L('<path d="M3.5 11L12 4l8.5 7M6 9.5V20h12V9.5"/><path d="M12 17.2c-2.2-1.4-3-2.4-3-3.6a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1.2-.8 2.2-3 3.6z"/>'),
    libro: L('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>'),
    juego: L('<path d="M9 4h3a1.6 1.6 0 0 1 3.2 0H18v4a1.6 1.6 0 0 0 0 3.2V17h-4a1.6 1.6 0 0 0-3.2 0H6v-4a1.6 1.6 0 0 0 0-3.2V4z"/>'),
    logros: L('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>'),
    flecha: L('<path d="M12 4v16M6 14l6 6 6-6"/>'),
    chat: L('<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>'),
    mapa: L('<circle cx="5.5" cy="6" r="2.2"/><circle cx="18.5" cy="7" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7.4 7l9.2.6M6.6 8l4.2 8.2M17.6 9l-4.4 7.4"/>'),
    coordinacion: L('<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M3 20h18"/>'),
  };

  // El símbolo de Mosaico Telar es el logo circular de js/tejido.js (el elegido por el dueño), quieto y a color; los otros tres son teselas.
  const marca = (nombre, clase) => (nombre === 'mosaico' && MT.tejido ? MT.tejido.logoColor(clase || '') : svg(MARCAS[nombre](clase || '')));
  // Símbolo + nombre. Es la forma horizontal del logo.
  const lockup = (clase) => h('span', { class: 'logo-lockup ' + (clase || '') }, marca('mosaico', 'logo-simbolo'), h('span', { class: 'logo-nombre' }, MT.nombre));
  const icono = (nombre) => svg(ICONOS[nombre]);

  MT.ui = { h, ricoTexto, htmlSeguro, esIngles, conIdiomas, svg, telar, marca, lockup, icono, HILOS };
})(window.MT = window.MT || {});
