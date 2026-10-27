import { expect, test } from "@playwright/test";

const categorias = [{ id: 1, nombre: "Ropa" }];
const productos = [{
  id: 10,
  categoria: 1,
  categoria_nombre: "Ropa",
  nombre: "Chaqueta Noir",
  descripcion: "Edición esencial de ZonaShop.",
  imagen: null,
  precio: "189900.00",
  existencias: 4,
  agotado: false,
}];

async function simularApi(page) {
  await page.route(/^http:\/\/(localhost|127\.0\.0\.1):8000\/api\//, async (route) => {
    const ruta = new URL(route.request().url()).pathname;
    if (ruta === "/api/auth/me/") {
      await route.fulfill({ json: { autenticado: false, usuario: null } });
    } else if (ruta === "/api/categorias/") {
      await route.fulfill({ json: categorias });
    } else if (ruta === "/api/productos/") {
      await route.fulfill({ json: productos });
    } else {
      await route.fulfill({ status: 404, json: { detail: "No encontrado" } });
    }
  });
}

test.beforeEach(async ({ page }) => simularApi(page));

test("el header móvil, menú y filtros funcionan a 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const header = page.locator(".encabezado");
  await expect(header).toBeVisible();
  await expect(header).toHaveCSS("height", "60px");
  await expect(page.locator("#estado")).toHaveText("1 producto(s) encontrado(s).");

  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(desborda).toBe(false);

  for (const selector of ["#boton-menu", "#boton-filtros-header", "#boton-cuenta-header", "#boton-abrir-carrito"]) {
    const caja = await page.locator(selector).boundingBox();
    expect(caja?.width).toBeGreaterThanOrEqual(44);
    expect(caja?.height).toBeGreaterThanOrEqual(44);
  }

  await page.locator("#boton-menu").click();
  await expect(page.locator("#menu-lateral")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.locator("#boton-cerrar-menu").click();
  await expect(page.locator("#menu-lateral")).toHaveAttribute("aria-hidden", "true");

  await page.locator("#boton-menu").click();
  await page.locator("#overlay-menu").click({ position: { x: 370, y: 120 } });
  await expect(page.locator("#menu-lateral")).toHaveAttribute("aria-hidden", "true");

  await page.locator("#boton-menu").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-lateral")).toHaveAttribute("aria-hidden", "true");

  await page.locator("#boton-filtros-header").click();
  await expect(page.locator("#panel-filtros-header")).toBeVisible();
  expect(await page.locator("#formulario-filtros").evaluate(
    (elemento) => getComputedStyle(elemento).gridTemplateColumns.split(" ").length,
  )).toBe(1);
  await page.locator("#busqueda").fill("Chaqueta");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.locator("#panel-filtros-header")).toBeHidden();

  await page.locator("#boton-cuenta-header").click();
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
});

test("los filtros forman una fila y no desbordan en escritorio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#boton-filtros-header").click();

  const columnas = await page.locator("#formulario-filtros").evaluate(
    (elemento) => getComputedStyle(elemento).gridTemplateColumns.split(" ").length,
  );
  expect(columnas).toBe(5);
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )).toBe(false);
});
