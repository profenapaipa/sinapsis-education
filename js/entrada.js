/* entrada.js: el recorrido de entrada (portada con scroll, cuatro pestañas con un mini ejemplo cada una, y la pregunta «¿Quién eres?»).

   Por qué existe. La plataforma se veía sobrecargada: el inicio explicaba todo a la vez y repetía lo que ya dicen el pendón y el pitch. Aquí
   la entrada es un recorrido corto con una sola idea por pantalla, acompañado por las cuatro mascotas (Sinapso, Kinesis, Wisfox y Niky). Lo que
   falta se dice en voz alta, y todo lo demás sigue a un toque en «Saber más» y en las otras páginas, que no se tocan.

   Qué hay aquí (inicio.js lo arma en la página):
   - TEXTOS y MARCA: TODOS los textos nuevos están en este archivo, al principio, para que el dueño los apruebe o los cambie en un solo lugar.
     El nombre de la marca es una sola constante (MARCA.nombre): cambiarlo aquí cambia la entrada.
   - pestanas(): el tablist de cuatro pestañas (Sinapsis, Kinesis, Wisfox, Niky), con teclado y ARIA.
   - quienEres(): la pregunta única. Elegir un rol avanza solo a su guía.
   - companera(rol): la mascota que acompaña en la guía de cada rol (la usa portales.js).

   Los mini ejemplos usan el caso de la exposición guiada que esté elegido (por defecto el 1, Inglés) para que la mesa y el recorrido cuenten la
   misma historia, y leen de los datos de partida (MT.datos.semilla), nunca de lo que la persona haya cambiado: son de lectura, no escriben nada.
   Todo con códigos de estudiante (P-03), sin nombres.

   Las mascotas llegan de MT.mascotas (js/mascotas.js, de otra rama). Aquí solo se les da sitio con clases (css/entrada.css): ningún estilo depende
   de cómo estén dibujadas por dentro, para que el dibujo definitivo entre sin tocar la entrada. */
