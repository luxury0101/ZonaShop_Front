// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";


const api = vi.hoisted(() => ({
  actualizarPerfil: vi.fn(),
  obtenerPerfil: vi.fn(),
}));

vi.mock("../api/autenticacion.js", () => api);


function prepararDocumento() {
  document.body.innerHTML = `
    <button id="boton-mi-perfil"></button>
    <dialog id="modal-perfil">
      <form id="formulario-perfil">
        <input name="nombre" required />
        <input name="email" type="email" required />
        <input name="telefono" />
        <input name="direccion" />
        <input name="ciudad" />
        <input name="departamento" />
        <input name="codigo_postal" />
        <input name="instrucciones_envio" />
        <input name="passwordActual" />
        <input name="passwordNueva" />
        <input name="passwordConfirmacion" />
        <p id="mensaje-perfil"></p>
        <button id="boton-guardar-perfil" type="submit"></button>
      </form>
      <button id="boton-cerrar-perfil"></button>
    </dialog>`;
  const modal = document.querySelector("#modal-perfil");
  modal.showModal = vi.fn();
  modal.close = vi.fn();
}


describe("perfil", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    prepararDocumento();
  });

  it("carga y actualiza los datos personales y de envío", async () => {
    const perfil = {
      nombre: "Ana",
      email: "ana@zonashop.test",
      telefono: "3001234567",
      direccion: "Calle 10",
      ciudad: "Bogotá",
      departamento: "Cundinamarca",
      codigo_postal: "110111",
      instrucciones_envio: "Portería",
    };
    api.obtenerPerfil.mockResolvedValue(perfil);
    api.actualizarPerfil.mockResolvedValue({ ...perfil, ciudad: "Medellín" });
    const { iniciarPerfil } = await import("./perfil.js");
    iniciarPerfil();

    document.querySelector("#boton-mi-perfil").click();
    await vi.waitFor(() => {
      expect(document.querySelector('[name="email"]').value).toBe(perfil.email);
    });
    document.querySelector('[name="ciudad"]').value = "Medellín";
    document.querySelector("#formulario-perfil").requestSubmit();

    await vi.waitFor(() => {
      expect(api.actualizarPerfil).toHaveBeenCalledWith(
        expect.objectContaining({ ciudad: "Medellín" }),
      );
    });
  });
});
