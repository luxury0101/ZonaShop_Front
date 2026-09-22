const CLAVE_ALMACENAMIENTO = "zonashop_carrito";

let carrito = [];

const elementos = {
  botonAbrir: document.querySelector("#boton-abrir-carrito"),
  cantidad: document.querySelector("#cantidad-carrito"),
  modal: document.querySelector("#modal-carrito"),
  botonCerrar: document.querySelector("#boton-cerrar-carrito"),
  botonVaciar: document.querySelector("#boton-vaciar-carrito"),
  botonWhatsApp: document.querySelector("#boton-finalizar-whatsapp"),
  lista: document.querySelector("#lista-carrito"),
  estado: document.querySelector("#estado-carrito"),
  total: document.querySelector("#total-carrito"),
  aviso: document.querySelector("#aviso-carrito"),
};


function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));
}


function guardarCarrito() {
  localStorage.setItem(
    CLAVE_ALMACENAMIENTO,
    JSON.stringify(carrito),
  );
}


function cargarCarrito() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]",
    );

    carrito = Array.isArray(datos)
      ? datos.filter(
        (item) =>
          item &&
          item.id != null &&
          Number.isInteger(item.cantidad) &&
          item.cantidad > 0,
      )
      : [];
  } catch (error) {
    console.error("No se pudo recuperar el carrito:", error);
    carrito = [];
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  }
}


function obtenerCantidadTotal() {
  return carrito.reduce(
    (total, item) => total + item.cantidad,
    0,
  );
}


function obtenerValorTotal() {
  return carrito.reduce(
    (total, item) =>
      total + Number(item.precio) * item.cantidad,
    0,
  );
}


function mostrarAviso(mensaje, esError = false) {
  if (!elementos.aviso) {
    return;
  }

  elementos.aviso.textContent = mensaje;
  elementos.aviso.classList.toggle(
    "aviso-carrito--error",
    esError,
  );
  elementos.aviso.hidden = !mensaje;

  window.clearTimeout(mostrarAviso.temporizador);

  if (mensaje) {
    mostrarAviso.temporizador = window.setTimeout(
      () => {
        elementos.aviso.hidden = true;
      },
      3000,
    );
  }
}


function actualizarResumen() {
  const cantidad = obtenerCantidadTotal();
  const total = obtenerValorTotal();

  if (elementos.cantidad) {
    elementos.cantidad.textContent = cantidad;
  }

  if (elementos.total) {
    elementos.total.textContent = formatearPrecio(total);
  }

  if (elementos.estado) {
    elementos.estado.textContent = cantidad === 0
      ? "Tu carrito está vacío."
      : `${cantidad} artículo(s) en el carrito.`;
  }

  if (elementos.botonVaciar) {
    elementos.botonVaciar.disabled = cantidad === 0;
  }

  if (elementos.botonWhatsApp) {
    elementos.botonWhatsApp.disabled = cantidad === 0;
  }
}


function cambiarCantidad(productoId, nuevaCantidad) {
  const item = carrito.find(
    (producto) => String(producto.id) === String(productoId),
  );

  if (!item) {
    return;
  }

  const cantidad = Number(nuevaCantidad);
  const limite = Number(item.existencias);

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    eliminarDelCarrito(productoId);
    return;
  }

  if (Number.isFinite(limite) && cantidad > limite) {
    item.cantidad = limite;
    mostrarAviso(
      `Solo hay ${limite} unidad(es) disponibles.`,
      true,
    );
  } else {
    item.cantidad = cantidad;
  }

  guardarCarrito();
  renderizarCarrito();
}


function eliminarDelCarrito(productoId) {
  carrito = carrito.filter(
    (item) => String(item.id) !== String(productoId),
  );

  guardarCarrito();
  renderizarCarrito();
}


function crearControlCantidad(item) {
  const contenedor = document.createElement("div");
  contenedor.className = "item-carrito__cantidad";

  const botonRestar = document.createElement("button");
  botonRestar.type = "button";
  botonRestar.textContent = "−";
  botonRestar.setAttribute(
    "aria-label",
    `Restar una unidad de ${item.nombre}`,
  );

  const entrada = document.createElement("input");
  entrada.type = "number";
  entrada.min = "1";
  entrada.max = String(item.existencias);
  entrada.value = String(item.cantidad);
  entrada.setAttribute(
    "aria-label",
    `Cantidad de ${item.nombre}`,
  );

  const botonSumar = document.createElement("button");
  botonSumar.type = "button";
  botonSumar.textContent = "+";
  botonSumar.setAttribute(
    "aria-label",
    `Agregar una unidad de ${item.nombre}`,
  );
  botonSumar.disabled =
    item.cantidad >= Number(item.existencias);

  botonRestar.addEventListener(
    "click",
    () => cambiarCantidad(item.id, item.cantidad - 1),
  );

  entrada.addEventListener(
    "change",
    () => cambiarCantidad(item.id, Number(entrada.value)),
  );

  botonSumar.addEventListener(
    "click",
    () => cambiarCantidad(item.id, item.cantidad + 1),
  );

  contenedor.append(
    botonRestar,
    entrada,
    botonSumar,
  );

  return contenedor;
}


