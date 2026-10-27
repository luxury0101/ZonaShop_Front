import { expect, test } from "@playwright/test";

const categorias = [
  {
    id: 1,
    nombre: "Ropa",
    descripcion: "Moda para todos",
    cantidad_productos: 1,
  },
];

const productos = [
  {
    id: 10,
    categoria: 1,
    categoria_nombre: "Ropa",
    nombre: "Chaqueta Noir",
    descripcion: "Edición esencial de ZonaShop.",
    imagen: "/images/lookbook-1.webp",
    imagen_secundaria: "/images/lookbook-2.webp",
    precio: "189900.00",
    existencias: 4,
    creado_en: "2026-10-21T12:00:00Z",
    agotado: false,
  },
];

async function simularApi(page) {
  const origen = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || "4173"}`;
  await page.route(/^http:\/\/(localhost|127\.0\.0\.1):8000\/api\//, async (route) => {
    const url = new URL(route.request().url());
    const headers = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": origen,
    };

    if (url.pathname === "/api/auth/me/") {
      await route.fulfill({
        headers,
        json: { autenticado: false, usuario: null },
      });
      return;
    }

    if (url.pathname === "/api/categorias/") {
      await route.fulfill({ headers, json: categorias });
      return;
    }

    if (url.pathname === "/api/productos/") {
      await route.fulfill({ headers, json: productos });
      return;
    }

    await route.fulfill({
      status: 404,
      headers,
      json: { detail: "No encontrado" },
    });
  });
}

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => console.error("Error de página:", error));
  page.on("requestfailed", (request) => {
    console.error("Petición fallida:", request.url(), request.failure());
  });
  await simularApi(page);
});

test("el hero usa imágenes responsive y anima una sola vez por sesión", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const hero = page.locator(".presentacion");
  await expect(hero).toHaveClass(/presentacion--animar/);
  await expect(page.locator(".presentacion__media img")).toHaveAttribute(
    "src",
    "/images/hero.webp",
  );
  await expect(page.locator(".presentacion__media source")).toHaveAttribute(
    "srcset",
    "/images/hero-mobile.webp",
  );
  await expect(page.locator(".presentacion__media source")).toHaveAttribute(
    "media",
    "(max-width: 899px)",
  );
  await expect(page.getByText("01 / COLECCIÓN", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )).toBe(false);

  await page.reload();
  await expect(hero).not.toHaveClass(/presentacion--animar/);
});

test("el hero elige la imagen correcta y respeta movimiento reducido", async ({ page }) => {
  for (const [ancho, alto, archivoEsperado] of [
    [375, 812, "/images/hero-mobile.webp"],
    [768, 900, "/images/hero-mobile.webp"],
    [1280, 800, "/images/hero.webp"],
  ]) {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");
    const imagen = page.locator(".presentacion__media img");
    await expect.poll(
      () => imagen.evaluate((elemento) => new URL(elemento.currentSrc).pathname),
    ).toBe(archivoEsperado);
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )).toBe(false);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => sessionStorage.removeItem("zonashop:hero-animado"));
  await page.reload();
  await expect(page.locator(".presentacion")).toHaveClass(/presentacion--animar/);
  await expect(page.locator(".presentacion__contenido")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".presentacion__contenido")).toHaveCSS("opacity", "1");
  await expect(page.locator(".presentacion__monograma-texto")).toHaveCSS("stroke-dashoffset", "0px");
});

test("la cabecera difumina el hero y los títulos mantienen un ritmo legible", async ({ page }) => {
  for (const [ancho, alto] of [
    [375, 812],
    [768, 900],
    [1280, 800],
  ]) {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");

    const medidas = await page.evaluate(() => {
      const header = document.querySelector(".encabezado");
      const hero = document.querySelector(".presentacion");
      const titulo = document.querySelector(".presentacion h1");
      const acciones = document.querySelector(".encabezado .acciones-header");
      const headerStyle = getComputedStyle(header);
      const tituloStyle = getComputedStyle(titulo);
      const accionesStyle = getComputedStyle(acciones);

      return {
        blur: headerStyle.backdropFilter || headerStyle.webkitBackdropFilter,
        fondo: headerStyle.backgroundColor,
        heroTop: hero.getBoundingClientRect().top,
        altoAcciones: acciones.getBoundingClientRect().height,
        direccionAcciones: accionesStyle.flexDirection,
        proporcionInterlineado:
          Number.parseFloat(tituloStyle.lineHeight) / Number.parseFloat(tituloStyle.fontSize),
        tieneOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    expect(medidas.blur).toContain("blur(");
    expect(medidas.fondo).toMatch(/rgba\([^)]*,\s*0\.[0-9]+\)/);
    expect(Math.abs(medidas.heroTop)).toBeLessThanOrEqual(1);
    expect(medidas.altoAcciones).toBeLessThanOrEqual(60);
    expect(medidas.direccionAcciones).toBe("row");
    expect(medidas.proporcionInterlineado).toBeGreaterThanOrEqual(0.97);
    expect(medidas.tieneOverflow).toBe(false);
  }
});

test("carga el catálogo y permite agregar un producto al carrito", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Encuentra tu próximo favorito" }),
  ).toBeVisible();
  await expect(page.locator("#productos").getByRole("heading", { name: "Chaqueta Noir" })).toBeVisible();

  await expect(page.getByRole("button", { name: "Agregar Chaqueta Noir" })).toHaveCount(0);
  await expect(page.locator("#productos .producto__imagen--secundaria")).toHaveCount(1);
  await page.locator("#productos").getByRole("button", { name: "Ver detalles de Chaqueta Noir" }).click();
  await expect(page.locator("#modal-detalle-producto")).toBeVisible();
  await page.locator("#detalle-producto-agregar").click();
  await expect(page.locator("#cantidad-carrito")).toHaveText("1");

  await expect(page.getByRole("dialog", { name: "Carrito de compras" })).toBeVisible();
  await expect(page.locator("#total-carrito")).toContainText("189.900");
});

test("las secciones editoriales se adaptan sin desbordes", async ({ page }) => {
  for (const [ancho, alto] of [[375, 812], [768, 900], [1280, 800]]) {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");
    await expect(page.locator(".confianza")).toBeVisible();
    await expect(page.locator("#categorias-mosaico .categoria-editorial")).toHaveCount(1);
    await expect(page.locator("#productos-nuevos .producto")).toHaveCount(1);
    await expect(page.locator(".banner-editorial")).toBeVisible();
    await expect(page.locator(".lookbook__pieza")).toHaveCount(4);
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )).toBe(false);
  }
});

test("una ruta administrativa directa conserva el fallback y solicita login", async ({ page }) => {
  await page.goto("/admin/productos");

  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.locator("#login-email")).toBeFocused();
});

test("las páginas informativas y los canales de contacto son reales y responsive", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/politicas-de-envio");

  await expect(page.getByRole("heading", { name: "Políticas de envío", exact: true })).toBeVisible();
  await expect(page.getByText("[tiempo de entrega]", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a la tienda" })).toHaveAttribute("href", "/#productos-catalogo");
  await expect(page.getByRole("heading", { name: "Encuentra tu próximo favorito" })).toBeHidden();
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )).toBe(false);

  await expect(page.getByRole("link", { name: "juancontre845@gmail.com" }))
    .toHaveAttribute("href", "mailto:juancontre845@gmail.com");
  const whatsapp = page.getByRole("link", { name: /WhatsApp/ });
  await expect(whatsapp).toHaveAttribute("href", /wa\.me\/573158301333/);
  await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("link", { name: /Instagram|Facebook|TikTok/ })).toHaveCount(0);

  for (const [ruta, titulo] of [
    ["/cambios-y-devoluciones", "Cambios y devoluciones"],
    ["/politica-de-privacidad", "Política de privacidad"],
    ["/terminos-y-condiciones", "Términos y condiciones"],
  ]) {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { name: titulo, exact: true })).toBeVisible();
  }
});