(function (MT) {
  'use strict';
  const { h, ricoTexto } = MT.ui;

  /* La marca, en un solo lugar. El eslogan es el aprobado por el dueño. */
  const MARCA = { nombre: 'Sinapsis Education', lema: 'Tejemos caminos para aprender.' };

  /* TEXTOS. Marcado «aprobado» lo que ya estaba aprobado y se reutiliza igual; «adaptado» lo aprobado con un recorte; «nuevo» lo que el dueño
     todavía no ha visto. La tabla de aprobación del informe sale de aquí. */
  const TEXTOS = {
    portada: {
      empezar: 'Empezar',                                                     // nuevo (rótulo del botón único)
      yaSe: 'Ya sé quién soy: elegir mi rol',                                 // nuevo
      seguir: (rol) => 'Seguir como ' + rol.toLowerCase() + ': ir a mi guía', // nuevo
      // El descriptor («Educación inclusiva con tecnología») salió de la portada: se dice en voz alta y Sinapso ya da la bienvenida (MT.narrativa).
    },
    camino: {
      etiqueta: 'Quién te acompaña',                                          // nuevo (solo para lectores de pantalla)
      // La apertura del pitch aprobada por el dueño, sin el cierre provisional («... para ___»).
      sinapso: ['Sinapsis es donde dos neuronas se conectan para aprender.', 'Nosotros conectamos el colegio, la familia y el estudiante.'],
      // «el aula / el estudiante / la guía» son los rótulos aprobados.
      rotulos: { kinesis: 'el aula', wisfox: 'el estudiante', niky: 'la guía' },
      pasosTitulo: 'Tres pasos para empezar',                                 // nuevo
      pasos: [['Pruébalo en un minuto', 'ent-pestanas'], ['Elige tu rol', 'ent-quien'], ['Haz una cosa en tu guía', null]], // nuevo (el tercero es lo que pasa después de elegir: no lleva a ningún lado)
    },
    pestanas: {
      titulo: 'Pruébalo en un minuto',                                        // nuevo
      aria: 'Las cuatro piezas de la plataforma',                             // nuevo
      siguiente: (nombre) => 'Siguiente: ' + nombre,                          // nuevo
      elegirRol: 'Elegir mi rol',                                             // nuevo
      sinapso: {
        nombre: 'Sinapsis', rotulo: 'la plataforma',
        // nuevo (opción 2 recomendada en sinergia-contenido.md: no repite la apertura del pitch ni arrastra su cierre provisional)
        frase: 'Tres piezas, un mismo camino: Kinesis acompaña al colegio, Wisfox al estudiante y Niky a los dos.',
        guia: 'Toca para ver cómo viaja una actividad, del aula al estudiante.',                // nuevo
        paso: 'Siguiente paso', otra: 'Ver otra vez',                                           // nuevo
        pasos: [                                                                                 // nuevo (se completan con el caso elegido)
          (d) => ({ donde: 'Kinesis', texto: `La docencia ajusta «${d.actividad.titulo}» para ${d.est.id} y la envía.` }),
          () => ({ donde: 'Kinesis', texto: 'Orientación revisa y aprueba. Sin su decisión, nada avanza.' }),
          (d) => ({ donde: 'Wisfox', texto: `${d.est.id} recibe la actividad a su medida, y Niky acompaña sus dudas.` }),
        ],
      },
      kinesis: {
        nombre: 'Kinesis', rotulo: 'el aula',
        frase: 'Kinesis es el aula: el docente planea, orientación aprueba y la familia ve lo que se hace.', // nuevo (opción 1 recomendada en sinergia-contenido.md)
        guia: (d) => `Toca un apoyo del perfil de ${d.est.id} y mira cómo cambia «${d.actividad.titulo}».`,                         // nuevo
        grupo: (d) => 'Apoyos del perfil de ' + d.est.id,                                                                           // nuevo
        vacio: 'Aquí aparece el cambio en la actividad.',                                                                          // nuevo
        cambio: 'Cambio en la actividad', porque: 'Por qué',                                                                       // nuevo
        nota: 'Orientación lo revisa antes de que llegue al estudiante.',                                                         // adaptado de «Nada llega a nadie sin esa decisión»
        aprobar: 'Aprobar, como orientación',                                                                                      // nuevo
        aprobado: (d) => `Aprobado: ahora ${d.est.id} puede recibir la actividad a su medida.`,                                   // nuevo
      },
      wisfox: {
        nombre: 'Wisfox', rotulo: 'el estudiante',
        frase: 'Wisfox es donde el estudiante practica lo que ya estudia, con su actividad a su medida y sus propios logros.', // nuevo (opción 2 recomendada en sinergia-contenido.md)
        guia: 'Responde y mira la retroalimentación.',                                                                           // nuevo
        bien: 'Correcta.', casi: 'Todavía no.', otra: 'Otra pregunta',                                                           // nuevo
        medida: 'A tu medida',                                                                                                   // existente (marca de la actividad ajustada en Wisfox)
      },
      niky: {
        nombre: 'Niky', rotulo: 'la guía',
        frase: 'Niky es una IA que propone; la persona decide. Hoy responde con ejemplos preparados.',                          // nuevo (opción 1 recomendada en sinergia-contenido.md)
        guia: 'Toca una pregunta y mira la respuesta.',                                                                          // nuevo
        honesto: 'Niky hoy responde con ejemplos preparados: todavía no está conectada a un modelo de lenguaje.',                // nuevo (a partir de «Hoy responde con ejemplos»)
        pensando: 'Niky está pensando…', ejemplo: 'Respuesta de ejemplo',                                                         // existente en ia.js
        ideas: (d) => 'Pedir ideas: ' + d.c.asignatura,                                                                          // existente en casos.js
        usted: 'Docente', estudiante: 'Estudiante',                                                                              // nuevo
        usar: 'Usar', cambiar: 'Cambiar',                                                                                        // nuevo (la persona decide)
        decide: { usar: 'La usarás. Niky propone; decides tú.', cambiar: 'La cambiarás. Niky propone; decides tú.' },            // nuevo
      },
    },
    rol: {
      titulo: '¿Quién eres?',                                                 // aprobado (acortado de «¿Quién eres? Empieza por aquí»)
      bajada: 'Elige y te llevamos a tu guía.',                               // adaptado de «Elige tu rol y te mostramos por dónde empezar»
      acompana: (nombre) => 'Te acompaña ' + nombre,                          // nuevo
      coordinacion: 'Soy de coordinación',                                    // existente (roles.js)
      niky: 'Niky, la guía con IA, está disponible en cualquier camino. Hoy responde con ejemplos preparados.', // adaptado de «Hoy responde con ejemplos»
    },
    guia: { acompana: (nombre) => 'Te acompaña ' + nombre },                   // nuevo
    saberMas: {
      titulo: 'Saber más',                                                    // nuevo
      resumen: 'Para qué existe y por qué lo hacemos',                        // nuevo
      paraQue: 'Para que cada estudiante encuentre en el aula caminos para aprender a su manera, y para que quienes enseñan cuenten con herramientas que acompañen su labor.', // aprobado
      sentido: 'Tecnología con sentido: humana, pedagógica, al servicio del encuentro.',                                          // aprobado
      neuro: (marca) => `Cada cerebro se desarrolla a su ritmo (neurodesarrollo), algunos por caminos distintos a los más comunes (neurodivergencia), y esa variedad es parte natural de lo humano (neurodiversidad). ${marca} acompaña esa variedad en el aula.`, // aprobado (con la marca)
      // Los tres textos que siguen eran del inicio anterior y se conservan sin cambios (aprobados): el eje de la personalización, la privacidad y la
      // aclaración honesta de que los portales originales todavía no comparten datos.
      realidad: 'Cada estudiante tiene una experiencia y una realidad de vida diferentes. Por eso el aprendizaje se personaliza, en un entorno inclusivo donde las distintas formas de desarrollarse y de aprender encuentran su lugar.',
      privacidad: 'Privacidad en la información de cada persona: cada rol ve solo lo que le corresponde.',
      conexion: 'En Mi espacio ya se tejen así: la actividad que se aprueba en Kinesis es la que recibe el estudiante en Wisfox, y Niky acompaña a los dos. Entre los portales originales, compartir los datos es lo que viene con el servidor.',
      leyes: 'las leyes que los respaldan',                                   // existente
      pedagogia: ['Pensado desde la pedagogía inclusiva, el DUA y el PIAR, y desde ', '.'], // aprobado
      enlaces: [                                                              // títulos existentes de las páginas a las que lleva
        ['Los tres portales', '#/portales'], ['Así viaja una clase inclusiva', '#/recorrido/camino'], ['Qué nos distingue', '#/mapa/distingue'],
        ['Cómo cuidamos los datos de los estudiantes', '#/recorrido/datos'], ['Todo en el mapa', '#/mapa/conexiones'],
        ['Formas de participar', '#/planes'], ['Conocer nuestro sentido', '#/hoja/propuesta'],
      ],
    },
  };

  /* ---------------------------------------------------------------- mascotas */
  // El hilo de color de cada mascota (data-espacio de tokens.css). Niky conserva el código interno «valeria» de su color.
  const ESPACIO = { sinapso: 'mosaico', kinesis: 'kinesis', wisfox: 'wisfox', niky: 'valeria' };
  const mascotaDeRol = (rol) => (rol === 'estudiante' ? 'wisfox' : 'kinesis');
  const nombreDe = (id) => ((MT.mascotas.lista.find((m) => m.id === id) || {}).nombre) || id;
  // Todas decorativas: el nombre siempre está escrito al lado. El tamaño lo manda el CSS (clases), no el dibujo.
  /* La emoción (contento, curioso, pensando, celebra, animo, sorprendido, duda) la dibuja js/mascotas.js; si esa versión aún no la entiende, la pose
     parecida hace el mismo trabajo, así la historia se ve con cualquiera de las dos. */
  const POSE_DE = { contento: 'saluda', curioso: 'senala', pensando: 'piensa', celebra: 'celebra', animo: 'saluda', sorprendido: 'base', duda: 'piensa' };
  const mascota = (id, pose, clase, emocion) => MT.mascotas.mascota(id, { pose: pose || (emocion && POSE_DE[emocion]) || 'base', emocion, tamano: 120, clase: 'ent-masc ' + (clase || '') });

  /* El estado de un ejemplo: en cuál de los cinco momentos del arco va (Bienvenida, Reto, Guía, Acción, Logro), qué dice la mascota y cómo se siente.
     Cada ejemplo recorre el arco en pequeño; así «paso X de 5» se ve en todos y la mascota cambia de cara con lo que haces. */
  function estadoDe(id) {
    const N = MT.narrativa; const momentos = N.MOMENTOS;
    const ranura = h('div', { class: 'ent-panel__masc' }, mascota(id, 'base', 'ent-masc--panel', 'contento'));
    const puntos = momentos.map(() => h('span', { class: 'ent-punto' }));
    const rotulo = h('strong');
    const momento = h('p', { class: 'ent-momento' }, h('span', { class: 'ent-puntos', 'aria-hidden': 'true' }, puntos), rotulo);
    const linea = h('p', { class: 'ent-panel__linea', 'aria-live': 'polite' });
    /* poner(momento, clave): el momento del arco (por id) y la frase de MT.narrativa ('demo:<id>:<clave>'); la emoción sale de esa frase. */
    function poner(idMomento, clave) {
      const i = momentos.findIndex((m) => m.id === idMomento);
      const l = N.linea('demo:' + id + ':' + clave) || { texto: '', emocion: momentos[i].emocion };
      puntos.forEach((p, k) => p.classList.toggle('ent-punto--hecho', k <= i));
      rotulo.textContent = `Paso ${i + 1} de ${momentos.length}: ${momentos[i].rotulo}`;
      linea.textContent = l.texto;
      ranura.replaceChildren(mascota(id, null, 'ent-masc--panel', l.emocion));
    }
    return { ranura, momento, linea, poner };
  }

  /* La compañera de la guía de cada rol: una fila pequeña sobre el título, sin tapar nada y sin ocupar la pantalla en el celular. */
  function companera(rolId) {
    const id = mascotaDeRol(rolId);
    // Bienvenida del rol: la mascota se presenta y dice, en una frase, qué haces aquí (de MT.narrativa, la misma voz que en el resto).
    const l = MT.narrativa.linea('rol:' + rolId);
    return h('p', { class: 'ent-companera', 'data-espacio': ESPACIO[id] }, mascota(id, null, 'ent-masc--chica', l ? l.emocion : 'contento'),
      h('span', null, h('strong', null, TEXTOS.guia.acompana(nombreDe(id))), l ? h('span', { class: 'ent-companera__frase' }, ' ' + l.texto) : null));
  }

  /* ---------------------------------------------------------------- datos del caso (solo lectura) */
  function datosDelCaso() {
    const c = MT.casos.actual();
    const sem = MT.datos.semilla();
    const actividad = c.actividad || sem.actividades[0];
    const base = sem.estudiantes.find((e) => e.id === c.estudiante) || { id: c.estudiante, apoyos: [] };
    const est = c.perfil ? { id: c.perfil.id, apoyos: c.perfil.apoyos.slice() } : base;
    // El caso trae sus respuestas de Niky; si no (el caso 1), valen las de partida.
    const respuestas = Object.assign({}, MT.datos.respuestasIA, c.ia || {});
    return { c, actividad, est, respuestas };
  }
  const enIngles = (el, t) => { if (MT.ui.esIngles(t, /___/.test(t))) el.lang = 'en'; return el; };

  /* ---------------------------------------------------------------- los cuatro mini ejemplos */
  const caja = (guia, ...hijos) => h('div', { class: 'ent-demo' }, h('p', { class: 'ent-demo__guia' }, guia), ...hijos);

  // Sinapsis: una actividad viaja de Kinesis a Wisfox, un paso por toque.
  function demoSinapso(d, est) {
    const T = TEXTOS.pestanas.sinapso; let n = 1;
    const pasos = T.pasos.map((f) => f(d));
    const lista = h('ol', { class: 'ent-viaje' }, pasos.map((p) => h('li', { class: 'ent-viaje__paso', 'data-espacio': p.donde === 'Wisfox' ? 'wisfox' : 'kinesis' },
      mascota(p.donde === 'Wisfox' ? 'wisfox' : 'kinesis', 'base', 'ent-masc--paso'),
      h('div', null, h('strong', null, p.donde), h('p', null, p.texto)))));
    const boton = h('button', { class: 'btn', type: 'button' }, T.paso);
    function pintar() {
      [...lista.children].forEach((li, i) => {
        li.classList.toggle('ent-viaje__paso--visto', i < n);
        li.classList.toggle('ent-viaje__paso--actual', i === n - 1);
        if (i === n - 1) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      boton.textContent = n >= pasos.length ? T.otra : T.paso;
    }
    // Reto al abrir; Acción mientras viaja; Logro cuando llega al estudiante.
    const momento = () => (n <= 1 ? est.poner('reto', 'reto') : n >= pasos.length ? est.poner('logro', 'logro') : est.poner('accion', 'accion'));
    boton.addEventListener('click', () => { n = n >= pasos.length ? 1 : n + 1; pintar(); momento(); });
    pintar(); momento();
    return caja(T.guia, lista, h('div', { class: 'acciones' }, boton));
  }

  // Kinesis: al tocar un apoyo del perfil se ve el cambio concreto de la actividad y su razón.
  function demoKinesis(d, est) {
    const T = TEXTOS.pestanas.kinesis;
    const apoyos = d.est.apoyos.slice(0, 3);
    const salida = h('div', { class: 'ent-demo__salida', 'aria-live': 'polite' }, h('p', { class: 'suave' }, T.vacio));
    const chips = apoyos.map((apoyo) => {
      const b = h('button', { class: 'ent-chip', type: 'button', 'aria-pressed': 'false', onclick: () => {
        chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const a = MT.datos.generarAjuste({ apoyos: [apoyo] })[0];
        const aprobado = h('p', { class: 'ent-demo__ok', 'aria-live': 'polite' });
        const aprobar = h('button', { class: 'btn btn--chico', type: 'button', onclick: () => { aprobar.disabled = true; aprobado.textContent = T.aprobado(d); est.poner('logro', 'logro'); } }, T.aprobar);
        salida.replaceChildren(h('p', { class: 'etiqueta' }, T.cambio), h('p', null, a.cambio), h('p', { class: 'etiqueta' }, T.porque), h('p', null, a.porque), h('p', { class: 'suave ent-demo__nota' }, T.nota), h('div', { class: 'acciones' }, aprobar), aprobado);
        est.poner('accion', 'accion');
      } }, apoyo);
      return b;
    });
    est.poner('reto', 'reto');
    return caja(T.guia(d), h('div', { class: 'ent-chips', role: 'group', 'aria-label': T.grupo(d) }, chips), salida);
  }

  // Wisfox: una pregunta del quiz de la actividad, con la explicación de la respuesta, sea cual sea.
  function demoWisfox(d, est) {
    const T = TEXTOS.pestanas.wisfox; const preguntas = d.actividad.quiz.slice(0, 3); let i = 0;
    const cuerpo = h('div', { class: 'ent-quiz' });
    function pintar() {
      const q = preguntas[i]; let respondida = false;
      const retro = h('div', { class: 'ent-demo__salida', 'aria-live': 'polite' });
      const opciones = q.o.map((txt, k) => {
        const b = enIngles(h('button', { class: 'ent-opcion', type: 'button' }, txt), txt);
        b.addEventListener('click', () => {
          if (respondida) return; respondida = true;
          const ok = k === q.a;
          opciones.forEach((x, j) => { x.disabled = true; x.classList.toggle('ent-opcion--bien', j === q.a); x.classList.toggle('ent-opcion--elegida', j === k && !ok); if (j === q.a) x.setAttribute('aria-label', x.textContent + ', respuesta correcta'); });
          retro.replaceChildren(h('p', null, h('strong', null, ok ? T.bien : T.casi), ' ', q.why),
            preguntas.length > 1 ? h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { i = (i + 1) % preguntas.length; pintar(); } }, T.otra) : null);
          // Acertar es el logro; no acertar se acompaña con ánimo (la explicación ya está a la vista), sin tono de error.
          if (ok) est.poner('logro', 'logro'); else est.poner('accion', 'animo');
        });
        return b;
      });
      cuerpo.replaceChildren(enIngles(h('p', { class: 'ent-quiz__q' }, q.q), q.q), h('div', { class: 'ent-opciones' }, opciones), retro);
      est.poner('reto', 'reto');
    }
    pintar();
    return caja(T.guia, h('p', null, h('span', { class: 'sello sello--ok' }, T.medida)), cuerpo);
  }

  // Niky: dos preguntas de ejemplo (la del docente y la del estudiante) con su respuesta preparada. No es un modelo conectado y se dice.
  function demoNiky(d, est) {
    const T = TEXTOS.pestanas.niky;
    const conversacion = h('div', { class: 'ent-chat', 'aria-live': 'polite' });
    let sec = 0;
    const preguntas = [
      { etiqueta: d.c.ayuda.etiqueta, texto: d.c.ayuda.pregunta, tarea: 'ayuda', quien: T.estudiante },
      { etiqueta: T.ideas(d), texto: d.c.ideas, tarea: 'disenar', quien: T.usted },
    ];
    const botones = preguntas.map((p) => h('button', { class: 'ent-chip', type: 'button', onclick: async () => {
      const mio = ++sec;
      botones.forEach((x) => x.setAttribute('aria-pressed', String(x.textContent === p.etiqueta)));
      conversacion.replaceChildren(h('div', { class: 'ent-burbuja ent-burbuja--yo' }, h('small', null, p.quien), p.texto), h('div', { class: 'ent-burbuja ent-burbuja--ia' }, T.pensando));
      est.poner('guia', 'accion');   // Niky piensa: es el momento de la guía y la herramienta
      await new Promise((r) => setTimeout(r, 300));
      if (mio !== sec) return;   // tocó otra pregunta mientras tanto
      const decide = h('p', { class: 'ent-demo__ok', 'aria-live': 'polite' });
      const elegir = (k) => h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: () => { decide.textContent = T.decide[k]; est.poner('logro', 'logro'); } }, T[k]);
      const respuesta = h('div', { class: 'ent-burbuja ent-burbuja--ia' }, h('small', null, 'Niky'), h('div', { class: 'ent-burbuja__texto', tabindex: '0', role: 'region', 'aria-label': 'Respuesta de Niky' }, ricoTexto(d.respuestas[p.tarea])), h('span', { class: 'sello sello--aviso' }, T.ejemplo),
        h('div', { class: 'acciones' }, elegir('usar'), elegir('cambiar')), decide);
      conversacion.replaceChildren(conversacion.firstChild, respuesta);
      est.poner('accion', 'respuesta');
    } }, p.etiqueta));
    est.poner('reto', 'reto');
    return caja(T.guia, h('div', { class: 'ent-chips', role: 'group', 'aria-label': 'Preguntas de ejemplo' }, botones), conversacion, h('p', { class: 'suave ent-demo__nota' }, T.honesto));
  }

  /* ---------------------------------------------------------------- las cuatro pestañas */
  const ORDEN = ['sinapso', 'kinesis', 'wisfox', 'niky'];
  const DEMOS = { sinapso: demoSinapso, kinesis: demoKinesis, wisfox: demoWisfox, niky: demoNiky };

  function pestanas(alElegirRol) {
    const d = datosDelCaso();
    const P = TEXTOS.pestanas;
    const lista = h('div', { class: 'ent-pestanas', role: 'tablist', 'aria-label': P.aria });
    const paneles = [];
    const tabs = ORDEN.map((id, k) => {
      const T = P[id];
      const tab = h('button', { class: 'ent-pestana', role: 'tab', type: 'button', id: 'ent-tab-' + id, 'aria-selected': 'false', 'aria-controls': 'ent-panel-' + id, tabindex: '-1', 'data-espacio': ESPACIO[id] },
        mascota(id, 'base', 'ent-masc--tab'), h('span', null, T.nombre));
      const est = estadoDe(id);
      const sig = ORDEN[k + 1];
      const siguiente = sig
        ? h('button', { class: 'btn btn--suave', type: 'button', onclick: () => elegir(k + 1, true) }, P.siguiente(P[sig].nombre))
        : h('button', { class: 'btn', type: 'button', onclick: alElegirRol }, P.elegirRol);
      const panel = h('div', { class: 'ent-panel', role: 'tabpanel', id: 'ent-panel-' + id, 'aria-labelledby': 'ent-tab-' + id, tabindex: '0', hidden: true, 'data-espacio': ESPACIO[id] },
        h('div', { class: 'ent-panel__cab' }, est.ranura, h('div', null, h('h3', null, T.nombre), est.momento)),
        est.linea,
        h('p', { class: 'ent-panel__frase' }, T.frase),
        DEMOS[id](d, est),
        h('div', { class: 'acciones ent-panel__pie' }, siguiente));
      paneles.push(panel);
      return tab;
    });
    lista.append(...tabs);

    // Pestañas con activación automática (las flechas muestran el panel): hay solo cuatro y el contenido es corto.
    function elegir(k, foco) {
      tabs.forEach((t, j) => { const on = j === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; paneles[j].hidden = !on; });
      if (foco) tabs[k].focus();
    }
    lista.addEventListener('keydown', (e) => {
      const k = tabs.indexOf(document.activeElement); if (k < 0) return;
      const sig = { ArrowRight: (k + 1) % tabs.length, ArrowLeft: (k + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
      if (sig === undefined) return;
      e.preventDefault(); elegir(sig, true);
    });
    tabs.forEach((t, k) => t.addEventListener('click', () => elegir(k, false)));
    elegir(0, false);
    return h('div', { class: 'ent-pestanas-caja' }, lista, ...paneles);
  }

  /* ---------------------------------------------------------------- ¿Quién eres? */
  function quienEres() {
    const R = TEXTOS.rol; const st = MT.store;
    const elegir = (r) => { st.cambiar((s) => { s.rol = r.id; }); location.hash = '#/portales/' + MT.roles.por(r.id).marca; };
    const opcion = (r, clase) => {
      const id = mascotaDeRol(r.id);
      return h('button', { class: 'ent-rol ' + (clase || ''), type: 'button', 'data-espacio': ESPACIO[id], onclick: () => elegir(r) },
        mascota(id, 'saluda', 'ent-masc--rol'),
        h('span', { class: 'ent-rol__texto' }, h('strong', null, r.boton), h('small', null, R.acompana(nombreDe(id)))));
    };
    const principales = MT.roles.lista.filter((r) => r.id !== 'coordinacion');
    const coord = MT.roles.por('coordinacion');
    return h('div', { class: 'ent-rol-caja' },
      h('div', { class: 'ent-roles' }, principales.map((r) => opcion(r))),
      h('div', { class: 'ent-rol-niky', 'data-espacio': ESPACIO.niky }, mascota('niky', 'base', 'ent-masc--chica'), h('p', { class: 'suave' }, R.niky)),
      h('p', { class: 'ent-rol-coord' }, h('button', { class: 'ent-enlace', type: 'button', onclick: () => elegir(coord) }, R.coordinacion)));
  }

  MT.entrada = { MARCA, TEXTOS, ESPACIO, ORDEN, mascotaDeRol, mascota, nombreDe, companera, pestanas, quienEres, datosDelCaso };
})(window.MT = window.MT || {});