function crearItemCarrito(item) {
  const articulo = document.createElement("article");
  articulo.className = "item-carrito";

  const informacion = document.createElement("div");
  informacion.className = "item-carrito__informacion";

  const nombre = document.createElement("h3");
  nombre.textContent = item.nombre;

  const precioUnitario = document.createElement("p");
  precioUnitario.textContent =
    `${formatearPrecio(item.precio)} por unidad`;

  informacion.append(nombre, precioUnitario);

  const controles = crearControlCantidad(item);

  const subtotal = document.createElement("strong");
  subtotal.className = "item-carrito__subtotal";
  subtotal.textContent = formatearPrecio(
    Number(item.precio) * item.cantidad,
  );

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "item-carrito__eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener(
    "click",
    () => eliminarDelCarrito(item.id),
  );

  articulo.append(
    informacion,
    controles,
    subtotal,
    botonEliminar,
  );

  return articulo;
}


function renderizarCarrito() {
  if (!elementos.lista) {
    return;
  }

  elementos.lista.replaceChildren();

  carrito.forEach((item) => {
    elementos.lista.append(crearItemCarrito(item));
  });

  actualizarResumen();
}


function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  mostrarAviso("El carrito fue vaciado.");
}


function crearMensajeWhatsApp() {
  const lineas = [
    "Hola, quiero realizar el siguiente pedido en ZonaShop:",
    "",
  ];

  carrito.forEach((item) => {
    const subtotal = Number(item.precio) * item.cantidad;

    lineas.push(
      `• ${item.nombre} x${item.cantidad} — ${formatearPrecio(subtotal)}`,
    );
  });

  lineas.push(
    "",
    `Total: ${formatearPrecio(obtenerValorTotal())}`,
    "",
    "Quedo atento(a) para confirmar disponibilidad y entrega.",
  );

  return lineas.join("\n");
}


function finalizarPorWhatsApp() {
  if (carrito.length === 0) {
    mostrarAviso(
      "Agrega al menos un producto antes de continuar.",
      true,
    );
    return;
  }

  const mensaje = encodeURIComponent(crearMensajeWhatsApp());

  window.open(
    `https://wa.me/?text=${mensaje}`,
    "_blank",
    "noopener,noreferrer",
  );
}


export function agregarAlCarrito(producto) {
  const existencias = Number(producto.existencias);

  if (
    producto.agotado ||
    !Number.isFinite(existencias) ||
    existencias < 1
  ) {
    mostrarAviso(
      "Este producto no tiene existencias disponibles.",
      true,
    );
    return;
  }

  const itemExistente = carrito.find(
    (item) => String(item.id) === String(producto.id),
  );

  if (itemExistente) {
    itemExistente.existencias = existencias;
    itemExistente.precio = Number(producto.precio);
    itemExistente.nombre = producto.nombre;

    if (itemExistente.cantidad >= existencias) {
      mostrarAviso(
        `Ya agregaste todas las unidades disponibles de ${producto.nombre}.`,
        true,
      );
      return;
    }

    itemExistente.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      cantidad: 1,
      existencias,
    });
  }

  guardarCarrito();
  renderizarCarrito();
  mostrarAviso(
    `${producto.nombre} se agregó al carrito.`,
  );
}


export function iniciarCarrito() {
  cargarCarrito();
  renderizarCarrito();

  elementos.botonAbrir?.addEventListener(
    "click",
    () => elementos.modal?.showModal(),
  );

  elementos.botonCerrar?.addEventListener(
    "click",
    () => elementos.modal?.close(),
  );

  elementos.botonVaciar?.addEventListener(
    "click",
    vaciarCarrito,
  );

  elementos.botonWhatsApp?.addEventListener(
    "click",
    finalizarPorWhatsApp,
  );

  elementos.modal?.addEventListener(
    "click",
    (evento) => {
      if (evento.target === elementos.modal) {
        elementos.modal.close();
      }
    },
  );
}
