/* inicio.js: la portada de la plataforma, pensada para una mesa con un celular o un portátil.

   Una sola idea por pantalla, de arriba hacia abajo:
   1. la portada: Sinapso, el nombre, el eslogan y UN solo botón («Empezar»);
   2. un camino corto donde las mascotas aparecen una a una al desplazarse (decorado, nunca necesario para entender);
   3. cuatro pestañas con un mini ejemplo que funciona: Sinapsis, Kinesis, Wisfox y Niky;
   4. «¿Quién eres?»: una pregunta, y cada opción avanza sola a la guía de ese rol;
   5. «Saber más»: lo que antes llenaba el inicio (por qué existe, normatividad, a dónde ir después), plegado y a un toque.

   Qué se quitó del inicio y dónde sigue: las capturas, los tres ✓ de confianza, «Qué es», las tarjetas de los portales, «Así viaja una clase»,
   «Qué la hace distinta» y la regla de los datos ya viven en #/portales, #/recorrido, #/mapa y #/planes; lo que solo vivía aquí
   (para qué existe, los tres términos de neurodiversidad y las leyes) quedó en «Saber más».

   Los textos están todos en js/entrada.js. Aparecer al desplazarse usa IntersectionObserver con opacidad y transform, nada más; si la persona
   pide menos movimiento (sistema o interruptor «calmado») todo está visible desde el principio. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const st = MT.store;

  const ir = (id) => { const el = document.getElementById(id); if (el) MT.movimiento.desplazar(el); };

  /* Las mascotas del camino aparecen una a una. Sin IntersectionObserver, o con movimiento calmado, no se oculta nada: el contenido nunca
     depende de la animación. El efecto de paralaje es mínimo (unos píxeles, al ritmo del desplazamiento) y se apaga con el calmado. */
  function conAparicion(raiz) {
    const items = [...raiz.querySelectorAll('.ent-aparece')];
    if (!('IntersectionObserver' in window) || MT.movimiento.calmado()) return;
    items.forEach((el) => el.classList.add('ent-oculto'));
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('ent-oculto'); io.unobserve(e.target); } });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));

    const flotantes = [...raiz.querySelectorAll('.ent-flota')];
    let cuadro = 0;
    const mover = () => {
      cuadro = 0;
      if (MT.movimiento.calmado()) { flotantes.forEach((el) => el.style.removeProperty('--py')); return; }
      const mitad = window.innerHeight / 2;
      flotantes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const py = Math.max(-14, Math.min(14, ((r.top + r.height / 2) - mitad) * -0.05));
        el.style.setProperty('--py', py.toFixed(1) + 'px');
      });
    };
    const alDesplazar = () => { if (!cuadro) cuadro = requestAnimationFrame(mover); };
    window.addEventListener('scroll', alDesplazar, { passive: true });
    MT.router.alSalir(() => { io.disconnect(); window.removeEventListener('scroll', alDesplazar); if (cuadro) cancelAnimationFrame(cuadro); });
  }

  function portada(E, T, presentando) {
    const s = st.obtener(); const rol = s.rol ? MT.roles.por(s.rol) : null;
    // El logo (piezas negras con hilos de colores) sigue en la portada, pequeño y sin los botones de demostración que tenía el inicio anterior.
    // Se guarda el manejador en MT.entrada.logo para que las pruebas puedan alternar blanco y negro sin botones en pantalla.
    const logo = MT.tejido.logoTejido(); E.logo = logo;
    const bien = MT.narrativa.linea('bienvenida') || { texto: '', emocion: 'contento' };
    return h('section', { class: 'ent-portada', 'aria-labelledby': 'ent-h1' },
      h('div', { class: 'ent-ancho ent-portada__cuerpo' },
        // Momento 1, Bienvenida: Sinapso te recibe contento y lo dice con su propia frase (MT.narrativa).
        h('div', { class: 'ent-portada__masc' }, E.mascota('sinapso', null, 'ent-masc--grande', bien.emocion), h('p', { class: 'ent-habla', 'aria-live': 'polite' }, bien.texto)),
        h('div', { class: 'ent-portada__texto' },
          h('div', { class: 'ent-marca' }, logo.el),
          h('h1', { id: 'ent-h1' }, E.MARCA.nombre),
          h('p', { class: 'ent-lema' }, E.MARCA.lema),
          h('div', { class: 'ent-portada__acciones' },
            h('button', { class: 'btn ent-empezar', type: 'button', 'aria-describedby': 'ent-empezar-linea', onclick: () => ir('ent-quien') }, T.portada.empezar),
            h('p', { class: 'ent-empezar-linea', id: 'ent-empezar-linea' }, T.portada.empezarLinea),
            h('button', { class: 'ent-enlace', type: 'button', onclick: () => ir('ent-quien') }, T.portada.yaSe),
            // Entrada discreta al tutorial guiado (js/tutorial.js): elegir rol y ejemplo y recorrer las pantallas reales.
            h('button', { class: 'ent-enlace', type: 'button', id: 'btn-ver-tutorial', onclick: () => MT.tutorial && MT.tutorial.abrir() }, 'Ver el tutorial'),
            rol ? h('a', { class: 'ent-enlace', href: '#/portales/' + rol.marca }, T.portada.seguir(rol.nombre)) : null))));
  }

  /* ---- portada3 ---- El camino: tres tarjetas grandes, una por proyecto, en lugar de las mascotas repetidas (pedido del dueño, 9 nov 2026).
     Los personajes se reservan para el tutorial; aquí cada proyecto se reconoce por su logo y su color. Niky va en el centro, unida por un hilo
     a las otras dos, porque apoya en los dos espacios. Dentro de cada tarjeta están los botones del tutorial guiado según el rol. */
  function camino(E, T) {
    const C = T.camino; const P = C.proyectos;
    const { marca, icono } = MT.ui;
    const reto = MT.narrativa.linea('reto');
    const tutorial = (rol) => { if (MT.tutorial) MT.tutorial.iniciar({ rol }); };
    const botonRol = (id) => { const r = MT.roles.por(id);
      return h('button', { class: 'ent-proy__rol', type: 'button', 'data-rol': id, onclick: () => tutorial(id) }, icono(r.icono), h('span', null, r.nombre)); };
    const tarjeta = (id, espacio, cuerpo, pie) => h('article', { class: 'ent-proy ent-aparece', 'data-proyecto': id, 'data-espacio': espacio, 'aria-labelledby': 'ent-proy-' + id },
      h('div', { class: 'ent-proy__cab' }, h('span', { class: 'ent-proy__logo' }, marca(espacio)),
        h('div', null, h('h3', { id: 'ent-proy-' + id }, E.nombreDe(id)), h('p', { class: 'ent-proy__titulo' }, P[id].titulo))),
      h('p', { class: 'ent-proy__texto' }, P[id].texto), cuerpo, pie);
    const conRoles = (id) => h('div', { class: 'ent-proy__acciones' },
      h('p', { class: 'ent-proy__etiqueta', id: 'ent-proy-' + id + '-rec' }, C.recorrer),
      h('div', { class: 'ent-proy__roles', role: 'group', 'aria-labelledby': 'ent-proy-' + id + '-rec' }, P[id].roles.map(botonRol)));
    const kinesis = tarjeta('kinesis', 'kinesis', conRoles('kinesis'), h('a', { class: 'ent-proy__entrar', href: '#/portales/kinesis' }, P.kinesis.entrar));
    const wisfox = tarjeta('wisfox', 'wisfox', conRoles('wisfox'), h('a', { class: 'ent-proy__entrar', href: '#/portales/wisfox' }, P.wisfox.entrar));
    const niky = tarjeta('niky', 'valeria',
      h('ul', { class: 'ent-proy__puentes' }, h('li', { 'data-espacio': 'kinesis' }, P.niky.enKinesis), h('li', { 'data-espacio': 'wisfox' }, P.niky.enWisfox)),
      h('div', { class: 'ent-proy__acciones' }, h('div', { class: 'ent-proy__roles' },
        h('button', { class: 'ent-proy__rol ent-proy__rol--niky', type: 'button', id: 'ent-preguntar-niky', onclick: () => MT.ia && MT.ia.panel.abrir() }, icono('chat'), h('span', null, P.niky.preguntar)),
        h('button', { class: 'ent-proy__rol', type: 'button', onclick: () => tutorial('docente') }, icono('recorrido'), h('span', null, P.niky.verla)))));
    return h('section', { class: 'ent-camino', id: 'ent-camino', tabindex: '-1', 'aria-labelledby': 'ent-camino-t' },
      h('div', { class: 'ent-ancho' },
        h('div', { class: 'ent-sinapso ent-aparece' }, h('p', null, h('strong', null, C.sinapso[0]), ' ', C.sinapso[1])),
        reto ? h('p', { class: 'ent-reto ent-aparece' }, reto.texto) : null,
        h('h2', { id: 'ent-camino-t', class: 'ent-proy-titulo' }, C.proyectosTitulo),
        h('p', { class: 'bajada ent-proy-bajada' }, C.proyectosBajada),
        h('div', { class: 'ent-proyectos' }, kinesis, niky, wisfox)));
  }
  // ---- fin portada3 ----

  function saberMas(E, T) {
    const S = T.saberMas;
    const leyes = h('button', { class: 'termino', type: 'button', 'aria-label': 'Marco normativo: las leyes que respaldan estas ideas', onclick: () => MT.glosario.abrirNombre('Marco normativo') }, S.leyes);
    return h('section', { class: 'ent-saber', id: 'ent-saber', 'aria-labelledby': 'ent-saber-t' },
      h('div', { class: 'ent-ancho' },
        h('h2', { id: 'ent-saber-t' }, S.titulo),
        h('details', { class: 'ent-detalle' },
          h('summary', null, S.resumen),
          h('div', { class: 'ent-detalle__cuerpo' },
            h('p', { class: 'ent-objetivo' }, S.paraQue), h('p', { class: 'suave' }, S.sentido),
            h('p', null, S.neuro(E.MARCA.nombre)), h('p', null, S.realidad),
            h('p', null, S.pedagogia[0], leyes, S.pedagogia[1]),
            h('p', null, S.privacidad), h('p', null, S.conexion))),
        h('ul', { class: 'ent-enlaces' }, S.enlaces.map(([t, href]) => h('li', null, h('a', { href }, t))))));
  }

  MT.router.registrar({
    id: 'inicio', titulo: 'Inicio', espacio: '',
    render(main) {
      const E = MT.entrada; const T = E.TEXTOS;
      // En modo presentación (o entrando con ?caso= / #/caso/N, que lo activa un instante después) el recorrido se omite: la exposición guiada
      // del lunes empieza en su guion y no debe verse alterada. Queda la portada, la pregunta de rol y «Saber más».
      const presentando = (MT.presentacion && MT.presentacion.activo()) || /[?&]caso=\d+/.test(location.search) || /^#\/caso\//.test(location.hash);
      const raiz = h('div', { class: 'entrada' });
      // quien2: se filtran los null (Element.append(null) escribe el texto «null»: era el «nullnull» que se veía en modo presentación).
      raiz.append(...[
        portada(E, T, presentando),
        presentando ? null : camino(E, T),
        presentando ? null : h('section', { class: 'ent-seccion ent-seccion--pestanas', id: 'ent-pestanas', 'aria-labelledby': 'ent-pest-t' },
          h('div', { class: 'ent-ancho' }, h('h2', { id: 'ent-pest-t' }, T.pestanas.titulo), E.pestanas(() => ir('ent-quien')))),
        h('section', { class: 'ent-seccion ent-seccion--rol', id: 'ent-quien', tabindex: '-1', 'aria-labelledby': 'ent-rol-t' },
          h('div', { class: 'ent-ancho' }, h('h2', { id: 'ent-rol-t' }, T.rol.titulo), h('p', { class: 'bajada' }, T.rol.bajada), E.quienEres())),
        saberMas(E, T)].filter(Boolean));
      main.append(raiz);
      conAparicion(raiz);
    },
  });
})(window.MT = window.MT || {});
