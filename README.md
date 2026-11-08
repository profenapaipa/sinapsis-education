# Mosaico Telar

Plataforma de educación inclusiva con tecnología. *Tejemos caminos para aprender.*

El docente planea una clase con el Diseño Universal para el Aprendizaje, orientación valida los ajustes, la familia ve el proceso y cada estudiante recibe la actividad a su medida. Reúne a Kinesis (el aula), Wisfox (el estudiante) y Niky (la guía).

Para verla, abre `index.html` o la página publicada. No necesita instalación ni servidor, y lo que se crea queda solo en el navegador de quien lo usa.

Un proyecto en construcción del Semillero Maker de Tecnología con Sentido.

## Exposición guiada (muestra del 9 de noviembre de 2026)

El modo presentación (botón «Modo presentación» o Alt+P) trae cinco casos preparados con un mismo recorrido: coordinación, orientación, docente, familia, estudiante y Niky, con un solo ejemplo. En cada exposición se usa un caso. Cada paso dice quién habla (Kinesis, Wisfox, Niky o todas y todos) y cuánto dura; un caso dura de 9 a 10 minutos y medio.

Para entrar directo a un caso, la dirección termina en `#/caso/1` a `#/caso/5` (por ejemplo `index.html#/caso/3`). También se elige en el selector «Caso» del guion. Los casos y su guion están en `js/casos.js`; la prueba que los recorre completos es `node herramientas/qa_exposicion.mjs http://localhost:8765`.

Los datos son de ejemplo, con códigos y sin diagnósticos. Los recursos de cada caso (imágenes, audios, tarjetas) están pendientes.
