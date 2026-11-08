# -*- coding: utf-8 -*-
"""
auditar.py: prueba Mosaico Telar en un navegador real.

    python herramientas/auditar.py            # todo
    python herramientas/auditar.py --enlaces  # además, comprueba que los enlaces externos respondan
    python herramientas/auditar.py --dist     # prueba la copia empaquetada (herramientas/empaquetar.py) con el mismo arnés

Por qué existe: los fallos de una página como esta (desbordes en el celular, texto que no se
lee en el tema oscuro, un botón que no hace nada) no se ven leyendo el código. Se ven midiendo.
Esto deja ese método como herramienta, para repetirlo antes de cada publicación.

Qué hace
--------
1. Revisa que cada archivo que referencia index.html exista.
2. Sirve la carpeta por http y abre herramientas/arnes.html en Chrome sin pantalla. El arnés
   recorre todas las pantallas en 390 y 1280 px de ancho, en tema claro y oscuro, y mide:
   desborde horizontal, errores de ejecución, un único h1, controles sin nombre, controles de
   menos de 24 px y contraste del texto (4,5 a 1, o 3 a 1 en texto grande).
3. Ejecuta el recorrido completo como lo haría una persona: ajustar como docente, aprobar en
   Orientación, verlo en Familia, recibirlo como estudiante, hacer el quiz y hablar con
   Niky.
4. Imprime un informe. Sale con código 1 si algo falla.

Necesita Chrome o Edge instalado. No instala nada y no envía datos a ningún sitio.
"""

import html
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAVEGADORES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]


def encontrar_navegador():
    for ruta in NAVEGADORES:
        if os.path.exists(ruta):
            return ruta
    return None


def revisar_referencias(raiz=None):
    """Cada src y href local de index.html, y cada url() de las hojas de estilo, debe existir."""
    raiz = raiz or RAIZ
    fallos = []
    with open(os.path.join(raiz, 'index.html'), encoding='utf-8') as f:
        texto = f.read()
    refs = re.findall(r'(?:src|href)="([^"#?:]+)"', texto)
    for css in re.findall(r'href="(css/[^"]+)"', texto):
        with open(os.path.join(raiz, css), encoding='utf-8') as f:
            base = os.path.dirname(css)
            refs += [os.path.normpath(os.path.join(base, u)).replace('\\', '/')
                     for u in re.findall(r'url\("?([^")]+)"?\)', f.read())]
    for ref in sorted(set(refs)):
        if ref.startswith('data:') or 'data:image' in ref:
            continue  # imágenes incrustadas en el propio CSS
        if not os.path.exists(os.path.join(raiz, ref)):
            fallos.append('falta el archivo ' + ref)
    return fallos


def puerto_libre():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class Silencioso(SimpleHTTPRequestHandler):
    resultado = None  # lo llena el arnés al terminar

    def log_message(self, *args):  # sin ruido en la consola
        pass

    def do_POST(self):
        # El arnés entrega aquí su informe cuando termina.
        if self.path == '/__resultado':
            largo = int(self.headers.get('Content-Length', 0))
            Silencioso.resultado = json.loads(self.rfile.read(largo).decode('utf-8'))
            self.send_response(204)
        else:
            self.send_response(404)
        self.end_headers()


def servir(raiz=None):
    puerto = puerto_libre()
    servidor = ThreadingHTTPServer(('127.0.0.1', puerto), partial(Silencioso, directory=raiz or RAIZ))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor, puerto


def correr_arnes(navegador, puerto):
    """Abre el arnés en Chrome y espera a que entregue su informe. Corre en tiempo real: la página incrusta
    proyectos que cargan desde internet, y el modo de tiempo virtual de Chrome se detiene con eso."""
    perfil = tempfile.mkdtemp(prefix='mt_audit_')  # perfil limpio: sin extensiones ni caché
    Silencioso.resultado = None
    url = f'http://127.0.0.1:{puerto}/herramientas/arnes.html'
    proc = subprocess.Popen([navegador, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--user-data-dir={perfil}', url],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        limite = time.time() + 600
        while Silencioso.resultado is None and time.time() < limite:
            time.sleep(1)
    finally:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(proc.pid)], capture_output=True)
        else:
            proc.terminate()
    if Silencioso.resultado is None:
        raise RuntimeError('El arnés no devolvió resultados en 10 minutos.')
    return Silencioso.resultado


