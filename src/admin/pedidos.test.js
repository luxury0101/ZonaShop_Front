// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";


const dependencias = vi.hoisted(() => ({
  actualizarEstadoPedido: vi.fn(),
  obtenerPedidosAdministracion: vi.fn(),
  obtenerUsuarioActual: vi.fn(),
}));

vi.mock("../api/autenticacion.js", () => ({
  actualizarEstadoPedido: dependencias.actualizarEstadoPedido,
  obtenerPedidosAdministracion: dependencias.obtenerPedidosAdministracion,
}));
vi.mock("../auth/sesion.js", () => ({
  obtenerUsuarioActual: dependencias.obtenerUsuarioActual,
}));


describe("administración de pedidos", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/admin/pedidos");
    document.body.innerHTML = `
      <select id="filtro-estado-pedidos"><option value="">Todos</option></select>
      <p id="estado-pedidos-admin"></p>
      <div id="lista-pedidos-admin"></div>`;
    dependencias.obtenerUsuarioActual.mockReturnValue({ rol: "administrador" });
    dependencias.obtenerPedidosAdministracion.mockResolvedValue([{
      numero: "11111111-1111-1111-1111-111111111111",
      total: "50000.00",
      estado: "pagado",
      creado_en: "2026-10-07T12:00:00Z",
      cliente: { nombre: "Ana", email: "ana@zonashop.test" },
      envio: {
        destinatario: "Ana",
        telefono: "3001234567",
        direccion: "Calle 10",
        ciudad: "Bogotá",
        departamento: "Cundinamarca",
        instrucciones: "",
      },
      items: [{ nombre_producto: "Camisa", cantidad: 1, subtotal: "50000.00" }],
    }]);
    dependencias.actualizarEstadoPedido.mockResolvedValue({ estado: "enviado" });
  });

  it("lista pedidos y permite actualizar su estado", async () => {
    const { iniciarAdministracionPedidos } = await import("./pedidos.js");
    iniciarAdministracionPedidos();
    await vi.waitFor(() => {
      expect(document.querySelector(".pedido-admin h3").textContent).toContain("11111111");
    });
    const selector = document.querySelector(".pedido-admin select");
    selector.value = "enviado";
    document.querySelector(".pedido-admin button").click();
    await vi.waitFor(() => {
      expect(dependencias.actualizarEstadoPedido)
        .toHaveBeenCalledWith("11111111-1111-1111-1111-111111111111", "enviado");
    });
  });
});
