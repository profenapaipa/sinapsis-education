/* ia-config.js: el único archivo que se toca para conectar Niky.

   proveedor:
     'auto'      (por defecto) Pregunta a /api/estado del mismo sitio. Si responde que hay IA,
                 usa el servidor; si no, Niky responde con textos de ejemplo.
     'simulado'  Siempre textos de ejemplo. Sirve para ensayar sin conexión.
     'servidor'  Igual que 'auto' pero sin la opción de volver a simulado al detectar.

   El servidor del piloto (Mosaico Telar/02_Piloto/app/server.js) ya expone /api/estado y
   POST /api/valeria con { tarea, texto } y responde { fuente, texto }. Para usarlo basta
   servir esta página desde ese servidor (mismo origen) y dejar base en ''.

   Las claves NUNCA van aquí: esta página es pública. Viven en el servidor, como variable
   de entorno. */
(function (MT) {
  'use strict';
  MT.iaConfig = {
    proveedor: 'auto',
    base: '',            // vacío = el mismo sitio. Otro origen exigiría configurar CORS en el servidor.
    deteccion: 2500,     // ms para saber si hay servidor
    espera: 8000,        // ms para que responda el modelo
  };
})(window.MT = window.MT || {});
