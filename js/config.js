/* config.js: lo único que se cambia al publicar. Sin claves ni secretos: este archivo es público.

   contacto: correo al que llegan las solicitudes de piloto. Si queda vacío, la página de piloto muestra
   la información sin el formulario.
   portales: dirección pública de cada aplicación. Niky no tiene dirección propia: vive dentro de la
   plataforma. */
(function (MT) {
  'use strict';
  MT.config = {
    nombre: MT.nombre,   // «Sinapsis Education»: se define en js/mensajes.js, que carga antes
    /* Registro de correo («Dejar mi correo», «Con tu correo», «Conversar sobre mi colegio»). Apagado a propósito: dice «te escribiremos» y todavía no hay
       a dónde enviarlo (ni servidor ni correo de contacto). Mientras esté apagado esas ofertas no se muestran y la conversación se canaliza por la página
       de piloto, que abre el correo de quien escribe. Se enciende (true) cuando haya `api` o `contacto`. */
    mostrarRegistro: false,
    contacto: '',
    /* Estilo de la página (data-estilo en <html>: "hilo", "piezas" o "taller"). Apagado: no hay selector en Apariencia y el atributo no se
       aplica, así que el sitio se ve exactamente como hoy. Se enciende (true) cuando el dueño elija y existan las capas visuales de
       css/estilo-hilo.css, css/estilo-piezas.css y css/estilo-taller.css. */
    mostrarEstilos: false,
    // Dirección del servidor (por ejemplo https://api.ejemplo.co). Vacía: el registro se reserva en este dispositivo.
    api: '',        // al configurarla, agrega su dirección a connect-src en la política de seguridad de index.html
    portales: {
      kinesis: 'https://profenapaipa.github.io/Kinesis/',
      wisfox: 'https://profenapaipa.github.io/wisfox/',
    },
  };
})(window.MT = window.MT || {});
