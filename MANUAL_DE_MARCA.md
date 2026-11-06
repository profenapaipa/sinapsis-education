# Manual de marca de Mosaico Telar

Versión 2.0, 30 de octubre de 2026. La versión viva, hecha con los mismos componentes que el sitio,
está en la plataforma (**Marca**). La justificación de los colores está en [PALETA.md](PALETA.md).

## 1. Propósito

> **Para que ninguna forma de aprender se quede fuera del aula.**

- **Eslogan:** *Tejemos caminos para aprender.*
- **Descriptor:** Colectivo de educación inclusiva con tecnología.
- **Qué hacemos:** unimos tres proyectos estudiantiles para que el docente planee una clase
  inclusiva, la orientación la valide, la familia la vea y cada estudiante la reciba a su medida.

### Valores

1. **Todos somos mosaico.** Todos aprendemos distinto, también quienes no tienen un diagnóstico.
2. **Cada hilo es autónomo.** Se unen sin perder su nombre, su código ni su cara.
3. **Los datos van primero.** Son menores de edad. Lo que no es necesario, no se pide.
4. **Decimos qué funciona.** Y qué es simulado. Sin adornos.
5. **Hecho por estudiantes,** con revisión de adultos y de otros equipos.

### De dónde viene el nombre

*Mosaico*: la diversidad de formas de aprender, que incluye a los neurotípicos. *Telar*: tejer es un
proceso artesanal donde varios hilos hacen una sola tela. La urdimbre es la malla curricular; la
trama, los ajustes de cada estudiante.

## 2. Principio de identidad: blanco y negro primero

La estructura, el logo y los íconos son **una sola tinta**. El color aparece solo para la **acción**
(el verde) y para **identificar cada hilo** (verde, ámbar, azul). Esto da un aire sobrio y editorial, y
evita la estética de "plataforma de IA en la nube" (azul noche, morado y degradados).

## 3. Logo

**Tres hilos y dos pasadas de trama.** Un telar en su forma más simple. La trama pasa por encima y
por debajo de los hilos, y una "costura" del color del fondo separa lo que va por encima.

| Versión | Cuándo |
|---|---|
| **Negro** sobre fondo claro | La principal |
| **Blanco** sobre fondo oscuro | El riel, el pie sobre oscuro |
| **A color** (verde, ámbar, azul) | Solo cuando hay que identificar a los tres proyectos: el favicon y piezas de comunicación |

- **Logo horizontal:** símbolo + "Mosaico Telar" en Nunito 900.
- **Espacio libre:** el ancho de un hilo, por todos los lados.
- **Tamaño mínimo:** 32 px el símbolo; 110 px el logo horizontal. **Por debajo de 32 px la trama se
  vuelve una mancha**: se usa el favicon a color.
- **No:** estirarlo, girarlo, cambiar el color o el orden de un hilo, ponerle sombras, degradados o fichas.
- **Archivos:** `assets/logo.svg` (a color, para favicon). En la página se dibuja desde `js/ui.js`
  con variables, y cambia solo entre negro y blanco.
- **Limitación conocida:** en tamaño grande se lee como un tejido; es un símbolo reticular y puede
  recordar a un "#". Si el equipo prefiere un trazo menos denso, es lo primero a explorar.

## 4. Color

Un color principal, dos funcionales y tres neutros. Todo en [PALETA.md](PALETA.md).

| Color | Hex | Papel |
|---|---|---|
| Tinta | `#1A1714` | Texto, estructura, logo, íconos |
| Papel / Lino | `#FFFFFF` / `#F6F2EA` | Superficies |
| **Verde bosque** | `#1B7F56` | **Principal: la acción.** El mismo verde que ya compartían Kinesis y Wisfox |
| Ámbar | `#E8A13C` | Hilo de Wisfox y avisos. Nunca lleva texto |
| Azul tinta | `#2B4FA3` | Hilo de Niky |

**El color nunca va solo:** todo estado lleva también texto ("Aprobado", "Pendiente", "Simulado").
**Nunca rojo** para un PIAR o un estudiante.

## 5. Tipografía

