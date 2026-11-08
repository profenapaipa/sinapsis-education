/* sw.js: el service worker. Guarda la "cáscara" de Mosaico Telar (página, estilos, scripts, tipografías e íconos) para que la
   plataforma abra y funcione sin internet.

   Dónde vive: el sitio se publica en una subruta de GitHub Pages (/mosaicotelar/), así que NADA aquí usa rutas que empiecen por "/".
   Todo se resuelve contra el alcance del worker (self.registration.scope), que es la carpeta donde está este archivo. Por eso la misma
   copia funciona en /mosaicotelar/, en la raíz de un servidor local o dentro de otra carpeta.

   Dos cuidados por compartir dominio con Kinesis y Wisfox (profenapaipa.github.io):
   - Solo se atienden las direcciones dentro del alcance de este worker. Los portales viven en otra subruta y ni siquiera llegan aquí.
   - Al limpiar cachés viejas solo se borran las que empiezan por "mosaicotelar-"; las de los otros proyectos no se tocan.

   Cómo se mantiene al día (el sitio se publica a menudo):
   - Los archivos de la cáscara se sirven al instante desde la caché y se revisan en segundo plano ("stale-while-revalidate"): la
     siguiente vez que se abra la página ya trae lo publicado, sin que nadie suba una versión. Si lo publicado cambió, se avisa en
     pantalla con un botón para recargar (js/conexion.js); no se recarga solo, para no interrumpir una demostración.
   - Las tipografías no cambian: se sirven siempre desde la caché.
   - VERSION solo hay que subirla cuando cambia ESTE archivo: la lista de CASCARA o la lógica. La prueba de herramientas/arnes.html
     comprueba que todo lo que carga index.html esté en la lista, así que un archivo nuevo sin registrar se detecta antes de publicar. */
'use strict';

const VERSION = 'v6';
const PREFIJO = 'mosaicotelar-';
const CACHE = PREFIJO + VERSION;

// Rutas relativas al alcance del worker. './' es la página cuando se entra por la carpeta, sin escribir index.html.
const CASCARA = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/favicon.svg',
  'assets/logo.svg',
  'assets/logo-color-fondo-blanco.svg',
  'assets/logo-color-fondo-negro.svg',
  'assets/logo-bn-fondo-blanco.svg',
  'assets/logo-bn-fondo-negro.svg',
  'assets/icono-192.png',
  'assets/icono-512.png',
  'assets/capturas/docente.jpg',
  'assets/capturas/estudiante.jpg',
  'css/animacion.css',
  'css/simbolos.css',
  'css/mascotas.css',
  'css/entrada.css',
  'css/niky.css',
  'css/estilo.css',
  'css/estilo-hilo.css',
  'css/estilo-piezas.css',
  'css/estilo-taller.css',
  'css/movil.css',
  'css/base.css',
  'css/calmado.css',
  'css/fuentes.css',
  'css/layout.css',
  'css/navegacion.css',
  'css/planes.css',
  'css/portales-vivos.css',
  'css/presentacion.css',
  'css/tokens.css',
  'css/vistas.css',
  'fonts/newsreader-italic.woff2',
  'fonts/newsreader-normal.woff2',
  'fonts/nunito-400.woff2',
  'fonts/nunito-600.woff2',
  'fonts/nunito-800.woff2',
  'fonts/nunito-900.woff2',
  'js/archivos.js',
  'js/barra.js',
  'js/casos.js',
  'js/entrada.js',
  'js/biblioteca.js',
  'js/conexion.js',
  'js/config.js',
  'js/contenido-ingles.js',
  'js/datos.js',
  'js/dialogos.js',
  'js/guias.js',
  'js/ia-config.js',
  'js/ia.js',
  'js/niky.js',
  'js/main.js',
  'js/mensajes.js',
  'js/movimiento.js',
  'js/plan.js',
  'js/presentacion.js',
  'js/red-de-seguridad.js',
  'js/roles.js',
  'js/router.js',
  'js/store.js',
  'js/tejido.js',
  'js/tema.js',
  'js/ui.js',
  'js/simbolos.js',
  'js/mascotas.js',
  'js/narrativa.js',
  'js/vivos.js',
  'js/vistas/comun.js',
  'js/vistas/creditos.js',
  'js/vistas/espacio.js',
  'js/vistas/construccion.js',
  'js/vistas/estado.js',
  'js/vistas/glosario.js',
  'js/vistas/identidad.js',
  'js/vistas/inicio.js',
  'js/vistas/mapa.js',
  'js/vistas/piloto.js',
  'js/vistas/planes.js',
  'js/vistas/portales.js',
  'js/vistas/recorrido.js',
  'js/vistas/valeria.js',
];

