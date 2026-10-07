import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { clienteApi, solicitar } from "./cliente.js";


const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");


function respuestaJson(datos, opciones = {}) {
  return {
    ok: opciones.ok ?? true,
    status: opciones.status ?? 200,
    headers: {
      get: () => "application/json",
    },
    json: async () => datos,
    text: async () => "",
  };
}


describe("cliente de la API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normaliza rutas y envía credenciales en consultas", async () => {
    const fetchSimulado = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(respuestaJson([{ id: 1 }]));

    const datos = await solicitar("productos");

    expect(datos).toEqual([{ id: 1 }]);
    expect(fetchSimulado).toHaveBeenCalledOnce();
    expect(fetchSimulado).toHaveBeenCalledWith(
      `${API_URL}/api/productos`,
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
  });

  it("obtiene y envía CSRF antes de una escritura", async () => {
    const fetchSimulado = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        respuestaJson({ csrfToken: "token-prueba" }),
      )
      .mockResolvedValueOnce(
        respuestaJson({ id: 2 }, { status: 201 }),
      );

    await clienteApi("/api/productos/", {
      method: "POST",
      body: JSON.stringify({ nombre: "Producto" }),
    });

    expect(fetchSimulado).toHaveBeenCalledTimes(2);
    expect(fetchSimulado).toHaveBeenNthCalledWith(
      2,
      `${API_URL}/api/productos/`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-CSRFToken": "token-prueba",
        }),
      }),
    );
  });

  it("propaga el mensaje y código de un error de la API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respuestaJson(
        { detail: "Acceso denegado." },
        { ok: false, status: 403 },
      ),
    );

    await expect(
      clienteApi("/api/productos/"),
    ).rejects.toMatchObject({
      message: "Acceso denegado.",
      status: 403,
    });
  });
});

