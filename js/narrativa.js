/* narrativa.js: la voz y el hilo del relato de la plataforma (quién habla, qué dice y con qué emoción, en cada momento del recorrido).
   CONTRATO (lo consumen la entrada, los espacios y Niky; si falta una línea devuelve null y quien llama no pinta nada):
     MT.narrativa.linea(contexto, datos) -> { texto, emocion, quien } | null
       contexto: 'bienvenida' | 'rol:<id>' | 'portal:<kinesis|wisfox|niky>' | 'paso:<rol>:<n>' | 'exito' | 'espera' | 'error' | 'vacio'
       emocion: 'contento' | 'curioso' | 'pensando' | 'celebra' | 'animo' | 'sorprendido' | 'duda'
       quien: id de mascota ('sinapso' | 'kinesis' | 'wisfox' | 'niky')
   Versión provisional: no dice nada hasta que el agente de narrativa la complete. */
(function (MT) {
  'use strict';
  MT.narrativa = { linea() { return null; } };
})(window.MT = window.MT || {});
