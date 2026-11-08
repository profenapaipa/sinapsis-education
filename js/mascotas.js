/* mascotas.js: las cuatro mascotas de la plataforma, dibujadas con un mismo estilo.
   CONTRATO (lo usan otras partes de la plataforma; no cambiar sin avisar):
     MT.mascotas.lista                      -> [{ id, nombre, animal, rol, color }] con id 'sinapso' | 'kinesis' | 'wisfox' | 'niky'
     MT.mascotas.mascota(id, { pose, tamano, clase, etiqueta })
         pose: 'base' | 'saluda' | 'senala' | 'piensa' | 'celebra' (si no existe, cae en 'base')
         tamano: ancho en px (alto proporcional); clase: clase extra; etiqueta: texto alternativo (si falta, es decorativa y va aria-hidden)
         devuelve un <svg> listo para insertar.
   Esta es la versión provisional (círculos de color) hasta que se entregue el dibujo definitivo. */
(function (MT) {
  'use strict';
  const { svg } = MT.ui;
  const LISTA = [
    { id: 'sinapso', nombre: 'Sinapso', animal: 'oso de anteojos', rol: 'guía general', color: 'var(--hilo-mosaico)' },
    { id: 'kinesis', nombre: 'Kinesis', animal: 'pulpo', rol: 'el aula', color: 'var(--hilo-kinesis)' },
    { id: 'wisfox', nombre: 'Wisfox', animal: 'zorro', rol: 'el estudiante', color: 'var(--hilo-wisfox)' },
    { id: 'niky', nombre: 'Niky', animal: 'venado', rol: 'la guía con IA', color: 'var(--hilo-valeria)' },
  ];
  function mascota(id, op) {
    const o = Object.assign({ pose: 'base', tamano: 120, clase: '', etiqueta: '' }, op);
    const m = LISTA.find((x) => x.id === id) || LISTA[0];
    const a11y = o.etiqueta ? `role="img" aria-label="${o.etiqueta}"` : 'aria-hidden="true"';
    return svg(`<svg class="mascota mascota--${m.id} ${o.clase}" viewBox="0 0 120 120" width="${o.tamano}" height="${o.tamano}" ${a11y} focusable="false"><circle cx="60" cy="60" r="52" fill="${m.color}"/></svg>`);
  }
  MT.mascotas = { lista: LISTA, mascota };
})(window.MT = window.MT || {});
