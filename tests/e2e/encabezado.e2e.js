import { expect, test } from "@playwright/test";

const categorias = [{ id: 1, nombre: "Ropa" }];
const productos = [{
  id: 10,
  categoria: 1,
  categoria_nombre: "Ropa",
  nombre: "Chaqueta Noir",
  descripcion: "Edición esencial de ZonaShop.",
  imagen: "/favicon.svg",
  imagen_secundaria: "/images/lookbook-2.webp",
  precio: "189900.00",
  existencias: 4,
  agotado: false,
}];

async function simularApi(page) {
  let falloPendiente = true;
  await page.route(/^http:\/\/(localhost|127\.0\.0\.1):8000\/api\//, async (route) => {
    const url = new URL(route.request().url());
    const ruta = url.pathname;
    if (ruta === "/api/auth/me/") {
      await route.fulfill({ json: { autenticado: false, usuario: null } });
    } else if (ruta === "/api/categorias/") {
      await route.fulfill({ json: categorias });
    } else if (ruta === "/api/productos/") {
      const busqueda = url.searchParams.get("buscar");
      if (busqueda === "sinresultados") {
        await route.fulfill({ json: [] });
      } else if (busqueda === "contallas") {
        await route.fulfill({
          json: [{
            ...productos[0],
            tallas: [
              { talla: "XS", stock: 3, agotada: false },
              { talla: "S", stock: 0, agotada: true },
              { talla: "M", stock: 2, agotada: false },
              { talla: "L", stock: 6, agotada: false },
              { talla: "XL", stock: 0, agotada: true },
            ],
          }],
        });
      } else if (busqueda === "fallar" && falloPendiente) {
        falloPendiente = false;
        await route.fulfill({ status: 503, json: { detail: "Servicio no disponible" } });
      } else {
        await route.fulfill({ json: productos });
      }
    } else {
      await route.fulfill({ status: 404, json: { detail: "No encontrado" } });
    }
  });
}

test.beforeEach(async ({ page }) => simularApi(page));

test("el header móvil, menú y filtros funcionan a 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/productos");

  const header = page.locator(".encabezado");
  await expect(header).toBeVisible();
  await expect(header).toHaveCSS("height", "60px");
  await expect(page.locator("#estado")).toHaveText("1 producto(s) encontrado(s).");

  const columnasProductos = await page.locator("#productos").evaluate(
    (elemento) => getComputedStyle(elemento).gridTemplateColumns.split(" ").length,
  );
  expect(columnasProductos).toBe(2);

  const imagenProducto = page.locator("#productos .producto__visual img").first();
  await expect(imagenProducto).toHaveAttribute("loading", "lazy");
  await expect(imagenProducto).toHaveAttribute("width", "440");
  await expect(imagenProducto).toHaveAttribute("height", "550");

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
  await expect(page).toHaveURL(/\/productos\?buscar=Chaqueta$/);
  await expect(page.locator("#estado")).toHaveText("1 producto(s) encontrado(s).");
  await expect(page.locator("#panel-filtros-header")).toBeHidden();

  await page.locator("#boton-cuenta-header").click();
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
  await page.getByRole("button", { name: "Crear una cuenta" }).click();
  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeHidden();
  await expect(page.getByRole("dialog", { name: "Crear cuenta" })).toBeVisible();
  await expect(page.locator("#registro-nombre")).toBeFocused();
});

test("el catálogo ofrece recuperación para estados vacío y de error", async ({ page }) => {
  await page.goto("/productos");

  await page.locator("#boton-filtros-header").click();
  await page.locator("#busqueda").fill("sinresultados");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByText("No encontramos productos con esos filtros", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).last().click();
  await expect(page.locator("#productos").getByRole("heading", { name: "Chaqueta Noir" })).toBeVisible();

  await page.locator("#boton-filtros-header").click();
  await page.locator("#busqueda").fill("fallar");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByText("No pudimos cargar los productos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.locator("#productos").getByRole("heading", { name: "Chaqueta Noir" })).toBeVisible();

  await page.locator("#boton-filtros-header").click();
  await page.locator("#busqueda").fill("contallas");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.locator("#productos").getByRole("button", { name: "Ver detalles de Chaqueta Noir" }).click();
  await expect(page.locator("#modal-detalle-producto")).toBeVisible();
  await expect(page.locator("#cantidad-carrito")).toHaveText("0");
  await page.locator("#detalle-producto-agregar").click();
  await expect(page.locator("#detalle-producto-error")).toHaveText("Elige una talla");
  await expect(page.getByRole("button", { name: "Talla S, agotada" })).toBeDisabled();
  await page.getByRole("button", { name: "Seleccionar talla M" }).click();
  await expect(page.locator("#detalle-producto-stock-bajo")).toHaveText("Quedan 2 unidades");
  await page.locator("#detalle-producto-agregar").click();
  await expect(page.locator("#cantidad-carrito")).toHaveText("1");
});

test("los filtros forman una fila y no desbordan en escritorio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/productos");
  await expect(page.locator("#estado")).toHaveText("1 producto(s) encontrado(s).");
  const columnasProductos = await page.locator("#productos").evaluate(
    (elemento) => getComputedStyle(elemento).gridTemplateColumns
      .split(" ")
      .filter((columna) => Number.parseFloat(columna) > 1)
      .length,
  );
  expect(columnasProductos).toBe(1);
  await page.locator("#boton-filtros-header").click();

  const columnas = await page.locator("#formulario-filtros").evaluate(
    (elemento) => getComputedStyle(elemento).gridTemplateColumns.split(" ").length,
  );
  expect(columnas).toBe(6);
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )).toBe(false);
});
