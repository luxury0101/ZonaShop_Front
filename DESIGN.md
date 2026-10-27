---
name: ZonaShop — Atelier Nocturno
description: Un sistema editorial nocturno donde la moda, la fotografía y la tipografía elegante lideran una compra clara.
colors:
  ink: "#07080a"
  ink-soft: "#0d0f12"
  panel: "#12151a"
  panel-raised: "#181b21"
  ivory: "#f4f4f1"
  silver: "#b8bec7"
  silver-soft: "#898f98"
  line: "#30343c"
  line-bright: "#5a606a"
  success: "#9bc8aa"
  danger: "#e59a9a"
  warning: "#dbc38a"
typography:
  display:
    fontFamily: "Bodoni Moda, Bodoni MT, Didot, serif"
    fontSize: "clamp(4rem, 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bodoni Moda, Bodoni MT, Didot, serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.08em"
  body:
    fontFamily: "Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.13em"
rounded:
  none: "0"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "clamp(5rem, 8vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
    height: "48px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.silver}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  input-default:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ivory}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.78rem 0.85rem"
    height: "48px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    size: "44px"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0"
  product-card:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    padding: "0 0 1.4rem"
  hero-monogram:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    width: "760px"
---

# Design System: ZonaShop — Atelier Nocturno

## Overview

**Creative North Star: "Atelier Nocturno"**

ZonaShop presenta la moda como una editorial nocturna: fondos profundos, fotografía decisiva, tipografía de alto contraste y una estructura silenciosa que deja respirar al producto. La sofisticación proviene de la proporción, el ritmo y la precisión, no de ornamentos añadidos.

El sistema combina una voz serif expresiva con una interfaz sans-serif contenida. Los controles son rectos, las divisiones son filetes plateados y el movimiento aparece solo para explicar estado, jerarquía o entrada; comprar siempre debe seguir siendo inmediato y legible en móvil y escritorio.

**Key Characteristics:**

- Oscuro, editorial y fotográfico.
- Bodoni expresiva frente a una interfaz sans-serif sobria.
- Controles rectos y superficies separadas por líneas de un píxel.
- Marfil reservado para contenido y acciones de máxima prioridad.
- Movimiento breve, orquestado y completamente prescindible.

## Colors

La paleta es casi monocromática: el marfil da la voz, la plata organiza la jerarquía y las capas negras construyen profundidad sin competir con la ropa.

### Primary

- **Marfil de Galería** (`colors.ivory`): texto principal, foco visible y acciones primarias; es la señal de mayor contraste del sistema.

### Secondary

- **Plata Editorial** (`colors.silver`): texto secundario, etiquetas y estados discretos.
- **Plata Velada** (`colors.silver-soft`): placeholders y contenido de menor prioridad.

### Tertiary

- **Verde Inventario** (`colors.success`): disponibilidad y confirmación.
- **Rosa Alerta** (`colors.danger`): errores, agotados y acciones destructivas.
- **Oro Aviso** (`colors.warning`): advertencias no destructivas.

### Neutral

- **Tinta Absoluta** (`colors.ink`): fondo base y contraste de texto sobre marfil.
- **Tinta Suave** (`colors.ink-soft`): tarjetas y pausas de sección.
- **Panel Carbón** (`colors.panel`): campos, diálogos y paneles.
- **Panel Elevado** (`colors.panel-raised`): estados de foco y overlays elevados.
- **Línea Grafito** (`colors.line`): divisores estructurales de baja presencia.
- **Línea Plata** (`colors.line-bright`): contornos interactivos y límites de overlays.

**The One Ivory Voice Rule.** El marfil identifica la máxima prioridad; no se dispersa como adorno ni compite con múltiples acentos.

**The Silver Hairline Rule.** Las capas oscuras se separan con filetes de un píxel antes de recurrir a sombras.

## Typography

**Display Font:** Bodoni Moda autoalojada, con Bodoni MT, Didot y serif como respaldo.

**Body Font:** Segoe UI, con Helvetica, Arial y sans-serif como respaldo.

**Character:** Bodoni aporta tensión editorial, contraste y firma de marca; Segoe UI mantiene controles, precios y lectura funcionales. La pareja debe sentirse lujosa sin volverse frágil.

### Hierarchy

- **Display** (`typography.display`): titulares hero y momentos de marca; admite líneas compactas y gran escala.
- **Headline** (`typography.headline`): títulos de sección que marcan pausas editoriales.
- **Title** (`typography.title`): nombres de producto compactos, en mayúsculas cuando el espacio exige escaneo rápido.
- **Body** (`typography.body`): descripciones y contenido de lectura; mantener líneas moderadas alrededor de 65–75 caracteres cuando sea posible.
- **Label** (`typography.label`): controles y metadatos en mayúsculas; el tracking amplio crea ritmo sin robar protagonismo.

**The Serif Earns Scale Rule.** La serif aparece en marca y jerarquías editoriales; no se usa en controles densos ni texto utilitario.

**The Quiet Label Rule.** Las etiquetas comunican con tamaño contenido, mayúsculas y tracking amplio; nunca simulan un segundo titular.

## Layout

El sistema usa un contenedor fluido de hasta 1440px con 1.5rem de margen lateral por defecto y secciones verticales amplias (`spacing.section`). La tienda pública reserva 60px para el encabezado fijo; en el hero, la fotografía continúa por debajo de una barra translúcida con desenfoque contextual. Las composiciones editoriales pueden ser asimétricas en pantallas grandes, pero se convierten en una sola columna antes de que fotografía, copy o acciones pierdan legibilidad.

