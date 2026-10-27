// @vitest-environment jsdom

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";


const dependencias = vi.hoisted(() => ({
  obtenerProducto: vi.fn(),
  completarCompra: vi.fn(),
  guardarCarritoCuenta: vi.fn(),
  obtenerPerfil: vi.fn(),
  abrirLogin: vi.fn(),
  obtenerUsuarioActual: vi.fn(),
}));

vi.mock("../api/catalogo.js", () => ({
  obtenerProducto: dependencias.obtenerProducto,
}));

vi.mock("../api/autenticacion.js", () => ({
  completarCompra: dependencias.completarCompra,
  guardarCarritoCuenta: dependencias.guardarCarritoCuenta,
  obtenerPerfil: dependencias.obtenerPerfil,
}));

vi.mock("../auth/sesion.js", () => ({
  abrirLogin: dependencias.abrirLogin,
  obtenerUsuarioActual: dependencias.obtenerUsuarioActual,
}));


function prepararInterfaz() {
  document.body.innerHTML = `
    <button id="boton-abrir-carrito"></button>
    <span id="cantidad-carrito"></span>
    <dialog id="modal-carrito"></dialog>
    <button id="boton-cerrar-carrito"></button>
    <button id="boton-vaciar-carrito"></button>
    <button id="boton-pagar"></button>
    <button id="boton-seguir-comprando"></button>
    <div id="lista-carrito"></div>
    <p id="estado-carrito"></p>
    <strong id="subtotal-carrito"></strong>
    <strong id="total-carrito"></strong>
    <p id="aviso-carrito"></p>
    <dialog id="modal-vaciar-carrito"></dialog>
    <dialog id="modal-pago"></dialog>
  `;
  document.querySelectorAll("dialog").forEach((dialogo) => {
    dialogo.showModal = vi.fn();
    dialogo.close = vi.fn();
  });
}


async function cargarModulo() {
  vi.resetModules();
  return import("./carrito.js");
}


