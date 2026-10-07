// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";


const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  consultarSesion: vi.fn(),
  iniciarSesion: vi.fn(),
  registrarUsuario: vi.fn(),
}));

vi.mock("../api/autenticacion.js", () => api);


function prepararDocumento() {
  document.body.innerHTML = `
    <button id="boton-menu"></button>
    <nav id="acciones-header"></nav>
    <div id="zona-invitado">
      <button id="boton-abrir-login"></button>
      <button id="boton-abrir-registro"></button>
    </div>
    <details id="menu-usuario" hidden><summary id="nombre-usuario"></summary></details>
    <a id="enlace-administracion" hidden></a>
    <button id="boton-cerrar-sesion"></button>
    <section id="panel-administracion" hidden></section>
    <dialog id="modal-login"><form id="formulario-login"></form></dialog>
    <dialog id="modal-registro"><form id="formulario-registro"></form></dialog>
    <button id="boton-cancelar-login"></button>
    <button id="boton-cancelar-registro"></button>
    <p id="mensaje-login"></p>
    <p id="mensaje-registro"></p>
  `;
  document.querySelectorAll("dialog").forEach((dialogo) => {
    dialogo.showModal = vi.fn();
    dialogo.close = vi.fn();
  });
}


describe("sesión", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    prepararDocumento();
  });

  it("muestra las acciones de invitado sin sesión", async () => {
    api.consultarSesion.mockResolvedValue({ autenticado: false, usuario: null });
    const { restaurarSesion } = await import("./sesion.js");
    await restaurarSesion();
    expect(document.querySelector("#zona-invitado").hidden).toBe(false);
    expect(document.querySelector("#menu-usuario").hidden).toBe(true);
  });

  it("muestra el nombre y el panel solo para administradores", async () => {
    api.consultarSesion.mockResolvedValue({
      autenticado: true,
      usuario: {
        id: 1,
        nombre: "Administradora",
        email: "admin@zonashop.test",
        rol: "administrador",
      },
    });
    const { restaurarSesion } = await import("./sesion.js");
    await restaurarSesion();
    expect(document.querySelector("#nombre-usuario").textContent).toBe("Administradora");
    expect(document.querySelector("#enlace-administracion").hidden).toBe(false);
    expect(document.querySelector("#panel-administracion").hidden).toBe(true);
  });
});
