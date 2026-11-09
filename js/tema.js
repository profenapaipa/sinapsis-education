/* tema.js: aplica la apariencia guardada antes de pintar, para que no haya un destello del tema equivocado.
   Es un archivo aparte (y no un script dentro de la página) para poder prohibir los scripts en línea en la política de seguridad. */
(function () {
  try {
    var a = JSON.parse(localStorage.getItem('mosaicotelar.apariencia') || '{}'), r = document.documentElement;
    // Por ahora la plataforma solo tiene modo claro: el oscuro no está optimizado (queda como tarea futura, el CSS se conserva). Se fuerza siempre, también si el navegador pide oscuro o si había uno guardado.
    r.dataset.tema = 'claro';
    if (a.texto === 'grande') r.dataset.texto = 'grande';
    if (a.movimiento === 'calmado') r.dataset.movimiento = 'calmado';
    // Estilo de la página: solo valores conocidos. js/main.js lo quita si MT.config.mostrarEstilos está apagado (este script corre antes de config.js).
    if (a.estilo === 'hilo' || a.estilo === 'piezas' || a.estilo === 'taller') r.dataset.estilo = a.estilo;
  } catch (e) { /* sin almacenamiento: se queda con el tema del sistema */ }
})();
