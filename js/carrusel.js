/* carrusel.js: la bienvenida de la primera vez que se abre la plataforma en un dispositivo.
   Cuatro pantallas que se recorren con un gesto hacia la derecha (o con «Siguiente»): qué es Sinapsis Education, qué se hace en Kinesis,
   qué se hace en Wisfox y cómo ayuda Niky. Cada personaje cuenta su parte, para que desde el primer momento quede claro "si entro como X,
   llego a esta plataforma y puedo hacer esto". Es corta a propósito: lo demás se dice en vivo o está a un toque en «Guía».

   Cuándo aparece: solo la primera vez (se recuerda en este dispositivo) y solo en la portada. No aparece en modo presentación, con ?caso=,
   con un enlace directo a otra pantalla ni con ?sin-intro (lo usan las pruebas automáticas, que siempre empiezan con el almacenamiento vacío).
   Los textos están juntos en TEXTOS, para que el equipo los apruebe o los cambie sin tocar el código. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const CLAVE = 'sinapsis.intro';

  const TEXTOS = {
    etiqueta: 'Bienvenida a ' + MT.nombre,
    siguiente: 'Siguiente', saltar: 'Saltar', verPlataforma: 'Ver la plataforma',
    pantalla: (i, n) => `Pantalla ${i} de ${n}`,
    diapositivas: [
      { quien: 'sinapso', emocion: 'contento', titulo: MT.nombre,
        linea: 'Sinapsis es donde dos neuronas se conectan para aprender.',
        detalle: 'Conectamos el colegio, la familia y el estudiante, para que cada cerebro aprenda a su ritmo.',
        pasos: [['Kinesis', 'el aula'], ['Wisfox', 'el estudiante'], ['Niky', 'la guía']] },
      { quien: 'kinesis', emocion: 'pensando', titulo: 'Kinesis, el aula',
        linea: 'Aquí se planea y se aprueba lo que cada estudiante necesita.',
        detalle: 'Si eres docente, orientación o familia, entras por Kinesis.',
        pasos: [['Docente', 'ajusta la actividad'], ['Orientación', 'revisa y aprueba'], ['Familia', 've el resultado']] },
      { quien: 'wisfox', emocion: 'celebra', titulo: 'Wisfox, el estudiante',
        linea: 'Aquí se practica a tu ritmo, con material interactivo.',
        detalle: 'Si eres estudiante, entras por Wisfox. El material parte de la malla curricular de tu colegio.',
        pasos: [['Recibes', 'la actividad a tu medida'], ['Practicas', 'y respondes'], ['Ves', 'tus logros']] },
      { quien: 'niky', emocion: 'curioso', titulo: 'Niky, la guía', final: true,
        linea: 'Te ayudo desde el botón redondo, en cualquier pantalla.',
        detalle: 'Propongo ideas y explico; tú decides. Hoy respondo con ejemplos preparados.',
        pasos: [['Preguntas', 'lo que no entiendes'], ['Propongo', 'una pista'], ['Decides', 'tú']] },
    ],
    entrarK: 'Entrar a Kinesis', entrarW: 'Entrar a Wisfox',
  };

  const visto = () => { try { return localStorage.getItem(CLAVE) === '1'; } catch (e) { return false; } };
  const marcarVisto = () => { try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* sin almacenamiento: volverá a salir */ } };

  function debeMostrarse() {
    if (visto()) return false;
    if (/[?&](sin-intro|caso)=?/.test(location.search)) return false;
    if (document.documentElement.dataset.presentacion === 'activa') return false;
    return location.hash === '' || location.hash === '#' || location.hash === '#/';
  }

  function mascota(id, emocion, tam) {
    try { return MT.mascotas.mascota(id, { emocion, tamano: tam }); } catch (e) { return h('span', { 'aria-hidden': 'true' }); }
  }

  function mostrar() {
    const T = TEXTOS; const n = T.diapositivas.length; let activa = 0; let cerrado = false;
    const previo = document.activeElement;
    let velo = null;
    const cerrar = (destino) => {
      if (cerrado) return; cerrado = true; marcarVisto();
      document.removeEventListener('keydown', alTeclado); velo.remove(); document.documentElement.classList.remove('carrusel-abierto');
      if (destino) location.hash = destino; else if (previo && previo.focus) { try { previo.focus(); } catch (e) { /* nada */ } }
    };
    const diapositiva = (d, i) => h('section', { class: 'carr-pantalla', 'data-quien': d.quien, 'aria-roledescription': 'diapositiva', 'aria-label': T.pantalla(i + 1, n) + ': ' + d.titulo },
      h('div', { class: 'carr-masc' }, mascota(d.quien, d.emocion, 168)),
      h('h2', { class: 'carr-titulo' }, d.titulo),
      h('p', { class: 'carr-linea' }, d.linea),
      h('ol', { class: 'carr-pasos' }, d.pasos.map(([a, b]) => h('li', null, h('strong', null, a), h('span', null, b)))),
      h('p', { class: 'carr-detalle' }, d.detalle),
      d.final ? h('div', { class: 'carr-acciones' },
        h('button', { class: 'btn', type: 'button', onclick: () => cerrar('#/portales/wisfox') }, T.entrarW),
        h('button', { class: 'btn', type: 'button', onclick: () => cerrar('#/portales/kinesis') }, T.entrarK),
        h('button', { class: 'btn btn--suave', type: 'button', onclick: () => cerrar(null) }, T.verPlataforma)) : null);
    const pista = h('div', { class: 'carr-pista', tabindex: 0, role: 'group', 'aria-roledescription': 'carrusel', 'aria-label': T.etiqueta }, T.diapositivas.map(diapositiva));
    const puntos = T.diapositivas.map((_, i) => h('button', { class: 'carr-punto', type: 'button', 'aria-label': T.pantalla(i + 1, n), onclick: () => ir(i) }));
    const sig = h('button', { class: 'btn carr-sig', type: 'button', onclick: () => (activa < n - 1 ? ir(activa + 1) : cerrar(null)) }, T.siguiente);
    const saltar = h('button', { class: 'btn btn--suave btn--chico carr-saltar', type: 'button', onclick: () => cerrar(null) }, T.saltar);
    velo = h('div', { class: 'carr', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.etiqueta },
      h('div', { class: 'carr-barra' }, h('p', { class: 'carr-etiqueta' }, T.etiqueta), saltar),
      pista, h('div', { class: 'carr-pie' }, h('div', { class: 'carr-puntos' }, puntos), sig));

    function pintar() {
      puntos.forEach((p, i) => p.setAttribute('aria-current', i === activa ? 'true' : 'false'));
      sig.hidden = activa === n - 1;
      [...pista.children].forEach((s, i) => s.setAttribute('aria-hidden', i === activa ? 'false' : 'true'));
    }
    function ir(i) { activa = Math.max(0, Math.min(n - 1, i)); pista.scrollTo({ left: activa * pista.clientWidth, behavior: 'smooth' }); pintar(); }
    // El gesto manda: al terminar de deslizar se mira qué pantalla quedó al centro.
    let t = 0;
    pista.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(pista.scrollLeft / pista.clientWidth); if (i !== activa) { activa = i; pintar(); } }, 70); });
    function alTeclado(e) {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(null); }
      else if (e.key === 'ArrowRight' && document.activeElement === pista) { e.preventDefault(); ir(activa + 1); }
      else if (e.key === 'ArrowLeft' && document.activeElement === pista) { e.preventDefault(); ir(activa - 1); }
    }
    document.addEventListener('keydown', alTeclado);
    document.body.append(velo); document.documentElement.classList.add('carrusel-abierto');
    pintar();
    try { pista.focus({ preventScroll: true }); } catch (e) { /* nada */ }
  }

  function iniciar() { if (debeMostrarse()) mostrar(); }
  MT.carrusel = { iniciar, mostrar, debeMostrarse, TEXTOS, CLAVE };
})(window.MT = window.MT || {});
