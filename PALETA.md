# La paleta de Mosaico Telar: decisión, justificación y validación

Versión 1.0, 30 de octubre de 2026.

## 1. La decisión

**Blanco y negro primero, color donde haga falta.** La estructura, el logo, los íconos y casi todo
el texto son tinta sobre papel. El color aparece solo para dos cosas: la acción y la identificación
de cada hilo.

| Color | Hex | Papel | Origen |
|---|---|---|---|
| Tinta | `#1A1714` | Monocromo: texto, estructura, logo, íconos | Un negro cálido |
| Papel | `#FFFFFF` | Monocromo: superficies | |
| Lino | `#F6F2EA` | Monocromo: fondos secundarios | Un blanco cálido que baja el brillo |
| **Verde bosque** | `#1B7F56` | **Color principal: la acción** (botones, enlaces, estados activos) y el hilo de Kinesis | Kinesis: su color de marca. Wisfox usa la misma familia (`#3D9960`, `#2E7D4F`) |
| Ámbar | `#E8A13C` | Funcional: el hilo de Wisfox y los avisos | Wisfox: su acento y el zorro. Kinesis: sus avisos y el PIAR |
| Azul tinta | `#2B4FA3` | Funcional: el hilo de Niky | El "Océano" del menú de apariencia de Kinesis (`#1D6FB8`), un paso más oscuro |

## 2. Por qué el verde es el principal

Los dos proyectos **ya eran verdes**: Kinesis en su verde bosque y Wisfox en su verde hoja. Elegir el
verde como único color principal no les cambia el tono; lo comparte. Cualquier otro color principal
habría obligado a uno de los dos a dejar de reconocerse.

Un matiz de uso: para **texto** sobre el fondo lino se usa un verde un paso más profundo (`#166A47`,
5,9:1), porque el verde de marca sobre lino da 4,5:1, justo en el límite. Los rellenos y los botones
conservan el verde de marca.

## 3. Cómo se validó

Adobe Color es una herramienta web interactiva y no se puede automatizar, así que se usaron dos
herramientas que reproducen sus chequeos y se pueden repetir:

1. **El validador de paletas del skill de visualización de datos.** Revisa luminosidad, croma,
   separación para daltonismo entre colores **adyacentes** y contraste.
2. **`herramientas/paleta.py`, hecha para este proyecto.** Revisa lo mismo para **todos** los pares,
   más la armonía por tonos. Corre con `python herramientas/paleta.py`, sin instalar nada.

Para repetirlo a mano en Adobe Color (color.adobe.com), se pegan los tres hex de los hilos y se abre
"Accessibility tools": muestra el contraste y la simulación de daltonismo.

**Por qué se usaron dos:** el validador del skill solo compara pares adyacentes y no vio que el
verde y el océano claro se confundían en tritanopía. La herramienta propia sí lo vio.

## 4. Resultados

### Armonía

| Hilo | Tono (OKLCH) |
|---|---|
| Verde bosque | 160° |
| Ámbar | 72° |
| Azul tinta | 250° |

Los tres ocupan sectores distintos de la rueda: un verde, un amarillo naranja y un azul. No es una
tríada perfecta, y no necesita serlo: lo que importa es que ningún par comparta sector.

### Contraste (WCAG: 4,5 para texto, 3 para texto grande y gráficos)

| Color | Sobre papel | Sobre lino | Sobre tinta |
|---|---|---|---|
| Verde bosque | 5,0 | 4,5 | 3,6 |
| Verde para texto | 6,6 | 5,9 | 2,7 |
| Azul tinta | 7,6 | 6,8 | 2,3 |
| **Ámbar** | **2,2** | **2,0** | 8,2 |

El ámbar **no pasa** sobre fondos claros. Por eso solo identifica y señala, y **nunca lleva texto**
encima ni se usa como texto: siempre va con el nombre al lado.

### Daltonismo (ΔE en OKLab ×100; 8 o más se distinguen, menos se confunden)

| Par | Visión normal | Protanopía | Deuteranopía | Tritanopía |
|---|---|---|---|---|
| Verde / Ámbar | 29 | 18 | 26 | 32 |
| Verde / Azul tinta | 21 | 21 | 20 | **9** |
| Ámbar / Azul tinta | 42 | 37 | 44 | 37 |

El par más exigente es verde y azul en tritanopía (9, por encima del mínimo de 8). Además, **el color
nunca va solo**: cada hilo tiene su forma (cuadrado, hexágono, círculo) y su nombre.

## 5. Lo que se descartó, y por qué

| Alternativa | Por qué se descartó |
|---|---|
| **Terracota** `#D9604F` con el verde | Parecía más cálido y artesanal, pero junto al verde es **indistinguible para protanopía** (ΔE 1) |
| **Océano claro** `#1D6FB8` con el verde | Casi se confunde con el verde en **tritanopía** (ΔE 3,5). Se oscureció a `#2B4FA3` |
| **Uva** `#6B4FC8` (otro preset de Kinesis) | Pasa los chequeos (ΔE 8,4), pero es el morado que se lee como "inteligencia artificial", justo lo que se quiso evitar |
| Fondos oscuros azul noche y degradados pastel | Se leían como "plataforma de IA en la nube". Se reemplazaron por tinta, lino y filetes finos |
| La chispa de cuatro puntas para Niky | Es el ícono genérico de IA. Se reemplazó por un círculo con una "V" sencilla |

## 6. Modo oscuro

La tinta se invierte (`#F4F0E8` sobre `#141210`). Los colores suben de luminosidad para mantener
contraste y separación: verde `#5CC08A`, azul `#6F8FE8` (ΔE 8,5 contra el verde, 6,0:1 de contraste) y
ámbar sin cambios para identificar.

## 7. Reglas de uso

1. El verde es para la **acción**. Un elemento verde se puede tocar o está activo.
2. El ámbar y el azul identifican un hilo o dan un aviso; no decoran.
3. El color nunca va solo: siempre hay texto, forma o ícono.
4. Nunca rojo para un PIAR ni para un estudiante: no es un error.
5. Cada proyecto conserva su propia paleta dentro de su aplicación, que se muestra intacta.
6. Antes de cambiar un color: `python herramientas/paleta.py` y `python herramientas/auditar.py`.

## 8. Lo que no se hizo

- No se usó Adobe Color en su sitio web (no es automatizable); se reprodujeron sus chequeos.
- La simulación de daltonismo es un modelo (Machado et al., 2009). No reemplaza probar con personas
  con daltonismo.
- No se validó el contraste dentro de las aplicaciones incrustadas, que se muestran como las hizo su
  equipo. Un ejemplo: el gris de texto secundario de Wisfox (`#7B8A80`) da unos 3,4:1 sobre su fondo.