**Newsreader** para los títulos (tono editorial y sereno) y **Nunito** para la interfaz, la voz que
Kinesis y Wisfox ya compartían. Ambas se alojan en `fonts/`, sin depender de internet (licencia SIL OFL).

| Uso | Familia y peso | Tamaño |
|---|---|---|
| Título | Newsreader 700 | 34 a 50 px |
| Subtítulo y botones | Nunito 800 | 22 y 16 px |
| Texto | Nunito 400 y 600 | 16 px, interlineado 1,6 |
| Datos y códigos | Monoespaciada del sistema | 14 px |

Todo está en `rem`; el menú de apariencia sube la base al 112,5 %.

## 6. Formas e íconos

Un mosaico se arma con teselas. **Cada hilo tiene la suya, en una sola tinta:**

| Hilo | Forma | Origen |
|---|---|---|
| Kinesis | Cuadrado redondeado con la "K" en movimiento: su brazo superior termina en un punto, el estudiante que avanza | Su identidad original |
| Wisfox | Hexágono con una "W" | Su identidad original |
| Niky | Círculo con una "V" sencilla | Nueva. Sin chispas ni destellos: la guía es acompañamiento, no magia |

**Íconos:** de línea, un solo trazo redondeado de 2 px, en una sola tinta, como los que ya usaban Kinesis y Wisfox.

## 7. Recursos gráficos

El telar y el mosaico dan para más que un logo. Se usan con medida: dan identidad sin cargar la pantalla.

| Recurso | Clase | Dónde |
|---|---|---|
| Patrón de trama | `.patron-telar` | Estados vacíos y piezas. Nunca detrás de texto largo |
| Patrón de teselas | `.patron-mosaico` | Una de las pocas veces en que los tres colores aparecen juntos |
| Divisor de puntada | `.puntada` | Separa secciones como una costura, en tinta |
| Barra de hilo | `.medidor--hilo` | Progreso: tres colores avanzando juntos |
| Cargador de trama | `.cargador-trama` | Espera. Se detiene si la persona pide menos movimiento |
| Mapa interactivo | `/#/mapa` | Cómo se conecta todo: módulos, flechas y roles |

## 8. Estructura de la interfaz

1. **El riel** (izquierda, siempre igual, en tinta con íconos blancos): Mapa, Kinesis, Wisfox, Niky,
   Demo y Roles. En celular baja a una barra inferior.
2. **Los proyectos reales, incrustados e intactos:** Kinesis y Wisfox se muestran con su propia cara,
   animaciones y recursos, dentro de un marco con su nombre, un selector de rol y el enlace a su código.
3. **La demostración** (`/#/demo`): el ajuste de punta a punta, con una barra lateral por rol.
4. **Niky**, con su propio espacio y un panel fijo que se abre desde cualquier pantalla.

Esquinas moderadas (14 px), filete fino y casi sin sombra. Sin degradados.

## 9. Voz

Hablamos como una persona que te cuenta algo con respeto: claro, concreto, sin tecnicismos. Siempre de tú.

| Así sí | Así no |
|---|---|
| "Tu ajuste espera a orientación." | Prometer lo que no existe |
| "Hoy responde con textos de ejemplo." | Mencionar diagnósticos o etiquetas |
| "Cuando la actividad esté lista te contaremos qué cambió y por qué." | Hablar de "casos" o "problemas" de un estudiante |

## 10. Accesibilidad (reglas, no sugerencias)

- Contraste de texto de al menos 4,5:1 (3:1 en texto grande), en claro y en oscuro.
- Controles de al menos 24 px de alto; los botones, de 44 px.
- Un solo título principal por pantalla; el foco llega a él al cambiar de pantalla.
- Todo control con nombre accesible; la IA y los estados cambian con `aria-live`.
- Respeta "menos movimiento" y el tamaño de texto del sistema.
- Se comprueba con `python herramientas/auditar.py` antes de cada publicación.

## 11. Cómo agregar un espacio nuevo

1. Una vista en `js/vistas/` que use `espacio()` de `comun.js`, o un proyecto en `embed.js`.
2. Una línea en la lista del riel, en `js/main.js`.
3. Si tiene módulos, agregarlos al mapa en `js/vistas/mapa.js`.
4. Pasar la auditoría.
