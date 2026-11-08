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
    return h('section', { class: 'ent-portada', 'aria-labelledby': 'ent-h1' },
      h('div', { class: 'ent-ancho ent-portada__cuerpo' },
        h('div', { class: 'ent-portada__masc' }, E.mascota('sinapso', 'saluda', 'ent-masc--grande')),
        h('div', { class: 'ent-portada__texto' },
          h('div', { class: 'ent-marca' }, logo.el, h('p', { class: 'etiqueta' }, T.portada.descriptor)),
          h('h1', { id: 'ent-h1' }, E.MARCA.nombre),
          h('p', { class: 'ent-lema' }, E.MARCA.lema),
          h('div', { class: 'ent-portada__acciones' },
            h('button', { class: 'btn ent-empezar', type: 'button', onclick: () => ir(presentando ? 'ent-quien' : 'ent-camino') }, T.portada.empezar),
            h('button', { class: 'ent-enlace', type: 'button', onclick: () => ir('ent-quien') }, T.portada.yaSe),
            rol ? h('a', { class: 'ent-enlace', href: '#/guia/' + rol.id }, T.portada.seguir(rol.nombre)) : null))));
  }

  // El camino: un hilo con los colores de los cuatro hilos de la plataforma y las tres mascotas que van apareciendo.
  function camino(E, T) {
    const C = T.camino;
    const estacion = (id, texto) => h('li', { class: 'ent-estacion ent-aparece', 'data-espacio': E.ESPACIO[id] },
      h('div', { class: 'ent-flota' }, E.mascota(id, 'saluda', 'ent-masc--estacion')),
      h('p', null, h('strong', null, E.nombreDe(id)), h('span', null, texto)));
    return h('section', { class: 'ent-camino', id: 'ent-camino', tabindex: '-1', 'aria-labelledby': 'ent-camino-t' },
      h('div', { class: 'ent-ancho' },
        h('h2', { id: 'ent-camino-t', class: 'solo-lectores' }, C.etiqueta),
        h('div', { class: 'ent-sinapso ent-aparece', 'data-espacio': E.ESPACIO.sinapso },
          h('div', { class: 'ent-flota' }, E.mascota('sinapso', 'senala', 'ent-masc--estacion')),
          h('p', null, h('strong', null, C.sinapso[0]), ' ', C.sinapso[1])),
        h('ol', { class: 'ent-estaciones' }, ['kinesis', 'wisfox', 'niky'].map((id) => estacion(id, C.rotulos[id])))));
  }

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
      raiz.append(
        portada(E, T, presentando),
        presentando ? null : camino(E, T),
        presentando ? null : h('section', { class: 'ent-seccion ent-seccion--pestanas', id: 'ent-pestanas', 'aria-labelledby': 'ent-pest-t' },
          h('div', { class: 'ent-ancho' }, h('h2', { id: 'ent-pest-t' }, T.pestanas.titulo), E.pestanas(() => ir('ent-quien')))),
        h('section', { class: 'ent-seccion ent-seccion--rol', id: 'ent-quien', tabindex: '-1', 'aria-labelledby': 'ent-rol-t' },
          h('div', { class: 'ent-ancho' }, h('h2', { id: 'ent-rol-t' }, T.rol.titulo), h('p', { class: 'bajada' }, T.rol.bajada), E.quienEres())),
        saberMas(E, T));
      main.append(raiz);
      conAparicion(raiz);
    },
  });
})(window.MT = window.MT || {});