const alcance = () => self.registration.scope;
const absoluta = (ruta) => new URL(ruta, alcance()).href;
const INICIO = () => absoluta('index.html');

/* Instalación: se baja toda la cáscara, saltándose la caché HTTP (GitHub Pages guarda diez minutos y se instalaría una mezcla de
   versiones). Si un solo archivo falla, la instalación falla entera y el worker anterior sigue sirviendo: mejor eso que una cáscara
   incompleta que se quedaría sin abrir justo sin internet. */
self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CASCARA.map(async (ruta) => {
      const url = absoluta(ruta);
      const respuesta = await fetch(url, { cache: 'reload' });
      if (!respuesta.ok) throw new Error(`No se pudo guardar ${ruta} (${respuesta.status})`);
      // La carpeta y index.html son la misma página: se guarda también bajo index.html para responder a cualquiera de las dos.
      await cache.put(ruta === './' ? INICIO() : url, respuesta);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n.startsWith(PREFIJO) && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  if (!pedido.url.startsWith(alcance())) return;       // otro origen, u otra subruta del mismo dominio: no es de este worker
  evento.respondWith(responder(evento, pedido));
});

const SIN_RESPUESTA = () => new Response('Sin conexión y sin copia guardada.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

async function responder(evento, pedido) {
  const cache = await caches.open(CACHE);
  // Entrar por la carpeta, por index.html o con cualquier ?parámetro es la misma página (las rutas del sitio van tras el #).
  const esPagina = pedido.mode === 'navigate';
  const clave = esPagina ? INICIO() : pedido.url;
  const guardado = await cache.match(clave, { ignoreSearch: !esPagina, ignoreVary: true });
  const refresco = refrescar(cache, clave, guardado);
  if (guardado) {
    // Las tipografías no cambian: no se revisan. Lo demás se revisa en segundo plano y se tiene la última versión la próxima vez.
    if (!/\.woff2$/.test(clave)) evento.waitUntil(refresco.catch(() => {}));
    return guardado;
  }
  try { return await refresco; } catch (e) { return SIN_RESPUESTA(); }
}

// Pide la versión publicada (sin usar la caché HTTP), la guarda y, si cambió, avisa a las páginas abiertas.
async function refrescar(cache, clave, anterior) {
  if (anterior && /\.woff2$/.test(clave)) return anterior;
  const respuesta = await fetch(clave, { cache: 'no-cache' });
  if (respuesta.ok && respuesta.type === 'basic') {
    await cache.put(clave, respuesta.clone());
    if (anterior && cambio(anterior, respuesta)) avisarVersionNueva();
  }
  return respuesta;
}

// Se compara con lo que el servidor declara (ETag o fecha de modificación). Si no declara nada, no se afirma que haya cambiado.
function cambio(vieja, nueva) {
  for (const campo of ['etag', 'last-modified']) {
    const a = vieja.headers.get(campo); const b = nueva.headers.get(campo);
    if (a && b) return a !== b;
  }
  return false;
}
async function avisarVersionNueva() {
  const paginas = await self.clients.matchAll({ type: 'window' });
  paginas.forEach((p) => p.postMessage({ tipo: 'version-nueva' }));
}
