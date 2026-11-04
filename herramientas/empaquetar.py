# -*- coding: utf-8 -*-
"""
empaquetar.py: genera una copia del sitio con pocos archivos, en dist/.

    python herramientas/empaquetar.py                  # dist/ con las hojas de estilo y los scripts unidos y sin comentarios
    python herramientas/empaquetar.py --sin-minificar  # solo une los archivos (para depurar el empaquetado)
    python herramientas/empaquetar.py --destino X      # otra carpeta
    python herramientas/empaquetar.py --con-pruebas    # copia también herramientas/arnes.html (lo usa auditar.py --dist)

Por qué existe: la página pide 51 archivos de código (13 hojas de estilo y 38 scripts). En una conexión 3G rápida el primer contenido
tarda unos 8 s, casi todo por la cantidad de solicitudes (cada una paga su latencia), no por los bytes. Aquí se unen en tres archivos
sin cambiar de lugar ninguna línea de código:

    css/mosaico.css   las 16 hojas de estilo, en el mismo orden de index.html
    js/inicio.js      red-de-seguridad.js y tema.js, que deben correr antes de pintar (van en <head>)
    js/mosaico.js     los scripts del final del <body>, en el mismo orden

Reglas que se respetan:
- NO es obligatorio. El sitio de la raíz (index.html con sus archivos sueltos) sigue funcionando igual, también abierto desde el disco
  (file://). Esta carpeta es una copia para publicar o para llevar en la USB; no reemplaza al original.
- Sin dependencias: solo Python 3. No usa Node ni paquetes. El "minificado" solo quita comentarios y espacios de sobra con un
  recorrido que respeta cadenas, plantillas y expresiones regulares; no renombra nada, así que los errores de la consola siguen
  señalando nombres legibles. Si algo se ve raro, --sin-minificar descarta que sea el minificado.
- El service worker de dist/ se genera a partir del de la raíz: misma lista, cambiando solo los archivos de código por los tres unidos.
- El mismo arnés (herramientas/arnes.html) prueba esta copia con `python herramientas/auditar.py --dist`.
"""

import argparse
import os
import re
import shutil
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RE_CSS = re.compile(r'[ \t]*<link rel="stylesheet" href="(css/[^"]+)">[ \t]*\r?\n?')
RE_JS = re.compile(r'[ \t]*<script src="(js/[^"]+)"></script>[ \t]*\r?\n?')


# ---------------------------------------------------------------------------------------------------------------------------
# Minificado de JavaScript: quita comentarios y espacios de sobra. Respeta cadenas, plantillas (con ${...} anidadas) y regex.
# ---------------------------------------------------------------------------------------------------------------------------