El catálogo parte de una retícula flexible de hasta cuatro columnas, conserva un gap de un píxel para que los filetes formen la estructura y pasa a dos columnas en móvil. Los controles nunca deben crear desplazamiento horizontal desde 375px; las imágenes de producto mantienen proporción 4:5 y recorte `cover`.

**The Product Rhythm Rule.** El espacio amplio se reserva para transiciones entre historias; dentro de compra y administración prevalecen retículas compactas, alineación rigurosa y targets cómodos.

**The Clear Display Rule.** Los titulares serif conservan un interlineado mínimo de `0.98` y tracking de `-0.025em`: compactos, pero sin cruces entre ascendentes, descendentes o líneas consecutivas.

## Elevation & Depth

Atelier Nocturno es plano por defecto. La profundidad se comunica mediante variaciones tonales, fotografía, blur contextual y filetes; las sombras densas se reservan para diálogos, paneles flotantes, notificaciones y menús que deben separarse inequívocamente del lienzo. El texto sobre fotografía puede usar sombra ambiental contenida para preservar contraste.

### Shadow Vocabulary

- **Overlay profundo** (`shadows.overlay-deep`): diálogos y menús laterales.
- **Panel flotante** (`shadows.panel-floating`): filtros y overlays anclados.
- **Texto fotográfico** (`shadows.photo-copy`): titulares y cuerpo colocados sobre imagen.

**The Flat by Default Rule.** Una superficie en reposo no recibe sombra; primero se resuelve con tono y línea, y solo se eleva cuando su comportamiento lo exige.

## Shapes

La forma dominante es ortogonal: botones, campos, tarjetas, diálogos y menús usan esquinas rectas (`rounded.none`). Los bordes de un píxel actúan como estructura y nunca como decoración redundante. El radio píldora (`rounded.pill`) es una excepción funcional reservada para indicadores pequeños, como el contador del carrito.

**The Rectilinear Control Rule.** Todo control principal conserva esquinas rectas; redondear una tarjeta o un botón altera el carácter de la marca.

## Components

### Buttons

- **Shape:** recta, con un mínimo interactivo de 44–48px según el contexto.
- **Primary:** fondo marfil, texto tinta y etiqueta en mayúsculas; puede invertir a transparente en hover sin perder el borde.
- **Secondary:** transparente con borde plata; en hover toma plata y texto tinta.
- **Hover / Focus:** transiciones de 220–260ms, desplazamiento vertical máximo de 2px cuando no está sobre fotografía y foco visible marfil separado 4px.
- **Disabled:** panel elevado, plata velada y ausencia de desplazamiento.

### Cards / Containers

- **Corner Style:** recto en tarjetas, paneles y diálogos.
- **Background:** tinta suave o panel carbón según densidad.
- **Shadow Strategy:** sin sombra en tarjetas; elevación solo en overlays.
- **Border:** filete grafito; puede volverse plata en hover o foco.
- **Internal Padding:** compacto en catálogo y generoso en estados vacíos.

### Inputs / Fields

- **Style:** panel carbón, texto marfil, borde plata brillante y altura mínima de 48px.
- **Focus:** panel elevado, borde marfil y segundo filete exterior de un píxel.
- **Placeholder / Disabled:** plata velada; nunca reduce el contraste del valor ingresado.

### Navigation

El encabezado público es fijo, compacto y traslúcido, con marca Bodoni centrada y botones de icono de 44px. El menú lateral convierte la navegación en una lista serif de gran tamaño, separada por filetes; hover desplaza el enlace solo 0.45rem y cambia a plata. Los iconos usan trazo fino, no relleno ornamental.

### Product Card

La tarjeta prioriza una imagen 4:5, seguida por nombre compacto en mayúsculas y precio tabular. El borde permanece plano; en hover la imagen recupera color, escala con suavidad y la superficie asciende como máximo 6px. La ausencia de foto se resuelve con el monograma, no con una ilustración genérica.

### Editorial Hero

La firma del hero combina fotografía estática, titular Bodoni, CTA recto y monograma ZS outline. El monograma se dibuja una sola vez por sesión y después revela el contenido; `prefers-reduced-motion` muestra ambos desde el primer frame. Esta secuencia nunca bloquea la lectura, la navegación ni el acceso al catálogo.

**The Motion Has Memory Rule.** Una entrada expresiva sucede una vez por sesión; el sistema no repite movimiento ceremonial en cada visita de página.

## Do's and Don'ts

### Do:

- **Do** dejar que la fotografía y el producto ocupen el primer plano.
- **Do** usar Bodoni para firma, titulares y pausas editoriales, y sans-serif para comprar y operar.
- **Do** separar superficies oscuras con tono y filetes antes de añadir sombra.
- **Do** mantener foco visible, targets cómodos y una experiencia completa sin animación.
- **Do** usar fotografías estáticas optimizadas y marcar recursos provisionales para reemplazo.

### Don't:

- **Don't** introducir colores de acento saturados que compitan con la paleta marfil y plata.
- **Don't** redondear controles, tarjetas o diálogos; la geometría recta es parte de la identidad.
- **Don't** convertir cada sección en un espectáculo animado ni repetir la entrada del hero dentro de la misma sesión.
- **Don't** usar video de fondo, movimiento automático continuo o decoración abstracta donde la fotografía puede contar la historia.
- **Don't** sacrificar claridad de compra, contraste o adaptación móvil por una composición editorial.
