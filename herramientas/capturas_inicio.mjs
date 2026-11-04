// capturas_inicio.mjs: regenera las dos capturas del inicio (assets/capturas/docente.jpg y estudiante.jpg) desde la plataforma real, para que la
// vista previa de la bienvenida nunca quede desactualizada. Se corre cada vez que cambie el aspecto de Mi espacio, y siempre antes de congelar una versión.
//   node herramientas/capturas_inicio.mjs [http://127.0.0.1:8791]
// Usa el cliente de depuración de qa_cdp.mjs (Chrome) y deja el sitio con sus datos de ejemplo, en el tema claro, sin movimiento y a 1280 x 800.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrir } from './qa_cdp.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8791';
const PANTALLAS = [['docente', 'docente', '#/mi/actividades'], ['estudiante', 'estudiante', '#/mi/resumen']];

const nav = await abrir({ ancho: 1280, alto: 800, puerto: 9461 });
try {
  await nav.medio({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: 'light' }] });
  await nav.ir(BASE + '/', 2500);
  for (const [archivo, rol, ruta] of PANTALLAS) {
    await nav.evaluar(`MT.store.cambiar((s) => { s.rol = '${rol}'; }); location.hash = '${ruta}'; true`);
    await nav.esperar(1800);
    const r = await nav.enviar('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
    const destino = path.join(RAIZ, 'assets', 'capturas', archivo + '.jpg');
    fs.writeFileSync(destino, Buffer.from(r.result.data, 'base64'));
    console.log('capturada', destino);
  }
  await nav.evaluar(`MT.store.cambiar((s) => { s.rol = null; }); location.hash = '#/'; true`);
} finally { nav.cerrar(); }
