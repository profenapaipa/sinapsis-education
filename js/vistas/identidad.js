/* identidad.js: el manual de marca, vivo. Cada muestra se dibuja con los mismos componentes y
   variables de la plataforma, así el manual no puede contradecir a la página: si cambia un color
   en tokens.css, cambia aquí. */
(function (MT) {
  'use strict';
  const { h, svg, marca, lockup, icono } = MT.ui;
  const { pagina } = MT.comun;

  const COLORES = [
    { nombre: 'Tinta', hex: '#1A1714', rol: 'Monocromo', origen: 'Un negro cálido, no un negro puro.', uso: 'Texto, estructura, logo e íconos.' },
    { nombre: 'Papel', hex: '#FFFFFF', rol: 'Monocromo', origen: 'Fondo de tarjetas y páginas.', uso: 'Superficies.' },
    { nombre: 'Lino', hex: '#F6F2EA', rol: 'Monocromo', origen: 'Un blanco cálido que baja el brillo de la pantalla.', uso: 'Fondos secundarios y bandas.' },
    { nombre: 'Verde bosque', hex: '#1B7F56', rol: 'Color principal', origen: 'Kinesis: su color de marca. Wisfox usa la misma familia (#3D9960 y #2E7D4F).', uso: 'La acción: botón principal, enlaces y estados activos.' },
    { nombre: 'Ámbar', hex: '#E8A13C', rol: 'Funcional', origen: 'Wisfox: su acento y el zorro. Kinesis: sus avisos y el PIAR.', uso: 'Identifica a Wisfox y da avisos. Nunca rojo: un PIAR no es un error. Nunca lleva texto encima.' },
    { nombre: 'Azul tinta', hex: '#2B4FA3', rol: 'Funcional', origen: 'El “Océano” del menú de apariencia de Kinesis (#1D6FB8), un paso más oscuro: el original se confundía con el verde en tritanopía.', uso: 'Identifica a Niky.' },
  ];

  // Contraste WCAG, calculado aquí mismo para que la cifra mostrada sea siempre la real.
  const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const razon = (a, b) => { const x = lum(a); const y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const ICONOS = ['docente', 'orientacion', 'familia', 'coordinacion', 'libro', 'chat', 'mapa', 'recorrido', 'estado', 'identidad'];

  const VERSIONES = [
    { nombre: 'A color, sobre fondo blanco', clase: 'muestra-logo--claro', mono: false, archivo: 'logo-color-fondo-blanco.svg', uso: 'La versión principal: piezas negras e hilos de colores.' },
    { nombre: 'A color, sobre fondo negro', clase: 'muestra-logo--oscuro', mono: false, archivo: 'logo-color-fondo-negro.svg', uso: 'Las piezas pasan a blanco y los hilos conservan su color.' },
    { nombre: 'Blanco y negro, sobre fondo blanco', clase: 'muestra-logo--claro', mono: true, archivo: 'logo-bn-fondo-blanco.svg', uso: 'Para impresión en una tinta, fotocopias y sellos.' },
    { nombre: 'Blanco y negro, sobre fondo negro', clase: 'muestra-logo--oscuro', mono: true, archivo: 'logo-bn-fondo-negro.svg', uso: 'Para fondos oscuros sin color.' },
  ];

  const FONDOS = [
    { id: 'kinesis', nombre: 'Verde Kinesis', hex: '#1B7F56', tinta: '#FFFFFF' },
    { id: 'valeria', nombre: 'Azul Niky', hex: '#2B4FA3', tinta: '#FFFFFF' },
    { id: 'wisfox', nombre: 'Ámbar Wisfox', hex: '#E8A13C', tinta: '#1A1714' },
    { id: 'mosaico', nombre: 'Rosa Mosaico', hex: '#E0527E', tinta: '#1A1714' },
  ];

  const seccion = (id, titulo, ...hijos) => h('section', { class: 'manual-seccion', id, 'aria-labelledby': 'm-' + id }, h('h2', { id: 'm-' + id }, titulo), ...hijos);

  MT.router.registrar({
    id: 'identidad', titulo: 'Identidad', espacio: '',
    render(main) {
      const c = pagina(main, { etiqueta: 'Identidad', titulo: MT.nombre + ': identidad',
        descripcion: 'Cómo se ve y cómo habla la plataforma. Todo lo que ves aquí está hecho con los mismos componentes que usa el resto del sitio.' });

      c.append(h('nav', { class: 'toc', 'aria-label': 'Contenido de la identidad' }, h('ul', null,
        [['proposito', 'Propósito'], ['logo', 'Logo'], ['estilos', 'Propuestas de estilo'], ['color', 'Color'], ['tipografia', 'Tipografía'], ['formas', 'Formas e íconos'], ['recursos', 'Recursos'], ['componentes', 'Componentes'], ['voz', 'Voz']]
          .map(([id, t]) => h('li', null, h('a', { href: '#/identidad', onclick: (e) => { e.preventDefault(); const el = document.getElementById(id); if (el) MT.movimiento.desplazar(el); } }, t))))));

      c.append(seccion('proposito', 'Propósito',
        h('div', { class: 'rejilla rejilla--2' },
          h('div', { class: 'tarjeta tarjeta--borde' }, h('p', { class: 'etiqueta' }, 'Por qué existimos'), h('p', { class: 'manual-grande' }, 'Para que ninguna forma de aprender se quede fuera del aula.')),
          h('div', { class: 'tarjeta tarjeta--borde' }, h('p', { class: 'etiqueta' }, 'Eslogan'), h('p', { class: 'manual-grande' }, 'Tejemos caminos para aprender.'))),
        h('p', null, h('strong', null, 'Qué hacemos: '), 'una plataforma para que el docente planee una clase inclusiva, la orientación la valide, la familia la vea y cada estudiante la reciba a su medida.'),
        h('p', null, h('strong', null, 'Descriptor: '), 'Colectivo de educación inclusiva con tecnología.'),
        h('div', { class: 'rejilla rejilla--3' }, [['Todos somos mosaico', 'Todos aprendemos distinto, también quienes no tienen un diagnóstico.'], ['Cada pieza conserva su nombre', 'Kinesis, Wisfox y Niky se unen sin perder su identidad.'], ['Los datos van primero', 'Son menores de edad. Lo que no es necesario, no se pide.'], ['Decimos qué hay', 'Y qué responde con ejemplos. Sin adornos.']]
          .map(([t, p]) => h('div', { class: 'tarjeta' }, h('h3', null, t), h('p', null, p))))));

      c.append(seccion('logo', 'Logo',
        h('p', null, 'Una trama de telar vista de cerca: ', h('strong', null, 'nueve teselas negras cruzadas por hilos de cuatro colores'), ', que pasan por encima y por debajo. El mosaico son las piezas; el telar, lo que las une. Cada hilo es el color de uno de los portales: verde (Kinesis), azul (Niky), ámbar (Wisfox) y rosa (la plataforma que los une).'),
        // El logo grande, animado, sobre negro: es lo primero que se ve de la identidad.
        (() => {
          const grande = MT.tejido.logo({ animar: false, clase: 'logo-heroe__svg' });
          return h('div', { class: 'logo-heroe' },
            h('div', { class: 'logo-heroe__logo' }, grande.el),
            h('div', { class: 'logo-heroe__texto' }, h('p', { class: 'etiqueta' }, MT.nombre), h('p', { class: 'manual-grande' }, 'Tejemos caminos para aprender.'),
              h('p', { class: 'suave' }, 'Las fichas llegan sueltas, se unen y los hilos las tejen: así se arma el mosaico.'),
              h('button', { class: 'btn btn--chico', type: 'button', onclick: () => grande.repetir() }, 'Ver otra vez')));
        })(),
        h('h3', { class: 'manual-subtitulo' }, 'Las cuatro versiones'),
        h('div', { class: 'logo-versiones' }, VERSIONES.map((v) => h('div', { class: 'logo-version' },
          h('div', { class: 'muestra-logo ' + v.clase }, lockup(v.mono ? 'logo-mono' : '')),
          h('div', { class: 'logo-version__pie' }, h('h4', null, v.nombre), h('p', { class: 'suave' }, v.uso),
            h('a', { class: 'btn btn--chico btn--suave', href: 'assets/' + v.archivo, download: v.archivo }, 'Descargar SVG'))))),
        h('h3', { class: 'manual-subtitulo' }, 'Sobre los colores de la marca'),
        h('div', { class: 'logo-colores' }, FONDOS.map((f) => h('div', { class: 'logo-color logo-color--' + f.id, style: `background:${f.hex}; color:${f.tinta}` },
          lockup('logo-mono'), h('span', { class: 'logo-color__rotulo' }, f.nombre)))),
        h('h3', { class: 'manual-subtitulo' }, 'Dónde se ve'),
        h('div', { class: 'logo-usos' },
          h('div', { class: 'logo-uso' }, h('div', { class: 'uso-pestana' }, h('img', { src: 'assets/favicon.svg', alt: '', width: 16, height: 16 }), h('span', null, MT.nombre)), h('p', { class: 'suave' }, 'Pestaña del navegador: solo el logo circular, sin contorno.')),
          h('div', { class: 'logo-uso' }, h('div', { class: 'uso-riel' }, h('span', { class: 'uso-riel__boton' }, h('img', { src: 'assets/favicon.svg', alt: '' }))), h('p', { class: 'suave' }, 'Botón de inicio: el logo dentro de un círculo con contorno blanco, para que resalte.')),
          h('div', { class: 'logo-uso' }, h('div', { class: 'uso-tamanos' }, [16, 32, 64].map((n) => h('img', { src: 'assets/favicon.svg', alt: '', width: n, height: n }))), h('p', { class: 'suave' }, 'Tamaños de uso: 16, 32 y 64 px.')),
          h('div', { class: 'logo-uso' }, h('div', { class: 'uso-sticker' }, h('img', { src: 'assets/favicon.svg', alt: '' })), h('p', { class: 'suave' }, 'Sticker o pegatina: el círculo se corta limpio.'))),
        h('p', { class: 'suave', style: 'margin-top:.6rem' }, 'La base es la versión a color: piezas negras con los hilos de colores. De ella salen las otras tres. En la pestaña del navegador va solo el logo circular, sin contorno; en el botón de inicio va dentro de un círculo con contorno blanco, centrado, para que resalte sobre el riel oscuro.'),
        h('div', { class: 'tarjeta', style: 'margin-top:1rem' }, h('h3', null, 'Por qué se ve como se ve (leyes de la Gestalt)'),
          h('ul', null,
            h('li', null, h('strong', null, 'Cierre: '), 'el círculo completo se lee aunque los hilos lo corten en nueve piezas.'),
            h('li', null, h('strong', null, 'Semejanza: '), 'todos los hilos tienen el mismo grosor y todas las piezas la misma tinta; por eso se lee como una sola trama.'),
            h('li', null, h('strong', null, 'Continuidad: '), 'cada hilo sigue recto de lado a lado y el ojo lo sigue aunque se oculte bajo otro.'),
            h('li', null, h('strong', null, 'Figura y fondo: '), 'los hilos son el espacio vacío: el logo se dibuja con lo que no está, y por eso funciona en cualquier fondo.'),
            h('li', null, h('strong', null, 'Simplicidad: '), 'una sola forma, un solo grosor y una sola tinta. Sin degradados, sin líneas de distinto peso.'))),
        h('div', { class: 'rejilla rejilla--3', style: 'margin-top:1rem' },
          h('div', { class: 'tarjeta' }, h('div', { class: 'muestra-simbolo' }, marca('mosaico', 'simbolo-grande')), h('p', { class: 'suave' }, 'Símbolo solo, para íconos y favicon. Se lee desde 16 px.')),
          h('div', { class: 'tarjeta' }, h('h3', null, 'Cómo se usa'), h('ul', null,
            h('li', null, 'Espacio libre: el ancho de un hilo, por todos los lados.'), h('li', null, 'Tamaño mínimo: 16 px el símbolo; 110 px el logo completo.'), h('li', null, 'Los hilos llevan el color de su portal; en blanco y negro, toman el color del fondo.'))),
          h('div', { class: 'tarjeta' }, h('h3', null, 'Cómo no'), h('ul', null,
            h('li', null, 'No estirarlo ni girarlo.'), h('li', null, 'No cambiar los colores de las piezas ni de los hilos.'), h('li', null, 'No ponerle sombras, degradados ni contornos.'))))));

      // Demo temporal: las propuestas de estilo del tejido, vivas, para decidir con ellas a la vista.
      const hiloLana = (d, c) => `<path class="hilo ${c}" pathLength="1" d="${d}"/>`;
      const divisor = () => {
        const el = svg(`<svg class="divisor-lana teje" viewBox="0 0 800 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">${hiloLana('M0 20 C 100 -6, 160 46, 270 20 S 420 -4, 540 22 S 700 44, 780 18', 'p1')}${hiloLana('M0 32 C 100 6, 170 58, 280 32 S 430 8, 550 34 S 710 56, 790 30', 'p2')}${hiloLana('M0 44 C 100 18, 180 70, 290 44 S 440 20, 560 46 S 720 68, 796 42', 'p3')}${hiloLana('M0 56 C 100 30, 190 82, 300 56 S 450 32, 570 58 S 730 80, 800 54', 'p4')}</svg>`);
        return el;
      };
      const pieza = (color, nombre, linea, forma, clase) => h('div', { class: 'pieza-portal-card ' + (clase || ''), style: `--pc:${color}` },
        svg(`<svg viewBox="0 0 110 100" aria-hidden="true" focusable="false"><path d="${forma}" fill="${color}"/></svg>`),
        h('div', { class: 'contenido' }, h('b', null, nombre), h('span', null, linea)));
      const F1 = 'M10 10H90V40a10 10 0 1 1 0 20V90H10Z';                       // lengüeta a la derecha
      const F2 = 'M10 10H90V40a10 10 0 1 1 0 20V90H10V60a10 10 0 1 0 0-20Z';   // hueco a la izquierda y lengüeta a la derecha
      const F3 = 'M10 10H90V90H10V60a10 10 0 1 0 0-20Z';                       // solo el hueco a la izquierda
      const portales = h('div', { class: 'piezas-portales separadas' }, pieza('#1B7F56', 'Kinesis', 'El hilo de quien enseña', F1), pieza('#2B4FA3', 'Niky', 'El hilo que cruza a los otros dos', F2), pieza('#E8A13C', 'Wisfox', 'El hilo del estudiante', F3, 'pieza-portal-card--wisfox'));
      portales.addEventListener('mouseenter', () => portales.classList.remove('separadas'));
      portales.addEventListener('mouseleave', () => portales.classList.add('separadas'));
      const ovillo = () => svg('<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><defs><clipPath id="ov-demo"><circle cx="13" cy="13" r="10"/></clipPath></defs><circle cx="13" cy="13" r="10" fill="#fff"/><g clip-path="url(#ov-demo)" fill="none" stroke-width="2.4"><path d="M2 8C8 14 16 4 26 10" stroke="#2B4FA3"/><path d="M2 14C8 20 16 10 26 16" stroke="#E8A13C"/><path d="M8 2C12 10 8 18 16 26" stroke="#E0527E"/></g><circle cx="13" cy="13" r="10" fill="none" stroke="#fff" stroke-width="1.5"/></svg>');
      const escena = h('div', { class: 'escena-lana' }, h('h4', null, 'Mapa'), h('div', { class: 'cortina', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')));
      const nombresEscena = ['Mapa', 'Participar', 'Hoja de ruta', 'Identidad']; let ne = 0;
      const div1 = divisor();
      c.append(seccion('estilos', 'Propuestas de estilo',
        h('p', { class: 'aviso' }, 'Temporal, para decidir con la demostración a la vista. Son cuatro movimientos de la dirección «Hilo conductor» más las piezas que encajan. Con «movimiento calmado» o «reducir movimiento» todo queda quieto y completo.'),
        h('div', { class: 'estilo-demo' }, h('h3', null, 'A · Divisor de lana'), h('p', { class: 'suave' }, 'Sustituye la línea entre secciones. Se teje al llegar y no cambia de color ni de grosor.'), div1,
          h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { div1.classList.remove('teje'); void div1.getBoundingClientRect(); div1.classList.add('teje'); } }, 'Tejer otra vez')),
        h('div', { class: 'estilo-demo' }, h('h3', null, 'B · Los tres portales como piezas que encajan'), h('p', { class: 'suave' }, 'Pasa el cursor (o toca el botón): la lengüeta de cada pieza entra exacta en el hueco de la siguiente. En celular se apilan.'), portales,
          h('p', { style: 'text-align:center' }, h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => portales.classList.toggle('separadas') }, 'Encajar o separar'))),
        h('div', { class: 'estilo-demo' }, h('h3', null, 'C · Ovillo en el botón y progreso de cuatro hilos'), h('p', { class: 'suave' }, 'El botón principal lleva un ovillo que gira al pasar el cursor; el avance del camino de un ajuste es un hilo de cuatro colores.'),
          h('div', { class: 'acciones' }, h('button', { class: 'btn btn-ovillo', type: 'button' }, ovillo(), 'Entrar con mi rol'), h('button', { class: 'btn btn--suave', type: 'button' }, 'Participar')),
          h('p', { style: 'margin:1rem 0 0' }, h('strong', null, 'El camino de un ajuste: '), '4 de 6 pasos'), h('div', { class: 'hilo-avance', role: 'img', 'aria-label': '4 de 6 pasos hechos' }, h('i'))),
        h('div', { class: 'estilo-demo' }, h('h3', null, 'D · Cambio de sección: la lana cruza'), h('p', { class: 'suave' }, 'Al pasar de una página a otra, cuatro hilos cruzan en poco más de un segundo, los mismos de la barra superior de hoy.'), escena,
          h('p', { style: 'margin-top:.8rem' }, h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { escena.classList.remove('corre'); void escena.getBoundingClientRect(); escena.classList.add('corre'); setTimeout(() => { ne = (ne + 1) % nombresEscena.length; escena.querySelector('h4').textContent = nombresEscena[ne]; }, 520); } }, 'Cambiar de sección')))));

      c.append(seccion('color', 'Color',
        h('p', null, h('strong', null, 'Un color principal, dos funcionales y tres neutros.'), ' El principal es el verde bosque, y se eligió por continuidad: los dos proyectos ya eran verdes, así que la plataforma no les cambia el tono, lo comparte. Los funcionales también salen de las aplicaciones.'),
        h('div', { class: 'rejilla rejilla--3' }, COLORES.map((k) => h('div', { class: 'tarjeta muestra-color' },
          h('div', { class: 'muestra-color__tinte', style: `background:${k.hex}` }),
          h('p', { class: 'etiqueta' }, k.rol), h('h3', null, k.nombre), h('p', { class: 'dato' }, k.hex), h('p', null, k.uso), h('p', { class: 'suave' }, 'Origen: ' + k.origen),
          h('p', { class: 'suave' }, (() => { const b = razon(k.hex, '#FFFFFF'); const t = razon(k.hex, '#1A1714'); return b >= t ? `Texto encima: blanco (${b.toFixed(1)}:1)` : `Texto encima: tinta (${t.toFixed(1)}:1). El blanco no pasa.`; })())))),
        h('div', { class: 'tarjeta tarjeta--borde', style: 'margin-top:1rem' }, h('h3', null, 'Por qué estos tres funcionan juntos'),
          h('ul', null,
            h('li', null, h('strong', null, 'Se distinguen aunque no se vea el color: '), 'verde, ámbar y azul se separan en daltonismo: el par más exigente es verde y azul en tritanopía (ΔE 8,7, por encima del mínimo de 8); los demás superan 17. Se validaron con la herramienta de paletas.'),
            h('li', null, h('strong', null, 'Cubren los tres ejes del color: '), 'un verde (planta), un amarillo naranja (cálido) y un azul (frío). Además, cada hilo tiene su forma (cuadrado, hexágono, círculo) y su nombre: el color nunca va solo.'),
            h('li', null, h('strong', null, 'El ámbar nunca lleva texto: '), 'su contraste con blanco es 2,1:1, por debajo del mínimo. Por eso solo se usa como identificador, siempre con el nombre al lado.'),
            h('li', null, h('strong', null, 'Se descartó el terracota: '), 'se veía más cálido, pero junto a este verde es indistinguible para protanopía (ΔE 1). Tampoco el océano claro: junto al verde casi se confunde en tritanopía (ΔE 3,5).'))),
        h('p', { class: 'suave', style: 'margin-top:.8rem' }, 'Cada color se validó para daltonismo y contraste con una herramienta de paletas antes de usarse.')));

      c.append(seccion('tipografia', 'Tipografía',
        h('p', null, h('strong', null, 'Newsreader'), ' para los títulos, que dan un tono editorial y sereno, y ', h('strong', null, 'Nunito'), ' para la interfaz, la voz que Kinesis y Wisfox ya compartían. Ambas se alojan en el sitio, sin depender de internet (licencia SIL OFL).'),
        h('div', { class: 'tarjeta' },
          h('p', { class: 'tipo tipo--1' }, 'Tejemos caminos para aprender'), h('p', { class: 'dato' }, 'Títulos · Newsreader 700 · 34 a 50 px'),
          h('p', { class: 'tipo tipo--2' }, 'Una clase pensada para todos'), h('p', { class: 'dato' }, 'Subtítulos · Nunito 800 · 22 px'),
          h('p', { class: 'tipo tipo--3' }, 'El docente planea una vez y cada estudiante recibe su camino.'), h('p', { class: 'dato' }, 'Texto · Nunito 400 y 600 · 16 px, interlineado 1,6'))));

      c.append(seccion('formas', 'Formas e íconos',
        h('p', null, 'Un mosaico se arma con teselas. Cada hilo tiene la suya y las tres son de una sola tinta, como el logo. Las dos primeras las conservó cada proyecto; la tercera se diseñó para completar la familia.'),
        h('div', { class: 'rejilla rejilla--3' },
          h('div', { class: 'tarjeta tesela' }, marca('kinesis', 'tesela-marca'), h('h3', null, 'Cuadrado redondeado'), h('p', null, 'Kinesis, el aula. La “K” en movimiento: su brazo superior termina en un punto, el estudiante que avanza.')),
          h('div', { class: 'tarjeta tesela' }, marca('wisfox', 'tesela-marca'), h('h3', null, 'Hexágono'), h('p', null, 'Wisfox, el estudiante. El hexágono con la W que ya tenía.')),
          h('div', { class: 'tarjeta tesela' }, marca('valeria', 'tesela-marca'), h('h3', null, 'Círculo'), h('p', null, 'Niky, la guía. Una “V” sencilla, sin chispas ni destellos: la guía no es magia, es acompañamiento.'))),
        h('div', { class: 'tarjeta', style: 'margin-top:1rem' }, h('h3', null, 'Íconos'), h('p', { class: 'suave' }, 'De línea, con un solo trazo redondeado de 2 px y en una sola tinta, como los que ya usaban Kinesis y Wisfox.'),
          h('div', { class: 'iconos-fila' }, ICONOS.map((n) => icono(n))))));

      c.append(seccion('recursos', 'Recursos gráficos',
        h('p', null, 'El telar y el mosaico dan para más que un logo. Estos recursos salen de los dos símbolos y se usan con medida: dan identidad sin cargar la pantalla.'),
        h('div', { class: 'rejilla rejilla--2' },
          h('div', { class: 'tarjeta' }, h('div', { class: 'patron-telar', role: 'img', 'aria-label': 'Patrón de trama de telar' }), h('h3', null, 'Patrón de trama'), h('p', { class: 'suave' }, 'Fondo muy suave para estados vacíos y piezas. Nunca detrás de texto largo.')),
          h('div', { class: 'tarjeta' }, h('div', { class: 'patron-mosaico', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6].map((i) => h('span', { class: 'p' + (i % 3) }))), h('h3', null, 'Patrón de teselas'), h('p', { class: 'suave' }, 'Tres formas, tres colores: el mosaico completo. Es una de las pocas veces que los tres colores aparecen juntos.')),
          h('div', { class: 'tarjeta' }, h('hr', { class: 'puntada' }), h('h3', null, 'Divisor de puntada'), h('p', { class: 'suave' }, 'Separa secciones como una costura, en tinta.')),
          h('div', { class: 'tarjeta' }, h('div', { class: 'medidor medidor--hilo', role: 'img', 'aria-label': 'Barra de hilo al 66 %' }, h('span', { style: 'width:66%' })), h('h3', null, 'Barra de hilo'), h('p', { class: 'suave' }, 'El progreso se teje: tres colores avanzando juntos.')),
          h('div', { class: 'tarjeta' }, h('div', { class: 'cargador-trama', role: 'img', 'aria-label': 'Cargando' }, h('span'), h('span'), h('span')), h('h3', null, 'Cargador'), h('p', { class: 'suave' }, 'Tres hilos subiendo y bajando. Se detiene si la persona pide menos movimiento.')))));

      c.append(seccion('componentes', 'Componentes',
        h('p', null, 'Esquinas moderadas, filete fino y casi sin sombra. El verde marca la acción; todo lo demás es tinta.'),
        h('div', { class: 'tarjeta' }, h('div', { class: 'acciones' }, h('button', { class: 'btn', type: 'button' }, 'Botón principal'), h('button', { class: 'btn btn--suave', type: 'button' }, 'Botón secundario'),
          h('span', { class: 'sello sello--ok' }, 'Aprobado'), h('span', { class: 'sello sello--aviso' }, 'Pendiente'), h('span', { class: 'sello sello--e' }, 'Simulado')))));

      c.append(seccion('voz', 'Voz',
        h('p', null, 'Hablamos como una persona que te cuenta algo con respeto: claro, concreto y sin tecnicismos. Siempre de tú.'),
        h('div', { class: 'rejilla rejilla--2' },
          h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, 'Así sí'), h('ul', null,
            h('li', null, '“Tu ajuste espera a orientación.”'), h('li', null, '“Hoy responde con textos de ejemplo.”'), h('li', null, '“Cuando la actividad esté lista te contaremos qué cambió y por qué.”'))),
          h('div', { class: 'tarjeta' }, h('h3', null, 'Así no'), h('ul', null,
            h('li', null, 'Prometer lo que no existe.'), h('li', null, 'Mencionar diagnósticos o etiquetas.'), h('li', null, 'Hablar de “casos” o “problemas” de un estudiante.'))))));
    },
  });
})(window.MT = window.MT || {});
