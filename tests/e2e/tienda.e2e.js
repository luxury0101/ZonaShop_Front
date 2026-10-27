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
    imagen: null,
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

test("carga el catálogo y permite agregar un producto al carrito", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Encuentra tu próximo favorito" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chaqueta Noir" })).toBeVisible();

  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.locator("#cantidad-carrito")).toHaveText("1");

  await page.getByRole("button", { name: /abrir carrito/i }).click();
  await expect(page.getByRole("dialog", { name: "Carrito de compras" })).toBeVisible();
  await expect(page.locator("#total-carrito")).toContainText("189.900");
});

test("una ruta administrativa directa conserva el fallback y solicita login", async ({ page }) => {
  await page.goto("/admin/productos");

  await expect(page.getByRole("dialog", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.locator("#login-email")).toBeFocused();
});
