// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";


describe("navegación administrativa", () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState({}, "", "/admin/productos");
    document.body.innerHTML = `
      <button id="boton-menu-admin"></button>
      <nav id="navegacion-admin">
        <a data-ruta-admin="inicio"></a>
        <a data-ruta-admin="productos"></a>
      </nav>
      <span id="miga-actual"></span>
      <span id="nombre-admin"></span>
      <p id="saludo-admin"></p>
      <section data-vista-admin="inicio" hidden></section>
      <section data-vista-admin="productos" hidden></section>`;
  });

  it("muestra únicamente el módulo de la ruta y resalta su enlace", async () => {
    const { iniciarNavegacionAdmin, obtenerModuloAdminActual } = await import("./navegacion.js");
    iniciarNavegacionAdmin();
    window.dispatchEvent(new CustomEvent("sesion:cambiada", {
      detail: { usuario: { nombre: "Administradora", rol: "administrador" } },
    }));

    expect(obtenerModuloAdminActual()).toBe("productos");
    expect(document.querySelector('[data-vista-admin="productos"]').hidden).toBe(false);
    expect(document.querySelector('[data-vista-admin="inicio"]').hidden).toBe(true);
    expect(document.querySelector('[data-ruta-admin="productos"]').getAttribute("aria-current"))
      .toBe("page");
    expect(document.querySelector("#miga-actual").textContent).toBe("Productos");
    expect(document.querySelector("#nombre-admin").textContent).toBe("Administradora");
  });
});