_ANTES_DE_REGEX = set('(,=:[!&|?{};+-*%<>~^')
_PALABRAS_ANTES_DE_REGEX = {'return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'instanceof'}


def _fin_cadena(s, i):
    """s[i] es ' o ": devuelve el índice justo después de la comilla de cierre."""
    comilla = s[i]
    i += 1
    while i < len(s):
        if s[i] == '\\':
            i += 2
        elif s[i] == comilla:
            return i + 1
        else:
            i += 1
    raise ValueError('cadena sin cerrar')


def _fin_plantilla(s, i):
    """s[i] es `: devuelve el índice después del ` de cierre, saltando las expresiones ${ ... } (que pueden traer cadenas y plantillas)."""
    i += 1
    while i < len(s):
        c = s[i]
        if c == '\\':
            i += 2
        elif c == '`':
            return i + 1
        elif c == '$' and s[i + 1:i + 2] == '{':
            i = _fin_llaves(s, i + 2)
        else:
            i += 1
    raise ValueError('plantilla sin cerrar')


def _fin_llaves(s, i):
    """Dentro de ${ ...: devuelve el índice después de la } que cierra. Las cadenas y plantillas anidadas se saltan completas."""
    nivel = 1
    while i < len(s):
        c = s[i]
        if c in '\'"':
            i = _fin_cadena(s, i)
        elif c == '`':
            i = _fin_plantilla(s, i)
        elif c == '{':
            nivel += 1
            i += 1
        elif c == '}':
            nivel -= 1
            i += 1
            if nivel == 0:
                return i
        else:
            i += 1
    raise ValueError('${ sin cerrar')


def _fin_regex(s, i):
    """s[i] es la / que abre una expresión regular: devuelve el índice después de sus banderas."""
    i += 1
    en_clase = False
    while i < len(s):
        c = s[i]
        if c == '\\':
            i += 2
            continue
        if c == '[':
            en_clase = True
        elif c == ']':
            en_clase = False
        elif c == '/' and not en_clase:
            i += 1
            while i < len(s) and (s[i].isalnum() or s[i] == '_'):
                i += 1
            return i
        elif c == '\n':
            raise ValueError('regex con salto de línea')
        i += 1
    raise ValueError('regex sin cerrar')


def minificar_js(s):
    s = s.replace('\r\n', '\n')
    out = []
    i, n = 0, len(s)
    previo = ''          # último carácter significativo emitido
    palabra = ''         # última palabra completa emitida (para return / typeof ...)
    while i < n:
        c = s[i]
        if c in '\'"':
            j = _fin_cadena(s, i)
            out.append(s[i:j]); i = j; previo = '"'; palabra = ''
        elif c == '`':
            j = _fin_plantilla(s, i)
            out.append(s[i:j]); i = j; previo = '"'; palabra = ''
        elif c == '/' and s[i + 1:i + 2] == '/':
            j = s.find('\n', i)
            i = n if j < 0 else j            # el salto de línea se procesa como espacio en blanco
        elif c == '/' and s[i + 1:i + 2] == '*':
            j = s.find('*/', i + 2)
            if j < 0:
                raise ValueError('comentario sin cerrar')
            con_salto = '\n' in s[i:j]
            i = j + 2
            out.append('\n' if con_salto else ' ')   # nunca pegar dos símbolos que estaban separados; ni perder un salto de línea
        elif c == '/' and (previo == '' or previo in _ANTES_DE_REGEX or palabra in _PALABRAS_ANTES_DE_REGEX):
            j = _fin_regex(s, i)
            out.append(s[i:j]); i = j; previo = ')'; palabra = ''
        elif c.isspace():
            j = i
            while j < n and s[j].isspace():
                j += 1
            out.append('\n' if '\n' in s[i:j] else ' ')
            i = j
        else:
            if c.isalnum() or c in '_$':
                j = i
                while j < n and (s[j].isalnum() or s[j] in '_$'):
                    j += 1
                palabra = s[i:j]
                out.append(palabra); i = j; previo = 'a'
            else:
                out.append(c); i += 1; previo = c; palabra = ''
    texto = ''.join(out)
    # Una sola pasada final: sin espacios al borde de cada línea y sin líneas vacías (los saltos de línea sí se conservan: protegen de la
    # inserción automática de punto y coma). Las plantillas multilínea ya salieron intactas porque se copiaron enteras arriba, pero
    # esta pasada trabaja sobre el texto ya unido, así que se vuelve a proteger saltando las líneas que están dentro de una plantilla.
    return _recortar_lineas(texto)


def _recortar_lineas(texto):
    """Quita espacios al borde de las líneas y las líneas vacías, sin tocar el interior de cadenas ni plantillas."""
    salida = []
    i, n = 0, len(texto)
    inicio_linea = True
    while i < n:
        c = texto[i]
        if c in '\'"':
            j = _fin_cadena(texto, i); salida.append(texto[i:j]); i = j; inicio_linea = False
        elif c == '`':
            j = _fin_plantilla(texto, i); salida.append(texto[i:j]); i = j; inicio_linea = False
        elif c == '/' and i + 1 < n and texto[i + 1] not in '/*' and _parece_regex(salida):
            try:
                j = _fin_regex(texto, i)
            except ValueError:
                j = i + 1
            salida.append(texto[i:j]); i = j; inicio_linea = False
        elif c == '\n':
            if salida and salida[-1] != '\n':
                while salida and salida[-1] == ' ':
                    salida.pop()
                salida.append('\n')
            i += 1; inicio_linea = True
        elif c == ' ' and inicio_linea:
            i += 1
        else:
            salida.append(c); i += 1; inicio_linea = False
    return ''.join(salida).strip() + '\n'


def _parece_regex(salida):
    """En la pasada final: ¿la / que sigue abre una regex? Mismo criterio que arriba, mirando lo ya emitido."""
    for x in reversed(salida):
        if x in (' ', '\n'):
            continue
        ultimo = x[-1]
        if ultimo in _ANTES_DE_REGEX:
            return True
        m = re.search(r'[A-Za-z_$]+$', x)
        return bool(m and m.group(0) in _PALABRAS_ANTES_DE_REGEX)
    return True


# ---------------------------------------------------------------------------------------------------------------------------
# Minificado de CSS
# ---------------------------------------------------------------------------------------------------------------------------

def minificar_css(s):
    s = s.replace('\r\n', '\n')
    out = []
    i, n = 0, len(s)
    while i < n:
        c = s[i]
        if c in '\'"':
            j = _fin_cadena(s, i); out.append(s[i:j]); i = j
        elif c == '/' and s[i + 1:i + 2] == '*':
            j = s.find('*/', i + 2)
            if j < 0:
                raise ValueError('comentario CSS sin cerrar')
            i = j + 2
            out.append(' ')
        elif s.startswith('url(', i) and s[i + 4:i + 5] not in '\'"':
            j = s.find(')', i)
            out.append(s[i:j + 1]); i = j + 1
        elif c.isspace():
            while i < n and s[i].isspace():
                i += 1
            out.append(' ')
        else:
            out.append(c); i += 1
    t = ''.join(out)
    # Espacios que sobran junto a { } ; , y después de : (antes de : no: " :hover" significa algo distinto de ":hover").
    # Se hace por trozos para no tocar el interior de cadenas ni de url(...).
    partes = re.split(r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|url\([^)\'"]*\))', t)
    for k in range(0, len(partes), 2):
        p = partes[k]
        p = re.sub(r' ?([{};,]) ?', r'\1', p)
        p = re.sub(r':  ?', ': ', p)    # normaliza; el espacio después de : se conserva para no tocar selectores como "a :is(...)"
        p = p.replace(';}', '}')
        partes[k] = p
    return ''.join(partes).strip() + '\n'


# ---------------------------------------------------------------------------------------------------------------------------
# Armado de dist/
# ---------------------------------------------------------------------------------------------------------------------------

def leer(ruta):
    with open(os.path.join(RAIZ, ruta), encoding='utf-8', newline='') as f:
        return f.read().replace('\r\n', '\n')


def escribir(destino, ruta, texto):
    p = os.path.join(destino, ruta)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(texto)


def construir(destino, minificar=True, con_pruebas=False):
    """Arma el sitio empaquetado en `destino`. Devuelve un dict con las medidas."""
    index = leer('index.html')
    cabeza, resto = index.split('</head>', 1)
    hojas = RE_CSS.findall(cabeza)
    js_cabeza = RE_JS.findall(cabeza)
    js_cuerpo = RE_JS.findall(resto)
    if not hojas or not js_cabeza or not js_cuerpo:
        raise RuntimeError('index.html no tiene la forma esperada (hojas, scripts del head y scripts del cuerpo)')

    if os.path.isdir(destino):
        shutil.rmtree(destino)
    os.makedirs(destino)

    css_min = minificar_css if minificar else (lambda t: t)
    js_min = minificar_js if minificar else (lambda t: t)
    crudo = {'css': 0, 'js': 0}

    def unir(rutas, minificador, clave):
        trozos = []
        for r in rutas:
            t = leer(r)
            crudo[clave] += len(t.encode('utf-8'))
            trozos.append('/* ---- ' + r + ' ---- */\n' + minificador(t) if not minificar else minificador(t))
        return '\n'.join(trozos)

    escribir(destino, 'css/mosaico.css', unir(hojas, css_min, 'css'))
    escribir(destino, 'js/inicio.js', unir(js_cabeza, js_min, 'js'))
    escribir(destino, 'js/mosaico.js', unir(js_cuerpo, js_min, 'js'))

    # index.html: la primera referencia de cada grupo se cambia por el archivo unido y las demás se quitan.
    def sustituir(texto, regex, nuevo):
        usado = [False]

        def f(m):
            if usado[0]:
                return ''
            usado[0] = True
            return nuevo + '\n'
        return regex.sub(f, texto)

    cabeza2 = sustituir(cabeza, RE_CSS, '<link rel="stylesheet" href="css/mosaico.css">')
    cabeza2 = sustituir(cabeza2, RE_JS, '<script src="js/inicio.js"></script>')
    resto2 = sustituir(resto, RE_JS, '<script src="js/mosaico.js"></script>')
    # Los dos scripts del head iban uno tras otro con una hoja en medio de ellos: el orden entre scripts y hojas no cambia nada, porque
    # tema.js solo escribe atributos en <html> y red-de-seguridad.js solo registra escuchas; ninguno lee estilos.
    escribir(destino, 'index.html', cabeza2 + '</head>' + resto2)

    # Service worker: misma lista que el de la raíz, con los tres archivos unidos en lugar de los sueltos.
    sw = leer('sw.js')
    m = re.search(r"const CASCARA = \[\n(.*?)\n\];", sw, re.S)
    if not m:
        raise RuntimeError('sw.js no tiene la forma esperada (const CASCARA = [...])')
    lista = re.findall(r"'([^']+)'", m.group(1))
    lista = [r for r in lista if not (r.startswith('css/') or r.startswith('js/'))] + ['css/mosaico.css', 'js/inicio.js', 'js/mosaico.js']
    nueva = 'const CASCARA = [\n' + '\n'.join("  '%s'," % r for r in lista) + '\n];'
    escribir(destino, 'sw.js', sw[:m.start()] + nueva + sw[m.end():])

    # Lo demás se copia tal cual.
    for carpeta in ('assets', 'fonts'):
        shutil.copytree(os.path.join(RAIZ, carpeta), os.path.join(destino, carpeta))
    shutil.copy(os.path.join(RAIZ, 'manifest.webmanifest'), destino)
    if con_pruebas:
        os.makedirs(os.path.join(destino, 'herramientas'))
        shutil.copy(os.path.join(RAIZ, 'herramientas', 'arnes.html'), os.path.join(destino, 'herramientas'))

    def tam(ruta):
        return os.path.getsize(os.path.join(destino, ruta))
    return {
        'archivos_de_codigo_antes': len(hojas) + len(js_cabeza) + len(js_cuerpo), 'archivos_de_codigo_despues': 3,
        'css_antes': crudo['css'], 'css_despues': tam('css/mosaico.css'),
        'js_antes': crudo['js'], 'js_despues': tam('js/inicio.js') + tam('js/mosaico.js'),
    }


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser(description='Genera una copia empaquetada del sitio.')
    ap.add_argument('--destino', default=os.path.join(RAIZ, 'dist'))
    ap.add_argument('--sin-minificar', action='store_true')
    ap.add_argument('--con-pruebas', action='store_true')
    a = ap.parse_args()
    r = construir(os.path.abspath(a.destino), minificar=not a.sin_minificar, con_pruebas=a.con_pruebas)
    print(f"Listo: {a.destino}")
    print(f"  Archivos de código: {r['archivos_de_codigo_antes']} -> {r['archivos_de_codigo_despues']}")
    print(f"  Hojas de estilo: {r['css_antes']:,} -> {r['css_despues']:,} bytes")
    print(f"  Scripts:         {r['js_antes']:,} -> {r['js_despues']:,} bytes")
    return 0


if __name__ == '__main__':
    sys.exit(main())
