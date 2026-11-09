/* presentacion.js: las entradas antiguas del modo presentación, que ahora llevan al TUTORIAL GUIADO (js/tutorial.js).

   Por qué cambió (decisión del dueño, 9 nov 2026, muestra de la CCB): el modo presentación ponía una barra con el guion de la mesa
   (#guion-mesa) que el público veía y que era un borrador por aprobar; el tutorial guiado recorre los mismos ejemplos sobre las pantallas
   reales con una tarjeta pensada para quien la usa. Por eso:
   - Ya no hay botón «Modo presentación» ni atajo Alt+P, y la barra del guion no se construye nunca.
   - Las direcciones que ya circulan en QR y enlaces siguen sirviendo: ?caso=N y #/caso/N abren el tutorial en ese ejemplo, con el rol
     de ?rol= si viene y es válido (docente por defecto).
   - Un estado guardado antiguo («mosaicotelar.presentacion» con activo: true) se borra al cargar: no reactiva nada.
   El módulo se deja inerte en lugar de borrarlo porque otros archivos preguntan MT.presentacion.activo() (casos.js, espacio.js,
   inicio.js) y main.js llama a desdeUrl(); así nada de eso se rompe y la respuesta es siempre «no está activo».
   css/presentacion.css sigue cargándose, pero todo cuelga de html[data-presentacion="activa"], que ya nadie pone. */
(function (MT) {
  'use strict';
  const CLAVE = 'mosaicotelar.presentacion';
  // Lo guardado por la versión anterior se olvida: si alguien ensayó con la barra del guion, no le vuelve a salir.
  try { localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento: no había nada guardado */ }

  const ROLES = ['docente', 'orientacion', 'familia', 'coordinacion', 'estudiante'];

  /* Entrar directo a un ejemplo: la dirección termina en #/caso/3 (también vale ?caso=3, que es lo que llevan los QR impresos).
     Se limpia la dirección y se abre el tutorial guiado en ese ejemplo. */
  async function desdeUrl() {
    if (!MT.casos || !(MT.tutorial || MT.recorridoPortal)) return;
    const m = /^#\/caso\/(\d+)\/?$/.exec(location.hash) || /[?&]caso=(\d+)/.exec(location.search);
    const n = m ? Number(m[1]) : 0;
    if (!(n >= 1 && n <= MT.casos.lista.length)) return;
    const pedido = (/[?&]rol=([a-z]+)/.exec(location.search) || [])[1];
    const rol = ROLES.includes(pedido) ? pedido : 'docente';
    history.replaceState(null, '', location.pathname + '#/');
    // dentro: el recorrido ocurre dentro del portal del rol; el número de ejemplo lo elige la persona en el portal.
    if (MT.recorridoPortal) MT.recorridoPortal.abrir(rol); else await MT.tutorial.iniciar({ rol, caso: n });
  }

  // Escribir #/caso/3 con la página ya abierta también funciona (no recarga la página, solo cambia el hash).
  window.addEventListener('hashchange', () => { if (/^#\/caso\/\d+\/?$/.test(location.hash)) desdeUrl(); });

  // La misma forma de antes, sin efecto: activo() siempre es falso y alternar/ir/reiniciar no encienden nada.
  const nada = () => {};
  MT.presentacion = { desdeUrl, iniciar: nada, alternar: nada, activo: () => false, paso: () => 0, ir: nada, reiniciar: nada };
})(window.MT = window.MT || {});