describe("carrito", () => {
  beforeEach(() => {
    dependencias.obtenerProducto.mockReset();
    dependencias.completarCompra.mockReset();
    dependencias.guardarCarritoCuenta.mockReset();
    dependencias.obtenerPerfil.mockReset();
    dependencias.abrirLogin.mockReset();
    dependencias.obtenerUsuarioActual.mockReset();
    dependencias.obtenerUsuarioActual.mockReturnValue(null);
    localStorage.clear();
    prepararInterfaz();
  });

  it("inicia vacío", async () => {
    const { iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();

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

    await iniciarCarrito();
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

  it("abre el carrito al agregar y lo cierra a los cuatro segundos si no hay interacción", async () => {
    vi.useFakeTimers();
    const modal = document.querySelector("#modal-carrito");
    modal.showModal.mockImplementation(() => modal.setAttribute("open", ""));
    modal.close.mockImplementation(() => modal.removeAttribute("open"));
    const { agregarAlCarrito, iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();
    agregarAlCarrito({
      id: 18,
      nombre: "Camiseta editorial",
      precio: "89900.00",
      existencias: 2,
      agotado: false,
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(modal.showModal).toHaveBeenCalledOnce();
    expect(modal.open).toBe(true);

    await vi.advanceTimersByTimeAsync(4000);
    expect(modal.close).toHaveBeenCalledOnce();
    vi.useRealTimers();
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

    await iniciarCarrito();
    agregarAlCarrito(producto);
    agregarAlCarrito(producto);

    const guardado = JSON.parse(
      localStorage.getItem("zonashop_carrito"),
    );
    expect(guardado[0].cantidad).toBe(1);
    expect(document.querySelector("#aviso-carrito").textContent)
      .toContain("Solo quedan 1 unidades disponibles");
  });

  it("mantiene tallas distintas como artículos separados", async () => {
    const { agregarAlCarrito, iniciarCarrito } = await cargarModulo();
    const producto = {
      id: 8,
      nombre: "Camisa oversize",
      precio: "89900.00",
      existencias: 5,
      agotado: false,
      tallas: [
        { talla: "S", stock: 2 },
        { talla: "M", stock: 3 },
      ],
    };

    await iniciarCarrito();
    agregarAlCarrito({ ...producto, talla: "S", existencias: 2 });
    agregarAlCarrito({ ...producto, talla: "M", existencias: 3 });

    const guardado = JSON.parse(localStorage.getItem("zonashop_carrito"));
    expect(guardado).toEqual([
      expect.objectContaining({ id: 8, talla: "S", cantidad: 1 }),
      expect.objectContaining({ id: 8, talla: "M", cantidad: 1 }),
    ]);
    expect(document.querySelector("#lista-carrito").textContent).toContain("Talla: S");
    expect(document.querySelector("#lista-carrito").textContent).toContain("Talla: M");
  });

  it("revalida precio y existencias al restaurar el carrito", async () => {
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
    dependencias.obtenerProducto.mockResolvedValue({
      id: 11,
      nombre: "Bolso actualizado",
      precio: "90000.00",
      existencias: 1,
      agotado: false,
    });
    const { iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("1");
    expect(document.querySelector("#lista-carrito h3").textContent)
      .toBe("Bolso actualizado");
    expect(document.querySelector("#total-carrito").textContent)
      .toContain("90.000");
    expect(document.querySelector("#aviso-carrito").textContent)
      .toContain("precios y existencias actuales");

    const guardado = JSON.parse(
      localStorage.getItem("zonashop_carrito"),
    );
    expect(guardado[0]).toEqual(
      expect.objectContaining({
        nombre: "Bolso actualizado",
        precioCentavos: 9000000,
        cantidad: 1,
        existencias: 1,
      }),
    );
  });

  it("retira productos que ya no existen", async () => {
    localStorage.setItem(
      "zonashop_carrito",
      JSON.stringify([
        {
          id: 21,
          nombre: "Producto eliminado",
          precio: 10000,
          cantidad: 1,
          existencias: 2,
        },
      ]),
    );
    dependencias.obtenerProducto.mockRejectedValue(
      Object.assign(new Error("No encontrado"), { status: 404 }),
    );
    const { iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("0");
    expect(JSON.parse(localStorage.getItem("zonashop_carrito")))
      .toEqual([]);
  });

  it("conserva datos guardados cuando la API no responde", async () => {
    localStorage.setItem(
      "zonashop_carrito",
      JSON.stringify([
        {
          id: 31,
          nombre: "Producto guardado",
          precio: 25000,
          cantidad: 1,
          existencias: 2,
        },
      ]),
    );
    dependencias.obtenerProducto.mockRejectedValue(
      Object.assign(new Error("Sin conexión"), { status: 503 }),
    );
    const { iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();

    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("1");
    expect(document.querySelector("#aviso-carrito").textContent)
      .toContain("Se conservaron temporalmente");
  });

  it("descarta almacenamiento corrupto", async () => {
    localStorage.setItem("zonashop_carrito", "contenido-inválido");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { iniciarCarrito } = await cargarModulo();

    await iniciarCarrito();

    expect(localStorage.getItem("zonashop_carrito")).toBeNull();
    expect(document.querySelector("#cantidad-carrito").textContent)
      .toBe("0");
  });

  it("conserva el carrito y abre el login al pagar sin sesión", async () => {
    const { agregarAlCarrito, iniciarCarrito } = await cargarModulo();
    await iniciarCarrito();
    agregarAlCarrito({
      id: 41,
      nombre: "Camisa",
      precio: "45000.00",
      existencias: 2,
      agotado: false,
    });

    document.querySelector("#boton-pagar").click();

    expect(dependencias.abrirLogin).toHaveBeenCalledOnce();
    expect(JSON.parse(localStorage.getItem("zonashop_carrito")))
      .toEqual([expect.objectContaining({ id: 41, cantidad: 1 })]);
  });
});
