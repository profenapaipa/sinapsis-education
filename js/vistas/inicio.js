/* inicio.js: la puerta de entrada, pensada como la de una plataforma que se presenta a colegios y
   a un jurado. Muestra la plataforma misma (capturas de sus espacios), hace una sola pregunta
   ("¿quién eres?") y todo lo demás sale de ahí. Cada cifra tiene su fuente y lo simulado se dice. */
(function (MT) {
  'use strict';
  const { h, marca } = MT.ui;
  const st = MT.store;


  function tarjetaRol(r) {
    return h('article', { class: 'tarjeta rol-tarjeta' },
      h('span', { class: 'rol-icono' }, MT.ui.icono(r.icono)),
      h('h3', null, r.nombre), h('p', { class: 'rol-lema' }, r.lema),
      h('button', { class: 'btn', type: 'button', onclick: () => { st.cambiar((s) => { s.rol = r.id; }); location.hash = '#/guia/' + r.id; } }, r.boton));
  }

  function componente(id, nombre, rotulo, texto) {
    return h('article', { class: 'tarjeta proyecto-tarjeta portal', 'data-espacio': id }, h('div', { class: 'cuerpo' },
      h('div', { class: 'proyecto-cab' }, marca(id), h('div', null, h('h3', null, nombre), h('small', null, rotulo))), h('p', null, texto),
      h('div', { class: 'acciones' }, h('a', { class: 'btn btn--chico btn--suave', href: '#/portales/' + id, 'aria-label': 'Ir a ' + nombre }, 'Ir a ' + nombre))));
  }

  MT.router.registrar({
    id: 'inicio', titulo: 'Inicio', espacio: '',
    render(main) {
      const s = st.obtener();
      const c = h('div', { class: 'contenedor' });
      const tejido = MT.tejido.logoTejido();

      c.append(h('section', { class: 'lienzo' },
        h('div', null,
          h('p', { class: 'descriptor' }, 'Colectivo de educación inclusiva con tecnología'),
          h('div', { class: 'marca-hero' },
            h('div', { class: 'marca-hero__logo' }, tejido.el, h('div', { class: 'marca-hero__controles' },
              h('button', { class: 'btn btn--chico btn--suave', type: 'button', onclick: tejido.repetir }, 'Ver otra vez'),
              h('button', { class: 'btn btn--chico btn--suave', type: 'button', 'aria-pressed': 'false', onclick: (e) => { e.currentTarget.setAttribute('aria-pressed', String(tejido.alternar())); } }, 'Blanco y negro'))),
            h('div', null, h('h1', null, 'Mosaico Telar'), h('p', { class: 'marca-hero__lema' }, 'Tejemos caminos para aprender.'))),
          h('p', { class: 'intro' }, 'Cada cerebro se desarrolla a su ritmo (neurodesarrollo), algunos por caminos distintos a los más comunes (neurodivergencia), y esa variedad es parte natural de lo humano (neurodiversidad). Mosaico Telar acompaña esa variedad en el aula.'),
          h('ul', { class: 'hilos-leyenda', 'aria-label': 'Sus tres portales' }, [['kinesis', 'Kinesis', 'el aula'], ['valeria', 'ValerIA', 'la guía'], ['wisfox', 'Wisfox', 'el estudiante'], ['mosaico', 'Mosaico Telar', 'la plataforma que los une']].map(([id, n, r]) => h('li', { 'data-espacio': id }, h('i', { 'aria-hidden': 'true' }), h('strong', null, n), ' ' + r))),
          h('div', { class: 'acciones' },
            h('a', { class: 'btn', href: '#roles', onclick: (e) => { e.preventDefault(); const el = document.getElementById('roles'); if (el) MT.movimiento.desplazar(el); } }, 'Entrar con mi rol'),
            h('a', { class: 'btn btn--suave', href: '#/planes' }, 'Participar')),
          h('ul', { class: 'confianza' },
            h('li', null, 'Pensado desde la pedagogía inclusiva, el DUA y el PIAR, y desde ',
              h('button', { class: 'termino', type: 'button', 'aria-label': 'Marco normativo: las leyes que respaldan estas ideas', onclick: () => MT.glosario.abrirNombre('Marco normativo') }, 'las leyes que los respaldan'), '.'),
            h('li', null, 'Privacidad en la información de cada persona: cada rol ve solo lo que le corresponde.'),
            h('li', null, 'Funciona sin instalar nada'))),
        h('div', { class: 'vitrina' },
          h('div', { class: 'dispositivo dispositivo--a' }, h('img', { src: 'assets/capturas/docente.jpg', alt: 'El espacio del docente: sus estudiantes, el siguiente paso y las actividades planeadas con DUA', width: '1280', height: '800', loading: 'lazy', decoding: 'async' }), h('span', { class: 'dispositivo-rotulo' }, 'Espacio del docente')),
          h('div', { class: 'dispositivo dispositivo--b' }, h('img', { src: 'assets/capturas/estudiante.jpg', alt: 'El espacio del estudiante: su actividad del día con el quiz, sus puntos y sus logros', width: '1280', height: '800', loading: 'lazy', decoding: 'async' }), h('span', { class: 'dispositivo-rotulo' }, 'Espacio del estudiante')))));

      if (s.rol) {
        const r = MT.roles.por(s.rol);
        c.append(h('section', { class: 'siguiente-banner', 'aria-label': 'Continuar' },
          h('div', null, h('p', { class: 'etiqueta' }, 'Estás como ' + r.nombre.toLowerCase()), h('h2', null, 'Continúa donde lo dejaste')),
          h('a', { class: 'btn', href: '#/guia' }, 'Ver mi guía de inicio')));
      }

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-que' },
        h('h2', { id: 'h-que' }, 'Qué es Mosaico Telar'),
        h('p', { class: 'bajada' }, 'Es la plataforma donde el docente planea una clase inclusiva, orientación la valida, la familia la ve y cada estudiante la recibe a su medida. Reúne tres portales para que esa clase llegue completa, del docente al estudiante. Cada portal nació como un proyecto de estudiantes; juntos comparten una identidad, un camino para cada rol y los mismos datos.'),
        h('div', { class: 'plataforma' },
          h('span', { class: 'plataforma__rotulo' }, marca('mosaico', 'plataforma__marca'), 'Mosaico Telar · la plataforma'),
          h('div', { class: 'rejilla rejilla--3' },
            componente('kinesis', 'Kinesis', 'El aula', 'Es el hilo de quien enseña: desde aquí la docencia teje la personalización del aprendizaje con cada estudiante.'),
            componente('wisfox', 'Wisfox', 'El estudiante', 'Es el hilo del estudiante: material didáctico interactivo que parte de la malla curricular de su institución.'),
            componente('valeria', 'ValerIA', 'La guía', 'Es el hilo que cruza a los otros dos: propone, ordena y lleva la información hasta quien debe decidir. La IA amplía la agentividad de las personas; no la reemplaza. Hoy responde con ejemplos.')),
          h('p', { class: 'plataforma__une' }, h('strong', null, 'Cómo se conectan: '), 'En Mi espacio ya se tejen así: la actividad que se aprueba en Kinesis es la que recibe el estudiante en Wisfox, y ValerIA acompaña a los dos. Entre los portales originales, compartir los datos es lo que viene con el servidor.')),
        h('div', { class: 'objetivo' }, h('p', { class: 'etiqueta' }, 'Para qué existe'),
          h('p', { class: 'objetivo__texto' }, 'Para que cada estudiante encuentre en el aula caminos para aprender a su manera, y para que quienes enseñan cuenten con herramientas que acompañen su labor.'),
          h('p', { class: 'objetivo__sentido' }, 'Tecnología con sentido: humana, pedagógica, al servicio del encuentro.')),
        h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#roles', onclick: (e) => { e.preventDefault(); const el = document.getElementById('roles'); if (el) MT.movimiento.desplazar(el); } }, 'Elegir mi rol'),
          h('a', { class: 'btn btn--suave', href: '#/portales' }, 'Ver los tres portales'))));

      c.append(h('section', { class: 'seccion', id: 'roles', 'aria-labelledby': 'h-roles' },
        h('h2', { id: 'h-roles' }, '¿Quién eres? Empieza por aquí'),
        h('p', { class: 'bajada' }, 'Elige tu rol y te mostramos por dónde empezar: qué portal te toca, en qué orden y qué hace cada uno. Puedes cambiar de rol cuando quieras.'),
        h('div', { class: 'rejilla rejilla--5' }, MT.roles.lista.map(tarjetaRol)),
        h('p', { class: 'suave', style: 'margin-top:1rem' }, 'Si solo quieres conocerla, ', h('a', { href: '#/portales' }, 'mira los tres portales'), ', ', h('a', { href: '#/mapa/conexiones' }, 'el mapa'), ' o ', h('a', { href: '#/recorrido/roles' }, 'qué ve cada rol'), '.')));

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-como' },
        h('h2', { id: 'h-como' }, 'Así viaja una clase inclusiva'),
        h('p', { class: 'bajada' }, 'Un ajuste nace en el aula, pasa por orientación y solo entonces llega a la familia y al estudiante. ValerIA acompaña a quien enseña y a quien aprende.'),
        h('ol', { class: 'pasos3' },
          h('li', null, h('h3', null, 'Planea'), h('p', null, 'El docente diseña la clase con DUA, ve los apoyos de cada estudiante y le pide ideas a ValerIA.'), h('span', { class: 'sello sello--ok' }, 'Disponible hoy')),
          h('li', null, h('h3', null, 'Valida'), h('p', null, 'Orientación revisa el ajuste y lo aprueba o lo devuelve. Nada llega a nadie sin esa decisión.'), h('span', { class: 'sello sello--ok' }, 'Disponible hoy')),
          h('li', null, h('h3', null, 'Aprende'), h('p', null, 'El estudiante recibe la actividad a su medida y la familia ve el proceso mientras ocurre.'), h('span', { class: 'sello sello--ok' }, 'Disponible hoy'))),
        h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/recorrido/camino' }, 'Recorrerlo de punta a punta'), h('a', { class: 'btn btn--suave', href: '#/mapa/conexiones' }, 'Ver todo en el mapa'))));

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-dif' },
        h('h2', { id: 'h-dif' }, 'Qué la hace distinta'),
        h('div', { class: 'rejilla rejilla--3 diferencial' },
          h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, 'Un camino compartido'), h('p', null, 'Docentes, orientación, familias y estudiantes ven el mismo proceso, cada uno con lo suyo, y cada paso se entiende.')),
          h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, 'Para todos, no solo con diagnóstico'), h('p', null, 'El DUA es la base: la clase se piensa para todos y el ajuste cubre lo que el diseño no alcanza.')),
          h('div', { class: 'tarjeta tarjeta--borde' }, h('h3', null, 'Protegida por diseño'), h('p', null, 'La información clínica queda aislada y la IA nunca la recibe.'))),
        h('p', { style: 'margin-top:1rem' }, h('a', { href: '#/mapa/distingue' }, 'Conocer todo lo que nos distingue'))));

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-problema' },
        h('h2', { id: 'h-problema' }, 'Cada aula reúne muchas maneras de aprender'),
        h('p', { class: 'bajada' }, 'En cada aula conviven muchas maneras de aprender. Queremos tejer entre ellas: herramientas que ayuden a la docencia a imaginar, probar y acompañar.'),
        h('div', { class: 'rejilla rejilla--3' },
          h('div', { class: 'tarjeta' }, h('span', { class: 'cifra' }, 'Cada estudiante'), h('p', null, 'tiene una experiencia y una realidad de vida diferentes. Por eso el aprendizaje se personaliza, en un entorno inclusivo donde las distintas formas de desarrollarse y de aprender encuentran su lugar.')),
          h('div', { class: 'tarjeta' }, h('span', { class: 'cifra' }, 'Una mirada que evoluciona'), h('p', null, 'La normatividad de educación inclusiva y la reflexión pedagógica avanzan hacia una atención más humana y cercana. Mosaico Telar la toma como punto de partida, no como meta.')),
          h('div', { class: 'tarjeta' }, h('span', { class: 'cifra' }, 'Todos'), h('p', null, 'Todos aprendemos distinto, y por eso todos somos parte del mosaico. La herramienta está para acompañar esa diversidad.')))));

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-datos' },
        h('div', { class: 'garantias' },
          h('h2', { id: 'h-datos' }, 'Los datos de los estudiantes van primero'),
          h('p', null, 'Trabajamos con información de menores de edad. Por eso la regla es clara: los datos de partida son de ejemplo y lo que tú escribes se queda en tu navegador.'),
          h('div', { class: 'rejilla rejilla--2' },
            [['Ningún dato real entra hasta que todo esté en regla', 'Política de tratamiento de datos, autorización de las familias, contrato con el colegio, cifrado y una revisión de seguridad independiente.'],
             ['La información clínica queda aislada', 'Solo la ve orientación. Ni docentes, ni familias, ni coordinación, ni la IA la reciben.'],
             ['La IA solo propone', 'Trabaja con perfiles ficticios y sin acceso a bases de datos. Sus respuestas son propuestas, nunca decisiones.'],
             ['Lo que subes se queda contigo', 'Los archivos se guardan solo en este navegador y no se envían a ningún servidor. Cada archivo lo ve únicamente quien tú elijas.']]
              .map(([t, p]) => h('div', { class: 'item' }, h('h3', null, t), h('p', null, p)))),
          h('p', { style: 'margin-top:1rem' }, h('a', { href: '#/recorrido/datos' }, 'Ver cómo viaja la información')))));

      c.append(h('section', { class: 'seccion', 'aria-labelledby': 'h-participa' },
        h('h2', { id: 'h-participa' }, 'Participa en su construcción'),
        h('p', { class: 'bajada' }, 'Puedes recorrer la demostración completa sin registrarte. Si quieres seguirnos de cerca o conversar sobre tu colegio, hay una puerta abierta.'),
        h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/registro/lista' }, 'Dejar mi correo'), h('a', { class: 'btn btn--suave', href: '#/registro/conversar' }, 'Conversar sobre mi colegio'), h('a', { class: 'btn btn--suave', href: '#/planes' }, 'Ver las formas de participar'), h('a', { class: 'btn btn--suave', href: '#/hoja/propuesta' }, 'Conocer nuestro sentido'))));

      main.append(c);
    },
  });
})(window.MT = window.MT || {});