def comprobar_enlaces():
    """Cada enlace externo que aparece en el código debe responder. Ignora la ruta /issues/new."""
    urls = set()
    for carpeta, _, archivos in os.walk(RAIZ):
        if '.git' in carpeta:
            continue
        for a in archivos:
            if a.endswith(('.js', '.html', '.md')):
                with open(os.path.join(carpeta, a), encoding='utf-8') as f:
                    urls |= set(re.findall(r"https://[^\s'\")<>]+", f.read()))
    fallos = []
    for u in sorted(urls):
        u = u.rstrip('.,;')
        if u.endswith('/issues/new') or 'fonts.googleapis' in u:
            continue
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (auditar.py)'})
            urllib.request.urlopen(req, timeout=15)
        except Exception as e:
            fallos.append(f'{u} -> {e}')
    return fallos, len(urls)


def main():
    # La consola de Windows usa una página de códigos que rompe las tildes.
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    problemas = 0
    print('Mosaico Telar: auditoría\n')

    # --dist: se arma la copia empaquetada en una carpeta temporal (con el arnés dentro) y se prueba esa, no la de la raíz.
    raiz = RAIZ
    if '--dist' in sys.argv:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import empaquetar
        raiz = os.path.join(tempfile.mkdtemp(prefix='mt_dist_'), 'sitio')
        medidas = empaquetar.construir(raiz, con_pruebas=True)
        print(f"Copia empaquetada: {medidas['archivos_de_codigo_antes']} archivos de código -> {medidas['archivos_de_codigo_despues']}\n")

    refs = revisar_referencias(raiz)
    print('1. Archivos referenciados:', 'todos existen' if not refs else '')
    for r in refs:
        print('   FALLA', r)
    problemas += len(refs)

    navegador = encontrar_navegador()
    if not navegador:
        print('\nNo encontré Chrome ni Edge: no puedo medir en un navegador.')
        return 1

    servidor, puerto = servir(raiz)
    try:
        datos = correr_arnes(navegador, puerto)
    finally:
        servidor.shutdown()

    if datos.get('fatal'):
        print('\nEl arnés tuvo un error (se muestran los resultados parciales):\n', datos['fatal'])
        problemas += 1

    casos = datos['casos']
    malos = [c for c in casos if c['fallos']]
    medidos = sum(c['contraste']['medidos'] for c in casos)
    omitidos = sum(c['contraste']['omitidos'] for c in casos)
    print(f'\n2. Pantallas: {len(casos)} casos (pantallas x 2 anchos x 2 temas), {len(malos)} con fallos.')
    print(f'   Contraste: {medidos} textos medidos; {omitidos} sobre degradado omitidos (se revisan a ojo).')
    for c in malos:
        print(f"   FALLA {c['ruta']} {c['ancho']}px tema {c['tema']}")
        for f in c['fallos']:
            print('      -', f)
    problemas += len(malos)

    flujo = datos['flujo']
    malos_f = [x for x in flujo if not x['ok']]
    print(f'\n3. Recorrido completo: {len(flujo) - len(malos_f)} de {len(flujo)} comprobaciones bien.')
    for x in malos_f:
        print('   FALLA', x['nombre'], '|', x['detalle'])
    problemas += len(malos_f)

    if '--enlaces' in sys.argv:
        fallos, total = comprobar_enlaces()
        print(f'\n4. Enlaces externos: {total - len(fallos)} de {total} responden.')
        for f in fallos:
            print('   FALLA', f)
        problemas += len(fallos)

    print('\nResultado:', 'todo bien.' if not problemas else f'{problemas} problema(s).')
    return 1 if problemas else 0


if __name__ == '__main__':
    sys.exit(main())
