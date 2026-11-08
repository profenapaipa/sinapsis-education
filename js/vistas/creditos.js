/* creditos.js: quiénes hacen Mosaico Telar y de dónde vienen sus partes.

   Los créditos viven en su propia página y no en cada pantalla: el proyecto es del semillero y de sus estudiantes, y quien lo
   lidera no necesita estar a la vista todo el tiempo. En el pie solo va el nombre del semillero.
   Sin nombres de estudiantes ni de ninguna institución: solo el semillero, el liderazgo y las fuentes. */
(function (MT) {
  'use strict';
  const { h } = MT.ui;
  const { pagina } = MT.comun;

  MT.router.registrar({
    id: 'creditos', titulo: 'Créditos', espacio: '',
    render(main) {
      const c = pagina(main, { etiqueta: 'Créditos', titulo: 'Quiénes tejen Mosaico Telar', descripcion: 'Un trabajo colectivo, hecho con estudiantes y para las aulas.' });
      c.append(h('div', { class: 'tarjeta tarjeta--borde' }, h('h2', null, 'El semillero'),
        h('p', { class: 'creditos__lema' }, 'Un proyecto del Semillero Maker de Tecnología con Sentido, liderado por Néstor Andrés Paipa y sus estudiantes.')));
      c.append(h('div', { class: 'rejilla rejilla--2', style: 'margin-top:1rem' },
        h('div', { class: 'tarjeta' }, h('h2', null, 'Los tres portales'),
          h('p', null, 'Kinesis, Niky y Wisfox nacieron como proyectos de estudiantes del semillero. Cada uno conserva su nombre y su autonomía, y hoy se tejen en una misma plataforma.')),
        h('div', { class: 'tarjeta' }, h('h2', null, 'La ruta de Inglés'),
          h('p', null, 'Las lecciones y los quizes de Inglés de grado 8.° fueron escritos por el equipo de Wisfox a partir de la malla de Inglés 2026.'))));
      c.append(h('div', { class: 'tarjeta', style: 'margin-top:1rem' }, h('h2', null, 'Fuentes y herramientas abiertas'),
        h('ul', null,
          h('li', null, 'Tipografías Nunito y Newsreader, con licencia SIL Open Font License.')),
        h('p', { class: 'suave' }, 'Si algo de lo que ves merece un crédito que no está, dínoslo: queremos que cada aporte tenga su lugar.')));
    },
  });
})(window.MT = window.MT || {});
