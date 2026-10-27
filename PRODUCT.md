# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que compran ropa en línea para mujer y hombre desde móvil o escritorio. El personal administrador gestiona categorías, productos, tallas, existencias y pedidos.

## Product Purpose

ZonaShop permite descubrir productos de moda, consultar disponibilidad por talla, comprar mediante un carrito y completar un pago simulado. El proyecto busca ofrecer una experiencia de tienda editorial, elegante y sencilla.

## Operating Context

La tienda pública y el panel administrativo comparten un frontend en HTML, SCSS y JavaScript con Vite. El frontend consume una API Django y se publica en Vercel.

## Capabilities and Constraints

- Conservar la lógica existente de catálogo, filtros, tallas, carrito, autenticación, pedidos, pago simulado y administración.
- Las tallas de ropa disponibles son XS, S, M, L y XL.
- Las mejoras visuales no deben cambiar rutas, base de datos ni flujo de pago.
- La experiencia debe funcionar sin desbordes horizontales desde 375 px y respetar `prefers-reduced-motion`.
- Las imágenes editoriales deben ser estáticas y optimizadas; no se usarán videos de fondo.

## Brand Commitments

- Nombre: ZonaShop.
- Identidad oscura con blancos, grises y detalles plateados.
- Logotipo y títulos principales con tipografía serif elegante.
- Dirección visual minimalista, editorial y de lujo.

## Evidence on Hand

- Catálogo real y categorías servidos por la API.
- Fotografías de producto administradas desde el panel.
- No hay todavía fotografías editoriales propias de marca; los recursos provisionales deben identificarse para su reemplazo.

## Product Principles

- La moda y el producto son protagonistas.
- Cada interacción visual debe preservar la claridad de compra.
- La expresión editorial no debe añadir peso o movimiento innecesario.
- La experiencia móvil tiene la misma prioridad que escritorio.

## Accessibility & Inclusion

Mantener foco visible, controles accesibles por teclado, contraste suficiente, texto alternativo descriptivo y reducción de movimiento según la preferencia del sistema.
