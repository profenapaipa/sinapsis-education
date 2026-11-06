# -*- coding: utf-8 -*-
"""
paleta.py: valida la paleta de Mosaico Telar, con los mismos chequeos que ofrece Adobe Color.

    python herramientas/paleta.py

Por qué existe: Adobe Color es una herramienta web interactiva y no se puede automatizar, así que
aquí se reproducen sus tres chequeos, para poder repetirlos antes de cada cambio de color:

1. Armonía: los ángulos de tono entre los colores (rueda cromática, en OKLCH).
2. Contraste: razón WCAG del texto sobre cada superficie.
3. Daltonismo: cuánto se parecen entre sí los tres colores de hilo vistos con protanopía,
   deuteranopía y tritanopía (distancia ΔE en OKLab, escala x100). Por debajo de 8 se confunden.

Para repetirlo a mano en Adobe Color: https://color.adobe.com, "Extract" o "Create", y se pegan los
códigos hex de abajo; "Accessibility tools" muestra el contraste y la simulación de daltonismo.

No necesita instalar nada: solo Python 3.

Nota: el validador del skill de visualización solo compara colores adyacentes; esta herramienta compara
todos los pares, y por eso encontró que el océano claro se confundía con el verde en tritanopía.
"""
import math
import sys

HILOS = {'Verde bosque (Kinesis)': '#1B7F56', 'Ámbar (Wisfox)': '#E8A13C', 'Azul tinta (Niky)': '#2B4FA3'}
DESCARTADO = {'Terracota (descartado)': '#D9604F'}
SUPERFICIES = {'Papel': '#FFFFFF', 'Lino': '#F6F2EA', 'Tinta': '#1A1714'}


def lineal(hexa):
    r, g, b = (int(hexa[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return [f(r), f(g), f(b)]


def luminancia(hexa):
    r, g, b = lineal(hexa)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    x, y = luminancia(a), luminancia(b)
    return (max(x, y) + 0.05) / (min(x, y) + 0.05)


def oklab(rgb):
    """RGB lineal a OKLab (Björn Ottosson, 2020)."""
    r, g, b = rgb
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s]


def tono(hexa):
    _, a, b = oklab(lineal(hexa))
    return math.degrees(math.atan2(b, a)) % 360


def delta_e(rgb1, rgb2):
    a, b = oklab(rgb1), oklab(rgb2)
    return 100 * math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


# Simulación de daltonismo (Machado et al. 2009, severidad completa), sobre RGB lineal.
MATRICES = {
    'protanopía': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    'deuteranopía': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    'tritanopía': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}


def simular(hexa, m):
    v = lineal(hexa)
    return [max(0.0, min(1.0, sum(m[i][j] * v[j] for j in range(3)))) for i in range(3)]


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    print('Paleta de Mosaico Telar\n')

    print('1. Armonía (tono en OKLCH, 0 a 360 grados)')
    nombres = list(HILOS)
    tonos = [tono(h) for h in HILOS.values()]
    for n, t in zip(nombres, tonos):
        print(f'   {n:26s} {t:6.1f}°')
    sep = sorted((tonos[(i + 1) % 3] - tonos[i]) % 360 for i in range(3))
    print(f'   Separación entre hilos: {", ".join(f"{x:.0f}°" for x in sep)} (una tríada perfecta sería 120° y 120° y 120°)')
    print('   Lectura: verde, ámbar y azul cubren los tres sectores de la rueda; no hay dos en el mismo sector.\n')

    print('2. Contraste del texto (WCAG: 4,5 para texto, 3 para texto grande y gráficos)')
    todos = {**HILOS, 'Verde para texto (#166A47)': '#166A47'}
    for n, h in todos.items():
        fila = '   ' + f'{n:28s}' + ''.join(f' {s}: {contraste(h, c):4.1f}' for s, c in SUPERFICIES.items())
        print(fila)
    print('   El ámbar no pasa 4,5 sobre papel: por eso identifica pero nunca lleva texto encima.\n')

    print('3. Daltonismo: ΔE entre pares de hilos (>= 8 se distinguen; < 8 se confunden)')
    descartada_a = {'Verde bosque (Kinesis)': '#1B7F56', 'Terracota (descartado)': '#D9604F', 'Azul tinta (Niky)': '#2B4FA3'}
    descartada_b = {'Verde bosque (Kinesis)': '#1B7F56', 'Ámbar (Wisfox)': '#E8A13C', 'Océano claro (descartado)': '#1D6FB8'}
    for etiqueta, conjunto in (('Paleta elegida', HILOS), ('Descartada: con terracota', descartada_a), ('Descartada: con el océano claro', descartada_b)):
        print(f'   {etiqueta}')
        items = list(conjunto.items())
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                (n1, h1), (n2, h2) = items[i], items[j]
                d = {'visión normal': delta_e(lineal(h1), lineal(h2))}
                for nom, m in MATRICES.items():
                    d[nom] = delta_e(simular(h1, m), simular(h2, m))
                peor = min(d.values())
                marca = 'OK ' if peor >= 8 else 'FALLA'
                print(f'     [{marca}] {n1.split(" (")[0]} / {n2.split(" (")[0]}: ' + ', '.join(f'{k} {v:.0f}' for k, v in d.items()))
    print()


if __name__ == '__main__':
    main()
