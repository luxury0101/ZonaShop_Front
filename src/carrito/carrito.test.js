// @vitest-environment jsdom

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";


function prepararInterfaz() {
  document.body.innerHTML = `
    <button id="boton-abrir-carrito"></button>
    <span id="cantidad-carrito"></span>
    <dialog id="modal-carrito"></dialog>
    <button id="boton-cerrar-carrito"></button>
    <button id="boton-vaciar-carrito"></button>
    <div id="lista-carrito"></div>
    <p id="estado-carrito"></p>
    <strong id="total-carrito"></strong>
    <p id="aviso-carrito"></p>
  `;
}


async function cargarModulo() {
  vi.resetModules();
  return import("./carrito.js");
}


describe("carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    prepararInterfaz();
  });

  it("inicia vacío", async () => {
    const { iniciarCarrito } = await cargarModulo();

    iniciarCarrito();

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("0");
    expect(document.querySelector("#estado-carrito").textContent)
      .toBe("Tu carrito está vacío.");
    expect(document.querySelector("#boton-vaciar-carrito").disabled)
      .toBe(true);
  });

  it("agrega productos, calcula el total y conserva el carrito", async () => {
    const {
      agregarAlCarrito,
      iniciarCarrito,
    } = await cargarModulo();

    iniciarCarrito();
    agregarAlCarrito({
      id: 7,
      nombre: "Camiseta negra",
      precio: "50000.00",
      existencias: 3,
      agotado: false,
    });
    agregarAlCarrito({
      id: 7,
      nombre: "Camiseta negra",
      precio: "50000.00",
      existencias: 3,
      agotado: false,
    });

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("2");
    expect(document.querySelector("#total-carrito").textContent)
      .toContain("100.000");

    const guardado = JSON.parse(
      localStorage.getItem("zonashop_carrito"),
    );
    expect(guardado).toEqual([
      expect.objectContaining({ id: 7, cantidad: 2 }),
    ]);
  });

  it("no permite superar las existencias", async () => {
    const {
      agregarAlCarrito,
      iniciarCarrito,
    } = await cargarModulo();
    const producto = {
      id: 3,
      nombre: "Gorra",
      precio: "30000.00",
      existencias: 1,
      agotado: false,
    };

    iniciarCarrito();
    agregarAlCarrito(producto);
    agregarAlCarrito(producto);

    const guardado = JSON.parse(
      localStorage.getItem("zonashop_carrito"),
    );
    expect(guardado[0].cantidad).toBe(1);
    expect(document.querySelector("#aviso-carrito").textContent)
      .toContain("todas las unidades disponibles");
  });

  it("restaura una selección válida del almacenamiento local", async () => {
    localStorage.setItem(
      "zonashop_carrito",
      JSON.stringify([
        {
          id: 11,
          nombre: "Bolso",
          precio: 80000,
          cantidad: 2,
          existencias: 4,
        },
      ]),
    );
    const { iniciarCarrito } = await cargarModulo();

    iniciarCarrito();

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("2");
    expect(document.querySelector("#lista-carrito h3").textContent)
      .toBe("Bolso");
    expect(document.querySelector("#total-carrito").textContent)
      .toContain("160.000");
  });

  it("descarta almacenamiento corrupto", async () => {
    localStorage.setItem("zonashop_carrito", "contenido-inválido");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { iniciarCarrito } = await cargarModulo();

    iniciarCarrito();

    expect(localStorage.getItem("zonashop_carrito")).toBeNull();
    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("0");
  });
});
